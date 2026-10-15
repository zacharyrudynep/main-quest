import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";
import { trackVisitOncePerDay } from "../lib/track";
import { getConsent } from "../lib/consent";
import ConsentBanner from "../components/ConsentBanner";

export default function App({ Component, pageProps }) {
  const [consent, setConsent] = useState(null);

  // Read the stored choice on mount (client-only).
  useEffect(() => {
    setConsent(getConsent());
  }, []);

  // React live when the choice is changed elsewhere (e.g. the Account settings toggle).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onChange = (e) => setConsent((e && e.detail) || getConsent());
    window.addEventListener("mq-consent-change", onChange);
    return () => window.removeEventListener("mq-consent-change", onChange);
  }, []);

  // Initialize non-essential analytics ONLY after the user accepts.
  useEffect(() => {
    // If the user declined (including after previously accepting), stop capturing.
    if (typeof window !== "undefined" && consent === "declined") {
      try { if (window.posthog && window.posthog.opt_out_capturing) window.posthog.opt_out_capturing(); } catch (e) {}
      return;
    }
    if (consent !== "accepted") return;

    trackVisitOncePerDay();

    // PostHog is optional — it only loads if NEXT_PUBLIC_POSTHOG_KEY is set.
    // Loaded from PostHog's CDN (official snippet), so no npm dependency is required.
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || typeof window === "undefined") return;
    // Already loaded (e.g. re-accepting after a decline) — just opt back in.
    if (window.__phInit) { try { window.posthog && window.posthog.opt_in_capturing && window.posthog.opt_in_capturing(); } catch (e) {} return; }
    window.__phInit = true;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
    /* eslint-disable */
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    /* eslint-enable */
    try { window.posthog.init(key, { api_host: host, capture_pageview: true, person_profiles: "identified_only" }); } catch (e) {}
  }, [consent]);

  return (
    <>
      <Component {...pageProps} />
      {consent === "accepted" && <Analytics />}
      <ConsentBanner onChange={setConsent} />
    </>
  );
}