# Configuration

Create local configuration from the tracked template:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

The server scripts load `.env.local` when it exists.

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | No | Enables live OpenAI coaching. Leave it blank to use the deterministic offline interviewer. |
| `OPENAI_MODEL` | No | Overrides the server default model. |
| `PORT` | No | Express API port for `npm run server:dev` and `npm start`. The template sets 8787. |

If you add a key, keep it in `.env.local` or your shell environment. Never commit real secrets.
