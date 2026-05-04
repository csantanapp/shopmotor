"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Intercepts all fetch responses globally.
 * If any API call returns 401, redirects to /login preserving the current path.
 */
export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        const url = typeof args[0] === "string" ? args[0] : args[0] instanceof Request ? args[0].url : "";
        // Only intercept internal API calls
        if (url.startsWith("/api/")) {
          const redirect = encodeURIComponent(window.location.pathname);
          router.push(`/login?redirect=${redirect}`);
        }
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [router]);
}
