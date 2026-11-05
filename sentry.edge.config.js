// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://c4e10524daff771c9b0824cc3028d701@o4512182267281408.ingest.us.sentry.io/4512182273966080",

  // Was tracesSampleRate: 1 (trace everything). Drop the high-fanout cron/proxy routes
  // and sample the rest lightly to stay well under the span quota. Errors still captured.
  tracesSampler: (ctx) => {
    const name = (ctx && ctx.name) || "";
    if (/\/api\/cron\//.test(name) || /\/api\/jobs\/(ats|cache)/.test(name)) return 0;
    return 0.05;
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