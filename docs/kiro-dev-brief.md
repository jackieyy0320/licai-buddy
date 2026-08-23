# Licai Buddy - Kiro 开发需求文档

> **文档版本：** v2.0  
> **创建日期：** 2026-08-19  
> **更新说明：** 增加强制验收标准、执行规范

---

## 一、开发概述

### 1.1 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Next.js | 14.x | React SSR/SSG 框架 |
| 语言 | TypeScript | 5.x | 类型安全 |
| 样式 | Tailwind CSS | 3.x | 原子化 CSS |
| UI 组件 | shadcn/ui | latest | 基于 Radix UI |
| 数据库 | SQLite | - | 本地文件存储 |
| ORM | Prisma | 5.x | 类型安全 ORM |
| 状态管理 | React Context | - | 轻量状态管理 |
| 表单 | React Hook Form | 7.x | 表单处理 |
| 验证 | Zod | latest | Schema 验证 |
| 图表 | Recharts | latest | 数据可视化 |
| 测试 | Jest + Playwright | - | 单元测试 + E2E |

### 1.2 项目结构

```
Licai-Buddy/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # 根布局
│   │   ├── page.tsx                 # 首页
│   │   ├── transactions/            # 记账模块
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   ├── accounts/                # 账户模块
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   ├── inventory/               # 库存模块
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   ├── investments/             # 投资模块
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   ├── reports/                 # 报表模块
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   └── globals.css             # 全局样式
│   ├── components/                   # 通用组件
│   │   ├── ui/                      # shadcn/ui 组件
│   │   ├── layout/                  # 布局组件
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── transactions/           # 记账组件
│   │   │   ├── TransactionForm.tsx
│   │   │   └── TransactionList.tsx
│   │   ├── accounts/               # 账户组件
│   │   │   ├── AccountForm.tsx
│   │   │   └── AccountList.tsx
│   │   ├── inventory/              # 库存组件
│   │   │   ├── InventoryForm.tsx
│   │   │   └── InventoryList.tsx
│   │   └── reports/                # 报表组件
│   │       ├── MonthlyChart.tsx
│   │       └── CategoryChart.tsx
│   ├── lib/                         # 工具
│   │   ├── prisma.ts               # Prisma 客户端
│   │   └── utils.ts                # 工具函数
│   ├── types/                       # TypeScript 类型
│   │   ├── transaction.ts
│   │   ├── account.ts
│   │   ├── inventory.ts
│   │   └── investment.ts
│   └── hooks/                       # 自定义 Hooks
│       ├── useTransactions.ts
│       ├── useAccounts.ts
│       └── useInventory.ts
├── prisma/
│   └── schema.prisma               # 数据库 Schema
├── __tests__/                      # 单元测试
├── e2e/                           # 端到端测试
└── public/                         # 静态资源
```

---

## 二、数据库设计

### 2.1 Schema 文件

**文件路径：** `prisma/schema.prisma`

**完整 Schema 内容：**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// 用户
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String   // bcrypt 加密
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  accounts      Account[]
  transactions  Transaction[]
  inventories   Inventory[]
  investments   Investment[]
  categories    Category[]
}

// 账户
model Account {
  id        String   @id @default(uuid())
  userId    String
  name      String
  type      String   // cash, bank, credit, investment
  balance   Float    @default(0)
  icon      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@index([userId])
}

// 分类
model Category {
  id        String   @id @default(uuid())
  userId    String
  name      String
  type      String   // income, expense
  icon      String
  color     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@index([userId])
}

// 交易
model Transaction {
  id        String   @id @default(uuid())
  userId    String
  accountId String
  categoryId String
  type      String   // income, expense, transfer
  amount    Float
  date      DateTime
  note      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  account   Account   @relation(fields: [accountId], references: [id], onDelete: Cascade)
  category  Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([accountId])
  @@index([date])
}

// 库存商品
model Inventory {
  id            String   @id @default(uuid())
  userId        String
  name          String
  quantity      Int      @default(0)
  price         Float
  purchaseDate  DateTime
  expiryDate    DateTime?
  category      String?
  note          String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

// 投资产品
model Investment {
  id             String   @id @default(uuid())
  userId         String
  name           String
  type           String   // fund, stock, bank, crypto, other
  principal      Float
  currentValue   Float
  purchaseDate   DateTime
  note           String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  records        InvestmentRecord[]

  @@index([userId])
}

// 投资收益记录
model InvestmentRecord {
  id           String   @id @default(uuid())
  investmentId String
  userId       String
  type         String   // profit, loss, dividend
  amount       Float
  date         DateTime
  note         String?
  createdAt    DateTime @default(now())

  investment   Investment @relation(fields: [investmentId], references: [id], onDelete: Cascade)
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([investmentId])
  @@index([userId])
}
```

### 2.2 表关系说明

```
User (1) ──→ (N) Account
User (1) ──→ (N) Category
User (1) ──→ (N) Transaction
User (1) ──→ (N) Inventory
User (1) ──→ (N) Investment
Investment (1) ──→ (N) InvestmentRecord
Transaction (N) ──→ (1) Account
Transaction (N) ──→ (1) Category
```

---

## 三、API 设计规范（强制）

### 3.1 统一响应格式

```typescript
// 成功响应
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// 错误响应
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: string[];
  };
}

// 分页响应
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

### 3.2 记账模块 API

#### GET /api/transactions

**功能：** 获取交易列表

**请求参数：**
```typescript
interface TransactionListParams {
  page?: number;           // 默认 1
  limit?: number;          // 默认 20
  dateFrom?: string;       // YYYY-MM-DD
  dateTo?: string;         // YYYY-MM-DD
  categoryId?: string;     // 分类 ID
  accountId?: string;      // 账户 ID
  type?: 'income' | 'expense' | 'transfer';
  search?: string;         // 搜索备注
}
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "expense",
      "amount": 50.00,
      "date": "2026-08-19",
      "note": "午餐",
      "account": { "id": "uuid", "name": "现金", "type": "cash" },
      "category": { "id": "uuid", "name": "餐饮", "icon": "🍜" }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 100, "pages": 5 }
}
```

#### POST /api/transactions

**功能：** 创建交易

**请求体：**
```typescript
interface CreateTransactionInput {
  type: 'income' | 'expense' | 'transfer';
  amount: number;        // 必须 > 0
  date: string;          // YYYY-MM-DD
  note?: string;         // 可选，最长 200 字符
  accountId: string;     // 账户 ID
  categoryId?: string;   // 分类 ID（转账时不需要）
  toAccountId?: string;  // 转账时目标账户
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "expense",
    "amount": 50.00,
    "date": "2026-08-19",
    "note": "午餐",
    "accountId": "uuid",
    "categoryId": "uuid",
    "createdAt": "2026-08-19T10:00:00Z"
  }
}
```

**错误响应：**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "金额必须大于 0",
    "fields": ["amount"]
  }
}
```

#### PUT /api/transactions/[id]

**功能：** 更新交易

**请求体：**
```typescript
interface UpdateTransactionInput {
  amount?: number;
  date?: string;
  note?: string;
  accountId?: string;
  categoryId?: string;
}
```

#### DELETE /api/transactions/[id]

**功能：** 删除交易

**响应：**
```json
{ "success": true }
```

### 3.3 账户模块 API

#### GET /api/accounts

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "现金",
      "type": "cash",
      "balance": 1000.00,
      "icon": "💵"
    }
  ]
}
```

#### POST /api/accounts

**请求体：**
```typescript
interface CreateAccountInput {
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'investment';
  balance?: number;      // 默认 0
  icon?: string;
}
```

#### POST /api/accounts/[id]/transfer

**功能：** 账户间转账

**请求体：**
```typescript
interface TransferInput {
  toAccountId: string;
  amount: number;        // 必须 > 0
  note?: string;
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "fromBalance": 900.00,
    "toBalance": 1100.00,
    "transaction": { ... }
  }
}
```

**余额不足时返回：**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "余额不足",
    "fields": ["amount"]
  }
}
```

### 3.4 库存模块 API

#### GET /api/inventory

**请求参数：**
```typescript
interface InventoryListParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  includeExpired?: boolean;  // 默认 false
}
```

#### POST /api/inventory

**请求体：**
```typescript
interface CreateInventoryInput {
  name: string;
  quantity: number;      // 默认 1
  price: number;
  purchaseDate?: string; // 默认今天
  expiryDate?: string;
  category?: string;
  note?: string;
}
```

#### POST /api/inventory/[id]/consume

**功能：** 消耗商品

**请求体：**
```typescript
interface ConsumeInput {
  quantity: number;      // 必须 > 0，且 <= 当前数量
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "newQuantity": 7,
    "previousQuantity": 10
  }
}
```

### 3.5 投资模块 API

#### GET /api/investments

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "XX 基金",
      "type": "fund",
      "principal": 10000.00,
      "currentValue": 11000.00,
      "profit": 1000.00,
      "profitRate": 0.10,
      "purchaseDate": "2026-01-01"
    }
  ]
}
```

#### POST /api/investments/[id]/record

**功能：** 记录收益

**请求体：**
```typescript
interface RecordInvestmentInput {
  type: 'profit' | 'loss' | 'dividend';
  amount: number;
  date?: string;
  note?: string;
}
```

---

## 四、强制验收标准

### 4.1 记账模块验收标准（10 项）

| 序号 | 验收项 | 通过标准 | 测试要求 |
|------|--------|----------|----------|
| 1 | 添加支出 | 成功返回 201，余额正确减少 | 正常流程 + 边界测试 |
| 2 | 添加收入 | 成功返回 201，余额正确增加 | 正常流程 + 边界测试 |
| 3 | 添加转账 | 转出账户减少，转入账户增加 | 正常流程 + 余额不足测试 |
| 4 | 列表查询 | 按时间倒序，支持分页 | 接口测试 |
| 5 | 筛选功能 | 按日期/类别/账户筛选正确 | 多条件组合测试 |
| 6 | 编辑记录 | 更新后数据正确 | 正常流程 + 空值测试 |
| 7 | 删除记录 | 删除后不再显示，余额不变 | 正常流程 + 重复删除测试 |
| 8 | 金额校验 | 金额为 0 或负数时返回 400 | 异常测试 |
| 9 | 必填项校验 | 金额/类别/账户为空时返回 400 | 异常测试 |
| 10 | 单元测试覆盖 | 核心逻辑覆盖率 > 80% | 覆盖率报告 |

### 4.2 账户模块验收标准（6 项）

| 序号 | 验收项 | 通过标准 | 测试要求 |
|------|--------|----------|----------|
| 1 | 添加账户 | 成功返回 201，初始余额正确 | 正常流程 + 边界测试 |
| 2 | 账户列表 | 显示所有账户及余额 | 接口测试 |
| 3 | 转账功能 | 转出减少，转入增加，生成流水 | 正常流程测试 |
| 4 | 余额不足 | 余额不足时转账失败，返回 400 | 异常测试 |
| 5 | 删除账户 | 余额为 0 才能删除 | 边界测试 |
| 6 | 单元测试覆盖 | 核心逻辑覆盖率 > 80% | 覆盖率报告 |

### 4.3 库存模块验收标准（6 项）

| 序号 | 验收项 | 通过标准 | 测试要求 |
|------|--------|----------|----------|
| 1 | 添加商品 | 成功返回 201，数量正确 | 正常流程 + 边界测试 |
| 2 | 商品列表 | 显示所有商品，包含数量、价格、到期状态 | 接口测试 |
| 3 | 消耗商品 | 数量正确减少，生成消耗记录 | 正常流程 + 数量不足测试 |
| 4 | 补充库存 | 数量正确增加 | 正常流程测试 |
| 5 | 到期提醒 | 即将过期的商品标记提醒 | 接口测试 |
| 6 | 单元测试覆盖 | 核心逻辑覆盖率 > 80% | 覆盖率报告 |

### 4.4 投资模块验收标准（6 项）

| 序号 | 验收项 | 通过标准 | 测试要求 |
|------|--------|----------|----------|
| 1 | 添加投资 | 成功返回 201，本金正确 | 正常流程 + 边界测试 |
| 2 | 投资列表 | 显示所有产品，计算收益率 | 接口测试 |
| 3 | 收益率计算 | 收益率 = (当前价值-本金)/本金 | 计算逻辑测试 |
| 4 | 记录收益 | 收益记录正确保存 | 正常流程测试 |
| 5 | 修改价值 | 更新当前价值，重新计算收益率 | 正常流程测试 |
| 6 | 单元测试覆盖 | 核心逻辑覆盖率 > 80% | 覆盖率报告 |

### 4.5 报表模块验收标准（5 项）

| 序号 | 验收项 | 通过标准 | 测试要求 |
|------|--------|----------|----------|
| 1 | 月度收支 | 正确统计每月收入/支出/结余 | 接口测试 |
| 2 | 分类占比 | 正确计算各分类占比 | 接口测试 |
| 3 | 趋势图表 | 正确返回趋势数据 | 接口测试 |
| 4 | 数据导出 | 导出 CSV/Excel 格式正确 | 接口测试 |
| 5 | 单元测试覆盖 | 核心逻辑覆盖率 > 80% | 覆盖率报告 |

---

## 五、开发任务清单

### 5.1 项目初始化

- [ ] 初始化 Next.js 14 项目
- [ ] 配置 TypeScript + Tailwind CSS
- [ ] 配置 Prisma + SQLite
- [ ] 配置 shadcn/ui 组件库
- [ ] 配置 ESLint + Prettier
- [ ] 创建项目目录结构
- [ ] 编写基础布局组件
- [ ] 编写导航栏组件
- [ ] **验收：** 项目构建成功，无报错

### 5.2 记账模块

**任务：**
- [ ] 编写数据库 Schema
- [ ] 执行数据库迁移
- [ ] 编写 Prisma 客户端
- [ ] 编写记账 API（CRUD）
- [ ] 编写记账页面
- [ ] 编写交易列表组件
- [ ] 编写添加交易表单
- [ ] 编写交易筛选功能
- [ ] 编写单元测试
- [ ] 编写集成测试

**验收：** 10 项验收标准全部通过

### 5.3 账户模块

**任务：**
- [ ] 编写账户 API
- [ ] 编写账户管理页面
- [ ] 编写账户列表组件
- [ ] 编写添加账户表单
- [ ] 编写转账功能
- [ ] 编写余额计算逻辑
- [ ] 编写单元测试
- [ ] 编写集成测试

**验收：** 6 项验收标准全部通过

### 5.4 库存模块

**任务：**
- [ ] 编写库存 API
- [ ] 编写库存管理页面
- [ ] 编写商品列表组件
- [ ] 编写添加商品表单
- [ ] 编写消耗/补充库存功能
- [ ] 编写到期提醒逻辑
- [ ] 编写单元测试
- [ ] 编写集成测试

**验收：** 6 项验收标准全部通过

### 5.5 投资模块

**任务：**
- [ ] 编写投资 API
- [ ] 编写投资管理页面
- [ ] 编写投资列表组件
- [ ] 编写添加投资表单
- [ ] 编写收益记录功能
- [ ] 编写收益率计算逻辑
- [ ] 编写单元测试
- [ ] 编写集成测试

**验收：** 6 项验收标准全部通过

### 5.6 报表模块

**任务：**
- [ ] 编写报表 API
- [ ] 编写报表页面
- [ ] 编写月度收支图表
- [ ] 编写分类支出饼图
- [ ] 编写趋势折线图
- [ ] 编写数据导出功能
- [ ] 编写单元测试
- [ ] 编写 E2E 测试

**验收：** 5 项验收标准全部通过

### 5.7 数据联动

**任务：**
- [ ] 编写消费→库存联动逻辑
- [ ] 编写库存→消费联动逻辑
- [ ] 编写投资→账户联动逻辑
- [ ] 编写价格追踪功能
- [ ] 编写关联报表
- [ ] 编写端到端测试
- [ ] 性能优化

**验收：** 功能验证通过

---

## 六、代码规范

### 6.1 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件 | kebab-case | `transaction-form.tsx` |
| 组件 | PascalCase | `TransactionForm` |
| 函数 | camelCase | `handleSubmit` |
| 常量 | UPPER_SNAKE_CASE | `MAX_AMOUNT` |
| 类型 | PascalCase | `TransactionType` |
| 接口 | PascalCase | `TransactionInput` |
| 数据库字段 | snake_case | `created_at` |

### 6.2 注释规范

```typescript
// 单行注释：解释复杂逻辑
// 多行注释：说明函数用途

/**
 * 添加交易记录
 * @param data 交易数据
 * @returns 创建的交易记录
 */
async function createTransaction(data: TransactionInput) {
  // 实现逻辑
}
```

### 6.3 错误处理

```typescript
try {
  // 业务逻辑
} catch (error) {
  console.error('操作失败:', error);
  // 返回结构化错误响应
  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || '操作失败',
      }
    },
    { status: error.status || 500 }
  );
}
```

### 6.4 数据验证

```typescript
import { z } from 'zod';

// 所有输入必须使用 Zod Schema 验证
const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().positive('金额必须大于 0'),
  date: z.string().date('日期格式错误'),
  note: z.string().max(200).optional(),
  accountId: z.string().uuid('账户 ID 格式错误'),
  categoryId: z.string().uuid('分类 ID 格式错误'),
});

// 验证输入
const parsed = createTransactionSchema.safeParse(req.body);
if (!parsed.success) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0].message,
        fields: parsed.error.issues.map(i => i.path[0]),
      }
    },
    { status: 400 }
  );
}
```

---

## 七、测试要求

### 7.1 测试覆盖率目标

| 模块 | 最低覆盖率 | 目标覆盖率 |
|------|-----------|-----------|
| 记账模块 | 70% | 85% |
| 账户模块 | 70% | 85% |
| 库存模块 | 60% | 80% |
| 投资模块 | 60% | 80% |
| 报表模块 | 50% | 75% |
| **整体** | **60%** | **80%** |

### 7.2 测试用例要求

**每个功能必须包含以下测试类型：**

| 测试类型 | 数量 | 内容 |
|----------|------|------|
| 正常流程 | 1-2 个 | 验证功能正常执行 |
| 边界测试 | 1 个 | 验证边界条件 |
| 异常测试 | 1 个 | 验证错误处理 |
| 空值测试 | 1 个 | 验证空数据处理 |

### 7.3 测试文件结构

```
__tests__/
├── unit/
│   ├── TransactionForm.test.tsx
│   ├── TransactionList.test.tsx
│   ├── AccountForm.test.tsx
│   └── ...
├── integration/
│   ├── api/
│   │   ├── transactions.test.ts
│   │   ├── accounts.test.ts
│   │   └── ...
│   └── database/
│       └── ...
└── e2e/
    ├── transactions.spec.ts
    ├── accounts.spec.ts
    └── ...
```

---

## 八、禁止行为

### 8.1 技术栈禁止

```
❌ 不得擅自更换框架（如改用 Vue、Angular）
❌ 不得擅自更换数据库（如改用 MySQL、PostgreSQL）
❌ 不得擅自更换 ORM（如改用 TypeORM、Mongoose）
❌ 不得擅自添加未授权的第三方库
```

### 8.2 功能禁止

```
❌ 不得擅自添加新功能（如用户系统、支付系统）
❌ 不得擅自修改 API 接口设计
❌ 不得擅自修改数据库 Schema
❌ 不得擅自跳过测试直接提交
```

### 8.3 流程禁止

```
❌ 不得跳过 Review 直接标记完成
❌ 不得伪造测试覆盖率报告
❌ 不得忽略错误直接返回成功
```

---

## 九、变更控制

### 9.1 需要审批的变更

```
以下变更必须经 Hermes 批准：
- 技术栈变更
- API 接口变更
- 数据库 Schema 变更
- 新增依赖包
- 修改核心业务逻辑
```

### 9.2 变更申请流程

```
1. Kiro 提交变更申请（说明原因）
2. Hermes 评估影响
3. Hermes 向 Jackie 汇报风险
4. Jackie 决策是否批准
5. 批准后更新文档，Kiro 执行变更
```

---

## 十、交付清单

### 10.1 代码交付

- [ ] 完整源代码
- [ ] 数据库迁移文件
- [ ] 环境配置文件（.env.example）
- [ ] 依赖清单（package.json）

### 10.2 测试交付

- [ ] 单元测试代码
- [ ] 集成测试代码
- [ ] E2E 测试代码
- [ ] 测试覆盖率报告

### 10.3 文档交付

- [ ] API 文档（Postman/Swagger）
- [ ] 部署文档
- [ ] 变更日志
- [ ] 测试报告

---

*文档版本：v2.0*
*创建日期：2026-08-19*
