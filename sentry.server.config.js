// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://c4e10524daff771c9b0824cc3028d701@o4512182267281408.ingest.us.sentry.io/4512182273966080",

  // Span usage was exhausting the plan because tracesSampleRate was 1 (trace EVERY
  // request). The crons and the ATS proxy/cache fan out to dozens of outbound HTTP
  // calls per invocation — each one becomes a span — so they produced the vast
  // majority of spans. We drop tracing for those routes entirely and sample only a
  // small slice of everything else. Error capture is unaffected (errors are cheap and
  // we're nowhere near that quota).
  tracesSampler: (ctx) => {
    const name = (ctx && ctx.name) || "";
    if (/\/api\/cron\//.test(name) || /\/api\/jobs\/(ats|cache)/.test(name)) return 0; // high-fanout background work — don't trace
    return 0.05; // ~5% of normal requests
  },

  // Turns off collection of data that could identify users. Adjust per category:
  // https://docs.sentry.io/platforms/javascript/configuration/options/#dataCollection
  dataCollection: {
    userInfo: false,
    graphQL: { document: false, variables: false },
    genAI: { inputs: false, outputs: false },
    databaseQueryData: false,
    queues: false,
    httpBodies: [],
    httpHeaders: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
    cookies: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
    urlQueryParams: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
  },
});