// convert-shots.mjs — one-time: turn the feature-tour PNG screenshots into .webp.
// Run from the repo root:  node convert-shots.mjs
// It reads every public/shots/*.png and writes a matching .webp next to it (quality 80,
// visually identical for screenshots). The board references the .webp files now, so after
// this runs and looks right you can delete the .png originals to shrink the repo/deploy.
import sharp from "sharp";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const dir = "public/shots";
const files = readdirSync(dir).filter((f) => /\.png$/i.test(f));
if (!files.length) { console.log("No PNGs found in public/shots — nothing to do."); process.exit(0); }

let before = 0, after = 0;
for (const f of files) {
  const src = join(dir, f);
  const dst = join(dir, f.replace(/\.png$/i, ".webp"));
  const p = statSync(src).size; before += p;
  await sharp(src).webp({ quality: 80 }).toFile(dst);
  const w = statSync(dst).size; after += w;
  console.log(`${f.padEnd(26)} ${(p / 1048576).toFixed(2)}MB -> ${(w / 1024).toFixed(0)}KB`);
}
console.log(`\nDone: ${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB across ${files.length} files.`);
console.log("The .webp files are in public/shots/. Once the feature tour looks right, you can delete the .png versions.");
