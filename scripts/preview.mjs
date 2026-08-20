/**
 * Serves the static export in ./out. Zero dependencies on purpose — the whole
 * point of `output: "export"` is that the built app is just files, and the
 * preview should not need a toolchain the deployed site doesn't.
 */
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const ROOT = resolve("out");
const PORT = Number(process.env.PORT ?? 4321);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

/** Resolves a URL to a file inside ./out, or null. Never escapes the root. */
async function locate(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const target = join(ROOT, clean);
  if (!target.startsWith(ROOT)) return null;

  for (const candidate of [target, join(target, "index.html"), `${target}.html`]) {
    try {
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch {
      // try the next shape
    }
  }
  return null;
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  const file = (await locate(pathname)) ?? (await locate("/404"));

  if (!file) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found");
    return;
  }

  res.writeHead(pathname === "/" || (await locate(pathname)) ? 200 : 404, {
    "content-type": TYPES[extname(file)] ?? "application/octet-stream",
    "cache-control": "no-store",
  });
  createReadStream(file).pipe(res);
});

try {
  await stat(ROOT);
} catch {
  console.error("No ./out directory — run `npm run build` first.");
  process.exit(1);
}

server.listen(PORT, () => {
  console.log(`TFT Set 18 flashcards → http://localhost:${PORT}`);
  console.log("Static files from ./out. Ctrl-C to stop.");
});
