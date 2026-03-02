/**
 * Test Helpers for API Route Tests
 *
 * Provides utilities for creating mock requests, route params, and extracting responses.
 *
 * IMPORTANT: Each test file that uses these helpers must also mock 'next/server'.
 * Add this at the top of your test file (before any imports):
 *
 * ```typescript
 * jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);
 * ```
 */

/**
 * Mock implementation for next/server module
 * Import this in your test file's jest.mock() call
 */
export const nextServerMock = {
  NextRequest: jest.fn().mockImplementation((url: string | URL, init?: { method?: string; body?: string }) => ({
    url: typeof url === 'string' ? url : url.toString(),
    method: init?.method || 'GET',
    json: async () => {
      if (init?.body) {
        return JSON.parse(init.body);
      }
      return {};
    },
  })),
  NextResponse: {
    json: (data: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
      status: init?.status || 200,
      headers: new Map(Object.entries(init?.headers || {})),
      json: async () => data,
    }),
  },
};

/**
 * Create a mock NextRequest object for testing API routes
 */
export function createMockRequest(
  url: string,
  options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}
): { url: string; method: string; json: () => Promise<unknown>; headers: { get: (key: string) => string | null } } {
  const { method = 'GET', body, headers = {} } = options;

  return {
    url,
    method,
    json: async () => body || {},
    headers: {
      get: (key: string) => headers[key] || null,
    },
  };
}

/**
 * Create route params for dynamic route handlers
 * Next.js 15 expects params to be a Promise
 */
export function createRouteParams<T extends Record<string, string>>(
  params: T
): { params: Promise<T> } {
  return {
    params: Promise.resolve(params),
  };
}

/**
 * Extract JSON data from a mock response
 */
export async function getResponseJson(
  response: { json: () => Promise<unknown> }
): Promise<unknown> {
  return response.json();
}
