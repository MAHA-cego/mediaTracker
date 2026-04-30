"use client";

import { useRouter } from "next/navigation";
import { apiClientFetch } from "@/lib/api-client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await apiClientFetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return <button onClick={handleLogout}>Logout</button>;
}
