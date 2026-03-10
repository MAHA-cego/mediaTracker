import { cookies } from "next/headers";

export async function apiServerFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`http://localhost:3000${path}`, {
    ...options,
    headers: {
      ...(options?.headers || {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
