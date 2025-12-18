# Copilot Instructions for AI Agents

## Project Overview
This is a React + TypeScript project bootstrapped with Vite. The codebase is organized for rapid development and hot module replacement (HMR). The main entry point is `src/main.tsx`, which loads the root component from `src/App.tsx`.

## Key Files & Structure
- `src/`: All source code. Main files:
  - `main.tsx`: App entry, renders `App`.
  - `App.tsx`: Main React component.
  - `assets/`: Static assets (images, etc.).
  - `App.css`, `index.css`: Stylesheets.
- `public/`: Static files served directly.
- `index.html`: Main HTML template.
- `vite.config.ts`: Vite configuration.
- `eslint.config.js`: ESLint rules (see README for advanced config).
- `tsconfig*.json`: TypeScript configs for app and node.

## Build, Run, and Test
- **Start dev server:** `npm run dev`
- **Build for production:** `npm run build`
- **Preview production build:** `npm run preview`
- **Lint:** `npm run lint` (uses ESLint, see config for type-aware rules)

## Patterns & Conventions
- Use functional React components and hooks (see `App.tsx`).
- TypeScript is enforced; use explicit types for props and state.
- Styles are imported at the component level (`App.css`, `index.css`).
- Asset imports use Vite's static import pattern.
- No custom service boundaries or API layers are present by default.

## ESLint & TypeScript
- ESLint config is in `eslint.config.js`. For stricter linting, follow README instructions to enable type-aware rules.
- TypeScript configs are split for app (`tsconfig.app.json`) and node (`tsconfig.node.json`).

## External Integrations
- Vite plugins for React are used (`@vitejs/plugin-react` or `@vitejs/plugin-react-swc`).
- No backend or API integration is present by default.

## Example Workflow
1. Edit components in `src/`.
2. Run `npm run dev` to see changes live.
3. Use `npm run lint` to check code quality.
4. Build with `npm run build` before deploying.

## References
- See `README.md` for ESLint and TypeScript expansion tips.
- Vite documentation: https://vitejs.dev/
- React documentation: https://react.dev/

---
If any section is unclear or missing, please provide feedback to improve these instructions.