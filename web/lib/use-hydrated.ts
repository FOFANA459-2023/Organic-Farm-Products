"use client";

import { useEffect, useState } from "react";

/** False during SSR and the first client render — use before reading localStorage-backed state. */
export function useHydrated() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}
