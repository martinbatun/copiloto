import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  basePath: "/agent",
  transpilePackages: ["@copiloto/ui", "@copiloto/agent-shared"],
};

export default config;
