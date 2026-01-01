# Contributing to anime-character-generator

Thanks for your interest in contributing! This project is UI‑first and evolving quickly. Small, focused pull requests are appreciated.

## Ground Rules

- Be kind and follow our Code of Conduct (see CODE_OF_CONDUCT.md).
- Prefer discussion first for non‑trivial features (open an issue).
- Keep PRs scoped; one logical change per PR.
- Use Conventional Commits for messages (e.g. `feat: ...`, `fix: ...`).

## Development Setup

- Node 20+ recommended
- Install deps: `npm install`
- Start dev server: `npm run dev`
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- Build: `npm run build`

Project highlights:
- Next.js (App Router), React 19, TypeScript strict
- Tailwind CSS v4 for styling
- Three.js via @react-three/fiber and @react-three/drei

## Style Guidelines

- TypeScript: enable strict typing; avoid `any` when possible.
- Components: prefer small, composable components.
- Styling: Tailwind utility classes; use `cn` helper to merge classes.
- Assets: put static files under `public/` and export from `public/images/index.ts` (use `generateImageIndex.js`).

## Branching & Commits

- Branch from `main`. Suggested naming: `feat/...`, `fix/...`, `chore/...`.
- Use Conventional Commits for titles. Examples:
  - `feat(landing): add hero model selector`
  - `fix(types): declare *.webp module`
  - `chore(ci): add Node 20 matrix`

## Pull Requests

- Fill out the PR template.
- Ensure CI is green: lint, typecheck, and build.
- Add screenshots for UI changes.
- Link related issues and describe the rationale.

## Reporting Bugs & Requesting Features

- Use the issue templates under GitHub Issues.
- For security vulnerabilities, do NOT open a public issue—see SECURITY.md.

Thanks for helping improve the project!

