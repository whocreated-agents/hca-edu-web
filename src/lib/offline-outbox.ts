'use client';

import { routes, type AttendanceSubmission } from '@hca/contracts';
import { call, ApiError } from './api';

export interface QueuedRegister {
  id: string; // sectionId:date
  sectionId: string;
  date: string;
  submission: AttendanceSubmission;
  queuedAt: string;
  retryCount: number;
  lastError?: string;
}

const STORAGE_KEY = 'hca_attendance_outbox_v1';

function getStoredOutbox(): QueuedRegister[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedRegister[]) : [];
  } catch {
    return [];
  }
}

function saveStoredOutbox(items: QueuedRegister[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('hca-outbox-changed', { detail: { count: items.length } }));
  } catch {
    // localStorage quota or private mode
  }
}

export function getOutboxCount(): number {
  return getStoredOutbox().length;
}

export function getOutboxItems(): QueuedRegister[] {
  return getStoredOutbox();
}

export function getQueuedSubmission(sectionId: string, date: string): QueuedRegister | undefined {
  const items = getStoredOutbox();
  return items.find((i) => i.sectionId === sectionId && i.date === date);
}

export function queueSubmission(sectionId: string, date: string, submission: AttendanceSubmission): void {
  const items = getStoredOutbox();
  const id = `${sectionId}:${date}`;
  const existingIdx = items.findIndex((i) => i.id === id);

  const entry: QueuedRegister = {
    id,
    sectionId,
    date,
    submission,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
  };

  if (existingIdx >= 0) {
    items[existingIdx] = entry;
  } else {
    items.push(entry);
  }
  saveStoredOutbox(items);
}

export function removeQueuedSubmission(sectionId: string, date: string): void {
  const items = getStoredOutbox();
  const filtered = items.filter((i) => !(i.sectionId === sectionId && i.date === date));
  saveStoredOutbox(filtered);
}

export function clearOutbox(): void {
  saveStoredOutbox([]);
}

let isSyncing = false;

export async function flushOutbox(): Promise<{ synced: number; failed: number }> {
  if (isSyncing || typeof window === 'undefined') return { synced: 0, failed: 0 };
  const items = getStoredOutbox();
  if (!items.length) return { synced: 0, failed: 0 };

  isSyncing = true;
  let synced = 0;
  let failed = 0;

  try {
    for (const item of [...items]) {
      try {
        await call(routes.attendance.putDay, {
          params: { id: item.sectionId, date: item.date },
          body: item.submission,
        });
        removeQueuedSubmission(item.sectionId, item.date);
        synced++;
      } catch (err: unknown) {
        failed++;
        if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
          // Terminal client/business error (401, 403, 409, 422) - discard from outbox so it does not retry indefinitely
          removeQueuedSubmission(item.sectionId, item.date);
        } else {
          item.retryCount++;
          item.lastError = err instanceof Error ? err.message : 'Sync failed';
          const current = getStoredOutbox();
          const idx = current.findIndex((i) => i.id === item.id);
          if (idx >= 0) {
            current[idx] = item;
            saveStoredOutbox(current);
          }
        }
      }
    }
  } finally {
    isSyncing = false;
  }

  return { synced, failed };
}

// Auto-sync listener when browser reconnects
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void flushOutbox();
  });
}
