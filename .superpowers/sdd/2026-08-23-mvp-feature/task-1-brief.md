# Task 1 Brief: Project Initialization

## Context
Task 1 of 8 for Licai Buddy MVP. This is the project setup task.

## Your Requirements

You are a developer agent working on the Licai Buddy project. The project location is:
`C:/Users/Administrator/Documents/Licai-Buddy`

Execute ALL steps below:

### Step 1: Initialize Next.js project
Run in the project directory:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```
Note: The project name "Licai-Buddy" has uppercase letters which npm doesn't allow. Use lowercase "licai-buddy" instead.

### Step 2: Install dependencies
```bash
npm install prisma @prisma/client bcryptjs jsonwebtoken zod react-hook-form @hookform/resolvers recharts clsx tailwind-merge next-auth
npm install -D @types/bcryptjs @types/jsonwebtoken jest ts-jest @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test eslint-config-prettier prettier @types/node
npx prisma init
```

### Step 3: Write Prisma schema
Create `prisma/schema.prisma` with this exact content:

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
  categoryId         String?
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
  toAccountId        String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  account         Account         @relation(fields: [accountId], references: [id], onDelete: Cascade)
  category        Category?       @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  parentTransaction Transaction?  @relation("RepeatingTransactions", fields: [parentTransactionId], references: [id], onDelete: SetNull)
  repeatingTransactions Transaction[] @relation("RepeatingTransactions")
  keywordTransactions KeywordTransaction[]

  @@index([userId])
  @@index([userId, accountId])
  @@index([userId, date])
  @@index([userId, categoryId])
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

### Step 4: Create Prisma client
Create `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Step 5: Create environment config
Create `.env.example`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret-change-in-production"
```

### Step 6: Push schema to database
```bash
npx prisma db push
```

### Step 7: Create root layout and page
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

### Step 8: Run tests to verify setup
```bash
npx jest --passWithNoTests
```

### Step 9: Commit
```bash
git add -A
git commit -m "chore: initialize project with Next.js, Prisma, and SQLite schema"
```

## Global Constraints
- Next.js 14 with App Router
- TypeScript 5.x
- Tailwind CSS 3.x
- Prisma ORM + SQLite
- JWT auth with bcrypt
- Zod for validation

## Success Criteria
- Next.js project scaffolded
- Prisma schema matches all models defined above
- Database migrations applied successfully
- All files created as specified
- Jest runs without errors
- Git commit successful
