/**
 * Typed API client — used by the mobile app (and optionally web client components)
 * to call the Next.js API layer.
 *
 * Wide-event logging is handled server-side. On the client, log failures only.
 */
import type { ApiResult } from './types';

export interface ClientConfig {
  baseURL: string;
  /** Called before every request. Return null to skip auth header. */
  getToken?: () => Promise<string | null>;
}

export function createApiClient(config: ClientConfig) {
  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<ApiResult<T>> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (config.getToken) {
      const token = await config.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${config.baseURL}${path}`, {
        method,
        headers,
        credentials: 'include',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        return { error: { message: text, code: String(res.status) } };
      }

      const data = await res.json() as T;
      return { data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      return { error: { message } };
    }
  }

  return {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
    put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
    patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
    del: <T>(path: string) => request<T>('DELETE', path),
  };
}
