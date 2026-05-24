import OpenAI from "openai";
import { z } from "zod";
import { runOfflineTurn } from "../src/domain/offlineEngine.js";
import type { InterviewTurnInput, InterviewTurnResult } from "../src/domain/types.js";

const aiTurnSchema = z.object({
  message: z.string().min(1),
  question: z.string().optional(),
  done: z.boolean(),
  overallScore: z.number().int().min(0).max(100),
  rubric: z.array(
    z.object({
      category: z.enum(["Relevance", "Technical depth", "Specificity", "Communication"]),
      score: z.number().int().min(0).max(5),
      max: z.literal(5),
      feedback: z.string().min(1)
    })
  ),
  improvements: z.array(z.string().min(1)).min(1)
});

export async function interviewWithOpenAI(input: InterviewTurnInput): Promise<InterviewTurnResult> {
  if (!process.env.OPENAI_API_KEY) {
    return withFallbackReason(input, "OPENAI_API_KEY is not configured");
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const offline = runOfflineTurn(input);
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5.5",
      input: [
        {
          role: "system",
          content:
            "You are a rigorous mock interviewer. Score the candidate with the provided rubric, give concise coaching, and ask exactly one next question unless the session is done. Return only JSON that matches the schema."
        },
        {
          role: "user",
          content: JSON.stringify({
            profile: input.profile,
            transcript: input.transcript,
            latestAnswer: input.answer,
            deterministicDraft: {
              message: offline.message,
              question: offline.question,
              done: offline.done,
              overallScore: offline.overallScore,
              rubric: offline.rubric,
              improvements: offline.improvements
            }
          })
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "interview_turn",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["message", "done", "overallScore", "rubric", "improvements"],
            properties: {
              message: { type: "string" },
              question: { type: "string" },
              done: { type: "boolean" },
              overallScore: { type: "integer", minimum: 0, maximum: 100 },
              rubric: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["category", "score", "max", "feedback"],
                  properties: {
                    category: {
                      type: "string",
                      enum: ["Relevance", "Technical depth", "Specificity", "Communication"]
                    },
                    score: { type: "integer", minimum: 0, maximum: 5 },
                    max: { type: "integer", enum: [5] },
                    feedback: { type: "string" }
                  }
                }
              },
              improvements: {
                type: "array",
                minItems: 1,
                items: { type: "string" }
              }
            }
          }
        }
      },
      store: false
    });
    const parsed = aiTurnSchema.parse(JSON.parse(extractOutputText(response)));

    return {
      ...parsed,
      transcript: offline.transcript.slice(0, -1).concat({
        ...offline.transcript[offline.transcript.length - 1],
        content: parsed.message
      }),
      source: "openai"
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "OpenAI request failed";
    return withFallbackReason(input, reason);
  }
}

function withFallbackReason(input: InterviewTurnInput, fallbackReason: string): InterviewTurnResult {
  return {
    ...runOfflineTurn(input),
    fallbackReason
  };
}

function extractOutputText(response: unknown): string {
  if (typeof response !== "object" || response === null) {
    throw new Error("OpenAI response was empty");
  }

  if ("output_text" in response && typeof response.output_text === "string") {
    return response.output_text;
  }

  throw new Error("OpenAI response did not include output_text");
}
