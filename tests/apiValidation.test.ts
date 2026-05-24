import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../server/app";

describe("interview API validation", () => {
  it("rejects invalid profile and answer payloads before calling the interviewer", async () => {
    const interviewer = vi.fn();
    const app = createApp({ interviewer });

    const response = await request(app)
      .post("/api/interview/turn")
      .send({
        profile: {
          role: "",
          seniority: "Principal",
          interviewType: "Trivia",
          skills: []
        },
        transcript: [],
        answer: ""
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid interview turn");
    expect(response.body.fields).toEqual(expect.arrayContaining(["profile.role", "answer"]));
    expect(interviewer).not.toHaveBeenCalled();
  });

  it("uses an injected interviewer service for valid requests so tests do not hit the network", async () => {
    const interviewer = vi.fn().mockResolvedValue({
      message: "Good, now compare two caching approaches.",
      question: "Compare two caching approaches.",
      done: false,
      overallScore: 74,
      rubric: [],
      improvements: ["Name one specific cache invalidation risk."],
      transcript: [
        {
          id: "candidate-1",
          speaker: "candidate",
          content: "I used Redis for expensive profile lookups.",
          timestamp: "2026-05-24T00:00:00.000Z"
        }
      ],
      source: "openai"
    });
    const app = createApp({ interviewer });

    const response = await request(app)
      .post("/api/interview/turn")
      .send({
        profile: {
          role: "Backend Engineer",
          seniority: "Senior",
          interviewType: "Technical",
          skills: ["Node.js", "Caching"]
        },
        transcript: [],
        answer: "I used Redis for expensive profile lookups."
      });

    expect(response.status).toBe(200);
    expect(response.body.source).toBe("openai");
    expect(response.body.improvements).toContain("Name one specific cache invalidation risk.");
    expect(interviewer).toHaveBeenCalledOnce();
    expect(interviewer.mock.calls[0]?.[0].profile.skills).toEqual(["Node.js", "Caching"]);
  });
});
