export type Seniority = "Junior" | "Mid-level" | "Senior" | "Staff";

export type InterviewType = "Behavioral" | "Technical" | "System Design" | "Mixed";

export type QuestionFocus =
  | "experience"
  | "skill-depth"
  | "system-design"
  | "tradeoffs"
  | "collaboration"
  | "closing";

export interface InterviewProfile {
  role: string;
  seniority: Seniority;
  interviewType: InterviewType;
  skills: string[];
}

export interface PlannedQuestion {
  id: string;
  prompt: string;
  focus: QuestionFocus;
  skill?: string;
  expectedSignals: string[];
}

export interface TranscriptMessage {
  id: string;
  speaker: "interviewer" | "candidate";
  content: string;
  timestamp: string;
}

export interface RubricItem {
  category: "Relevance" | "Technical depth" | "Specificity" | "Communication";
  score: number;
  max: 5;
  feedback: string;
}

export interface AnswerScore {
  questionId: string;
  overallScore: number;
  rubric: RubricItem[];
  improvements: string[];
}

export interface InterviewSession {
  id: string;
  profile: InterviewProfile;
  currentQuestionIndex: number;
  plannedQuestions: PlannedQuestion[];
  messages: TranscriptMessage[];
  scores: AnswerScore[];
  status: "ready" | "in-progress" | "complete";
}

export interface InterviewTurnInput {
  profile: InterviewProfile;
  transcript: TranscriptMessage[];
  answer: string;
}

export interface InterviewTurnResult {
  message: string;
  question?: string;
  done: boolean;
  overallScore: number;
  rubric: RubricItem[];
  improvements: string[];
  transcript: TranscriptMessage[];
  source: "openai" | "offline";
  fallbackReason?: string;
}
