# Privacy and security

- OpenAI calls happen only from the Express server. Browser code calls local `/api` routes and never receives the API key.
- The OpenAI request uses `store: false`.
- Without `OPENAI_API_KEY`, the app uses the deterministic offline engine and does not need external AI access.
- Practice transcripts live in browser session state unless you export them. Treat exported reports as sensitive interview preparation notes.
- Do not paste confidential employer or customer details, or personally sensitive details, into practice answers.
- `.env.local`, `.env`, logs, build outputs and `node_modules` are ignored by git. Keep real secrets out of commits and public issue reports.
