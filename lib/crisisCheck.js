// lib/crisisCheck.js — lightweight tripwire for clear first-person self-harm /
// crisis expressions. NOT a clinical classifier. Keyed to explicit intent
// phrases so ordinary resume language (e.g. "crisis management") won't trip it.
const PATTERNS = [
  /\bi\s+(?:want|wanna|need)\s+to\s+die\b/i,
  /\bi\s+want\s+to\s+be\s+dead\b/i,
  /\b(?:kill|killing)\s+myself\b/i,
  /\bend(?:ing)?\s+my\s+life\b/i,
  /\btake\s+my\s+(?:own\s+)?life\b/i,
  /\bi\s+(?:want|plan|am\s+going)\s+to\s+end\s+it\s+all\b/i,
  /\b(?:hurt|harm)(?:ing)?\s+myself\b/i,
  /\bcommit(?:ting)?\s+suicide\b/i,
  /\bi(?:'?m|\s+am)\s+suicidal\b/i,
];

export function containsCrisisSignal(text) {
  if (!text) return false;
  const t = String(text);
  return PATTERNS.some((re) => re.test(t));
}

export const CRISIS_MESSAGE =
  "It sounds like you may be going through something really painful right now — and that matters far more than any job application. This is the one thing I can't help draft, but you deserve support from someone who can. In the US you can call or text 988 (the Suicide & Crisis Lifeline) any time, day or night. Outside the US, your local emergency number or a nearby crisis line can help. You don't have to carry this alone.";
