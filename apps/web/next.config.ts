import type { NextConfig } from "next";

const AGENT_WEB = process.env.AGENT_WEB_URL || "http://localhost:5500";
const AGENT_API = process.env.AGENT_API_URL || "http://localhost:3500";

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@copiloto/ui", "@copiloto/shared", "@copiloto/utils"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },

  /**
   * Rewrites — proxy hacia el sub-monorepo del agente:
   *   1) /agent-api/*  -> Agent API (Express :3500) — webhook + state
   *   2) /agent        -> Agent admin home
   *   3) /agent/*      -> Agent web (Next :5500, basePath '/agent')
   *
   * Rationale: el dashboard del operador y el admin del agente comparten
   * sesion (JWT en localStorage). Si los servimos como subpath del mismo
   * origen (5400) evitamos CORS y los managers no ven 2 dominios distintos.
   */
  async rewrites() {
    return [
      {
        source: "/agent-api/:path*",
        destination: `${AGENT_API}/:path*`,
      },
      {
        source: "/agent",
        destination: `${AGENT_WEB}/agent`,
      },
      {
        source: "/agent/:path*",
        destination: `${AGENT_WEB}/agent/:path*`,
      },
    ];
  },
};

export default config;
