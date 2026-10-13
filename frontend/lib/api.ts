/** The REST API (../api). Set NEXT_PUBLIC_API_URL in .env.local to point elsewhere. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  token?: string | null;   // Supabase access token; useApi() fills it in
  json?: unknown;          // sent as a JSON body
  body?: BodyInit;         // anything else, e.g. FormData (the browser sets its Content-Type)
  keepalive?: boolean;     // survives the page closing (pending undo writes)
}

/** fetch() against the API. Like fetch, it rejects only on network errors; check `res.ok`. */
export function api(path: string, { method = 'GET', token, json, body, keepalive }: ApiOptions = {}) {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(`${API_URL}${path}`, {
    method, headers, keepalive,
    body: json !== undefined ? JSON.stringify(json) : body,
  });
}

export type Api = (path: string, opts?: Omit<ApiOptions, 'token'>) => Promise<Response>;
