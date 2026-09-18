# Interview Practice Bot

Interview Practice Bot is a mock interview practice app that runs on your own machine. Job seekers, career coaches and bootcamp mentors use it to rehearse behavioral, technical, system design and mixed interviews with planned questions, rubric scoring and exportable transcripts. It is a React client backed by an Express API. It uses OpenAI when a key is configured and a deterministic offline engine otherwise. Status: version 0.1.0, a public portfolio project.

## Installation

Prerequisites:

- Node.js 24 or newer
- npm 11 or newer

```bash
npm ci
cp .env.example .env.local
```

Environment variables, all optional: `OPENAI_API_KEY`, `OPENAI_MODEL`, `PORT`. Leave `OPENAI_API_KEY` blank to use the offline engine. See [docs/configuration.md](docs/configuration.md) for details and the PowerShell copy command.

## Usage

```bash
npm run dev       # run Vite client and Express API together
npm run build     # typecheck and build client and server
npm run start     # run the built Express server
npm run preview   # preview the built Vite client
npm run audit     # fail on moderate or higher npm vulnerabilities
npm run outdated  # fail when npm reports outdated direct dependencies
```

The Vite dev server proxies `/api` to the Express server on `127.0.0.1:8787`.

The repo contains no deployment configuration. The app is built to run locally.

## Project structure

```text
├── .github
│   ├── workflows
│   │   └── ci.yml
│   └── dependabot.yml
├── docs
│   ├── architecture.md
│   ├── architecture.mmd
│   └── archive
├── server
│   ├── app.ts
│   ├── index.ts
│   ├── openaiInterviewer.ts
│   └── validation.ts
├── src
│   ├── domain
│   ├── main.tsx
│   └── styles.css
├── tests
├── .env.example
├── eslint.config.js
├── package.json
├── vite.config.ts
└── vitest.config.ts
```

See [docs/architecture.md](docs/architecture.md) for the flow diagram and what each file does.

## Coding style

ESLint 10 with the `@eslint/js` and `typescript-eslint` recommended configs, plus the React hooks and React refresh plugins (`eslint.config.js`). TypeScript runs in `strict` mode for the app, server and tooling configs. No formatter, commit hook or commit convention is configured.

```bash
npm run lint
npm run build   # includes the type check
```

## Test

```bash
npm test
```

Vitest runs the suites in `tests/`. They cover API request validation, question planning, rubric scoring and transcript export. CI runs audit, outdated, lint, test and build on every push to `main` and on pull requests.

## Documentation

- [docs/README.md](docs/README.md): index of all docs
- [docs/architecture.md](docs/architecture.md)
- [docs/configuration.md](docs/configuration.md)
- [docs/security.md](docs/security.md)
- [docs/operations.md](docs/operations.md)

## License

MIT. See [LICENSE](LICENSE).
