#!/usr/bin/env node
/*!
 * Cross-platform postbuild sync.
 *
 * `vite build` writes the IIFE bundle to `widget/dist/widget.js`. The
 * Next.js dashboard's `public/widget.js` is the public copy that gets
 * served to every customer site, so we copy the freshly-built bundle
 * there. We never hand-edit `frontend/public/widget.js` — the file is
 * generated output.
 *
 * The script intentionally uses `node:fs/promises` + `node:path` so it
 * works on Windows, macOS, and Linux without depending on a POSIX
 * shell. It resolves paths relative to the widget package root so the
 * script works regardless of the caller's `cwd`.
 */
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

async function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

async function main() {
  const widgetRoot = path.resolve(__dirname, "..");
  // `frontend/` is the Next.js app directory; `widget/` is a sibling.
  const projectRoot = path.resolve(widgetRoot, "..");

  const src = path.join(widgetRoot, "dist", "widget.js");
  const destDir = path.join(projectRoot, "frontend", "public");
  const dest = path.join(destDir, "widget.js");

  let srcBuf;
  try {
    srcBuf = await fs.readFile(src);
  } catch (err) {
    console.error(
      `[scrappy-widget] sync-artifact: cannot read ${src} (${err.message})`
    );
    process.exit(1);
  }

  await fs.mkdir(destDir, { recursive: true });

  // Skip the copy if the destination is byte-identical to avoid
  // needlessly touching mtimes during iterative builds.
  let destBuf = null;
  try {
    destBuf = await fs.readFile(dest);
  } catch {
    // First run, or the file was removed — that's fine.
  }

  const [srcHash, destHash] = await Promise.all([
    sha256(srcBuf),
    destBuf ? sha256(destBuf) : Promise.resolve(null),
  ]);

  if (destHash === srcHash) {
    console.log(
      `[scrappy-widget] sync-artifact: ${path.relative(projectRoot, dest)} is already up to date.`
    );
    return;
  }

  await fs.writeFile(dest, srcBuf);
  console.log(
    `[scrappy-widget] sync-artifact: copied ${path.relative(
      projectRoot,
      src
    )} → ${path.relative(projectRoot, dest)} (${srcBuf.length} bytes, sha256=${srcHash.slice(
      0,
      12
    )}…)`
  );
}

main().catch((err) => {
  console.error("[scrappy-widget] sync-artifact failed:", err);
  process.exit(1);
});
