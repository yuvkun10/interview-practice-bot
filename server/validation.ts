import { z } from "zod";

export const interviewProfileSchema = z.object({
  role: z.string().trim().min(2).max(80),
  seniority: z.enum(["Junior", "Mid-level", "Senior", "Staff"]),
  interviewType: z.enum(["Behavioral", "Technical", "System Design", "Mixed"]),
  skills: z
    .array(z.string().trim().min(1).max(40))
    .min(1)
    .max(6)
    .transform((skills) => Array.from(new Set(skills.map((skill) => skill.trim()).filter(Boolean))))
});

export const transcriptMessageSchema = z.object({
  id: z.string().min(1).max(80),
  speaker: z.enum(["interviewer", "candidate"]),
  content: z.string().min(1).max(5000),
  timestamp: z.string().datetime()
});

export const turnRequestSchema = z.object({
  profile: interviewProfileSchema,
  transcript: z.array(transcriptMessageSchema).max(20),
  answer: z.string().trim().min(1).max(5000)
});

export type TurnRequest = z.infer<typeof turnRequestSchema>;

export function issueFields(error: z.ZodError): string[] {
  return Array.from(new Set(error.issues.map((issue) => issue.path.join(".")).filter(Boolean)));
}
