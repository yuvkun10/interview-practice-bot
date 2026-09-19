import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createInitialSession } from "../src/domain/offlineEngine.js";
import { exportSessionReport } from "../src/domain/transcript.js";
import type { InterviewSession, InterviewTurnInput, InterviewTurnResult } from "../src/domain/types.js";
import { interviewWithOpenAI } from "./openaiInterviewer.js";
import { interviewProfileSchema, issueFields, turnRequestSchema } from "./validation.js";

export type InterviewerService = (input: InterviewTurnInput) => Promise<InterviewTurnResult>;

interface CreateAppOptions {
  interviewer?: InterviewerService;
}

export function createApp({ interviewer = interviewWithOpenAI }: CreateAppOptions = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.post("/api/interview/start", (request, response) => {
    const parsed = interviewProfileSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        error: "Invalid interview profile",
        fields: issueFields(parsed.error)
      });
      return;
    }

    response.json(createInitialSession(parsed.data));
  });

  app.post("/api/interview/turn", async (request, response, next) => {
    const parsed = turnRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        error: "Invalid interview turn",
        fields: issueFields(parsed.error)
      });
      return;
    }

    try {
      response.json(await interviewer(parsed.data));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/interview/export", (request, response) => {
    const session = request.body as InterviewSession;
    // Plain text with sniffing disabled, so user content is never rendered as HTML.
    response.set("Content-Type", "text/plain; charset=utf-8");
    response.set("X-Content-Type-Options", "nosniff");
    response.send(exportSessionReport(session));
  });

  serveStaticBuild(app);

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    void _next;

    const message = error instanceof Error ? error.message : "Unexpected server error";
    response.status(500).json({ error: message });
  });

  return app;
}

function serveStaticBuild(app: express.Express): void {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  const clientDist = path.resolve(currentDir, "..", "dist");

  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, rateLimit({ windowMs: 60_000, limit: 100 }), (_request, response) => {
    response.sendFile(path.join(clientDist, "index.html"));
  });
}
