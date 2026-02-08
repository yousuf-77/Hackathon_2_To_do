"use client";

import { useSession as useBetterAuthSession } from "better-auth/react";

export function useSession() {
  return useBetterAuthSession();
}
