#!/usr/bin/env python3
# Rewire client-side callAI() to the server route /api/ai/generate, removing the
# NEXT_PUBLIC_GEMINI_KEY usage from the browser bundle. Auto-detects CRLF vs LF
# and preserves it. Verifies anchors are unique and aborts cleanly on mismatch.

import io, sys

PATH = r"pages\index.js"   # run from project root; adjust if needed

with io.open(PATH, "r", encoding="utf-8", newline="") as f:
    text = f.read()

orig = text
nl = "\r\n" if "\r\n" in text else "\n"

# -- 1) Replace the whole callAI function body --
start_sig = "async function callAI(prompt,maxTokens=2000){"
end_sig = 'return data.candidates[0].content?.parts?.[0]?.text||"";' + nl + "}"

if text.count(start_sig) != 1:
    print("ABORT: expected exactly 1 callAI signature, found %d" % text.count(start_sig))
    sys.exit(1)

i = text.find(start_sig)
j = text.find(end_sig, i)
if j == -1:
    print("ABORT: could not find end of callAI function.")
    sys.exit(1)
old_block = text[i : j + len(end_sig)]

new_block = nl.join([
    "async function callAI(prompt,maxTokens=2000){",
    "  let token=\"\";",
    "  try{ const { data:sess }=await supabase.auth.getSession(); token=sess&&sess.session&&sess.session.access_token||\"\"; }catch(e){}",
    "  if(!token)throw new Error(\"Please sign in to use AI features.\");",
    "  const res=await fetch(\"/api/ai/generate\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\",Authorization:`Bearer ${token}`},body:JSON.stringify({prompt,maxTokens})});",
    "  const data=await res.json().catch(()=>({}));",
    "  if(!res.ok)throw new Error(data?.error||`AI error ${res.status}. Please try again.`);",
    "  return data.text||\"\";",
    "}",
])

text = text.replace(old_block, new_block, 1)

# -- 2) Clean the stale key-reference error message in AIApplyModal --
old_err = '"Could not generate. Check that NEXT_PUBLIC_GEMINI_KEY is set in Vercel environment variables."'
new_err = '"Could not generate. Please try again in a moment."'
if text.count(old_err) == 1:
    text = text.replace(old_err, new_err, 1)
else:
    print("NOTE: stale error message not found (count=%d) -- skipping that cosmetic edit." % text.count(old_err))

remaining = text.count("NEXT_PUBLIC_GEMINI_KEY")
if remaining:
    print("WARNING: %d reference(s) to NEXT_PUBLIC_GEMINI_KEY still present -- review manually." % remaining)

if text == orig:
    print("ABORT: no changes were made.")
    sys.exit(1)

with io.open(PATH, "w", encoding="utf-8", newline="") as f:
    f.write(text)

print("OK: callAI rewired to /api/ai/generate. (line ending: %s)" % ("CRLF" if nl == "\r\n" else "LF"))
print("NEXT_PUBLIC_GEMINI_KEY references remaining: %d" % remaining)
