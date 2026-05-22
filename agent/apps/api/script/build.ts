import { build } from "esbuild";
import { rmSync } from "node:fs";
import { resolve } from "node:path";

const outdir = resolve("dist");
rmSync(outdir, { recursive: true, force: true });

await build({
  entryPoints: [resolve("server/index.ts")],
  outfile: resolve(outdir, "index.mjs"),
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  sourcemap: true,
  packages: "external",
});

console.log(`[build:agent] wrote ${outdir}/index.mjs`);
