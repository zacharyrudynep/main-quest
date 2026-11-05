// remove-font-links.mjs — one-time: strip the old Google Fonts <link> tags from every
// page, now that the fonts are self-hosted via Fontsource (imported in pages/_app.js).
// Run from the repo root:  node remove-font-links.mjs
//
// It only deletes lines that reference fonts.googleapis.com or fonts.gstatic.com — i.e.
// the <link rel="preconnect"> and <link ... stylesheet> tags for Google Fonts. Nothing
// else is touched. It prints exactly what it removed from each file.
import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join } from "path";

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(js|jsx)$/.test(name)) out.push(p);
  }
  return out;
}

let files = 0, removed = 0;
for (const file of walk("pages")) {
  const lines = readFileSync(file, "utf8").split("\n");
  const kept = lines.filter((l) => !/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(l));
  if (kept.length !== lines.length) {
    removed += lines.length - kept.length;
    writeFileSync(file, kept.join("\n"));
    console.log(`${file}: removed ${lines.length - kept.length} line(s)`);
    files++;
  }
}
console.log(`\nDone: stripped ${removed} Google Fonts link line(s) from ${files} file(s).`);
if (removed === 0) console.log("(Nothing found — either already removed, or run this from the repo root.)");
