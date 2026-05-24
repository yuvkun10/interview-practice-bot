import { describe, expect, it } from "vitest";
import { scoreAnswer } from "../src/domain/rubric";
import type { InterviewProfile, PlannedQuestion } from "../src/domain/types";

describe("scoreAnswer", () => {
  const profile: InterviewProfile = {
    role: "Backend Engineer",
    seniority: "Senior",
    interviewType: "Technical",
    skills: ["Node.js", "PostgreSQL"]
  };

  const question: PlannedQuestion = {
    id: "technical-senior-backend-engineer-2",
    prompt: "Walk through a Node.js service you improved and how you measured success.",
    focus: "skill-depth",
    skill: "Node.js",
    expectedSignals: ["tradeoffs", "measurement", "specific example"]
  };

  it("rewards specific, structured answers with evidence and tradeoffs", () => {
    const strong = scoreAnswer({
      answer:
        "In a payments service I reduced p95 latency by 38% by profiling Node.js handlers, moving a blocking PostgreSQL query behind a queue, and measuring error budget impact. The tradeoff was slower reconciliation, so I added alerts and a rollback plan.",
      question,
      profile
    });

    expect(strong.overallScore).toBeGreaterThanOrEqual(82);
    expect(strong.rubric.find((item) => item.category === "Technical depth")?.score).toBe(5);
    expect(strong.improvements[0]).toMatch(/next/i);
  });

  it("flags thin answers with low scores and concrete improvement guidance", () => {
    const thin = scoreAnswer({
      answer: "I worked on Node and it went well.",
      question,
      profile
    });

    expect(thin.overallScore).toBeLessThan(45);
    expect(thin.rubric.find((item) => item.category === "Specificity")?.score).toBeLessThanOrEqual(2);
    expect(thin.improvements).toEqual(
      expect.arrayContaining([expect.stringMatching(/metric|number|evidence/i)])
    );
  });

  it("returns zeroed rubric items for blank candidate answers", () => {
    const blank = scoreAnswer({ answer: "   ", question, profile });

    expect(blank.overallScore).toBe(0);
    expect(blank.rubric.every((item) => item.score === 0)).toBe(true);
    expect(blank.improvements[0]).toMatch(/answer/i);
  });
});
