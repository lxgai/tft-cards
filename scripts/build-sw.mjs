/**
 * Post-build step: walks the static export and writes out/sw.js with a
 * precache list of every file it produced, plus a version derived from their
 * contents so a new build supersedes the old cache.
 *
 * Runs after `next build` because the asset filenames are content-hashed and
 * only exist once the build has run.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, posix, relative, resolve, sep } from "node:path";

const ROOT = resolve("out");
const TEMPLATE = resolve("scripts/sw-template.js");

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/** out/study/index.html -> /study/ ; out/index.html -> / ; anything else verbatim. */
function toUrl(file) {
  const rel = relative(ROOT, file).split(sep).join(posix.sep);
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
}

const files = walk(ROOT).filter((file) => !file.endsWith(`${sep}sw.js`));

const version = createHash("sha256");
for (const file of [...files].sort()) {
  version.update(toUrl(file));
  version.update(readFileSync(file));
}

const urls = [...new Set(files.map(toUrl))].sort();
const worker = readFileSync(TEMPLATE, "utf8")
  .replace("__VERSION__", version.digest("hex").slice(0, 12))
  .replace("__PRECACHE__", JSON.stringify(urls, null, 2));

writeFileSync(join(ROOT, "sw.js"), worker);
console.log(`sw.js: ${urls.length} files precached`);
