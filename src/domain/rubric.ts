import type { AnswerScore, InterviewProfile, PlannedQuestion, RubricItem } from "./types.js";

interface ScoreAnswerInput {
  answer: string;
  question: PlannedQuestion;
  profile: InterviewProfile;
}

const categories: RubricItem["category"][] = [
  "Relevance",
  "Technical depth",
  "Specificity",
  "Communication"
];

export function scoreAnswer({ answer, question, profile }: ScoreAnswerInput): AnswerScore {
  const trimmed = answer.trim();

  if (!trimmed) {
    return {
      questionId: question.id,
      overallScore: 0,
      rubric: categories.map((category) => ({
        category,
        score: 0,
        max: 5,
        feedback: "No answer was provided."
      })),
      improvements: ["Answer the question with a specific situation, action, result, and reflection."]
    };
  }

  const words = trimmed.split(/\s+/);
  const lower = trimmed.toLowerCase();
  const metrics = (trimmed.match(/\b\d+[%x]?\b|p\d{2}|latency|revenue|retention|conversion|error budget/gi) ?? []).length;
  const expectedSignalsHit = question.expectedSignals.filter((signal) => lower.includes(signal.toLowerCase())).length;
  const mentionedSkill = question.skill ? lower.includes(question.skill.toLowerCase()) : false;
  const mentionsRoleSkill = profile.skills.some((skill) => lower.includes(skill.toLowerCase()));
  const tradeoffLanguage = /\btrade[- ]?off|defer|risk|constraint|because|however|rollback|failure\b/i.test(trimmed);
  const actionLanguage = /\bI\s+(built|led|reduced|improved|designed|measured|profiled|validated|aligned|shipped|added|moved)\b/i.test(trimmed);
  const structureLanguage = /\b(context|because|result|impact|learned|next|first|then|finally)\b/i.test(trimmed);

  const relevance = clampScore(
    1 + (mentionedSkill || mentionsRoleSkill ? 2 : 0) + (expectedSignalsHit > 0 ? 1 : 0) + (words.length >= 30 ? 1 : 0)
  );
  const technicalDepth = clampScore(
    1 + (mentionedSkill || mentionsRoleSkill ? 1 : 0) + (tradeoffLanguage ? 1 : 0) + (metrics > 0 ? 1 : 0) + (technicalTermCount(lower) >= 2 ? 1 : 0)
  );
  const specificity = clampScore(
    1 + (metrics > 0 ? 2 : 0) + (actionLanguage ? 1 : 0) + (words.length >= 35 ? 1 : 0)
  );
  const communication = clampScore(
    1 + (words.length >= 18 ? 1 : 0) + (structureLanguage ? 1 : 0) + (words.length >= 45 ? 1 : 0) + (expectedSignalsHit >= 2 ? 1 : 0)
  );

  const rubric: RubricItem[] = [
    rubricItem("Relevance", relevance, feedbackFor("Relevance", relevance)),
    rubricItem("Technical depth", technicalDepth, feedbackFor("Technical depth", technicalDepth)),
    rubricItem("Specificity", specificity, feedbackFor("Specificity", specificity)),
    rubricItem("Communication", communication, feedbackFor("Communication", communication))
  ];
  const overallScore = Math.round((rubric.reduce((total, item) => total + item.score, 0) / 20) * 100);

  return {
    questionId: question.id,
    overallScore,
    rubric,
    improvements: buildImprovements({ metrics, words: words.length, tradeoffLanguage, structureLanguage, overallScore })
  };
}

function rubricItem(category: RubricItem["category"], score: number, feedback: string): RubricItem {
  return { category, score, max: 5, feedback };
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(5, value));
}

function technicalTermCount(answer: string): number {
  const terms = [
    "api",
    "architecture",
    "cache",
    "database",
    "latency",
    "node",
    "observability",
    "postgresql",
    "queue",
    "rollback",
    "service",
    "test"
  ];

  return terms.filter((term) => answer.includes(term)).length;
}

function feedbackFor(category: RubricItem["category"], score: number): string {
  if (score >= 5) {
    return `${category} is strong and interview-ready.`;
  }

  if (score >= 3) {
    return `${category} is credible but could use sharper evidence.`;
  }

  return `${category} needs a clearer example, stronger detail, or measurable impact.`;
}

function buildImprovements(input: {
  metrics: number;
  words: number;
  tradeoffLanguage: boolean;
  structureLanguage: boolean;
  overallScore: number;
}): string[] {
  const improvements: string[] = [];

  if (input.overallScore >= 80) {
    improvements.push("Next, make the answer even stronger by naming the hiring-panel signal you want them to remember.");
  }

  if (input.metrics === 0) {
    improvements.push("Add a metric, number, or evidence point so the impact is easier to trust.");
  }

  if (!input.tradeoffLanguage) {
    improvements.push("Name one tradeoff, risk, or constraint and explain why your choice was reasonable.");
  }

  if (!input.structureLanguage || input.words < 35) {
    improvements.push("Use a tighter setup-action-result structure with one sentence for the outcome.");
  }

  if (improvements.length === 0) {
    improvements.push("Close with what you learned and how you would apply it in the target role.");
  }

  return improvements;
}
