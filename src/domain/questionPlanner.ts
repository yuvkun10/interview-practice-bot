import type { InterviewProfile, InterviewType, PlannedQuestion, QuestionFocus, Seniority } from "./types.js";

const MAX_SKILL_QUESTIONS = 5;
const MAX_TOTAL_QUESTIONS = 6;

export function normalizeSkills(skills: string[], limit = MAX_SKILL_QUESTIONS): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const skill of skills) {
    const trimmed = skill.trim().replace(/\s+/g, " ");
    const key = trimmed.toLowerCase();

    if (!trimmed || seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push(trimmed);

    if (normalized.length === limit) {
      break;
    }
  }

  return normalized;
}

export function planQuestions(profile: InterviewProfile): PlannedQuestion[] {
  const skills = normalizeSkills(profile.skills);
  const role = profile.role.trim();
  const baseSlug = [
    slugify(profile.interviewType),
    slugify(profile.seniority),
    slugify(role)
  ].join("-");
  const questions: Omit<PlannedQuestion, "id">[] = [
    openingQuestion(role, profile.seniority, profile.interviewType)
  ];

  for (const skill of skills) {
    if (questions.length >= MAX_TOTAL_QUESTIONS) {
      break;
    }

    questions.push(skillQuestion(role, profile.seniority, profile.interviewType, skill));
  }

  if (questions.length < Math.min(MAX_TOTAL_QUESTIONS, skills.length + 2)) {
    questions.push(typeSpecificQuestion(role, profile.interviewType, skills[0]));
  }

  return questions.slice(0, MAX_TOTAL_QUESTIONS).map((question, index) => ({
    id: `${baseSlug}-${index + 1}`,
    ...question
  }));
}

function openingQuestion(role: string, seniority: Seniority, interviewType: InterviewType): Omit<PlannedQuestion, "id"> {
  return {
    prompt: `You are interviewing for a ${seniority} ${role} role. Walk me through a recent example that best shows your readiness for this ${interviewType.toLowerCase()} interview.`,
    focus: "experience",
    expectedSignals: ["specific example", "scope", "impact", "reflection"]
  };
}

function skillQuestion(
  role: string,
  seniority: Seniority,
  interviewType: InterviewType,
  skill: string
): Omit<PlannedQuestion, "id"> {
  const focus: QuestionFocus = interviewType === "Behavioral" ? "collaboration" : "skill-depth";
  const promptByType: Record<InterviewType, string> = {
    Behavioral: `Tell me about a time you used ${skill} while influencing people without direct authority.`,
    Technical: `Walk through a ${skill} problem you solved as a ${seniority} ${role}. What tradeoffs did you make and how did you validate the result?`,
    "System Design": `Design a practical system or workflow for a ${role} team where ${skill} is a central concern. What would you build first and what would you defer?`,
    Mixed: `Give me a concrete ${skill} example, then explain both the technical decision and how you communicated it.`
  };

  return {
    prompt: promptByType[interviewType],
    focus,
    skill,
    expectedSignals: ["tradeoffs", "measurement", "specific example", skill]
  };
}

function typeSpecificQuestion(
  role: string,
  interviewType: InterviewType,
  primarySkill?: string
): Omit<PlannedQuestion, "id"> {
  if (interviewType === "System Design") {
    return {
      prompt: `Sketch the architecture for a high-impact ${role} project${primarySkill ? ` involving ${primarySkill}` : ""}. Include failure modes, scaling limits, and a rollout plan.`,
      focus: "system-design",
      skill: primarySkill,
      expectedSignals: ["architecture", "failure modes", "scaling", "rollout"]
    };
  }

  if (interviewType === "Behavioral") {
    return {
      prompt: `Tell me about a difficult stakeholder moment in a ${role} context. What did you do and what changed afterward?`,
      focus: "collaboration",
      expectedSignals: ["stakeholders", "conflict", "action", "impact"]
    };
  }

  return {
    prompt: `What is the most important tradeoff you would want this ${role} hiring panel to understand about your experience?`,
    focus: "tradeoffs",
    skill: primarySkill,
    expectedSignals: ["tradeoff", "judgment", "impact", "learning"]
  };
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
