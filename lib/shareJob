// Compact, URL-safe encoding of the essentials of a job so a shared link can render
// a standalone job page (and social meta tags) without a live data fetch.
// Works both in the browser (btoa/atob) and on the server (Buffer) for getServerSideProps.

export function encodeJob(job) {
  const data = {
    c: job.company || "",
    t: job.title || "",
    l: job.location || "",
    s: (job.summary || "").slice(0, 320),
    sal: job.salary || "",
    ty: job.type || "",
    e: job.experience || "",
    u: job.applyUrl || job.url || "",
    r: !!job.isRemote,
    h: !!job.isHybrid,
    v: !!job.isVolunteer,
  };
  const json = JSON.stringify(data);
  let b64;
  if (typeof btoa !== "undefined") b64 = btoa(unescape(encodeURIComponent(json)));
  else b64 = Buffer.from(json, "utf-8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeJob(key) {
  try {
    let b64 = String(key || "").replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    let json;
    if (typeof atob !== "undefined") json = decodeURIComponent(escape(atob(b64)));
    else json = Buffer.from(b64, "base64").toString("utf-8");
    const d = JSON.parse(json);
    if (!d || !d.t) return null;
    return {
      company: d.c || "",
      title: d.t || "",
      location: d.l || "",
      summary: d.s || "",
      salary: d.sal || "",
      type: d.ty || "",
      experience: d.e || "",
      applyUrl: d.u || "",
      isRemote: !!d.r,
      isHybrid: !!d.h,
      isVolunteer: !!d.v,
    };
  } catch (e) {
    return null;
  }
}