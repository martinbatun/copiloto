import { describe, it, expect } from "vitest";
import { makeIsAllowedOrigin } from "../server/lib/cors";

describe("makeIsAllowedOrigin", () => {
  const base = {
    allowed: ["https://app.copiloto.mx", "https://copiloto-web.vercel.app"],
    allowVercelPreviews: false,
    vercelPrefix: "copiloto-web",
  };

  it("permite orígenes exactos de la allowlist", () => {
    const ok = makeIsAllowedOrigin(base);
    expect(ok("https://app.copiloto.mx")).toBe(true);
    expect(ok("https://copiloto-web.vercel.app")).toBe(true);
  });

  it("rechaza orígenes ajenos", () => {
    const ok = makeIsAllowedOrigin(base);
    expect(ok("https://evil.com")).toBe(false);
    expect(ok("https://otra-app.vercel.app")).toBe(false);
  });

  it("con previews OFF, no permite previews del proyecto", () => {
    const ok = makeIsAllowedOrigin(base);
    expect(ok("https://copiloto-web-git-feat-x.vercel.app")).toBe(false);
  });

  it("con previews ON, permite *.vercel.app con el prefijo del proyecto", () => {
    const ok = makeIsAllowedOrigin({ ...base, allowVercelPreviews: true });
    expect(ok("https://copiloto-web-git-feat-x-team.vercel.app")).toBe(true);
    // pero no cualquier otro *.vercel.app
    expect(ok("https://otra-app.vercel.app")).toBe(false);
  });

  it("no truena con un origin no parseable", () => {
    const ok = makeIsAllowedOrigin({ ...base, allowVercelPreviews: true });
    expect(ok("no-es-una-url")).toBe(false);
  });
});
