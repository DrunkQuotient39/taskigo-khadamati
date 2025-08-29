export type ApiResponse<T> = { data: T; requestId?: string; action?: string };

export async function apiFetch<T>(input: RequestInfo, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const res = await fetch(input, {
    ...init,
    credentials: 'include',
  });
  const requestId = res.headers.get('X-Request-Id') || undefined;
  const action = res.headers.get('X-Action') || undefined;
  const data = (await res.json()) as T;
  return { data, requestId, action };
}


