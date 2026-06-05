import { build } from "esbuild";
import { rmSync } from "node:fs";
import { resolve } from "node:path";

const outdir = resolve("dist");
rmSync(outdir, { recursive: true, force: true });

// Estrategia de externals — manejada con dos plugins para que las deps
// transitivas se resuelvan sin necesidad de listarlas a mano:
//
// 1. Cualquier import non-relative (paquete npm) → external, salvo los
//    `@copiloto/*` del workspace cuyo main apunta a .ts (los necesitamos
//    inline porque no los pre-compilamos a .js).
// 2. El Prisma generated client (apps/api/prisma/generated/client/) → external
//    aunque su path sea relativo, porque es CJS con require() dinamicos que
//    esbuild no traduce limpiamente a ESM.

await build({
  entryPoints: [resolve("server/index.ts")],
  outfile: resolve(outdir, "index.mjs"),
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  sourcemap: true,
  plugins: [
    {
      name: "external-npm-deps",
      setup(build) {
        // Filter ^[^./] matches paths que NO empiezan con `.` ni `/` — es decir,
        // bare module specifiers (paquetes npm). Para los del workspace
        // devolvemos null y dejamos que esbuild los siga normalmente.
        build.onResolve({ filter: /^[^./]/ }, (args) => {
          if (args.path.startsWith("@copiloto/")) return null;
          return { path: args.path, external: true };
        });
      },
    },
    {
      name: "external-generated-prisma",
      setup(build) {
        build.onResolve({ filter: /prisma\/generated\// }, (args) => ({
          path: args.path,
          external: true,
        }));
      },
    },
  ],
});

console.log(`[build] wrote ${outdir}/index.mjs`);
console.log(`[build] externals: npm packages (except @copiloto/*) + prisma/generated/*`);
