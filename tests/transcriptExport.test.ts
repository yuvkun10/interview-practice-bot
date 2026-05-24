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
});
