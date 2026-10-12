import { API_URL } from "./index";

/**
 * Unified response envelope returned by the server (uni-response):
 * { success: boolean, message: string, data?: T }
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
}

/**
 * Thin fetch wrapper around the backend API.
 * - Prepends the configured API_URL
 * - Attaches the JWT as a Bearer token when provided
 * - Parses the uni-response envelope and throws ApiError on failure
 * - Returns the unwrapped `data`
 */
export async function apiRequest<T>(
  path: string,
  { method = "GET", token, body }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Tidak dapat terhubung ke server. Pastikan server berjalan.",
      0
    );
  }

  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    json = null;
  }

  if (!res.ok || !json || json.success === false) {
    const message =
      json?.message || `Request gagal dengan status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return json.data as T;
}
