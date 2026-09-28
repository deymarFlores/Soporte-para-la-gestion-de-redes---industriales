export const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:4000";

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  const body = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !body.success || body.data === undefined) {
    throw new Error(body.error ?? `Error consultando ${path}`);
  }

  return body.data;
}
