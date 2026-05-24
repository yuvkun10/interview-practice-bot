import type { InterviewSession, TranscriptMessage } from "./types.js";

export function exportSessionReport(session: InterviewSession): string {
  const lines = [
    "# Interview Practice Report",
    "",
    `Role: ${session.profile.role}`,
    `Seniority: ${session.profile.seniority}`,
    `Interview type: ${session.profile.interviewType}`,
    `Target skills: ${session.profile.skills.join(", ")}`,
    `Status: ${session.status}`,
    "",
    "## Scores"
  ];

  if (session.scores.length === 0) {
    lines.push("", "No answers have been scored yet.");
  } else {
    for (const score of session.scores) {
      lines.push("", `Question: ${score.questionId}`, `Overall score: ${score.overallScore}`);
      for (const item of score.rubric) {
        lines.push(`- ${item.category}: ${item.score}/${item.max} - ${item.feedback}`);
      }
      lines.push("Suggested improvements:");
      for (const improvement of score.improvements) {
        lines.push(`- ${improvement}`);
      }
    }
  }

  lines.push("", "## Transcript");
  for (const message of session.messages) {
    lines.push(formatMessage(message));
  }

  return lines.join("\n").replace(/[ \t]+$/gm, "");
}

function formatMessage(message: TranscriptMessage): string {
  const speaker = message.speaker === "interviewer" ? "Interviewer" : "Candidate";
  return `${speaker}: ${message.content}`;
}
