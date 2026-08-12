import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { useEffect } from "react";

export default function App({ Component, pageProps }) {
   useEffect(() => {
    // PostHog is optional — it only initializes if you set NEXT_PUBLIC_POSTHOG_KEY.
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (key && typeof window !== "undefined" && !window.posthog) {
      import("posthog-js")
        .then(({ default: posthog }) => {
          posthog.init(key, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
            capture_pageview: true,
            person_profiles: "identified_only",
          });
          window.posthog = posthog;
        })
        .catch(() => {});
    }
  }, []);
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
