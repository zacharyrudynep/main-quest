// pages/admin/companies.js — owner-only company directory editor.
// Loads the pristine company data from the server (GET /api/admin/companies/save),
// lets the owner edit every field inline, and on Save regenerates lib/companiesData.js
// + lib/studios.js and commits them to the repo (POST same endpoint).
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

const GOLD = "#c9a84c";
const G = "linear-gradient(135deg,#c9a84c,#e8613a)";
const TIERS = ["", "AAA", "AA", "Indie", "Publishers", "Outsourcing"];
const ATS_PLATFORMS = ["", "greenhouse", "lever", "ashby", "workable", "smartrecruiters", "recruitee", "applytojob", "bamboohr", "jobvite", "personio", "rippling", "breezy", "workday", "dayforce", "teamtailor"];
const RI_MODES = [["none", "None"], ["link", "External link"], ["email", "Register by email"], ["contact", "Contact page"]];
const INTERN = [["unknown", "Unknown"], ["yes", "Offers internships"], ["no", "No internships"]];

const KNOWN_KEYS = new Set(["name", "url", "email", "contact", "tier", "emailApply", "emailSpecifics", "internship", "internshipLink", "internshipNote", "registerInterest", "registerInterestLink", "registerInterestSameAs"]);

let _uid = 0;
const nextId = () => `c${++_uid}`;

// ── tree → editable logical companies (one per unique name, first occurrence wins
//    for fields; every occurrence contributes a location) ──
function parse(tree) {
  const order = { countries: Object.keys(tree), regions: {} };
  for (const c of order.countries) order.regions[c] = Object.keys(tree[c] || {});
  const byName = new Map();
  for (const country of order.countries) {
    for (const region of order.regions[country]) {
      for (const co of tree[country][region] || []) {
        let L = byName.get(co.name);
        if (!L) {
          const extra = {};
          for (const k of Object.keys(co)) if (!KNOWN_KEYS.has(k)) extra[k] = co[k];
          // register interest mode inference
          let ri = { mode: "none", value: "", sameAs: false };
          if (co.registerInterest === "email") {
            ri = { mode: "email", value: co.registerInterestLink || "", sameAs: !!co.email && co.registerInterestLink === co.email };
          } else if (co.registerInterest) {
            if (!!co.contact && co.registerInterestLink === co.contact) ri = { mode: "contact", value: co.registerInterestLink || "", sameAs: true };
            else ri = { mode: "link", value: co.registerInterestLink || "", sameAs: false };
          } else if (co.registerInterestLink) {
            // A link present with no active flag (dormant). Preserve it verbatim so a
            // save doesn't drop it; it stays inactive until a mode is chosen.
            extra.registerInterestLink = co.registerInterestLink;
          }
          L = {
            _id: nextId(), origName: co.name, name: co.name,
            url: co.url || "", email: co.email || "", contact: co.contact || "",
            tier: co.tier || "",
            emailApply: !!co.emailApply, emailSpecifics: co.emailSpecifics || "",
            ri,
            internship: { status: co.internship === "yes" ? "yes" : co.internship === "no" ? "no" : "unknown", link: co.internshipLink || "", note: co.internshipNote || "" },
            ats: { platform: "", slug: "" },
            locations: [], extra,
          };
          byName.set(co.name, L);
        }
        if (!L.locations.some((x) => x.country === country && x.region === region)) L.locations.push({ country, region });
      }
    }
  }
  return { companies: [...byName.values()], order };
}

// logical → a company object for the data file
function toObj(L) {
  const o = { name: L.name.trim(), url: (L.url || "").trim(), email: (L.email || "").trim() || null, contact: (L.contact || "").trim() || null };
  if (L.tier) o.tier = L.tier;
  const rv = (L.ri.value || "").trim();
  if (L.ri.mode === "link") { o.registerInterest = true; if (rv) o.registerInterestLink = rv; }
  else if (L.ri.mode === "email") { o.registerInterest = "email"; const v = L.ri.sameAs ? (o.email || "") : rv; if (v) o.registerInterestLink = v; }
  else if (L.ri.mode === "contact") { o.registerInterest = true; const v = L.ri.sameAs ? (o.contact || "") : rv; if (v) o.registerInterestLink = v; }
  if (L.emailApply) o.emailApply = true;
  if ((L.emailSpecifics || "").trim()) o.emailSpecifics = L.emailSpecifics.trim();
  if (L.internship.status === "yes") o.internship = "yes";
  else if (L.internship.status === "no") o.internship = "no";
  if ((L.internship.link || "").trim()) o.internshipLink = L.internship.link.trim();
  if ((L.internship.note || "").trim()) o.internshipNote = L.internship.note.trim();
  // Passthrough any unmanaged keys (e.g. volunteer, a dormant registerInterestLink).
  // Skip RI keys when the RI control is active so the editor's value wins.
  for (const k of Object.keys(L.extra || {})) {
    if ((k === "registerInterest" || k === "registerInterestLink") && L.ri.mode !== "none") continue;
    o[k] = L.extra[k];
  }
  return o;
}

// logical[] + original order + original studios → { tree, studios }
function build(companies, order, originalTree, originalStudios) {
  const byOrig = new Map();
  for (const L of companies) if (L.origName) byOrig.set(L.origName, L);
  const tree = {}; const emitted = new Set();
  const key = (n, c, r) => `${n}\u0000${c}\u0000${r}`;
  const put = (c, r, obj) => { (tree[c] = tree[c] || {}); (tree[c][r] = tree[c][r] || []); tree[c][r].push(obj); };
  // original order first
  for (const c of order.countries) {
    for (const r of (order.regions[c] || [])) {
      for (const co of (originalTree[c] && originalTree[c][r]) || []) {
        const L = byOrig.get(co.name);
        if (!L) continue;
        if (L.locations.some((x) => x.country === c && x.region === r) && !emitted.has(key(L.name, c, r))) {
          put(c, r, toObj(L)); emitted.add(key(L.name, c, r));
        }
      }
    }
  }
  // new locations + brand-new companies
  for (const L of companies) {
    for (const loc of L.locations) {
      if (!emitted.has(key(L.name, loc.country, loc.region))) { put(loc.country, loc.region, toObj(L)); emitted.add(key(L.name, loc.country, loc.region)); }
    }
  }
  // studios: start from original (preserves ATS entries whose name isn't in the
  // directory), then apply each company's edits.
  const studios = JSON.parse(JSON.stringify(originalStudios || {}));
  for (const L of companies) {
    if (L.origName && L.origName !== L.name && studios[L.origName]) delete studios[L.origName];
    const plat = (L.ats.platform || "").trim(), slug = (L.ats.slug || "").trim();
    if (plat && slug) studios[L.name] = { platform: plat, slug };
    else delete studios[L.name];
  }
  return { tree, studios };
}

export default function CompaniesAdmin() {
  const [status, setStatus] = useState("loading"); // loading|login|denied|error|ready
  const [companies, setCompanies] = useState([]);
  const [order, setOrder] = useState(null);
  const [origTree, setOrigTree] = useState(null);
  const [origStudios, setOrigStudios] = useState(null);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // {tone, text}

  async function token() { const { data } = await supabase.auth.getSession(); return data && data.session && data.session.access_token; }

  useEffect(() => {
    (async () => {
      const tk = await token();
      if (!tk) { setStatus("login"); return; }
      try {
        const r = await fetch("/api/admin/companies/save", { headers: { Authorization: `Bearer ${tk}` } });
        if (r.status === 401 || r.status === 403) { setStatus("denied"); return; }
        if (!r.ok) { setStatus("error"); return; }
        const j = await r.json();
        const { companies, order } = parse(j.companiesTree || {});
        const studios = j.studiosMap || {};
        for (const L of companies) { const s = studios[L.name]; if (s) L.ats = { platform: s.platform || "", slug: s.slug || "" }; }
        setCompanies(companies); setOrder(order); setOrigTree(j.companiesTree || {}); setOrigStudios(studios);
        setStatus("ready");
      } catch (e) { setStatus("error"); }
    })();
  }, []);

  const countriesList = useMemo(() => (order ? order.countries.slice() : []), [order]);
  const regionsByCountry = useMemo(() => (order ? order.regions : {}), [order]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return companies;
    return companies.filter((c) => c.name.toLowerCase().includes(s));
  }, [companies, q]);

  const update = (id, patch) => setCompanies((cs) => cs.map((c) => (c._id === id ? { ...c, ...patch } : c)));

  const addCompany = () => {
    const L = { _id: nextId(), origName: null, name: "New Company", url: "", email: "", contact: "", tier: "", emailApply: false, emailSpecifics: "", ri: { mode: "none", value: "", sameAs: false }, internship: { status: "unknown", link: "", note: "" }, ats: { platform: "", slug: "" }, locations: [], extra: {} };
    setCompanies((cs) => [L, ...cs]);
    setOpenId(L._id);
    setMsg(null);
  };

  const removeCompany = (id) => {
    if (!confirm("Remove this company entirely? It will disappear from the board on the next deploy.")) return;
    setCompanies((cs) => cs.filter((c) => c._id !== id));
  };

  async function save() {
    setSaving(true); setMsg(null);
    try {
      // guard: no blank/dup names
      const names = companies.map((c) => c.name.trim());
      if (names.some((n) => !n)) { setMsg({ tone: "err", text: "Every company needs a name." }); setSaving(false); return; }
      const { tree, studios } = build(companies, order, origTree, origStudios);
      const tk = await token();
      const r = await fetch("/api/admin/companies/save", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tk}` }, body: JSON.stringify({ companiesTree: tree, studiosMap: studios }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg({ tone: "err", text: j.error || "Save failed." }); setSaving(false); return; }
      const deployNote = j.deploy === "triggered" ? "A redeploy was triggered — changes go live in a few minutes." : j.deploy === "hook_failed" ? "Committed, but the deploy hook failed — deploy manually to go live." : "Committed. Deploy to make it live on the board.";
      setMsg({ tone: "ok", text: `Saved ✓  ${deployNote}` });
    } catch (e) { setMsg({ tone: "err", text: "Save failed — try again." }); }
    finally { setSaving(false); }
  }

  return (
    <>
      <Head>
        <title>Main Quest — Company Editor</title>
        <meta name="robots" content="noindex" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: "100vh", background: "radial-gradient(1100px 620px at 50% -12%, rgba(139,32,32,.14), transparent), #080608", color: "#f4edd8", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif", padding: "28px 18px 120px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 22, fontWeight: 700, background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Company Editor</div>
            <a href="/admin" style={{ textDecoration: "none", color: "rgba(244,237,216,.55)", fontSize: 12, fontFamily: "'Cinzel',serif" }}>← Back to admin</a>
          </div>

          {status === "loading" && <Note>Loading company directory…</Note>}
          {status === "login" && <Note>Please sign in as the owner on the <a href="/" style={{ color: GOLD }}>board</a> first, then return here.</Note>}
          {status === "denied" && <Note>This account isn't the owner.</Note>}
          {status === "error" && <Note>Couldn't load. Make sure <code>ADMIN_EMAIL</code> is set and you're the owner.</Note>}

          {status === "ready" && (
            <>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies…" style={{ flex: 1, minWidth: 220, background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.25)", color: "#f4edd8", borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none" }} />
                <button onClick={addCompany} style={{ background: G, border: "none", color: "#0a0608", borderRadius: 10, padding: "11px 16px", fontSize: 13, fontWeight: 800, fontFamily: "'Cinzel',serif", cursor: "pointer", whiteSpace: "nowrap" }}>+ Add Company</button>
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(244,237,216,.4)", marginBottom: 14 }}>{filtered.length} of {companies.length} companies{q ? " match" : ""}. Changes save to your repo files and go live after a deploy.</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.map((c) => (
                  <CompanyCard key={c._id} c={c} open={openId === c._id} onToggle={() => setOpenId(openId === c._id ? null : c._id)} onChange={(patch) => update(c._id, patch)} onRemove={() => removeCompany(c._id)} countriesList={countriesList} regionsByCountry={regionsByCountry} />
                ))}
                {filtered.length === 0 && <Note>No companies match “{q}”.</Note>}
              </div>
            </>
          )}
        </div>

        {status === "ready" && (
          <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, background: "linear-gradient(0deg, #080608 60%, transparent)", padding: "18px", display: "flex", justifyContent: "center", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            {msg && <span style={{ fontSize: 12.5, color: msg.tone === "err" ? "#e8a070" : "#7ecfb3", maxWidth: 520, textAlign: "right" }}>{msg.text}</span>}
            <button onClick={save} disabled={saving} style={{ background: G, border: "none", color: "#0a0608", borderRadius: 12, padding: "14px 34px", fontSize: 14, fontWeight: 800, fontFamily: "'Cinzel',serif", letterSpacing: .5, cursor: saving ? "default" : "pointer", boxShadow: "0 8px 28px rgba(201,168,76,.4)", opacity: saving ? .7 : 1 }}>{saving ? "Saving…" : "Save changes"}</button>
          </div>
        )}
      </div>
    </>
  );
}

function CompanyCard({ c, open, onToggle, onChange, onRemove, countriesList, regionsByCountry }) {
  const [addLoc, setAddLoc] = useState(false);
  const [nc, setNc] = useState(""); const [nr, setNr] = useState("");
  const set = (patch) => onChange(patch);
  const setRi = (patch) => onChange({ ri: { ...c.ri, ...patch } });
  const setIntern = (patch) => onChange({ internship: { ...c.internship, ...patch } });
  const setAts = (patch) => onChange({ ats: { ...c.ats, ...patch } });
  const removeLoc = (i) => onChange({ locations: c.locations.filter((_, idx) => idx !== i) });
  const addLocation = () => {
    const country = nc.trim(), region = nr.trim();
    if (!country || !region) return;
    if (!c.locations.some((l) => l.country === country && l.region === region)) onChange({ locations: [...c.locations, { country, region }] });
    setNc(""); setNr(""); setAddLoc(false);
  };

  return (
    <div style={{ border: "1px solid rgba(201,168,76,.2)", borderRadius: 12, background: "rgba(16,10,22,.5)", overflow: "hidden" }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 15px", cursor: "pointer" }}>
        <span style={{ color: GOLD, fontSize: 12, transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }}>▶</span>
        <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 14, color: "#f4edd8", flex: 1 }}>{c.name || "(unnamed)"}</span>
        {c.tier && <Tag>{c.tier}</Tag>}
        {c.ats.platform && <Tag muted>{c.ats.platform}</Tag>}
        <span style={{ fontSize: 10.5, color: "rgba(244,237,216,.35)" }}>{c.locations.length} loc</span>
      </div>

      {open && (
        <div style={{ padding: "4px 15px 18px", display: "flex", flexDirection: "column", gap: 13 }}>
          <Field label="Company name"><input style={inp} value={c.name} onChange={(e) => set({ name: e.target.value })} /></Field>
          <Row>
            <Field label="Site URL"><input style={inp} value={c.url} onChange={(e) => set({ url: e.target.value })} placeholder="https://…" /></Field>
            <Field label="Email"><input style={inp} value={c.email} onChange={(e) => set({ email: e.target.value })} placeholder="jobs@studio.com" /></Field>
          </Row>
          <Field label="Contact page URL"><input style={inp} value={c.contact} onChange={(e) => set({ contact: e.target.value })} placeholder="https://…/contact" /></Field>

          <Row>
            <Field label="Industry tier"><select style={sel} value={c.tier} onChange={(e) => set({ tier: e.target.value })}>{TIERS.map((t) => <option key={t} value={t} style={opt}>{t || "— none —"}</option>)}</select></Field>
            <Field label="Email-apply only">
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 0" }}>
                <input type="checkbox" checked={c.emailApply} onChange={(e) => set({ emailApply: e.target.checked })} />
                <span style={{ fontSize: 12.5, color: "rgba(244,237,216,.7)" }}>Applications only accepted by email</span>
              </label>
            </Field>
          </Row>

          {/* Register interest */}
          <div style={box}>
            <Label>Register interest</Label>
            <Row>
              <Field label="Mode"><select style={sel} value={c.ri.mode} onChange={(e) => setRi({ mode: e.target.value })}>{RI_MODES.map(([v, l]) => <option key={v} value={v} style={opt}>{l}</option>)}</select></Field>
              {(c.ri.mode === "email" || c.ri.mode === "contact") && (
                <Field label="Shortcut">
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 0" }}>
                    <input type="checkbox" checked={c.ri.sameAs} onChange={(e) => setRi({ sameAs: e.target.checked })} />
                    <span style={{ fontSize: 12, color: "rgba(244,237,216,.7)" }}>Same as company {c.ri.mode === "email" ? "email" : "contact page"}</span>
                  </label>
                </Field>
              )}
            </Row>
            {c.ri.mode !== "none" && !c.ri.sameAs && (
              <Field label={c.ri.mode === "email" ? "Email to register with" : c.ri.mode === "contact" ? "Contact page URL" : "External registration link"}>
                <input style={inp} value={c.ri.value} onChange={(e) => setRi({ value: e.target.value })} placeholder={c.ri.mode === "email" ? "careers@studio.com" : "https://…"} />
              </Field>
            )}
            {c.ri.mode !== "none" && c.ri.sameAs && <div style={{ fontSize: 11, color: "rgba(244,237,216,.4)" }}>Will use the company {c.ri.mode === "email" ? "email" : "contact page URL"} above.</div>}
          </div>

          <Field label="Email specifics (what to include when emailing)"><textarea style={{ ...inp, minHeight: 54, resize: "vertical" }} value={c.emailSpecifics} onChange={(e) => set({ emailSpecifics: e.target.value })} placeholder="e.g. include portfolio link and role in subject" /></Field>

          {/* ATS */}
          <div style={box}>
            <Label>ATS / job feed</Label>
            <Row>
              <Field label="ATS platform"><select style={sel} value={c.ats.platform} onChange={(e) => setAts({ platform: e.target.value })}>{ATS_PLATFORMS.map((p) => <option key={p} value={p} style={opt}>{p || "— none —"}</option>)}</select></Field>
              <Field label="Slug"><input style={inp} value={c.ats.slug} onChange={(e) => setAts({ slug: e.target.value })} placeholder="studioslug" /></Field>
            </Row>
            <div style={{ fontSize: 10.5, color: "rgba(244,237,216,.35)" }}>With both set, live jobs are pulled from this feed. Leave blank for a directory-only listing.</div>
          </div>

          {/* Internship */}
          <div style={box}>
            <Label>Internships</Label>
            <Row>
              <Field label="Status"><select style={sel} value={c.internship.status} onChange={(e) => setIntern({ status: e.target.value })}>{INTERN.map(([v, l]) => <option key={v} value={v} style={opt}>{l}</option>)}</select></Field>
              <Field label="Link (optional)"><input style={inp} value={c.internship.link} onChange={(e) => setIntern({ link: e.target.value })} placeholder="https://…/internships" /></Field>
            </Row>
            <Field label="Note (optional)"><input style={inp} value={c.internship.note} onChange={(e) => setIntern({ note: e.target.value })} placeholder="e.g. summer only, US-based" /></Field>
          </div>

          {/* Locations */}
          <div style={box}>
            <Label>Locations <span style={{ color: "rgba(244,237,216,.4)", fontWeight: 400 }}>— a company shows on the board wherever it has a location</span></Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 8 }}>
              {c.locations.map((l, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(201,168,76,.14)", border: "1px solid rgba(201,168,76,.4)", borderRadius: 18, padding: "5px 10px", fontSize: 12, color: "#f0d080" }}>
                  {l.region}, {l.country}
                  <span onClick={() => removeLoc(i)} style={{ cursor: "pointer", color: "rgba(232,97,58,.9)", fontWeight: 700 }}>×</span>
                </span>
              ))}
              {c.locations.length === 0 && <span style={{ fontSize: 11.5, color: "rgba(232,140,112,.8)" }}>No locations — won't appear on the board until you add one.</span>}
            </div>
            {!addLoc && <button onClick={() => setAddLoc(true)} style={pill}>+ Add location</button>}
            {addLoc && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <input list="mq-countries" style={{ ...inp, width: 170 }} value={nc} onChange={(e) => setNc(e.target.value)} placeholder="Country" />
                <input list={`mq-regions`} style={{ ...inp, width: 170 }} value={nr} onChange={(e) => setNr(e.target.value)} placeholder="State / region" />
                <datalist id="mq-countries">{countriesList.map((x) => <option key={x} value={x} />)}</datalist>
                <datalist id="mq-regions">{Array.from(new Set(Object.values(regionsByCountry).flat())).map((x) => <option key={x} value={x} />)}</datalist>
                <button onClick={addLocation} style={{ ...pill, background: "rgba(126,207,179,.14)", borderColor: "rgba(126,207,179,.4)", color: "#7ecfb3" }}>Add</button>
                <button onClick={() => { setAddLoc(false); setNc(""); setNr(""); }} style={pill}>Cancel</button>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
            <button onClick={onRemove} style={{ background: "rgba(224,112,96,.1)", border: "1px solid rgba(224,112,96,.4)", color: "#e07060", borderRadius: 8, padding: "7px 14px", fontSize: 11.5, fontFamily: "'Cinzel',serif", fontWeight: 700, cursor: "pointer" }}>Delete company</button>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = { background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.22)", color: "#f4edd8", borderRadius: 8, padding: "9px 11px", fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none", fontFamily: "inherit" };
const sel = { ...inp, colorScheme: "dark", cursor: "pointer" };
const opt = { background: "#140d14", color: "#f4edd8" };
const box = { border: "1px solid rgba(201,168,76,.14)", borderRadius: 10, padding: "12px 13px", background: "rgba(201,168,76,.03)", display: "flex", flexDirection: "column", gap: 10 };
const pill = { background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.3)", color: "#f0d080", borderRadius: 8, padding: "7px 13px", fontSize: 11.5, fontFamily: "'Cinzel',serif", fontWeight: 700, cursor: "pointer" };

function Field({ label, children }) { return <div style={{ flex: 1, minWidth: 180 }}><div style={{ fontSize: 10.5, color: "rgba(201,168,76,.7)", textTransform: "uppercase", letterSpacing: .6, fontFamily: "'Cinzel',serif", marginBottom: 5 }}>{label}</div>{children}</div>; }
function Row({ children }) { return <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{children}</div>; }
function Label({ children }) { return <div style={{ fontSize: 11, color: "rgba(201,168,76,.8)", textTransform: "uppercase", letterSpacing: .7, fontFamily: "'Cinzel',serif", fontWeight: 700 }}>{children}</div>; }
function Tag({ children, muted }) { return <span style={{ fontSize: 9, fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: .4, padding: "2px 8px", borderRadius: 20, color: muted ? "#8fd0e8" : "#f0d080", background: muted ? "rgba(96,160,232,.12)" : "rgba(201,168,76,.14)", border: `1px solid ${muted ? "rgba(96,160,232,.3)" : "rgba(201,168,76,.4)"}` }}>{children}</span>; }
function Note({ children }) { return <div style={{ color: "rgba(244,237,216,.6)", fontSize: 13.5, lineHeight: 1.6, padding: "18px 2px" }}>{children}</div>; }