# Interview Practice Bot

A local React and Node app for practicing interviews with a server-side OpenAI interviewer and deterministic offline fallback.

## Features

- Configure role, seniority, interview type, and target skills
- Chat-based interview flow with adaptive follow-up questions
- Rubric scoring across relevance, depth, specificity, and communication
- Suggested answer improvements after every response
- Session transcript and exportable interview report
- Deterministic offline engine for tests and fallback behavior

## Run Locally

```bash
npm ci
npm run dev
```

The Vite client proxies `/api` to the Express server.

## Environment

Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` for live interviewer responses. Without a valid key or model response, the API falls back to the deterministic offline engine.

## Quality Checks

```bash
npm run lint
npm test
npm run build
```

## License

MIT
