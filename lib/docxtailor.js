import JSZip from "jszip";

// Surgically rewrites the text inside an existing .docx while preserving all of its
// formatting (fonts, sizes, colors, bold lead-ins, bullets, spacing). We keep each
// paragraph's <w:pPr> and re-emit runs from the reworded text using the paragraph's
// own bold/normal run properties as templates. Validated against real resume docx.

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const unesc = (t) => String(t).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");

function splitParagraphs(xml) { return xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) || []; }
function paraPlain(p) { return (p.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || []).map(m => unesc(m.replace(/<[^>]+>/g, ""))).join(""); }

function paraMarkdown(p) {
  const runRe = /<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g; let m; const segs = [];
  while ((m = runRe.exec(p))) {
    const inner = m[1];
    const rpr = (inner.match(/<w:rPr>[\s\S]*?<\/w:rPr>/) || [""])[0];
    const bold = /<w:b\/>|<w:b /.test(rpr);
    const txt = (inner.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/) || [, ""])[1];
    if (txt !== "") segs.push({ bold, txt: unesc(txt) });
  }
  let out = "", i = 0;
  while (i < segs.length) { let j = i; const b = segs[i].bold; let t = ""; while (j < segs.length && segs[j].bold === b) { t += segs[j].txt; j++; } out += b ? `**${t}**` : t; i = j; }
  return out;
}
function rprTemplates(p) {
  let bold = null, normal = null;
  const re = /<w:r\b[^>]*>(<w:rPr>[\s\S]*?<\/w:rPr>)?<w:t/g; let m;
  while ((m = re.exec(p))) { const rpr = m[1] || "<w:rPr/>"; if (/<w:b\/>/.test(rpr) && !bold) bold = rpr; if (!/<w:b\/>/.test(rpr) && !normal) normal = rpr; }
  if (bold && !normal) normal = bold.replace("<w:b/>", "");
  if (normal && !bold) bold = normal.includes("<w:rPr>") ? normal.replace("<w:rPr>", "<w:rPr><w:b/>") : "<w:rPr><w:b/></w:rPr>";
  return { bold: bold || "<w:rPr/>", normal: normal || "<w:rPr/>" };
}
function buildRuns(md, bt, nt) {
  let out = "";
  for (const seg of md.split(/(\*\*[^*]+\*\*)/g)) { if (!seg) continue; const b = /^\*\*[\s\S]+\*\*$/.test(seg); const txt = b ? seg.slice(2, -2) : seg; out += `<w:r>${b ? bt : nt}<w:t xml:space="preserve">${esc(txt)}</w:t></w:r>`; }
  return out;
}
function rebuildPara(p, newMd) {
  const pPr = (p.match(/^<w:p[^>]*>(<w:pPr>[\s\S]*?<\/w:pPr>)/) || [, ""])[1];
  const open = (p.match(/^<w:p[^>]*>/) || ["<w:p>"])[0];
  const { bold, normal } = rprTemplates(p);
  return `${open}${pPr}${buildRuns(newMd, bold, normal)}</w:p>`;
}

// rewriteFn(markdownArray) -> Promise<rewrittenArray | null>. Returning null triggers fallback.
export async function tailorDocx(base64, rewriteFn) {
  const zip = await JSZip.loadAsync(Buffer.from(base64, "base64"));
  const docFile = zip.file("word/document.xml");
  if (!docFile) throw new Error("not a valid docx");
  let xml = await docFile.async("string");
  const paras = splitParagraphs(xml);
  const items = paras.map((p) => ({ p, md: paraMarkdown(p), plain: paraPlain(p) })).filter((x) => x.plain.trim().length > 0);
  if (!items.length) throw new Error("no text paragraphs");

  const rewrites = await rewriteFn(items.map((x) => x.md));
  if (!rewrites || rewrites.length !== items.length) return null; // caller falls back

  let changed = 0;
  for (let i = 0; i < items.length; i++) {
    const nm = rewrites[i];
    if (nm && nm.trim() && nm.trim() !== items[i].md.trim()) {
      xml = xml.replace(items[i].p, rebuildPara(items[i].p, nm));
      changed++;
    }
  }
  zip.file("word/document.xml", xml);
  const outB64 = await zip.generateAsync({ type: "base64", compression: "DEFLATE" });
  // plain text of the tailored resume, for scoring + the diff
  const plain = items.map((x, i) => (rewrites[i] || x.md).replace(/\*\*/g, "")).join("\n");
  return { base64: outB64, plain, changed };
}