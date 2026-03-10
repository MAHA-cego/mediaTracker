"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export type User = {
  id: string;
  email: string;
  username: string;
};

type SessionState =
  | { status: "loading" }
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated" };

export function useSession() {
  const [session, setSession] = useState<SessionState>({
    status: "loading",
  });

  useEffect(() => {
    apiFetch<User>("/api/me")
      .then((user) => {
        setSession({
          status: "authenticated",
          user,
        });
      })
      .catch(() => {
        setSession({
          status: "unauthenticated",
        });
      });
  }, []);

  return session;
}
