// Shared, hardened Gemini caller used by every AI endpoint.
// Fixes the three things that make AI features "fail or time out":
//   1) A hung Gemini request used to hang forever (Node fetch has no default
//      timeout) until the reverse proxy killed it → opaque timeout. Now every
//      attempt has an AbortController deadline and fails fast with a clear kind.
//   2) Hard-coded version numbers (gemini-3.6-flash, 3.5, 2.5…) go stale and 404,
//      wasting round-trips. We use Google's stable auto-routing ALIASES, which
//      always point at the current model, and skip anything that 404s.
//   3) Rate-limit (429) backoff is bounded so we fail to a clear "busy" quickly
//      instead of stacking seconds of sleeps before giving up.
//
// generateText(...) resolves to one of:
//   { ok: true, text, model }        success
//   { busy: true }                   every model is rate-limited right now
//   { timeout: true }                exceeded the deadline
//   { error: "<detail>" }            a real error (bad request, auth, empty, …)

const GEMINI_KEY = process.env.GEMINI_API_KEY;

// Stable aliases (auto-route to the current flash / flash-lite). A single env
// override still wins if you ever need to pin an exact model.
const DEFAULT_MODELS = process.env.GEMINI_MODEL
  ? [process.env.GEMINI_MODEL]
  : ["gemini-flash-latest", "gemini-flash-lite-latest"];

let cachedModel = null; // persists across requests on a long-running server

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function callOnce(model, payload, timeoutMs) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    const data = await r.json().catch(() => ({}));
    if (r.status === 429 || r.status === 503) return { kind: "busy" };
    if (r.status === 404) return { kind: "notfound", detail: `404 ${model}` };
    if (!r.ok) return { kind: "error", detail: `${r.status} ${(data.error && data.error.message) || "error"}`.slice(0, 200) };
    const cand = (data.candidates || [])[0];
    const text = cand && cand.content && cand.content.parts ? cand.content.parts.map((p) => p.text || "").join("") : "";
    if (text) return { kind: "ok", text, model };
    return { kind: "empty", detail: `empty (finish: ${(cand && cand.finishReason) || "?"})` };
  } catch (e) {
    if (e && e.name === "AbortError") return { kind: "timeout" };
    return { kind: "neterr", detail: String((e && e.message) || e).slice(0, 120) };
  } finally {
    clearTimeout(timer);
  }
}

export async function generateText({
  system,
  user,
  temperature = 0.4,
  topP = 0.9,
  maxOutputTokens = 8192,
  timeoutMs = 45000,   // hard ceiling per model attempt
  retriesPerModel = 1, // one quick retry on transient failure
  generationExtras = null, // merged into generationConfig (e.g. { thinkingConfig: { thinkingBudget: 0 } })
} = {}) {
  if (!GEMINI_KEY) return { error: "AI is not configured on the server." };

  const payload = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: { temperature, topP, maxOutputTokens, ...(generationExtras || {}) },
  };

  // Try the model that worked last first, then the rest.
  const order = cachedModel
    ? [cachedModel, ...DEFAULT_MODELS.filter((m) => m !== cachedModel)]
    : DEFAULT_MODELS.slice();

  const started = Date.now();
  let lastDetail = "", anyBusy = false, anyTimeout = false;

  for (const model of order) {
    for (let attempt = 0; attempt <= retriesPerModel; attempt++) {
      // Don't start an attempt we can't possibly finish within a sane total budget.
      const remaining = timeoutMs * 2 - (Date.now() - started);
      if (remaining <= 1500) { anyTimeout = true; break; }

      const g = await callOnce(model, payload, Math.min(timeoutMs, remaining));
      if (g.kind === "ok") { cachedModel = g.model; return { ok: true, text: g.text, model: g.model }; }
      if (g.kind === "busy") { anyBusy = true; if (attempt < retriesPerModel) { await sleep(500); continue; } break; }
      if (g.kind === "timeout") { anyTimeout = true; break; }       // move to next model
      if (g.kind === "notfound") { break; }                          // stale alias — skip model
      if (g.kind === "neterr") { if (attempt < retriesPerModel) { await sleep(400); continue; } lastDetail = g.detail; break; }
      // "error" / "empty": a real problem this model won't recover from
      lastDetail = g.detail || g.kind;
      break;
    }
  }

  if (anyBusy) return { busy: true };
  if (anyTimeout) return { timeout: true };
  return { error: lastDetail || "no available model" };
}

// Convenience: map a generateText result to an HTTP response shape most
// endpoints already use, so callers stay tiny and consistent.
export function aiErrorResponse(res, g) {
  if (g.busy) return res.status(429).json({ error: "The AI is busy right now — please try again in a moment.", busy: true });
  if (g.timeout) return res.status(504).json({ error: "That took too long — please try again.", timeout: true });
  return res.status(502).json({ error: `Couldn't generate — ${g.error || "unknown error"}` });
}

// Plain-string version of aiErrorResponse, for background jobs that store an error
// on a row instead of returning an HTTP response.
export function aiErrText(g) {
  if (g.busy) return "The AI is busy right now — please try again in a moment.";
  if (g.timeout) return "That took too long — please try again.";
  return `Couldn't generate — ${g.error || "unknown error"}`;
}