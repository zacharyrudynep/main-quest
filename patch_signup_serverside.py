#!/usr/bin/env python3
# Route both signup call sites (LoginPopup + Auth) through /api/auth/signup so
# account creation is gated by the IP ban list. Auto-detects CRLF/LF, verifies
# each anchor is unique, and aborts cleanly on any mismatch (no partial writes).

import io, sys

PATH = r"pages\index.js"

with io.open(PATH, "r", encoding="utf-8", newline="") as f:
    text = f.read()
orig = text
nl = "\r\n" if "\r\n" in text else "\n"

def block(lines):
    return nl.join(lines)

# ── 1) LoginPopup (compact style) ────────────────────────────────────────────
old_popup = block([
    '        const {data,error}=await supabase.auth.signUp({email,password:pass});',
    '        if(error){setErr(error.message);setLoading(false);return;}',
    '        await supabase.from("profiles").insert({id:data.user.id,name,data:{tosVersion:TOS_VERSION}});',
    '        onLogin({id:data.user.id,email,name,applied:{},profile:{tosVersion:TOS_VERSION}});',
])
new_popup = block([
    '        const _r=await fetch("/api/auth/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password:pass,name,tosVersion:TOS_VERSION})});',
    '        const _j=await _r.json().catch(()=>({}));',
    '        if(!_r.ok){setErr(_j.error||"Could not create account.");setLoading(false);return;}',
    '        const {data,error}=await supabase.auth.signInWithPassword({email,password:pass});',
    '        if(error){setErr("Account created - please sign in.");setLoading(false);return;}',
    '        onLogin({id:data.user.id,email,name,applied:{},profile:{tosVersion:TOS_VERSION}});',
])

# ── 2) Auth (spaced style) ───────────────────────────────────────────────────
old_auth = block([
    '        const { data, error } = await supabase.auth.signUp({ email, password: pass });',
    '        if (error) { setErr(error.message); setLoading(false); return; }',
    '        await supabase.from("profiles").insert({ id: data.user.id, name, data: { tosVersion: TOS_VERSION } });',
    '        onLogin({ id: data.user.id, email, name, applied: {}, profile: { tosVersion: TOS_VERSION } });',
])
new_auth = block([
    '        const _r = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: pass, name, tosVersion: TOS_VERSION }) });',
    '        const _j = await _r.json().catch(() => ({}));',
    '        if (!_r.ok) { setErr(_j.error || "Could not create account."); setLoading(false); return; }',
    '        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });',
    '        if (error) { setErr("Account created - please sign in."); setLoading(false); return; }',
    '        onLogin({ id: data.user.id, email, name, applied: {}, profile: { tosVersion: TOS_VERSION } });',
])

for label, old, new in [("LoginPopup", old_popup, new_popup), ("Auth", old_auth, new_auth)]:
    c = text.count(old)
    if c != 1:
        print("ABORT: %s signup block matched %d times (expected 1). No changes written." % (label, c))
        sys.exit(1)

text = text.replace(old_popup, new_popup, 1)
text = text.replace(old_auth, new_auth, 1)

# sanity: no direct signUp calls left
left = text.count("supabase.auth.signUp(")
if left:
    print("WARNING: %d direct supabase.auth.signUp( call(s) still present -- review." % left)

if text == orig:
    print("ABORT: no changes were made.")
    sys.exit(1)

with io.open(PATH, "w", encoding="utf-8", newline="") as f:
    f.write(text)

print("OK: both signup paths routed through /api/auth/signup. (line ending: %s)" % ("CRLF" if nl == "\r\n" else "LF"))
print("Remaining direct signUp calls: %d" % left)
