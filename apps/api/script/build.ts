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
  // Prisma engines + supabase ship con binarios — los dejamos fuera del bundle.
  packages: "external",
});

console.log(`[build] wrote ${outdir}/index.mjs`);
