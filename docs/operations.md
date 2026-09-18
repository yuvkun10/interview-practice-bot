# Operations

## Dependency maintenance

CI runs linting, tests, builds, `npm audit --audit-level=moderate` and `npm outdated`. Dependabot is configured for npm packages and GitHub Actions on a weekly schedule.

`npm run audit` fails on npm vulnerabilities of moderate severity or higher. `npm run outdated` fails when npm reports outdated direct dependencies.
