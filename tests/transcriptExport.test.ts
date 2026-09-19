import { describe, expect, it } from "vitest";
import { exportSessionReport } from "../src/domain/transcript";
import type { InterviewSession } from "../src/domain/types";

describe("exportSessionReport", () => {
  it("exports a complete readable session report", () => {
    const session: InterviewSession = {
      id: "session-1",
      profile: {
        role: "Product Manager",
        seniority: "Staff",
        interviewType: "Behavioral",
        skills: ["roadmapping", "stakeholder management"]
      },
      currentQuestionIndex: 1,
      plannedQuestions: [
        {
          id: "behavioral-staff-product-manager-1",
          prompt: "Tell me about a hard roadmap tradeoff.",
          focus: "experience",
          skill: "roadmapping",
          expectedSignals: ["context", "decision", "impact"]
        }
      ],
      messages: [
        {
          id: "m1",
          speaker: "interviewer",
          content: "Tell me about a hard roadmap tradeoff.",
          timestamp: "2026-05-24T00:00:00.000Z"
        },
        {
          id: "m2",
          speaker: "candidate",
          content: "I aligned three teams around a smaller launch and measured retention impact.",
          timestamp: "2026-05-24T00:01:00.000Z"
        }
      ],
      scores: [
        {
          questionId: "behavioral-staff-product-manager-1",
          overallScore: 84,
          rubric: [
            { category: "Relevance", score: 5, max: 5, feedback: "Directly answers the question." }
          ],
          improvements: ["Add one more stakeholder conflict detail."]
        }
      ],
      status: "complete"
    };

    const report = exportSessionReport(session);

    expect(report).toContain("# Interview Practice Report");
    expect(report).toContain("Product Manager");
    expect(report).toContain("Overall score: 84");
    expect(report).toContain("Add one more stakeholder conflict detail.");
    expect(report).toContain("Interviewer: Tell me about a hard roadmap tradeoff.");
    expect(report).not.toContain("undefined");
  });

  it("trims spaces and tabs at line ends but keeps inner whitespace", () => {
    const report = exportSessionReport(
      sessionWithAnswer("First line \t\nSecond\t line\t\r\nThird  \u2028Last \t ")
    );

    expect(report.endsWith("Candidate: First line\nSecond\t line\r\nThird\u2028Last")).toBe(true);
    expect(report).toContain("Target skills: roadmapping\nStatus: complete\n\n## Scores");
  });

  it("exports a long run of tabs without a trailing line break quickly", () => {
    const answer = `start${"\t".repeat(200_000)}end`;

    const started = performance.now();
    const report = exportSessionReport(sessionWithAnswer(answer));

    expect(performance.now() - started).toBeLessThan(1000);
    expect(report.endsWith(`Candidate: ${answer}`)).toBe(true);
  });
});

function sessionWithAnswer(content: string): InterviewSession {
  return {
    id: "session-2",
    profile: {
      role: "Product Manager",
      seniority: "Staff",
      interviewType: "Behavioral",
      skills: ["roadmapping"]
    },
    currentQuestionIndex: 0,
    plannedQuestions: [],
    messages: [{ id: "m1", speaker: "candidate", content, timestamp: "2026-05-24T00:00:00.000Z" }],
    scores: [],
    status: "complete"
  };
}
