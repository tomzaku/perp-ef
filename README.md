# FE Interview Prep

A comprehensive frontend interview training website built with React 19, TypeScript, Vite 7, and Tailwind CSS v4.

## Getting Started

```bash
npm install
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build to dist/
```

## Project Structure

```
src/
├── data/                  # Question bank & config
│   ├── algorithms.ts      # Algorithm questions (algo-1, algo-2, ..., algo-graph-1, ...)
│   ├── javascript.ts      # JavaScript questions (js-1, js-2, ...)
│   ├── nodejs.ts          # Node.js questions (node-1, node-2, ...)
│   ├── react-questions.ts # React questions (react-1, react-2, ...)
│   ├── design-system.ts   # Design System questions (ds-1, ds-2, ...)
│   ├── explanations.ts    # Supplemental explanations with ASCII diagrams
│   ├── testCases.ts       # Test cases for Submit feature (algorithm questions)
│   ├── studyPlan.ts       # 11-week study plan
│   ├── learningPaths.ts   # Algorithm learning paths by pattern
│   └── index.ts           # Merges all data at runtime
├── components/            # React components
├── hooks/                 # useProgress, useNotes
├── lib/                   # testRunner.ts (code execution engine)
└── types/                 # TypeScript interfaces
```

---

## Deployment

Deployed to GitHub Pages via GitHub Actions on push to `master`.

```bash
# Manual deploy trigger
gh workflow run deploy.yml
```

Site URL: `https://<username>.github.io/fe-interview-prep/`
