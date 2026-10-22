// /api/admin/companies/save  (owner only)
//   GET  → { ok:true, companiesTree, studiosMap }  — pristine current data (also the
//          owner gate for the /admin/companies page). Served from the SERVER's import
//          of the data files, so it's never affected by any client-side mutation.
//   POST { companiesTree, studiosMap } → regenerates lib/companiesData.js +
//          lib/studios.js and commits BOTH in a single commit to the repo. If
//          COOLIFY_DEPLOY_HOOK_URL is set, pings it to trigger a redeploy.
//
// Env:
//   GITHUB_TOKEN             (required for POST) fine-grained PAT, Contents: read/write
//   GITHUB_REPO              default "zacharyrudynep/main-quest"
//   GITHUB_BRANCH            default "main"
//   COOLIFY_DEPLOY_HOOK_URL  optional — POSTed after a successful commit
//   ADMIN_EMAIL              owner gate (same as the other admin endpoints)
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { COMPANIES_DATA } from "../../../../lib/companiesData";
import { ATS_STUDIOS } from "../../../../lib/studios";
import { generateCompaniesData, generateStudios } from "../../../../lib/companyFileGen";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();
const REPO = process.env.GITHUB_REPO || "zacharyrudynep/main-quest";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const GH = "https://api.github.com";

async function isOwner(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !ADMIN_EMAIL) return false;
  const { data: u } = await supabaseAdmin.auth.getUser(token);
  return !!(u && u.user && (u.user.email || "").toLowerCase() === ADMIN_EMAIL);
}

function gh(path, opts = {}) {
  const token = process.env.GITHUB_TOKEN;
  return fetch(`${GH}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "mainquest-admin",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
      ...(opts.headers || {}),
    },
  });
}

// Lightweight shape check so a malformed payload can't commit a broken file.
function validTree(t) {
  if (!t || typeof t !== "object" || Array.isArray(t)) return false;
  let companies = 0;
  for (const regions of Object.values(t)) {
    if (!regions || typeof regions !== "object") return false;
    for (const list of Object.values(regions)) {
      if (!Array.isArray(list)) return false;
      for (const c of list) { if (!c || typeof c !== "object" || !c.name) return false; companies++; }
    }
  }
  return companies > 0; // never let a save blank the whole directory
}

export default async function handler(req, res) {
  try {
    if (!(await isOwner(req))) return res.status(403).json({ error: "forbidden" });

    if (req.method === "GET") {
      return res.status(200).json({ ok: true, companiesTree: COMPANIES_DATA, studiosMap: ATS_STUDIOS });
    }
    if (req.method !== "POST") return res.status(405).json({ error: "GET or POST only" });

    if (!process.env.GITHUB_TOKEN) {
      return res.status(500).json({ error: "GITHUB_TOKEN is not configured on the server — add it before saving." });
    }

    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const tree = b.companiesTree;
    const studios = b.studiosMap || {};
    if (!validTree(tree)) return res.status(400).json({ error: "Company data looks malformed — nothing was saved." });
    if (!studios || typeof studios !== "object") return res.status(400).json({ error: "Studio (ATS) map looks malformed — nothing was saved." });

    // Regenerate both source files.
    const companiesSrc = generateCompaniesData(tree);
    const studiosSrc = generateStudios(studios);
    if (!companiesSrc.includes("export const COMPANIES_DATA") || !studiosSrc.includes("export const ATS_STUDIOS")) {
      return res.status(500).json({ error: "File generation failed a sanity check — nothing was saved." });
    }

    // ── Commit both files in ONE commit via the Git Data API ──
    // 1) current branch head → base commit + base tree
    const refR = await gh(`/repos/${REPO}/git/ref/heads/${BRANCH}`);
    if (!refR.ok) return res.status(502).json({ error: `GitHub: couldn't read branch (${refR.status}). Check GITHUB_TOKEN scope/repo.` });
    const refJ = await refR.json();
    const baseCommitSha = refJ.object && refJ.object.sha;
    const baseCommitR = await gh(`/repos/${REPO}/git/commits/${baseCommitSha}`);
    const baseCommitJ = await baseCommitR.json();
    const baseTreeSha = baseCommitJ.tree && baseCommitJ.tree.sha;

    // 2) blobs
    const mkBlob = async (content) => {
      const r = await gh(`/repos/${REPO}/git/blobs`, { method: "POST", body: JSON.stringify({ content, encoding: "utf-8" }) });
      if (!r.ok) throw new Error(`blob create failed (${r.status})`);
      return (await r.json()).sha;
    };
    const companiesBlob = await mkBlob(companiesSrc);
    const studiosBlob = await mkBlob(studiosSrc);

    // 3) tree
    const treeR = await gh(`/repos/${REPO}/git/trees`, {
      method: "POST",
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: [
          { path: "lib/companiesData.js", mode: "100644", type: "blob", sha: companiesBlob },
          { path: "lib/studios.js", mode: "100644", type: "blob", sha: studiosBlob },
        ],
      }),
    });
    if (!treeR.ok) return res.status(502).json({ error: `GitHub: tree create failed (${treeR.status}).` });
    const newTreeSha = (await treeR.json()).sha;

    // 4) commit
    const commitR = await gh(`/repos/${REPO}/git/commits`, {
      method: "POST",
      body: JSON.stringify({
        message: "Admin: update company directory via /admin/companies",
        tree: newTreeSha,
        parents: [baseCommitSha],
      }),
    });
    if (!commitR.ok) return res.status(502).json({ error: `GitHub: commit create failed (${commitR.status}).` });
    const newCommitSha = (await commitR.json()).sha;

    // 5) move the branch
    const updR = await gh(`/repos/${REPO}/git/refs/heads/${BRANCH}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: newCommitSha, force: false }),
    });
    if (!updR.ok) return res.status(502).json({ error: `GitHub: couldn't move branch (${updR.status}).` });

    // 6) optional auto-deploy
    let deploy = "manual";
    const hook = process.env.COOLIFY_DEPLOY_HOOK_URL;
    if (hook) {
      try { const h = await fetch(hook, { method: "POST" }); deploy = h.ok ? "triggered" : "hook_failed"; }
      catch (e) { deploy = "hook_failed"; }
    }

    return res.status(200).json({ ok: true, commit: newCommitSha, branch: BRANCH, deploy });
  } catch (e) {
    return res.status(500).json({ error: "Save failed: " + String((e && e.message) || e).slice(0, 200) });
  }
}