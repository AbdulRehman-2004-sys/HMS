# Coding Standards & Architecture Rules - LALA Medical Complex HMS

This document outlines the strict guidelines governing file organization, coding practices, and architectural boundaries in the LALA Medical Complex HMS.

## 1. Coding Rules
- **TypeScript Strictness:** Always enable strict mode. Never use `any`. Specify interface structures explicitly. Use `unknown` for inputs of uncertain types.
- **Pure Functions:** Keep logic functions pure where possible. Business logic must be separated from framework adapters.
- **Function Size:** Keep functions under 40 lines. Split logic into utility helpers when complexity increases.

## 2. Folder & Module Boundaries Rules
- **Feature Encapsulation:** Code relating to a specific domain (e.g. `billing`, `appointments`) must reside entirely inside that feature folder.
- **Cross-Feature Imports:** 
  - **Forbidden:** Direct imports from `features/moduleA/internals/*` into `features/moduleB`.
  - **Permitted:** Importing shared components from global directories, or public contracts (e.g. types/interfaces) exposed at the index of features.
- **Feature Structure:**
  A feature directory should contain:
  - `components/` - View components specific to this feature.
  - `hooks/` - Feature specific custom react queries/state.
  - `services/` - External API endpoints wrappers or local domain logic.
  - `types/` - Zod schema types and interfaces.
  - `index.ts` - Clean entry point exposing ONLY public assets.

## 3. Naming Conventions
- **Files:** `kebab-case` (e.g., `user-profile.tsx`, `error-handler.ts`).
- **React Components:** `PascalCase` (e.g., `DashboardShell.tsx`).
- **Variables & Functions:** `camelCase` (e.g., `getUserById`, `isLoading`).
- **DB Schemas & Tables:** `snake_case` (e.g., `refresh_tokens`, `audit_logs`).
- **Types & Interfaces:** `PascalCase` (e.g., `UserResponse`, `AuthCredentials`).

## 4. Error Handling Rules
- **No Try-Catch Swallow:** Never swallow errors. Always log them via the logger and map them to custom exceptions.
- **Async Wrapper:** Use the `asyncHandler` wrapper on all Express routes. Do not write manual try-catch loops in every controller.
- **Response Safety:** In production, stack traces must *never* be returned to the client. Return standard error payloads instead.

## 5. Validation Rules
- **Input Validation:** Every input entering the API (query, param, or body) must be parsed via a Zod schema.
- **Client Forms:** Use Zod schemas with React Hook Form to keep client inputs validated before submission.

## 6. Database Rules
- **No Raw Queries:** Always use Drizzle's query builder to ensure type-safety.
- **Index Definitions:** Add database indexes to query columns (e.g. `user_id`, `email`, `role`) that are searched frequently.
- **Audit Logs:** Any write operation on patient EHR or billing records *must* write an entry in the `audit_logs` table.

## 7. Component Rules
- **Pure Representation:** Keep UI components focused on visual layout. Move side-effects into custom hooks.
- **Theme Tokens:** Avoid hardcoded hex colors or arbitrary spacing numbers. Use Tailwind variables (e.g. `bg-primary`, `p-4`).

## 8. Service & Repository Rules
- **Decoupled Contracts:** Express controllers must call Services, which orchestrate business rules and query database Repositories. Controllers should remain thin HTTP layer adapters.

## 9. Security Rules
- **SQL Injection:** Avoid string interpolation in SQL statements.
- **No Sensitive Leakage:** Never include user passwords, salts, or refresh tokens in API response objects.
- **HTTP Headers:** Secure Express app with `helmet`, `cors` configurations, and rate-limiting.

## 10. Accepted Libraries
- **Frontend:** Next.js, React, Lucide-react, TanStack Query, Tailwind CSS, Zod, Axios, Radix UI.
- **Backend:** Express, Drizzle ORM, Winston, JsonWebToken, Bcryptjs, Cors, Helmet, Zod, Express-rate-limit.
- *Any additions must go through architecture board review.*
