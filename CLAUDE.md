# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scanalyzer is a Next.js 15 SaaS application with authentication, Stripe payments, i18n (English/Polish), and dark mode support. Built on the Skolaczk/next-starter template.

**Stack:** Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Drizzle ORM (PostgreSQL/Neon), NextAuth v5, Stripe, next-intl, shadcn/ui

## Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run preview          # Build + start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format:check     # Check Prettier formatting
npm run format:write     # Auto-format with Prettier
npm run typecheck        # Type-check without emitting

# Testing
npm run test             # Run Jest unit tests
npm run test:watch       # Jest watch mode
npm run e2e              # Run Playwright e2e tests
npm run e2e:ui           # Playwright with UI
```

## Architecture

### Route Structure
All routes are localized under `src/app/[locale]/`:
- `page.tsx` - Home/login page with credentials and GitHub OAuth
- `dashboard/` - Protected main app area
- `scanner/` - Scanner functionality
- `warehouse/` - Warehouse management
- `signup/` - User registration

### API Routes
- `api/auth/[...nextauth]/route.ts` - NextAuth handlers
- `api/auth/signup/route.ts` - User registration endpoint
- `api/stripe/webhook/route.ts` - Stripe subscription webhooks

### Key Files
- `src/lib/auth.ts` - NextAuth config with Credentials + GitHub providers, JWT strategy
- `src/lib/schema.ts` - Drizzle schema (users, accounts, sessions tables) + db client export
- `src/lib/stripe.ts` - Stripe client instance
- `src/env.mjs` - T3 Env validation for environment variables
- `src/middleware.ts` - next-intl middleware for locale routing
- `src/i18n/routing.ts` - Locale config (en, pl)

### Server Actions
- `src/actions/create-checkout-session.ts` - Creates Stripe subscription checkout

## Patterns

### Imports
Use `@/` path alias for all imports (maps to `src/`).

### Styling
Use `cn()` utility from `@/lib/utils` to merge Tailwind classes.

### i18n
Add translations to both `/messages/en.json` and `/messages/pl.json`.

### Authentication
- Check auth in server components/actions with `await auth()` from `@/lib/auth`
- User session includes: `id`, `stripeCustomerId`, `isActive` fields
- Protected routes check session existence

### Database
- Import `db` from `@/lib/schema` for database queries
- Use Drizzle ORM syntax for queries

## Pre-commit Hooks

Husky runs lint-staged on commit:
- ESLint + Prettier on `*.{jsx,js,ts,tsx}` files
- Commitlint enforces conventional commits

## CI/CD

GitHub Actions on PR to main:
- ESLint, TypeScript check, Prettier format check, Jest tests

Playwright tests run on push to main/master/develop.
