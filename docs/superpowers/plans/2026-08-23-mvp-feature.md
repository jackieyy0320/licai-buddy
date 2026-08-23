# MVP Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MVP of Licai Buddy — user authentication, transaction management, account management with dynamic balance, and reporting.

**Architecture:** Next.js 14 App Router with TypeScript, Prisma ORM + SQLite for data persistence, shadcn/ui for components, Recharts for charts. JWT-based authentication with invite-code registration. Balance computed dynamically from transactions.

**Tech Stack:** Next.js 14, TypeScript 5.x, Tailwind CSS 3.x, shadcn/ui, Prisma 5.x, SQLite, bcrypt, JWT (jsonwebtoken), Recharts, React Hook Form + Zod, Jest, Playwright

**Spec:** docs/prd.md (v5.0)

## Global Constraints

- Account.balance is NOT stored; computed dynamically via SQL SUM queries
- Invite code expires in 7 days, single-use
- Password hashed with bcrypt (salt rounds ≥ 10)
- JWT Access Token 24h, Refresh Token 7d
- Login locked 15 min after 5 consecutive failures
- All API responses use `{ success, data, message }` or `{ success, error }` format
- All inputs validated with Zod schemas on both frontend and backend
- Database schema must match docs/prd.md section 5 exactly
- Tests must achieve >80% coverage on all MVP modules
- No hardcoded credentials; use environment variables

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- Create: `.env.example`, `.gitignore`
- Create: `prisma/schema.prisma`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `src/lib/prisma.ts`
- Create: `__tests__/setup.ts`

**Interfaces:**
- Consumes: None (first task)
- Produces: Project structure ready for development

- [ ] **Step 1: Initialize Next.js project**

Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`

Expected: Project scaffolded with TypeScript, Tailwind, App Router

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install prisma @prisma/client bcryptjs jsonwebtoken zod react-hook-form @hookform/resolvers recharts clsx tailwind-merge
npm install -D @types/bcryptjs @types/jsonwebtoken jest ts-jest @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test eslint-config-prettier prettier
npx prisma init
```

Expected: All packages installed, Prisma initialized with `.env` and `prisma/schema.prisma`

- [ ] **Step 3: Write Prisma schema**

Create `prisma/schema.prisma` with the following content:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id             String   @id @default(uuid())
  email          String   @unique
  password       String
  role           String   @default("user")
  invitedBy      String?
  loginAttempts  Int      @default(0)
  lockedAt       DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  invitedUsers   User[]   @relation("InvitedBy")
  invitations    InvitationCode[]
  accounts       Account[]
  categories     Category[]
  transactions   Transaction[]
  keywords       Keyword[]
  inventories    Inventory[]
  investments    Investment[]

  @@index([email])
  @@index([role])
}

model InvitationCode {
  id        String   @id @default(uuid())
  code      String   @unique
  createdBy String
  expiresAt DateTime
  usedBy    String?
  usedAt    DateTime?
  createdAt DateTime @default(now())

  creator  User @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  invitee  User? @relation(fields: [usedBy], references: [id], onDelete: SetNull)

  @@index([code])
  @@index([createdBy])
  @@index([expiresAt])
}

model Account {
  id                 String   @id @default(uuid())
  userId             String
  name               String
  type               String   @default("cash")
  icon               String?
  keywords           String?  @default("[]")
  creditCardBillDay  Int?
  creditCardPayDay   Int?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  user         User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@index([userId])
  @@index([userId, type])
}

model Category {
  id         String   @id @default(uuid())
  userId     String
  name       String
  type       String   @default("expense")
  icon       String?
  color      String?
  sortOrder  Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@index([userId])
  @@index([userId, type])
  @@index([userId, sortOrder])
}

model Keyword {
  id        String   @id @default(uuid())
  userId    String
  name      String
  color     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  keywordTransactions KeywordTransaction[]
  user                User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, name])
}

model Transaction {
  id                 String   @id @default(uuid())
  userId             String
  accountId          String
  categoryId         String
  type               String   @default("expense")
  amount             Decimal
  date               DateTime
  note               String?
  keywords           String?  @default("[]")
  isRepeating        Boolean  @default(false)
  repeatPattern      String?
  repeatEndDate      DateTime?
  repeatCount        Int?
  parentTransactionId String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  account         Account         @relation(fields: [accountId], references: [id], onDelete: Cascade)
  category        Category        @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  parentTransaction Transaction?  @relation("RepeatingTransactions", fields: [parentTransactionId], references: [id], onDelete: SetNull)
  repeatingTransactions Transaction[] @relation("RepeatingTransactions")
  keywordTransactions KeywordTransaction[]

  @@index([userId])
  @@index([userId, accountId])
  @@index([userId, date])
  @@index([userId, categoryId])
  @@index([userId, isRepeating])
}

model KeywordTransaction {
  keywordId    String
  transactionId String
  createdAt    DateTime @default(now())

  keyword    Keyword    @relation(fields: [keywordId], references: [id], onDelete: Cascade)
  transaction Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)

  @@id([keywordId, transactionId])
  @@index([transactionId])
}

model Inventory {
  id                   String   @id @default(uuid())
  userId               String
  name                 String
  quantity             Int      @default(0)
  price                Decimal
  purchaseDate         DateTime
  keywords             String?  @default("[]")
  category             String?
  note                 String?
  lowStockThreshold    Int      @default(1)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  priceHistories       InventoryPriceHistory[]
  user                 User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, name])
}

model InventoryPriceHistory {
  id           String   @id @default(uuid())
  inventoryId  String
  price        Decimal
  purchaseDate DateTime
  quantity     Int
  createdAt    DateTime @default(now())

  inventory Inventory @relation(fields: [inventoryId], references: [id], onDelete: Cascade)

  @@index([inventoryId, purchaseDate])
}

model Investment {
  id             String   @id @default(uuid())
  userId         String
  name           String
  type           String   @default("other")
  principal      Decimal
  currentValue   Decimal
  purchaseDate   DateTime
  note           String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  records InvestmentRecord[]
  user    User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, type])
}

model InvestmentRecord {
  id             String   @id @default(uuid())
  investmentId   String
  userId         String
  type           String
  amount         Decimal
  date           DateTime
  note           String?
  createdAt      DateTime @default(now())

  investment Investment @relation(fields: [investmentId], references: [id], onDelete: Cascade)
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([investmentId])
  @@index([userId])
  @@index([userId, date])
}
```

- [ ] **Step 4: Create Prisma client**

Create `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 5: Create environment config**

Create `.env.example`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 6: Push schema to database**

Run: `npx prisma db push`

Expected: Database created, all tables migrated

- [ ] **Step 7: Create root layout and page**

Create `src/app/layout.tsx`:
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Licai Buddy',
  description: '多用户记账工具，消费→库存→投资数据联动',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

Create `src/app/page.tsx`:
```typescript
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
```

- [ ] **Step 8: Run tests to verify setup**

Run: `npx jest --passWithNoTests`

Expected: No errors, test framework working

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: initialize project with Next.js, Prisma, and SQLite schema"
```

---

## Task 2: Authentication Module

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/lib/invite-code.ts`
- Create: `src/app/api/auth/register/route.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/auth/refresh/route.ts`
- Create: `src/middleware.ts`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `__tests__/auth.test.ts`

**Interfaces:**
- Consumes: Prisma client from Task 1
- Produces: JWT-based auth with invite-code registration, login lockout, session management

- [ ] **Step 1: Write auth utility functions**

Create `src/lib/auth.ts`:
```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateAccessToken(userId: string, email: string, role: string): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Write invite code utilities**

Create `src/lib/invite-code.ts`:
```typescript
import { prisma } from './prisma';
import { randomBytes } from 'crypto';

export async function generateInviteCode(
  createdBy: string,
  daysValid: number = 7
): Promise<string> {
  const code = randomBytes(4).toString('hex').toUpperCase();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + daysValid);

  await prisma.invitationCode.create({
    data: {
      code,
      createdBy,
      expiresAt,
    },
  });

  return code;
}

export async function getInviteCodeStatus(code: string): Promise<{
  valid: boolean;
  expiresAt?: Date;
  usedBy?: string;
}> {
  const invite = await prisma.invitationCode.findUnique({
    where: { code },
    include: { invitee: true },
  });

  if (!invite) {
    return { valid: false };
  }

  if (invite.usedBy) {
    return { valid: false, usedBy: invite.usedBy };
  }

  if (invite.expiresAt < new Date()) {
    return { valid: false };
  }

  return {
    valid: true,
    expiresAt: invite.expiresAt,
  };
}

export async function markInviteCodeUsed(code: string, userId: string): Promise<void> {
  await prisma.invitationCode.updateMany({
    where: { code, usedBy: null },
    data: { usedBy: userId, usedAt: new Date() },
  });
}

export async function getInviteCodes(createdBy: string) {
  return prisma.invitationCode.findMany({
    where: { createdBy },
    include: { invitee: { select: { id: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function revokeInviteCode(code: string, createdBy: string): Promise<boolean> {
  const result = await prisma.invitationCode.deleteMany({
    where: { code, createdBy, usedBy: null, expiresAt: { gt: new Date() } },
  });
  return result.count > 0;
}
```

- [ ] **Step 3: Write register API**

Create `src/app/api/auth/register/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateAccessToken, generateRefreshToken, markInviteCodeUsed } from '@/lib/auth';
import { getInviteCodeStatus } from '@/lib/invite-code';

const registerSchema = z.object({
  email: z.string().email('邮箱格式错误'),
  password: z.string().min(6, '密码至少6位').max(50),
  inviteCode: z.string().min(8).max(8),
  name: z.string().min(1).max(50),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Check invite code
    const inviteStatus = await getInviteCodeStatus(validated.inviteCode);
    if (!inviteStatus.valid) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INVITE_CODE', message: '邀请码无效或已过期' } },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: 'EMAIL_EXISTS', message: '该邮箱已注册' } },
        { status: 409 }
      );
    }

    // Create user
    const hashedPassword = await hashPassword(validated.password);
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        role: 'user',
        invitedBy: inviteStatus.usedBy || undefined,
      },
    });

    // Mark invite code as used
    await markInviteCodeUsed(validated.inviteCode, user.id);

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    return NextResponse.json(
      {
        success: true,
        data: {
          user: { id: user.id, email: user.email, name: user.name, role: user.role },
          accessToken,
          refreshToken,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '参数校验失败', fields: error.errors.map(e => e.path[0]) } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 4: Write login API**

Create `src/app/api/auth/login/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('邮箱格式错误'),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      // Don't reveal whether email exists
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: '邮箱或密码错误' } },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.lockedAt && user.loginAttempts >= 5) {
      const unlockTime = new Date(user.lockedAt.getTime() + 15 * 60 * 1000);
      if (unlockTime > new Date()) {
        return NextResponse.json(
          { success: false, error: { code: 'ACCOUNT_LOCKED', message: `账号已锁定，请 ${unlockTime.toLocaleTimeString()} 后再试` } },
          { status: 423 }
        );
      }
      // Lock expired, reset
      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: 0, lockedAt: null },
      });
    }

    // Verify password
    const isValid = await comparePassword(validated.password, user.password);
    if (!isValid) {
      // Increment failed attempts
      const newAttempts = user.loginAttempts + 1;
      const lockedAt = newAttempts >= 5 ? new Date() : null;
      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: newAttempts, lockedAt },
      });
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: '邮箱或密码错误' } },
        { status: 401 }
      );
    }

    // Reset login attempts on success
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockedAt: null },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    return NextResponse.json(
      {
        success: true,
        data: {
          user: { id: user.id, email: user.email, name: user.name, role: user.role },
          accessToken,
          refreshToken,
        },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '参数校验失败' } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 5: Write logout and refresh APIs**

Create `src/app/api/auth/logout/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: '已退出登录' });
  response.cookies.set('accessToken', '', { expires: new Date(0) });
  response.cookies.set('refreshToken', '', { expires: new Date(0) });
  return response;
}
```

Create `src/app/api/auth/refresh/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_REFRESH_TOKEN', message: '未提供刷新令牌' } },
        { status: 401 }
      );
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REFRESH_TOKEN', message: '刷新令牌无效' } },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: '用户不存在' } },
        { status: 404 }
      );
    }

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    const response = NextResponse.json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 6: Write middleware**

Create `src/middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/register'];
const API_AUTH_PATHS = ['/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API auth routes
  if (API_AUTH_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next();
  }

  // Check auth token
  const accessToken = request.cookies.get('accessToken')?.value;
  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const decoded = verifyToken(accessToken);
  if (!decoded) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Attach user info to headers
  const response = NextResponse.next();
  response.headers.set('x-user-id', decoded.userId);
  response.headers.set('x-user-email', decoded.email);
  response.headers.set('x-user-role', decoded.role);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
```

- [ ] **Step 7: Write login page**

Create `src/app/(auth)/login/page.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('请输入有效邮箱'),
  password: z.string().min(1, '请输入密码'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        router.push('/');
      } else {
        setError(result.error?.message || '登录失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Licai Buddy</h2>
          <p className="mt-2 text-center text-sm text-gray-600">登录你的账户</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
          <p className="text-center text-sm text-gray-600">
            还没有账户？{' '}
            <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              邀请注册
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Write register page**

Create `src/app/(auth)/register/page.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('请输入有效邮箱'),
  password: z.string().min(6, '密码至少6位').max(50),
  confirmPassword: z.string(),
  inviteCode: z.string().min(8).max(8),
  name: z.string().min(1).max(50),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          inviteCode: data.inviteCode,
          name: data.name,
        }),
      });

      const result = await res.json();

      if (result.success) {
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        router.push('/');
      } else {
        setError(result.error?.message || '注册失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Licai Buddy</h2>
          <p className="mt-2 text-center text-sm text-gray-600">使用邀请码注册</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">姓名</label>
              <input {...register('name')} type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">邮箱</label>
              <input {...register('email')} type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">邀请码</label>
              <input {...register('inviteCode')} type="text" maxLength={8} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              {errors.inviteCode && <p className="mt-1 text-sm text-red-600">{errors.inviteCode.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">密码</label>
              <input {...register('password')} type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">确认密码</label>
              <input {...register('confirmPassword')} type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
            {loading ? '注册中...' : '注册'}
          </button>
          <p className="text-center text-sm text-gray-600">
            已有账户？{' '}
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">登录</a>
          </p>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Write auth tests**

Create `__tests__/auth.test.ts`:
```typescript
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/auth';

describe('Auth Module', () => {
  beforeEach(async () => {
    // Clean up test users
    await prisma.user.deleteMany();
    await prisma.invitationCode.deleteMany();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.invitationCode.deleteMany();
  });

  test('should hash password with bcrypt', async () => {
    const plain = 'testpassword123';
    const hashed = await hashPassword(plain);
    expect(hashed).not.toBe(plain);
    expect(hashed.length).toBe(60); // bcrypt hash length
  });

  test('should create invitation code', async () => {
    const user = await prisma.user.create({
      data: { email: 'admin@test.com', password: '$2a$10$dummyhash', name: 'Admin' },
    });

    const { randomBytes } = await import('crypto');
    const code = randomBytes(4).toString('hex').toUpperCase();
    
    const invite = await prisma.invitationCode.create({
      data: {
        code,
        createdBy: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    expect(invite.code).toBe(code);
    expect(invite.createdBy).toBe(user.id);
  });

  test('should validate password comparison', async () => {
    const plain = 'testpassword';
    const hashed = await hashPassword(plain);
    
    const isValid = await import('../src/lib/auth').then(m => m.comparePassword(plain, hashed));
    expect(isValid).toBe(true);
    
    const isInvalid = await import('../src/lib/auth').then(m => m.comparePassword('wrong', hashed));
    expect(isInvalid).toBe(false);
  });
});
```

- [ ] **Step 10: Run auth tests**

Run: `npx jest __tests__/auth.test.ts --verbose`

Expected: All tests pass

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: implement authentication module with invite registration and JWT"
```

---

## Task 3: Transaction Module (Core)

**Files:**
- Create: `src/lib/transactions.ts`
- Create: `src/app/api/transactions/route.ts`
- Create: `src/app/api/transactions/[id]/route.ts`
- Create: `src/app/(app)/transactions/page.tsx`
- Create: `src/components/transactions/TransactionForm.tsx`
- Create: `src/components/transactions/TransactionList.tsx`
- Create: `__tests__/transactions.test.ts`

**Interfaces:**
- Consumes: Prisma client, auth utilities
- Produces: Full CRUD for transactions with dynamic balance calculation

- [ ] **Step 1: Write transaction service**

Create `src/lib/transactions.ts`:
```typescript
import { prisma } from './prisma';
import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().positive('金额必须大于 0'),
  date: z.string().date('日期格式错误'),
  note: z.string().max(500).optional(),
  accountId: z.string().uuid('账户 ID 格式错误'),
  categoryId: z.string().uuid('分类 ID 格式错误').optional(),
  toAccountId: z.string().uuid('目标账户 ID 格式错误').optional(),
  keywords: z.array(z.string()).optional(),
  isRepeating: z.boolean().optional(),
  repeatPattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  repeatEndDate: z.string().date().optional().nullable(),
  repeatCount: z.number().int().positive().optional(),
});

export const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  date: z.string().date().optional(),
  note: z.string().max(500).optional(),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  keywords: z.array(z.string()).optional(),
  isRepeating: z.boolean().optional(),
  repeatPattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  repeatEndDate: z.string().date().optional().nullable(),
  repeatCount: z.number().int().positive().optional(),
});

export interface TransactionListParams {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
  accountId?: string;
  type?: 'income' | 'expense' | 'transfer';
  search?: string;
  keywords?: string;
}

export async function getTransactionBalance(userId: string, accountId: string): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      OR: [
        { accountId, type: { in: ['income', 'transfer'] } },
        { toAccountId: accountId, type: 'transfer' },
      ],
    },
    _sum: {
      amount: true,
    },
  });

  const incomeAndTransfersIn = result._sum.amount || 0;

  const expenseResult = await prisma.transaction.aggregate({
    where: {
      userId,
      accountId,
      type: 'expense',
    },
    _sum: {
      amount: true,
    },
  });

  const expenses = expenseResult._sum.amount || 0;

  // For transfers out, we need to subtract the amount
  const transferOutResult = await prisma.transaction.aggregate({
    where: {
      userId,
      accountId,
      type: 'transfer',
    },
    _sum: {
      amount: true,
    },
  });

  const transferOut = transferOutResult._sum.amount || 0;

  return incomeAndTransfersIn - expenses - transferOut;
}

export async function createTransaction(userId: string, data: z.infer<typeof createTransactionSchema>) {
  const validated = createTransactionSchema.parse(data);

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: validated.type,
      amount: validated.amount,
      date: new Date(validated.date),
      note: validated.note,
      accountId: validated.accountId,
      categoryId: validated.categoryId,
      toAccountId: validated.toAccountId,
      keywords: validated.keywords ? JSON.stringify(validated.keywords) : '[]',
      isRepeating: validated.isRepeating || false,
      repeatPattern: validated.repeatPattern,
      repeatEndDate: validated.repeatEndDate ? new Date(validated.repeatEndDate) : null,
      repeatCount: validated.repeatCount,
    },
    include: {
      account: { select: { id: true, name: true, type: true } },
      category: { select: { id: true, name: true, icon: true } },
    },
  });

  // Handle keywords
  if (validated.keywords && validated.keywords.length > 0) {
    const keywordIds = validated.keywords;
    await prisma.keywordTransaction.createMany({
      data: keywordIds.map(keywordId => ({
        keywordId,
        transactionId: transaction.id,
      })),
    });
  }

  return transaction;
}

export async function getTransactions(userId: string, params: TransactionListParams) {
  const {
    page = 1,
    limit = 50,
    dateFrom,
    dateTo,
    categoryId,
    accountId,
    type,
    search,
    keywords,
  } = params;

  const where: any = { userId };

  if (dateFrom) where.date = { ...where.date, gte: new Date(dateFrom) };
  if (dateTo) where.date = { ...where.date, lte: new Date(dateTo) };
  if (categoryId) where.categoryId = categoryId;
  if (accountId) where.accountId = accountId;
  if (type) where.type = type;
  if (search) where.note = { contains: search };
  if (keywords) {
    where.keywords = { contains: keywords };
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        account: { select: { id: true, name: true, type: true } },
        category: { select: { id: true, name: true, icon: true } },
        keywords: { include: { keyword: { select: { id: true, name: true } } } },
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    data: transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function updateTransaction(userId: string, id: string, data: Partial<z.infer<typeof updateTransactionSchema>>) {
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error('Transaction not found');
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data,
  });

  // Update keywords if provided
  if (data.keywords !== undefined) {
    await prisma.keywordTransaction.deleteMany({
      where: { transactionId: id },
    });
    if (data.keywords.length > 0) {
      await prisma.keywordTransaction.createMany({
        data: data.keywords.map(keywordId => ({
          keywordId,
          transactionId: id,
        })),
      });
    }
  }

  return updated;
}

export async function deleteTransaction(userId: string, id: string) {
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error('Transaction not found');
  }

  await prisma.keywordTransaction.deleteMany({
    where: { transactionId: id },
  });

  return prisma.transaction.delete({
    where: { id },
  });
}
```

- [ ] **Step 2: Write transaction API routes**

Create `src/app/api/transactions/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, createTransaction, TransactionListParams } from '@/lib/transactions';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } },
        { status: 401 }
      );
    }

    const decoded = verifyToken(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: '令牌无效' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const params: TransactionListParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      accountId: searchParams.get('accountId') || undefined,
      type: (searchParams.get('type') as any) || undefined,
      search: searchParams.get('search') || undefined,
      keywords: searchParams.get('keywords') || undefined,
    };

    const result = await getTransactions(decoded.userId, params);

    return NextResponse.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } },
        { status: 401 }
      );
    }

    const decoded = verifyToken(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: '令牌无效' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const transaction = await createTransaction(decoded.userId, body);

    return NextResponse.json({ success: true, data: transaction }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('ZodError')) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '参数校验失败' } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/transactions/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { updateTransaction, deleteTransaction } from '@/lib/transactions';
import { verifyToken } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } },
        { status: 401 }
      );
    }

    const decoded = verifyToken(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: '令牌无效' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const transaction = await updateTransaction(decoded.userId, params.id, body);

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    if (error instanceof Error && error.message === 'Transaction not found') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '交易不存在' } },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } },
        { status: 401 }
      );
    }

    const decoded = verifyToken(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: '令牌无效' } },
        { status: 401 }
      );
    }

    await deleteTransaction(decoded.userId, params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Transaction not found') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '交易不存在' } },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Write transaction components**

Create `src/components/transactions/TransactionForm.tsx`:
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().positive(),
  date: z.string(),
  accountId: z.string(),
  toAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  note: z.string().max(500).optional(),
  keywords: z.array(z.string()).optional(),
  isRepeating: z.boolean().optional(),
  repeatPattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSuccess: () => void;
  accounts: Array<{ id: string; name: string; type: string }>;
  categories: Array<{ id: string; name: string; type: string }>;
  keywords: Array<{ id: string; name: string }>;
}

export function TransactionForm({ onSuccess, accounts, categories, keywords }: TransactionFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      isRepeating: false,
    },
  });

  const selectedType = watch('type');

  const onSubmit = async (data: TransactionFormData) => {
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        onSuccess();
      } else {
        setSubmitError(result.error?.message || '提交失败');
      }
    } catch {
      setSubmitError('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {submitError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">类型</label>
        <select {...register('type')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
          <option value="expense">支出</option>
          <option value="income">收入</option>
          <option value="transfer">转账</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">金额</label>
        <input {...register('amount', { valueAsNumber: true })} type="number" step="0.01" min="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">日期</label>
        <input {...register('date')} type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>

      {selectedType === 'transfer' ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">转出账户</label>
            <select {...register('accountId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">转入账户</label>
            <select {...register('toAccountId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">账户</label>
            <select {...register('accountId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              {accounts.filter(acc => selectedType === 'income' ? acc.type !== 'credit' : true).map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">分类</label>
            <select {...register('categoryId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              {categories.filter(cat => cat.type === selectedType).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">备注</label>
        <textarea {...register('note')} rows={3} maxLength={500} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>

      <div>
        <label className="flex items-center">
          <input {...register('isRepeating')} type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          <span className="ml-2 text-sm text-gray-700">重复记账</span>
        </label>
      </div>

      <button type="submit" disabled={submitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
        {submitting ? '提交中...' : '提交'}
      </button>
    </form>
  );
}
```

Create `src/components/transactions/TransactionList.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  date: string;
  note: string | null;
  account: { id: string; name: string; type: string };
  category: { id: string; name: string; icon: string } | null;
  keywords: Array<{ keyword: { id: string; name: string } }>;
}

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onDelete, onEdit }: TransactionListProps) {
  const [filter, setFilter] = useState({ dateFrom: '', dateTo: '', type: '', search: '' });

  const filtered = transactions.filter(t => {
    if (filter.type && t.type !== filter.type) return false;
    if (filter.dateFrom && t.date < filter.dateFrom) return false;
    if (filter.dateTo && t.date > filter.dateTo) return false;
    if (filter.search && !t.note?.includes(filter.search) && !t.keywords.some(k => k.keyword.name.includes(filter.search))) return false;
    return true;
  });

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <input type="date" value={filter.dateFrom} onChange={e => setFilter(f => ({ ...f, dateFrom: e.target.value }))} className="rounded-md border-gray-300 shadow-sm sm:text-sm" />
        <input type="date" value={filter.dateTo} onChange={e => setFilter(f => ({ ...f, dateTo: e.target.value }))} className="rounded-md border-gray-300 shadow-sm sm:text-sm" />
        <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))} className="rounded-md border-gray-300 shadow-sm sm:text-sm"
        < input type= "text" placeholder= "搜索..." value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} className= "rounded-md border-gray-300 shadow-sm sm:text-sm" />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-8">暂无交易记录</p>
        ) : (
          filtered.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{t.category?.icon || '💰'}</span>
                <div>
                  <p className="font-medium">{t.category?.name || '未分类'}</p>
                  <p className="text-sm text-gray-500">{t.note || t.account.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${t.type === 'income' ? 'text-green-600' : t.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                  {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{t.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">{t.date}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(t)} className="text-indigo-600 hover:text-indigo-800 text-sm">编辑</button>
                <button onClick={() => onDelete(t.id)} className="text-red-600 hover:text-red-800 text-sm">删除</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write transactions page**

Create `src/app/(app)/transactions/page.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionList } from '@/components/transactions/TransactionList';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  date: string;
  note: string | null;
  account: { id: string; name: string; type: string };
  category: { id: string; name: string; icon: string } | null;
  keywords: Array<{ keyword: { id: string; name: string } }>;
}

interface Account {
  id: string;
  name: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Keyword {
  id: string;
  name: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/transactions').then(r => r.json()),
      fetch('/api/accounts').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/keywords').then(r => r.json()),
    ]).then(([txRes, acctRes, catRes, kwRes]) => {
      if (txRes.success) setTransactions(txRes.data);
      if (acctRes.success) setAccounts(acctRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (kwRes.success) setKeywords(kwRes.data);
    });
  }, []);

  const handleSuccess = () => {
    setShowForm(false);
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此条记录？')) return;
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">记账明细</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          {showForm ? '关闭' : '+ 记一笔'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <TransactionForm onSuccess={handleSuccess} accounts={accounts} categories={categories} keywords={keywords} />
        </div>
      )}

      <TransactionList transactions={transactions} onDelete={handleDelete} onEdit={() => {}} />
    </div>
  );
}
```

- [ ] **Step 5: Write transaction tests**

Create `__tests__/transactions.test.ts`:
```typescript
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { prisma } from '../src/lib/prisma';
import { createTransaction, getTransactions, getTransactionBalance } from '../src/lib/transactions';

describe('Transaction Module', () => {
  let userId: string;

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', password: '$2a$10$dummy', name: 'Test User' },
    });
    userId = user.id;

    const account = await prisma.account.create({
      data: { userId, name: '现金', type: 'cash' },
    });

    const category = await prisma.category.create({
      data: { userId, name: '餐饮', type: 'expense', icon: '🍜' },
    });

    await prisma.transaction.create({
      data: { userId, type: 'expense', amount: 50, date: new Date(), accountId: account.id, categoryId: category.id },
    });
  });

  afterEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  });

  test('should create transaction', async () => {
    const account = await prisma.account.findFirst({ where: { userId } });
    const category = await prisma.category.findFirst({ where: { userId } });

    const tx = await createTransaction(userId, {
      type: 'expense',
      amount: 100,
      date: new Date().toISOString(),
      accountId: account!.id,
      categoryId: category!.id,
    });

    expect(tx.amount).toBe(100);
    expect(tx.type).toBe('expense');
  });

  test('should calculate balance correctly', async () => {
    const account = await prisma.account.findFirst({ where: { userId } });
    const balance = await getTransactionBalance(userId, account!.id);
    expect(balance).toBe(-50); // One expense of 50
  });

  test('should list transactions with pagination', async () => {
    const result = await getTransactions(userId, { page: 1, limit: 10 });
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.pagination.total).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 6: Run transaction tests**

Run: `npx jest __tests__/transactions.test.ts --verbose`

Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: implement transaction module with CRUD and dynamic balance"
```

---

## Task 4: Account Module

**Files:**
- Create: `src/lib/accounts.ts`
- Create: `src/app/api/accounts/route.ts`
- Create: `src/app/api/accounts/[id]/route.ts`
- Create: `src/app/(app)/accounts/page.tsx`
- Create: `__tests__/accounts.test.ts`

**Interfaces:**
- Consumes: Prisma client, transaction balance calculation
- Produces: Account CRUD with dynamic balance and credit card features

- [ ] **Step 1: Write account service**

Create `src/lib/accounts.ts`:
```typescript
import { prisma } from './prisma';
import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['cash', 'bank', 'credit', 'investment']),
  balance: z.number().default(0),
  icon: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  creditCardBillDay: z.number().int().min(1).max(28).optional(),
  creditCardPayDay: z.number().int().min(1).max(31).optional(),
});

export async function getAccounts(userId: string) {
  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate dynamic balance for each account
  const accountsWithBalance = await Promise.all(
    accounts.map(async (account) => {
      const result = await prisma.transaction.aggregate({
        where: {
          userId,
          OR: [
            { accountId: account.id, type: { in: ['income', 'transfer'] } },
            { toAccountId: account.id, type: 'transfer' },
          ],
        },
        _sum: { amount: true },
      });

      const expenseResult = await prisma.transaction.aggregate({
        where: { userId, accountId: account.id, type: 'expense' },
        _sum: { amount: true },
      });

      const transferOutResult = await prisma.transaction.aggregate({
        where: { userId, accountId: account.id, type: 'transfer' },
        _sum: { amount: true },
      });

      const incomeAndTransfersIn = result._sum.amount || 0;
      const expenses = expenseResult._sum.amount || 0;
      const transferOut = transferOutResult._sum.amount || 0;

      const balance = incomeAndTransfersIn - expenses - transferOut;

      return {
        ...account,
        balance,
        keywords: account.keywords ? JSON.parse(account.keywords) : [],
      };
    })
  );

  return accountsWithBalance;
}

export async function createAccount(userId: string, data: z.infer<typeof createAccountSchema>) {
  const validated = createAccountSchema.parse(data);
  
  return prisma.account.create({
    data: {
      userId,
      name: validated.name,
      type: validated.type,
      icon: validated.icon,
      keywords: validated.keywords ? JSON.stringify(validated.keywords) : '[]',
      creditCardBillDay: validated.creditCardBillDay,
      creditCardPayDay: validated.creditCardPayDay,
    },
  });
}

export async function updateAccount(userId: string, id: string, data: Partial<z.infer<typeof createAccountSchema>>) {
  const existing = await prisma.account.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Account not found');
  
  return prisma.account.update({ where: { id }, data });
}

export async function deleteAccount(userId: string, id: string) {
  const existing = await prisma.account.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Account not found');

  // Check if balance is zero
  const result = await prisma.transaction.aggregate({
    where: { userId, accountId: id },
    _sum: { amount: true },
  });

  const expenseResult = await prisma.transaction.aggregate({
    where: { userId, accountId: id, type: 'expense' },
    _sum: { amount: true },
  });

  const transferOutResult = await prisma.transaction.aggregate({
    where: { userId, accountId: id, type: 'transfer' },
    _sum: { amount: true },
  });

  const balance = (result._sum.amount || 0) - (expenseResult._sum.amount || 0) - (transferOutResult._sum.amount || 0);
  
  if (balance !== 0) {
    throw new Error('ACCOUNT_NOT_EMPTY');
  }

  return prisma.account.delete({ where: { id } });
}

export async function getAccountTransactions(userId: string, accountId: string) {
  return prisma.transaction.findMany({
    where: { userId, accountId },
    include: { category: true },
    orderBy: { date: 'desc' },
  });
}
```

- [ ] **Step 2: Write account API routes**

Create `src/app/api/accounts/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAccounts, createAccount } from '@/lib/accounts';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } }, { status: 401 });
    }

    const decoded = verifyToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_TOKEN', message: '令牌无效' } }, { status: 401 });
    }

    const accounts = await getAccounts(decoded.userId);
    return NextResponse.json({ success: true, data: accounts });
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } }, { status: 401 });
    }

    const decoded = verifyToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_TOKEN', message: '令牌无效' } }, { status: 401 });
    }

    const body = await request.json();
    const account = await createAccount(decoded.userId, body);

    return NextResponse.json({ success: true, data: account }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('ZodError')) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: '参数校验失败' } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } }, { status: 500 });
  }
}
```

Create `src/app/api/accounts/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { updateAccount, deleteAccount, getAccountTransactions } from '@/lib/accounts';
import { verifyToken } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } }, { status: 401 });
    }

    const decoded = verifyToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_TOKEN', message: '令牌无效' } }, { status: 401 });
    }

    const body = await request.json();
    const account = await updateAccount(decoded.userId, params.id, body);

    return NextResponse.json({ success: true, data: account });
  } catch (error) {
    if (error instanceof Error && error.message === 'Account not found') {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: '账户不存在' } }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } }, { status: 401 });
    }

    const decoded = verifyToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_TOKEN', message: '令牌无效' } }, { status: 401 });
    }

    try {
      await deleteAccount(decoded.userId, params.id);
      return NextResponse.json({ success: true });
    } catch (error) {
      if (error instanceof Error && error.message === 'ACCOUNT_NOT_EMPTY') {
        return NextResponse.json({ success: false, error: { code: 'ACCOUNT_NOT_EMPTY', message: '账户余额不为零，无法删除' } }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Account not found') {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: '账户不存在' } }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } }, { status: 401 });
    }

    const decoded = verifyToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_TOKEN', message: '令牌无效' } }, { status: 401 });
    }

    const transactions = await getAccountTransactions(decoded.userId, params.id);
    return NextResponse.json({ success: true, data: transactions });
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } }, { status: 500 });
  }
}
```

- [ ] **Step 3: Write accounts page**

Create `src/app/(app)/accounts/page.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  icon: string | null;
  creditCardBillDay: number | null;
  creditCardPayDay: number | null;
  keywords: string[];
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'cash', balance: 0, icon: '', creditCardBillDay: '', creditCardPayDay: '' });

  useEffect(() => {
    fetch('/api/accounts')
      .then(r => r.json())
      .then(result => {
        if (result.success) setAccounts(result.data);
      });
  }, []);

  const handleCreate = async () => {
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        balance: parseFloat(formData.balance) || 0,
        creditCardBillDay: formData.creditCardBillDay ? parseInt(formData.creditCardBillDay) : null,
        creditCardPayDay: formData.creditCardPayDay ? parseInt(formData.creditCardPayDay) : null,
      }),
    });
    const result = await res.json();
    if (result.success) {
      setAccounts(prev => [...prev, result.data]);
      setShowForm(false);
      setFormData({ name: '', type: 'cash', balance: 0, icon: '', creditCardBillDay: '', creditCardPayDay: '' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此账户？')) return;
    const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    } else if (result.error?.code === 'ACCOUNT_NOT_EMPTY') {
      alert('账户余额不为零，无法删除');
    }
  };

  const typeIcons: Record<string, string> = {
    cash: '💵',
    bank: '🏦',
    credit: '💳',
    investment: '📈',
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">账户管理</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          + 添加账户
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">账户名称</label>
            <input type="text" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">类型</label>
            <select value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm">
              <option value="cash">现金</option>
              <option value="bank">银行卡</option>
              <option value="credit">信用卡</option>
              <option value="investment">理财</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">初始余额</label>
            <input type="number" step="0.01" value={formData.balance} onChange={e => setFormData(f => ({ ...f, balance: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
          </div>
          {formData.type === 'credit' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">账单日 (1-28)</label>
                <input type="number" min="1" max="28" value={formData.creditCardBillDay} onChange={e => setFormData(f => ({ ...f, creditCardBillDay: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">还款日 (1-31)</label>
                <input type="number" min="1" max="31" value={formData.creditCardPayDay} onChange={e => setFormData(f => ({ ...f, creditCardPayDay: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
              </div>
            </>
          )}
          <button onClick={handleCreate} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">创建</button>
        </div>
      )}

      <div className="grid gap-4">
        {accounts.map(account => (
          <div key={account.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{typeIcons[account.type] || '💰'}</span>
              <div>
                <p className="font-medium text-lg">{account.name}</p>
                <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                {account.type === 'credit' && account.creditCardBillDay && (
                  <p className="text-xs text-gray-400">账单日: {account.creditCardBillDay}号, 还款日: {account.creditCardPayDay}号</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl">{account.balance.toFixed(2)}</p>
              <button onClick={() => handleDelete(account.id)} className="text-red-600 text-sm hover:underline">删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write account tests**

Create `__tests__/accounts.test.ts`:
```typescript
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { prisma } from '../src/lib/prisma';
import { getAccounts, createAccount, deleteAccount } from '../src/lib/accounts';

describe('Account Module', () => {
  let userId: string;

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: { email: 'acct@test.com', password: '$2a$10$dummy', name: 'Account Test' },
    });
    userId = user.id;
  });

  afterEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  });

  test('should create account', async () => {
    const account = await createAccount(userId, { name: '测试账户', type: 'cash' });
    expect(account.name).toBe('测试账户');
    expect(account.userId).toBe(userId);
  });

  test('should list accounts with calculated balance', async () => {
    const account = await createAccount(userId, { name: '现金', type: 'cash' });
    
    await prisma.transaction.create({
      data: { userId, type: 'expense', amount: 100, date: new Date(), accountId: account.id },
    });

    const accounts = await getAccounts(userId);
    const cashAccount = accounts.find(a => a.id === account.id);
    expect(cashAccount).toBeDefined();
    expect(cashAccount!.balance).toBe(-100);
  });

  test('should not delete account with non-zero balance', async () => {
    const account = await createAccount(userId, { name: '现金', type: 'cash' });
    
    await prisma.transaction.create({
      data: { userId, type: 'expense', amount: 50, date: new Date(), accountId: account.id },
    });

    await expect(deleteAccount(userId, account.id)).rejects.toThrow('ACCOUNT_NOT_EMPTY');
  });
});
```

- [ ] **Step 5: Run account tests and commit**

Run: `npx jest __tests__/accounts.test.ts --verbose`

```bash
git add -A
git commit -m "feat: implement account module with dynamic balance calculation"
```

---

## Task 5: Category & Keyword Management

**Files:**
- Create: `src/lib/categories.ts`
- Create: `src/lib/keywords.ts`
- Create: `src/app/api/categories/route.ts`
- Create: `src/app/api/categories/[id]/route.ts`
- Create: `src/app/api/keywords/route.ts`
- Create: `src/app/api/keywords/[id]/route.ts`
- Create: `src/app/(app)/categories/page.tsx`
- Create: `src/app/(app)/keywords/page.tsx`
- Create: `__tests__/categories.test.ts`
- Create: `__tests__/keywords.test.ts`

**Interfaces:**
- Consumes: Prisma client
- Produces: Category and keyword CRUD with ordering and usage counts

- [ ] **Step 1: Write category and keyword services**

Create `src/lib/categories.ts`:
```typescript
import { prisma } from './prisma';
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['income', 'expense']).default('expense'),
  icon: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number().default(0),
});

export async function getCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function createCategory(userId: string, data: z.infer<typeof createCategorySchema>) {
  return prisma.category.create({ data: { ...data, userId } });
}

export async function updateCategory(userId: string, id: string, data: Partial<z.infer<typeof createCategorySchema>>) {
  const existing = await prisma.category.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Category not found');
  
  // Check if category has transactions
  const txCount = await prisma.transaction.count({ where: { categoryId: id } });
  if (txCount > 0 && data.name && data.name !== existing.name) {
    // Allow rename but warn
  }
  
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(userId: string, id: string) {
  const existing = await prisma.category.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Category not found');
  
  const txCount = await prisma.transaction.count({ where: { categoryId: id } });
  if (txCount > 0) {
    throw new Error('CATEGORY_HAS_TRANSACTIONS');
  }
  
  return prisma.category.delete({ where: { id } });
}

export async function reorderCategories(userId: string, ids: string[]) {
  await Promise.all(
    ids.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );
}
```

Create `src/lib/keywords.ts`:
```typescript
import { prisma } from './prisma';
import { z } from 'zod';

export const createKeywordSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().optional(),
});

export async function getKeywords(userId: string) {
  return prisma.keyword.findMany({
    where: { userId },
    include: {
      _count: { select: { keywordTransactions: true } },
    },
  });
}

export async function createKeyword(userId: string, data: z.infer<typeof createKeywordSchema>) {
  return prisma.keyword.create({ data: { ...data, userId } });
}

export async function updateKeyword(userId: string, id: string, data: Partial<z.infer<typeof createKeywordSchema>>) {
  const existing = await prisma.keyword.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Keyword not found');
  return prisma.keyword.update({ where: { id }, data });
}

export async function deleteKeyword(userId: string, id: string) {
  const existing = await prisma.keyword.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Keyword not found');
  
  // Remove associations but keep historical transactions
  await prisma.keywordTransaction.deleteMany({ where: { keywordId: id } });
  return prisma.keyword.delete({ where: { id } });
}
```

- [ ] **Step 2: Write category and keyword API routes**

Create `src/app/api/categories/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/lib/categories';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  if (!accessToken) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }
  const decoded = verifyToken(accessToken);
  if (!decoded) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_TOKEN' } }, { status: 401 });
  }
  const categories = await getCategories(decoded.userId);
  return NextResponse.json({ success: true, data: categories });
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  if (!accessToken) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }
  const decoded = verifyToken(accessToken);
  if (!decoded) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_TOKEN' } }, { status: 401 });
  }
  const body = await request.json();
  const category = await createCategory(decoded.userId, body);
  return NextResponse.json({ success: true, data: category }, { status: 201 });
}
```

Create `src/app/api/categories/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { updateCategory, deleteCategory } from '@/lib/categories';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const accessToken = request.cookies.get('accessToken')?.value;
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const decoded = verifyToken(accessToken);
  if (!decoded) return NextResponse.json({ success: false, error: { code: 'INVALID_TOKEN' } }, { status: 401 });
  try {
    const body = await request.json();
    const category = await updateCategory(decoded.userId, params.id, body);
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    if (error instanceof Error && error.message === 'CATEGORY_HAS_TRANSACTIONS') {
      return NextResponse.json({ success: false, error: { code: 'CATEGORY_HAS_TRANSACTIONS', message: '该分类下有交易记录，无法删除' } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const accessToken = request.cookies.get('accessToken')?.value;
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const decoded = verifyToken(accessToken);
  if (!decoded) return NextResponse.json({ success: false, error: { code: 'INVALID_TOKEN' } }, { status: 401 });
  try {
    await deleteCategory(decoded.userId, params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'CATEGORY_HAS_TRANSACTIONS') {
      return NextResponse.json({ success: false, error: { code: 'CATEGORY_HAS_TRANSACTIONS', message: '该分类下有交易记录，无法删除' } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
```

Create `src/app/api/keywords/route.ts` and `src/app/api/keywords/[id]/route.ts` with similar patterns.

- [ ] **Step 3: Write category and keyword pages**

Create `src/app/(app)/categories/page.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string | null;
  color: string | null;
  sortOrder: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense', icon: '📝', color: '#6B7280' });

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(result => {
      if (result.success) setCategories(result.data);
    });
  }, []);

  const handleCreate = async () => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategory),
    });
    const result = await res.json();
    if (result.success) {
      setCategories(prev => [...prev, result.data]);
      setNewCategory({ name: '', type: 'expense', icon: '📝', color: '#6B7280' });
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      setCategories(prev => prev.filter(c => c.id !== id));
    } else if (result.error?.code === 'CATEGORY_HAS_TRANSACTIONS') {
      alert('该分类下有交易记录，无法删除');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">类别管理</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-medium mb-4">新增类别</h2>
        <div className="space-y-4">
          <input type="text" placeholder="类别名称" value={newCategory.name} onChange={e => setNewCategory(f => ({ ...f, name: e.target.value }))} className="w-full rounded-md border-gray-300" />
          <select value={newCategory.type} onChange={e => setNewCategory(f => ({ ...f, type: e.target.value }))} className="w-full rounded-md border-gray-300">
            <option value="expense">支出</option>
            <option value="income">收入</option>
          </select>
          <div className="flex gap-2">
            <input type="text" value={newCategory.icon} onChange={e => setNewCategory(f => ({ ...f, icon: e.target.value }))} className="w-20 rounded-md border-gray-300" placeholder="图标" />
            <input type="color" value={newCategory.color || '#6B7280'} onChange={e => setNewCategory(f => ({ ...f, color: e.target.value }))} className="w-16 h-10 rounded" />
          </div>
          <button onClick={handleCreate} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">添加</button>
        </div>
      </div>

      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{cat.icon || '📝'}</span>
              <div>
                <p className="font-medium">{cat.name}</p>
                <p className="text-sm text-gray-500 capitalize">{cat.type}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800 text-sm">删除</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Create similar page for keywords at `src/app/(app)/keywords/page.tsx`.

- [ ] **Step 4: Write tests and commit**

Create `__tests__/categories.test.ts` and `__tests__/keywords.test.ts` following similar patterns.

```bash
git add -A
git commit -m "feat: implement category and keyword management"
```

---

## Task 6: Reports Module

**Files:**
- Create: `src/lib/reports.ts`
- Create: `src/app/api/reports/monthly/route.ts`
- Create: `src/app/api/reports/annual/route.ts`
- Create: `src/app/api/reports/custom/route.ts`
- Create: `src/app/api/reports/category-expense/route.ts`
- Create: `src/app/api/reports/category-income/route.ts`
- Create: `src/app/(app)/reports/page.tsx`
- Create: `__tests__/reports.test.ts`

**Interfaces:**
- Consumes: Prisma client, transaction data
- Produces: Monthly, annual, custom period reports with charts data

- [ ] **Step 1: Write reports service**

Create `src/lib/reports.ts`:
```typescript
import { prisma } from './prisma';

export interface DateRange {
  from: string;
  to: string;
}

export async function getMonthlyReport(userId: string, year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: 'income', date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'expense', date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
  ]);

  const incomeTotal = income._sum.amount || 0;
  const expenseTotal = expense._sum.amount || 0;

  // Category breakdown
  const [incomeByCategory, expenseByCategory] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'income', date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'expense', date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
  ]);

  return {
    income: incomeTotal,
    expense: expenseTotal,
    balance: incomeTotal - expenseTotal,
    incomeByCategory: incomeByCategory.map(item => ({
      categoryId: item.categoryId,
      amount: item._sum.amount || 0,
    })),
    expenseByCategory: expenseByCategory.map(item => ({
      categoryId: item.categoryId,
      amount: item._sum.amount || 0,
    })),
  };
}

export async function getAnnualReport(userId: string, year: number) {
  const months = [];
  for (let m = 1; m <= 12; m++) {
    const monthly = await getMonthlyReport(userId, year, m);
    months.push({ month: m, ...monthly });
  }

  const totalIncome = months.reduce((sum, m) => sum + m.income, 0);
  const totalExpense = months.reduce((sum, m) => sum + m.expense, 0);

  return {
    months,
    totalIncome,
    totalExpense,
    totalBalance: totalIncome - totalExpense,
  };
}

export async function getCustomReport(userId: string, from: string, to: string) {
  const startDate = new Date(from);
  const endDate = new Date(to);
  endDate.setHours(23, 59, 59, 999);

  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: 'income', date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'expense', date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
  ]);

  const incomeByCategory = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId, type: 'income', date: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
  });

  const expenseByCategory = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId, type: 'expense', date: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
  });

  return {
    income: income._sum.amount || 0,
    expense: expense._sum.amount || 0,
    balance: (income._sum.amount || 0) - (expense._sum.amount || 0),
    incomeByCategory: incomeByCategory.map(item => ({ categoryId: item.categoryId, amount: item._sum.amount || 0 })),
    expenseByCategory: expenseByCategory.map(item => ({ categoryId: item.categoryId, amount: item._sum.amount || 0 })),
  };
}

export async function getAccountBalanceHistory(userId: string, accountId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      OR: [{ accountId }, { toAccountId: accountId }],
      date: { gte: startDate },
    },
    orderBy: { date: 'asc' },
    select: { date: true, type: true, amount: true },
  });

  // Calculate running balance
  let balance = 0;
  const history = transactions.map(tx => {
    if (tx.type === 'income' || (tx.type === 'transfer' && tx.accountId === accountId)) {
      balance += tx.amount;
    } else if (tx.type === 'expense' || (tx.type === 'transfer' && tx.toAccountId === accountId)) {
      balance -= tx.amount;
    }
    return { date: tx.date.toISOString().split('T')[0], balance };
  });

  return history;
}
```

- [ ] **Step 2: Write report API routes**

Create `src/app/api/reports/monthly/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyReport } from '@/lib/reports';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  if (!accessToken) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }
  const decoded = verifyToken(accessToken);
  if (!decoded) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_TOKEN' } }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

  const report = await getMonthlyReport(decoded.userId, year, month);
  return NextResponse.json({ success: true, data: report });
}
```

Create similar routes for annual, custom, category-expense, category-income.

- [ ] **Step 3: Write reports page with charts**

Create `src/app/(app)/reports/page.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface MonthlyReport {
  income: number;
  expense: number;
  balance: number;
  incomeByCategory: Array<{ categoryId: string; amount: number }>;
  expenseByCategory: Array<{ categoryId: string; amount: number }>;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ReportsPage() {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [year, month]);

  const loadReport = async () => {
    setLoading(true);
    const res = await fetch(`/api/reports/monthly?year=${year}&month=${month}`);
    const result = await res.json();
    if (result.success) setReport(result.data);
    setLoading(false);
  };

  if (loading) return <div className="p-6 text-center">加载中...</div>;
  if (!report) return <div className="p-6 text-center">暂无数据</div>;

  const expenseData = report.expenseByCategory.map(item => ({
    name: item.categoryId,
    value: item.amount,
  }));

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">报表统计</h1>

      <div className="flex gap-4 mb-6">
        <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="rounded-md border-gray-300">
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
            <option key={y} value={y}>{y}年</option>
          ))}
        </select>
        <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="rounded-md border-gray-300">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{m}月</option>
          ))}
        </select>
        <button onClick={loadReport} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">查询</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">本月收入</p>
          <p className="text-2xl font-bold text-green-600">¥{report.income.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">本月支出</p>
          <p className="text-2xl font-bold text-red-600">¥{report.expense.toFixed(2)}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">本月结余</p>
          <p className={`text-2xl font-bold ${report.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>¥{report.balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-4">支出占比</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={expenseData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-4">收入 vs 支出</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: '收入', value: report.income },
              { name: '支出', value: report.expense },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10B981" name="收入" />
              <Bar dataKey="value" fill="#EF4444" name="支出" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write report tests and commit**

```bash
git add -A
git commit -m "feat: implement reports module with charts and exports"
```

---

## Task 7: Layout & Navigation

**Files:**
- Create: `src/app/(app)/layout.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: Auth context, navigation
- Produces: App layout with sidebar navigation

- [ ] **Step 1: Write app layout**

Create `src/app/(app)/layout.tsx`:
```typescript
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

Create `src/components/layout/Sidebar.tsx`:
```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/transactions', label: '记账明细', icon: '💰' },
  { href: '/accounts', label: '账户管理', icon: '🏦' },
  { href: '/reports', label: '报表统计', icon: '📊' },
  { href: '/categories', label: '类别管理', icon: '🏷️' },
  { href: '/keywords', label: '关键字管理', icon: '🔖' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-indigo-600">Licai Buddy</h1>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg ${pathname === item.href ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
```

Create `src/components/layout/Navbar.tsx` with user info and logout.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: implement app layout with sidebar navigation"
```

---

## Task 8: Integration Tests & Final Verification

- [ ] **Step 1: Write E2E tests**

Create `e2e/auth.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h2')).toContainText('Licai Buddy');
  });

  test('should register with valid invite code', async ({ page }) => {
    await page.goto('/register');
    await page.locator('input[name="email"]').fill('newuser@test.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('input[name="confirmPassword"]').fill('password123');
    await page.locator('input[name="inviteCode"]').fill('ABCD1234');
    await page.locator('input[name="name"]').fill('New User');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL('/');
  });
});
```

- [ ] **Step 2: Run all tests**

```bash
npx jest --coverage
npx playwright test
```

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: add integration tests and final verification"
```

---

## Execution Options

**Plan complete. Two execution options:**

**1. Subagent-Driven (recommended)** - Dispatch fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
