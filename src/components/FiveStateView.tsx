'use client';

import React, { type ReactNode } from 'react';

interface SkeletonProps {
  height?: string | number;
  width?: string | number;
  borderRadius?: string;
  count?: number;
  className?: string;
}

export function Skeleton({
  height = '20px',
  width = '100%',
  borderRadius = 'var(--radius-md)',
  count = 1,
  className = '',
}: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton ${className}`}
          style={{
            height,
            width,
            borderRadius,
            marginBottom: count > 1 ? 'var(--space-2)' : 0,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="state-empty" role="region" aria-label={title}>
      {icon ? (
        <div className="state-empty-icon">{icon}</div>
      ) : (
        <svg className="state-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )}
      <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
        {title}
      </h3>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto var(--space-4)' }}>
        {description}
      </p>
      {action && (
        action.href ? (
          <a href={action.href} className="btn btn-primary">{action.label}</a>
        ) : (
          <button type="button" onClick={action.onClick} className="btn btn-primary">{action.label}</button>
        )
      )}
    </div>
  );
}

interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ title = 'Error Loading Information', message, onRetry }: ErrorBannerProps) {
  return (
    <div className="state-error-banner" role="alert">
      <div>
        <strong style={{ display: 'block', fontSize: 'var(--font-size-sm)' }}>{title}</strong>
        <span style={{ fontSize: 'var(--font-size-xs)' }}>{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-secondary"
          style={{ minHeight: '32px', padding: '0 var(--space-3)', fontSize: 'var(--font-size-xs)' }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
