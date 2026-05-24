/* eslint-disable react-refresh/only-export-components */
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import type { InterviewProfile, InterviewSession, InterviewTurnResult } from "./domain/types";
import "./styles.css";

const initialProfile: InterviewProfile = {
  role: "Backend Engineer",
  seniority: "Senior",
  interviewType: "Technical",
  skills: ["Node.js", "PostgreSQL", "System design"]
};

function App() {
  const [profile, setProfile] = useState(initialProfile);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [answer, setAnswer] = useState("");
  const [lastTurn, setLastTurn] = useState<InterviewTurnResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startInterview() {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error ?? "Could not start interview.");
      }
      setSession(body as InterviewSession);
      setLastTurn(null);
      setAnswer("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start interview.");
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswer() {
    if (!session) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/interview/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, transcript: session.messages, answer })
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error ?? "Could not score answer.");
      }
      const turn = body as InterviewTurnResult;
      setLastTurn(turn);
      setSession({
        ...session,
        messages: turn.transcript,
        scores: session.scores.concat({
          questionId: session.plannedQuestions[Math.max(0, session.scores.length)]?.id ?? "question",
          overallScore: turn.overallScore,
          rubric: turn.rubric,
          improvements: turn.improvements
        }),
        status: turn.done ? "complete" : "in-progress"
      });
      setAnswer("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not score answer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="workspace">
      <section className="setup">
        <p className="eyebrow">Interview Practice Bot</p>
        <h1>Practice with adaptive questions and rubric scoring.</h1>

        <label>
          Role
          <input value={profile.role} onChange={(event) => setProfile({ ...profile, role: event.target.value })} />
        </label>

        <div className="split">
          <label>
            Seniority
            <select
              value={profile.seniority}
              onChange={(event) => setProfile({ ...profile, seniority: event.target.value as InterviewProfile["seniority"] })}
            >
              <option>Junior</option>
              <option>Mid-level</option>
              <option>Senior</option>
              <option>Staff</option>
            </select>
          </label>
          <label>
            Type
            <select
              value={profile.interviewType}
              onChange={(event) =>
                setProfile({ ...profile, interviewType: event.target.value as InterviewProfile["interviewType"] })
              }
            >
              <option>Behavioral</option>
              <option>Technical</option>
              <option>System Design</option>
              <option>Mixed</option>
            </select>
          </label>
        </div>

        <label>
          Skills
          <input
            value={profile.skills.join(", ")}
            onChange={(event) =>
              setProfile({
                ...profile,
                skills: event.target.value
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter(Boolean)
              })
            }
          />
        </label>

        <button onClick={startInterview} disabled={busy}>
          Start interview
        </button>

        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="session">
        {session ? (
          <>
            <div className="transcript">
              {session.messages.map((message) => (
                <article key={message.id} className={message.speaker}>
                  <strong>{message.speaker === "interviewer" ? "Interviewer" : "Candidate"}</strong>
                  <p>{message.content}</p>
                </article>
              ))}
            </div>

            <label>
              Your answer
              <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={6} />
            </label>

            <button onClick={submitAnswer} disabled={busy || answer.trim().length === 0 || session.status === "complete"}>
              Submit answer
            </button>

            {lastTurn ? (
              <div className="score">
                <div>
                  <span>Score</span>
                  <strong>{lastTurn.overallScore}</strong>
                </div>
                <ul>
                  {lastTurn.improvements.map((improvement) => (
                    <li key={improvement}>{improvement}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <div className="empty">
            <h2>Configure a role to begin</h2>
            <p>Questions are planned locally and answers are scored through the server.</p>
          </div>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
