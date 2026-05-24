import { describe, expect, it } from "vitest";
import { planQuestions } from "../src/domain/questionPlanner";
import type { InterviewProfile } from "../src/domain/types";

describe("planQuestions", () => {
  const profile: InterviewProfile = {
    role: "Frontend Platform Engineer",
    seniority: "Senior",
    interviewType: "System Design",
    skills: ["React performance", "accessibility", "testing"]
  };

  it("creates a deterministic plan tailored to the profile and target skills", () => {
    const firstPlan = planQuestions(profile);
    const secondPlan = planQuestions(profile);

    expect(secondPlan).toEqual(firstPlan);
    expect(firstPlan).toHaveLength(5);
    expect(firstPlan[0]?.prompt).toContain("Frontend Platform Engineer");
    expect(firstPlan.some((question) => question.focus === "system-design")).toBe(true);
    expect(firstPlan.map((question) => question.skill)).toEqual(
      expect.arrayContaining(["React performance", "accessibility", "testing"])
    );
  });

  it("normalizes excess and duplicate skills without changing the caller input", () => {
    const noisyProfile: InterviewProfile = {
      role: "Data Engineer",
      seniority: "Mid-level",
      interviewType: "Technical",
      skills: ["SQL", "sql", "Pipelines", "Observability", "Modeling", "Python", "Cloud"]
    };

    const plan = planQuestions(noisyProfile);

    expect(noisyProfile.skills).toHaveLength(7);
    expect(plan).toHaveLength(6);
    expect(plan.filter((question) => question.skill?.toLowerCase() === "sql")).toHaveLength(1);
    expect(plan[0]?.id).toBe("technical-mid-level-data-engineer-1");
  });
});
