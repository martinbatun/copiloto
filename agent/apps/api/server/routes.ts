import type { Express } from "express";
import webhookRoutes from "./routes/webhook.js";
import conversationsRoutes from "./routes/conversations.js";
import templatesRoutes from "./routes/templates.js";
import broadcastsRoutes from "./routes/broadcasts.js";
import flowsRoutes from "./routes/flows.js";
import agentRoutes from "./routes/agent.js";

export function registerRoutes(app: Express): void {
  app.use("/api/webhook", webhookRoutes);
  app.use("/api/conversations", conversationsRoutes);
  app.use("/api/templates", templatesRoutes);
  app.use("/api/broadcasts", broadcastsRoutes);
  app.use("/api/flows", flowsRoutes);
  app.use("/api/agent", agentRoutes);
}
