"use client";

import Script from "next/script";
import { useCallback, useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

/** Cloudflare Turnstile spam check. Call `reset()` after a failed submit to get a fresh token. */
export function useTurnstile() {
  const widgetId = useRef<string | null>(null);
  const reset = useCallback(() => {
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }, []);
  return { widgetId, reset };
}

export function Turnstile({
  onToken,
  widgetId,
}: {
  onToken: (token: string) => void;
  widgetId: React.RefObject<string | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.turnstile) setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !ref.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(ref.current, {
      sitekey: SITE_KEY,
      callback: onToken,
      "expired-callback": () => onToken(""),
      "error-callback": () => onToken(""),
      theme: "light",
      size: "flexible",
    });
    return () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [ready, onToken, widgetId]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div ref={ref} id={id} className="min-h-[65px]" />
    </>
  );
}
