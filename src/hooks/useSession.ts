"use client";

import { useEffect, useState } from "react";
import { apiClientFetch } from "@/lib/api-client";

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
    apiClientFetch<User>("/api/me")
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
