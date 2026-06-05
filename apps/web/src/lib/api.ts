// Cliente fetch tipado. Lee el token de localStorage y lo agrega como Bearer.
// El backend del core vive en NEXT_PUBLIC_API_URL (default :3400).

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3400";
const TOKEN_KEY = "copiloto:token";
const LOCATION_KEY = "copiloto:locationId";

function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Error con status code para que el AuthProvider pueda distinguir 401. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export async function api<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, `API ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(LOCATION_KEY);
  }
}

export function getSavedLocationId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LOCATION_KEY);
}

export function saveLocationId(id: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCATION_KEY, id);
  }
}
