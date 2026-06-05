import { build } from "esbuild";
import { rmSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const outdir = resolve("dist");
rmSync(outdir, { recursive: true, force: true });

// Solo los paquetes que vienen de node_modules deben permanecer external —
// los `@copiloto/*` del workspace tienen que entrar al bundle porque su
// `main` apunta a `.ts` que no existe en runtime (no compilamos los packages
// a JS aparte). Bundlear nos da un solo dist/index.mjs autocontenido contra
// el cual Node solo necesita resolver Prisma + libs npm.
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8")) as {
  dependencies?: Record<string, string>;
};
const externalDeps = Object.keys(pkg.dependencies ?? {}).filter(
  (name) => !name.startsWith("@copiloto/")
);

await build({
  entryPoints: [resolve("server/index.ts")],
  outfile: resolve(outdir, "index.mjs"),
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  sourcemap: true,
  external: externalDeps,
});

console.log(`[build] wrote ${outdir}/index.mjs`);
console.log(`[build] externals (${externalDeps.length}): ${externalDeps.join(", ")}`);
