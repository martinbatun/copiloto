// Cliente fetch tipado. Lee el token de localStorage y lo agrega como Bearer.
// El backend del core vive en NEXT_PUBLIC_API_URL (default :3400).

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3400";

function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("copiloto:token");
  return token ? { Authorization: `Bearer ${token}` } : {};
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
    throw new Error(`API ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("copiloto:token", token);
  }
}

export function clearToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("copiloto:token");
  }
}
