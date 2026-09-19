# AGENTS.md

Interview Practice Bot is a local mock interview app: a React client on Vite and an Express API, using OpenAI when a key is set and a deterministic offline engine otherwise.

## Setup

Node.js 24 or newer and npm 11 or newer.

```bash
npm ci
cp .env.example .env.local
```

Optional variables: `OPENAI_API_KEY`, `OPENAI_MODEL`, `PORT`. Leave the key blank for the offline engine. See [docs/configuration.md](docs/configuration.md).

## Commands

```bash
npm run dev       # Vite client and Express API together
npm run build     # tsc -b, vite build, server build (includes the type check)
npm run lint      # eslint .
npm test          # vitest run
npm run start     # run the built server
npm run audit     # npm audit --audit-level=moderate
npm run outdated  # npm outdated
```

The Vite dev server proxies `/api` to the Express server on `127.0.0.1:8787`.

## Project structure

- `src/`: React client. `src/domain/`: question planner, rubric, transcript, offline engine.
- `server/`: Express app, request validation, OpenAI interviewer.
- `tests/`: Vitest suites.

Details are in [docs/architecture.md](docs/architecture.md).

## Conventions

- TypeScript `strict`. ESLint with `@eslint/js`, `typescript-eslint`, React hooks and React refresh plugins.
- No formatter or commit convention is enforced. Do not add attribution trailers.

## Testing

Before a PR run audit, outdated, lint, test and build. CI runs the same set on pushes to `main` and on pull requests.

## Safety

- Never commit `.env` or `.env.local` files or API keys.
- The offline engine must keep working without a key.

## More

- [docs/README.md](docs/README.md): docs index
- [docs/security.md](docs/security.md): security notes
- [docs/operations.md](docs/operations.md): operations
