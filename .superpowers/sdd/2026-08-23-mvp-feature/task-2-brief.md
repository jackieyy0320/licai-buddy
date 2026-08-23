# Task 2 Brief: Authentication Module

## Context
Task 2 of 8 for Licai Buddy MVP. Task 1 completed: Next.js project initialized with Prisma schema.

## Your Requirements (read this first)

```typescript
// From docs/prd.md - 2.7 用户认证（P0）
// Features:
// - Invite-only registration (7-day validity, single-use)
// - Email/password login with JWT
// - Password reset via email
// - Admin invitation code management
// - Login protection (5 failures → 15 min lockout)
// - Account balance computed dynamically (NOT stored)
```

## Files to Create/Modify

### 1. Authentication Utilities
- `src/lib/auth.ts` - bcrypt hashing, JWT sign/verify
- `src/lib/invitation.ts` - invitation code generation/validation
- `src/lib/session.ts` - session management

### 2. API Routes
- `src/app/api/auth/register/route.ts` - POST /api/auth/register
- `src/app/api/auth/login/route.ts` - POST /api/auth/login
- `src/app/api/auth/logout/route.ts` - POST /api/auth/logout
- `src/app/api/auth/reset-password/route.ts` - POST /api/auth/reset-password
- `src/app/api/admin/invitations/route.ts` - GET/POST /api/admin/invitations

### 3. Types
- `src/types/auth.ts` - User, InvitationCode, JWT types

## Success Criteria
- [ ] User can register with valid invitation code
- [ ] User can login with email/password
- [ ] JWT tokens issued (Access: 24h, Refresh: 7d)
- [ ] Login locked after 5 consecutive failures (15 min)
- [ ] Invitation codes expire after 7 days
- [ ] Invitation codes are single-use
- [ ] All API routes return proper error responses
- [ ] Jest tests pass (>80% coverage)

## Key Implementation Notes

1. **Password hashing**: Use bcryptjs with salt rounds >= 10
2. **JWT signing**: Use jsonwebtoken with secret from env
3. **Login lockout**: Store failed attempts and lock timestamp in User model
4. **Balance computation**: Do NOT store balance in DB; compute via SQL SUM queries
5. **Error handling**: Return `{ success: false, error: "message" }` format

## Prisma Models Already Defined
- User (id, email, password, role, invitedBy, loginAttempts, lockedAt)
- InvitationCode (id, code, createdBy, expiresAt, usedBy)

## Testing Requirements
Write Jest tests for:
- Registration with valid/invalid invitation code
- Login with correct/incorrect credentials
- Login lockout after 5 failures
- Token generation and verification
- Invitation code expiration

## Instructions
1. Read this brief
2. Implement all files listed above
3. Run tests: `npx jest --passWithNoTests`
4. Commit changes
5. Push to GitHub
6. Close task when done

## Next Steps After Completion
Task 3: Transaction Module (unified bookkeeping with keywords, repeating rules)
