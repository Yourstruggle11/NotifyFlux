# Contributing to NotifyFlux

Thanks for helping improve NotifyFlux. This guide focuses on contributor workflow and tenant-safety expectations.

## Local development
- Node.js 18+
- Docker (for MongoDB + Redis)

Typical setup:
```bash
npm install
docker compose up -d
npm run dev
```

## Tests and checks
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Tests: `npm run test`
- CI parity (recommended): `npm run sanity`

## Branching and PRs
- Use short-lived branches with small, scoped commits.
- Open PRs against `main` and fill out the PR template.
- Link related issues and document tenant impact clearly.

## Commit guidance
- Prefer multiple small commits over one large commit.
- Keep messages descriptive and scoped to the change.

## Tenant isolation and security
- Always scope data access by `tenantId`.
- Socket rooms must be server-derived. never allow the client to join arbitrary rooms.
- Auth must be validated before any socket join or sensitive operation.
- Avoid logging secrets (tokens, passwords, hashes).
