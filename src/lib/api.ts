import { headers } from "next/headers";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const isServer = typeof window === "undefined";

  const url = isServer ? `http://localhost:3000${path}` : path;

  const cookieHeader = isServer
    ? ((await headers()).get("cookie") ?? "")
    : undefined;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options?.headers || {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
