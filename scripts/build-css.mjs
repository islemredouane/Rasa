// Compile one minified stylesheet per page with the Tailwind CLI (replaces the Tailwind Play CDN).
//
//   npm install          (once; installs tailwindcss + plugins as dev dependencies)
//   node scripts/build-css.mjs
//
// Each page has its own settings in tailwind/<page>.config.cjs and gets css/<page>.css.
// Run it after changing Tailwind classes in a page or in js/ or data/ (new classes are only
// included once the CSS is rebuilt).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(ROOT, "node_modules", "tailwindcss", "lib", "cli.js");
if (!fs.existsSync(cli)) {
  console.error("Tailwind is not installed. Run `npm install` first.");
  process.exit(1);
}

const configs = fs.readdirSync(path.join(ROOT, "tailwind")).filter((f) => f.endsWith(".config.cjs"));
fs.mkdirSync(path.join(ROOT, "css"), { recursive: true });

for (const config of configs) {
  const name = config.replace(".config.cjs", "");
  const out = path.join("css", `${name}.css`);
  execFileSync(
    process.execPath,
    [cli, "-c", path.join("tailwind", config), "-i", path.join("tailwind", "input.css"), "-o", out, "--minify"],
    { cwd: ROOT, stdio: ["ignore", "ignore", "pipe"] }
  );
  console.log(`${out.padEnd(26)} ${(fs.statSync(path.join(ROOT, out)).size / 1024).toFixed(1)} KB`);
}
