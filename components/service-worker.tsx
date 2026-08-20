"use client";

import { useEffect } from "react";

/**
 * Registers the offline worker. It caches the built application only — never
 * an answer, a score or a deck position. The app stays stateless between page
 * loads; this just means it still opens with no signal.
 *
 * Dev has no out/sw.js to register, so this is a no-op there.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // No offline support here; the app still works online.
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
