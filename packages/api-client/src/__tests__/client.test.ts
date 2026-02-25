import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiClient } from '../client';

// Helper to create a mock Response
function mockResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('createApiClient()', () => {
  const BASE = 'https://api.example.com';
  let client: ReturnType<typeof createApiClient>;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    client = createApiClient({ baseURL: BASE });
  });

  it('GET request returns typed data on success', async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse({ id: 1, name: 'Test' }));

    const result = await client.get<{ id: number; name: string }>('/items/1');
    expect(result).toEqual({ data: { id: 1, name: 'Test' } });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/items/1',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('POST request sends JSON body', async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse({ ok: true }));

    await client.post('/items', { name: 'New Item' });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/items',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'New Item' }),
      }),
    );
  });

  it('returns error shape on non-2xx response', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('Not Found', { status: 404, statusText: 'Not Found' }),
    );

    const result = await client.get('/missing');
    expect(result).toMatchObject({
      error: { message: 'Not Found', code: '404' },
    });
  });

  it('returns error shape on network failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    const result = await client.get('/unreachable');
    expect(result).toMatchObject({ error: { message: 'Network error' } });
  });

  it('attaches Authorization header when getToken returns a value', async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse({ ok: true }));

    const authedClient = createApiClient({
      baseURL: BASE,
      getToken: async () => 'my-token',
    });

    await authedClient.get('/secure');
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      }),
    );
  });

  it('skips Authorization header when getToken returns null', async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse({ ok: true }));

    const authedClient = createApiClient({
      baseURL: BASE,
      getToken: async () => null,
    });

    await authedClient.get('/public');
    const calledHeaders = (vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit)
      ?.headers as Record<string, string>;
    expect(calledHeaders?.['Authorization']).toBeUndefined();
  });
});
