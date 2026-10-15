// lib/aiTxn.js — records every Gemini generation attempt (success or failure) to the
// ai_transactions table, with an estimated Google API cost for that attempt.
//
// Cost is ESTIMATED from the tokens Gemini reports (usageMetadata) and a per-million
// price. Google AI Studio's free tier bills $0, but the paid API has per-token pricing;
// override the two env vars below with your plan's real flash prices for accurate numbers.
const IN_PER_M = Number(process.env.GEMINI_PRICE_IN_PER_M || 0.10);   // USD per 1M input tokens
const OUT_PER_M = Number(process.env.GEMINI_PRICE_OUT_PER_M || 0.40); // USD per 1M output tokens

export function estCostUsd(usage) {
  if (!usage) return 0;
  return (Number(usage.promptTokens || 0) / 1e6) * IN_PER_M + (Number(usage.outputTokens || 0) / 1e6) * OUT_PER_M;
}

// g is the result object from generateText(): { ok, text, model, usage } | { busy } | { timeout } | { error }
export async function logAiTxn(supabaseAdmin, { userId, kind, g }) {
  try {
    const ok = !!(g && g.ok);
    const usage = (g && g.usage) || null;
    const cost = estCostUsd(usage);
    const errText = ok ? null : (g && (g.error || (g.busy ? "busy / rate-limited" : g.timeout ? "timeout" : "failed"))) || "failed";
    await supabaseAdmin.from("ai_transactions").insert({
      user_id: userId || null,
      kind: String(kind || "").slice(0, 32),
      success: ok,
      model: (g && g.model) || null,
      prompt_tokens: usage ? usage.promptTokens : 0,
      output_tokens: usage ? usage.outputTokens : 0,
      total_tokens: usage ? usage.totalTokens : 0,
      est_cost_usd: Number(cost.toFixed(6)),
      error: ok ? null : String(errText).slice(0, 200),
    });
  } catch (e) { /* logging is best-effort — never breaks a generation */ }
}