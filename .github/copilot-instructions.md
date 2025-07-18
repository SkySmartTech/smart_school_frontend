# Copilot Instructions for smart-school-frontend

## Project Overview
- This is a React + TypeScript project bootstrapped with Vite.
- Uses Material UI (MUI) for UI components and theming.
- Project structure is modular: `src/components` for shared UI, `src/views` for pages, `src/services` for API logic, `src/context` for React context, and `src/state` for state management.
- Animations use `framer-motion`.

## Key Patterns & Conventions
- **Component Organization:**
  - Page-level components are in `src/views/`, e.g., `Dashboard/UserProfile.tsx`.
  - Reusable UI elements are in `src/components/`.
  - Layout components are under `src/components/Layout/`.
- **Styling:**
  - Use MUI's `sx` prop and theming (`useTheme`) for styling and colors.
  - Global styles in `src/index.css` and `src/App.css`.
- **State & Context:**
  - Global state via React context in `src/context/` and React Query in `src/state/queryClient.ts`.
- **API & Data:**
  - API logic in `src/services/` (e.g., `authService.ts`).
  - Mock/static data in `src/data/`.
- **Routing:**
  - App routes are defined in `src/Routes.tsx`.
- **Assets:**
  - Images and static files in `src/assets/` and `public/`.

## Developer Workflows
- **Install dependencies:**
  ```powershell
  npm install
  ```
- **Start development server:**
  ```powershell
  npm run dev
  ```
- **Build for production:**
  ```powershell
  npm run build
  ```
- **Lint code:**
  ```powershell
  npm run lint
  ```
- **No built-in test setup** (add tests as needed).

## Integration & Extensibility
- **Theming:** Extend `src/theme.ts` for custom MUI themes.
- **Sidebar/Navbar:** Use `Sidebar` and `Navbar` from `src/components/` for consistent layout.
- **User Data:** Replace `dummyUser` in `UserProfile.tsx` with real API data for production.

## Examples
- See `src/views/Dashboard/UserProfile.tsx` for a typical page layout and MUI usage.
- See `src/services/authService.ts` for API call patterns.

## Additional Notes
- Follow the modular structure for new features.
- Prefer functional components and hooks.
- Use TypeScript types from `src/types/` for consistency.
