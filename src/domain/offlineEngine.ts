import { planQuestions } from "./questionPlanner.js";
import { scoreAnswer } from "./rubric.js";
import type { InterviewProfile, InterviewSession, InterviewTurnInput, InterviewTurnResult, TranscriptMessage } from "./types.js";

export function createInitialSession(profile: InterviewProfile): InterviewSession {
  const plannedQuestions = planQuestions(profile);
  const firstQuestion = plannedQuestions[0];

  return {
    id: `session-${slugify([profile.role, profile.seniority, profile.interviewType, profile.skills.join("-")].join("-"))}`,
    profile,
    currentQuestionIndex: 0,
    plannedQuestions,
    messages: firstQuestion
      ? [
          {
            id: "interviewer-1",
            speaker: "interviewer",
            content: firstQuestion.prompt,
            timestamp: timestampFor(0)
          }
        ]
      : [],
    scores: [],
    status: "ready"
  };
}

export function runOfflineTurn(input: InterviewTurnInput): InterviewTurnResult {
  const plannedQuestions = planQuestions(input.profile);
  const answeredCount = input.transcript.filter((message) => message.speaker === "candidate").length;
  const currentQuestion = plannedQuestions[Math.min(answeredCount, plannedQuestions.length - 1)];
  const score = scoreAnswer({
    answer: input.answer,
    question: currentQuestion,
    profile: input.profile
  });
  const candidateMessage: TranscriptMessage = {
    id: `candidate-${answeredCount + 1}`,
    speaker: "candidate",
    content: input.answer.trim(),
    timestamp: timestampFor(input.transcript.length + 1)
  };
  const nextQuestion = plannedQuestions[answeredCount + 1];
  const done = !nextQuestion;
  const interviewerMessage: TranscriptMessage = {
    id: `interviewer-${answeredCount + 2}`,
    speaker: "interviewer",
    content: done
      ? closingMessage(score.overallScore)
      : `Score for that answer: ${score.overallScore}. ${score.improvements[0]} ${nextQuestion.prompt}`,
    timestamp: timestampFor(input.transcript.length + 2)
  };
  const transcript = [...input.transcript, candidateMessage, interviewerMessage];

  return {
    message: interviewerMessage.content,
    question: nextQuestion?.prompt,
    done,
    overallScore: score.overallScore,
    rubric: score.rubric,
    improvements: score.improvements,
    transcript,
    source: "offline"
  };
}

function closingMessage(score: number): string {
  if (score >= 80) {
    return "Strong finish. Your answers show clear evidence and role-level judgment. Export the report to review the final coaching notes.";
  }

  if (score >= 55) {
    return "Good progress. The main opportunity is adding sharper metrics, tradeoffs, and outcomes to each answer. Export the report for the full recap.";
  }

  return "Session complete. Focus your next practice round on concrete examples, measurable impact, and clearer answer structure.";
}

function timestampFor(offsetMinutes: number): string {
  return new Date(Date.UTC(2026, 4, 24, 0, offsetMinutes, 0)).toISOString();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
