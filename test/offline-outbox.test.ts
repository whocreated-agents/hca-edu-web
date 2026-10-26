import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  queueSubmission,
  getQueuedSubmission,
  getOutboxCount,
  getOutboxItems,
  removeQueuedSubmission,
  clearOutbox,
  flushOutbox,
} from '../src/lib/offline-outbox';
import { ApiError } from '../src/lib/api';
import * as apiModule from '../src/lib/api';
import type { AttendanceSubmission } from '@hca/contracts';

describe('Offline Attendance Outbox (BUG-009 Regression & Sync Invariants)', () => {
  const sampleSubmission: AttendanceSubmission = {
    capturedAt: new Date().toISOString(),
    mutationId: 'mut-12345',
    entries: [
      { studentId: 'student-1', status: 'PRESENT' },
      { studentId: 'student-2', status: 'ABSENT' },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
    clearOutbox();
    vi.restoreAllMocks();
  });

  it('queues, reads, and deletes attendance submissions in localStorage', () => {
    expect(getOutboxCount()).toBe(0);

    queueSubmission('sec-1', '2026-10-26', sampleSubmission);
    expect(getOutboxCount()).toBe(1);

    const queued = getQueuedSubmission('sec-1', '2026-10-26');
    expect(queued).toBeDefined();
    expect(queued?.sectionId).toBe('sec-1');
    expect(queued?.date).toBe('2026-10-26');
    expect(queued?.submission.mutationId).toBe('mut-12345');
    expect(queued?.retryCount).toBe(0);

    const items = getOutboxItems();
    expect(items.length).toBe(1);
    expect(items[0]?.id).toBe('sec-1:2026-10-26');

    removeQueuedSubmission('sec-1', '2026-10-26');
    expect(getOutboxCount()).toBe(0);
  });

  it('updates an existing queued submission in-place instead of creating duplicates', () => {
    queueSubmission('sec-1', '2026-10-26', sampleSubmission);
    expect(getOutboxCount()).toBe(1);

    const updatedSubmission: AttendanceSubmission = {
      ...sampleSubmission,
      entries: [{ studentId: 'student-1', status: 'LATE' }],
    };

    queueSubmission('sec-1', '2026-10-26', updatedSubmission);
    expect(getOutboxCount()).toBe(1);

    const queued = getQueuedSubmission('sec-1', '2026-10-26');
    expect(queued?.submission.entries[0]?.status).toBe('LATE');
  });

  it('successfully flushes outbox when server responds with 200 OK', async () => {
    queueSubmission('sec-1', '2026-10-26', sampleSubmission);
    expect(getOutboxCount()).toBe(1);

    const callSpy = vi.spyOn(apiModule, 'call').mockResolvedValueOnce({
      outcome: 'CREATED',
      sessionDate: '2026-10-26',
      sectionId: 'sec-1',
    } as any);

    const result = await flushOutbox();
    expect(result.synced).toBe(1);
    expect(result.failed).toBe(0);
    expect(getOutboxCount()).toBe(0);
    expect(callSpy).toHaveBeenCalledTimes(1);
  });

  it('BUG-009: discards non-retryable 4xx business rejections (401, 403, 409, 422) instead of retrying forever', async () => {
    queueSubmission('sec-1', '2026-10-26', sampleSubmission);
    expect(getOutboxCount()).toBe(1);

    // Simulate server returning 409 ATTENDANCE_FINALISED
    vi.spyOn(apiModule, 'call').mockRejectedValueOnce(
      new ApiError(409, {
        type: 'https://hca.edu.in/problems/attendance-finalised',
        title: 'Attendance Finalised',
        status: 409,
        detail: 'Attendance for this section and date has already been locked by administration.',
        code: 'ATTENDANCE_FINALISED',
      } as any)
    );

    const result = await flushOutbox();
    expect(result.synced).toBe(0);
    expect(result.failed).toBe(1);

    // Verified: Outbox must discard the rejected item so it does not loop indefinitely
    expect(getOutboxCount()).toBe(0);
  });

  it('BUG-009: retains items and increments retryCount on genuine network drops or 5xx server drops', async () => {
    queueSubmission('sec-1', '2026-10-26', sampleSubmission);
    expect(getOutboxCount()).toBe(1);

    // Simulate network TypeError (e.g. Failed to fetch / offline)
    vi.spyOn(apiModule, 'call').mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const result = await flushOutbox();
    expect(result.synced).toBe(0);
    expect(result.failed).toBe(1);

    // Verified: Item remains in outbox for subsequent retry
    expect(getOutboxCount()).toBe(1);
    const item = getQueuedSubmission('sec-1', '2026-10-26');
    expect(item?.retryCount).toBe(1);
    expect(item?.lastError).toContain('Failed to fetch');
  });

  it('BUG-009: retains items and increments retryCount on 500/503 server errors', async () => {
    queueSubmission('sec-1', '2026-10-26', sampleSubmission);
    expect(getOutboxCount()).toBe(1);

    // Simulate 503 Service Unavailable
    vi.spyOn(apiModule, 'call').mockRejectedValueOnce(
      new ApiError(503, {
        type: 'about:blank',
        title: 'Service Unavailable',
        status: 503,
      } as any)
    );

    const result = await flushOutbox();
    expect(result.synced).toBe(0);
    expect(result.failed).toBe(1);

    // Retained for retry when server recovers
    expect(getOutboxCount()).toBe(1);
    const item = getQueuedSubmission('sec-1', '2026-10-26');
    expect(item?.retryCount).toBe(1);
  });
});
