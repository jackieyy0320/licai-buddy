# Task 2 Brief: Authentication Module

## Context
Task 2 of 8 for Licai Buddy MVP. Task 1 completed: Next.js project initialized, Prisma schema created.

## Your Requirements (read this first)

```typescript
// From plan: docs/superpowers/plans/2026-08-23-mvp-feature.md - Task 2

Create these files:
- src/lib/auth.ts - JWT utilities, bcrypt hashing
- src/lib/invite-code.ts - Invite code generation/validation
- src/app/api/auth/register/route.ts
- src/app/api/auth/login/route.ts
- src/app/api/auth/logout/route.ts
- src/app/api/auth/refresh/route.ts
- src/middleware.ts - Route protection
- src/app/(auth)/login/page.tsx
- src/app/(auth)/register/page.tsx
- __tests__/auth.test.ts

KEY REQUIREMENTS:
- Password hashed with bcrypt (salt rounds >= 10)
- JWT Access Token: 24h expiry
- JWT Refresh Token: 7d expiry
- Login lockout: 5 failed attempts → 15 min lock
- Invite code: 7 days validity, single-use
- All API responses: { success, data, message } or { success, error }
- Zod validation on all inputs
```

## Global Constraints
- TypeScript strict mode
- No hardcoded secrets
- All passwords bcrypt hashed
- JWT tokens httpOnly cookies in production
- Error messages don't reveal whether email exists

## Interfaces Consumed
- `src/lib/prisma.ts` from Task 1

## Interfaces Produced
- Auth context for all subsequent tasks
- JWT token helpers
- Invite code management

## Report File
Write completion report to: `C:/Users/Administrator/Documents/Licai-Buddy/.superpowers/sdd/2026-08-23-mvp-feature/task-2-report.md`

## Success Criteria
- Register with valid invite code works
- Login with correct credentials works
- Login lockout after 5 failures works
- JWT token generation and verification works
- Invite code expires after 7 days
- All tests pass