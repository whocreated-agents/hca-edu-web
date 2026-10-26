import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { call, ApiError, setAccessToken, getAccessToken } from '../src/lib/api';
import { routes } from '@hca/contracts';

describe('Frontend API Client (call & ApiError)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    setAccessToken(null);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('manages accessToken state correctly', () => {
    expect(getAccessToken()).toBeNull();
    setAccessToken('jwt-test-token-123');
    expect(getAccessToken()).toBe('jwt-test-token-123');
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });

  it('attaches Authorization header when accessToken is present', async () => {
    setAccessToken('bearer-abc-999');

    let capturedHeaders: Record<string, string> = {};
    global.fetch = vi.fn().mockImplementation((_url, init: RequestInit) => {
      capturedHeaders = init.headers as Record<string, string>;
      return Promise.resolve(
        new Response(
          JSON.stringify({
            items: [],
            nextCursor: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
    });

    await call(routes.public.notices, { query: { limit: 10 } });
    expect(capturedHeaders.Authorization).toBe('Bearer bearer-abc-999');
    expect(capturedHeaders.Accept).toBe('application/json');
  });

  it('throws ApiError with parsed ProblemDetails on HTTP 4xx errors', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          type: 'https://hca.edu.in/problems/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: 'User does not possess OFFICE role.',
          code: 'FORBIDDEN',
          requestId: 'req-403-test',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    );

    try {
      await call(routes.adminContent.profile, {});
      expect.unreachable('Should have thrown ApiError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(403);
      expect(apiErr.code).toBe('FORBIDDEN');
      expect(apiErr.problem?.detail).toBe('User does not possess OFFICE role.');
      expect(apiErr.problem?.requestId).toBe('req-403-test');
    }
  });

  it('handles non-JSON error bodies gracefully without crashing parser', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response('<html><body>502 Bad Gateway</body></html>', {
        status: 502,
        headers: { 'Content-Type': 'text/html' },
      })
    );

    try {
      await call(routes.public.notices, {});
      expect.unreachable('Should have thrown ApiError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(502);
      expect(apiErr.problem).toBeNull();
      expect(apiErr.message).toBe('HTTP 502');
    }
  });
});
