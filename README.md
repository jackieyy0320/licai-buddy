# Licai Buddy

> 多用户记账工具，消费→库存→投资数据联动

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748)](https://www.prisma.io/)

---

## 🎯 项目定位

**一句话描述：** 一体化工具记账，让每一笔消费关联到资产与收益

**核心价值：** 消费 → 库存 → 投资 数据联动

**目标用户：** 25-40岁，有记账+理财需求，注重隐私的个人用户

---

## ✨ 核心功能

### MVP 功能（P0）

| 功能 | 描述 |
|------|------|
| 🔐 用户认证 | 邀请码注册、邮箱登录、JWT认证 |
| 💰 记账明细 | 统一记账入口、筛选搜索、重复记账 |
| 📊 账户管理 | 多账户、动态余额、信用卡专属 |
| 📈 报表统计 | 月度/年度报表、分类图表、数据导出 |

### 后续迭代（P1/P2）

- 购物库存管理
- 理财收益追踪
- 数据联动（消费→库存→投资）
- 价格趋势分析

---

## 🛠️ 技术栈

```
前端框架：Next.js 14 (App Router)
语言：TypeScript 5.x
样式：Tailwind CSS 3.x + shadcn/ui
数据库：SQLite + Prisma 5.x
认证：JWT + bcryptjs
图表：Recharts
表单：React Hook Form + Zod
测试：Jest + Playwright
```

---

## 📁 文档结构

```
docs/
├── prd.md                  # 产品需求文档（v5.0）
├── architecture.md         # 技术架构设计
├── design-spec.md          # UI设计规范
├── test-plan.md            # 测试计划
├── deployment.md           # 部署指南
├── plans/                  # 项目计划
│   └── mvp-feature.md     # MVP实施计划
└── tasks/                  # 任务Brief（运行时）
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/jackieyy0320/licai-buddy.git
cd licai-buddy

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填写实际值

# 4. 初始化数据库
npx prisma db push
npx prisma generate

# 5. 启动开发服务器
npm run dev
```

### 访问地址

- 开发环境：http://localhost:3000
- GitHub：https://github.com/jackieyy0320/licai-buddy

---

## 📋 项目管理

| 角色 | 负责人 | 职责 |
|------|--------|------|
| 产品负责人 | Jackie | 需求确认、验收反馈 |
| 项目经理 | Hermes (Louis) | 需求管理、UI设计、进度跟踪 |
| 开发者 | Qoder | 代码实现、测试编写 |

---

## 🗺️ 路线图

### Phase 1: MVP（当前）
- [x] 项目初始化
- [ ] UI组件库搭建
- [ ] 认证模块
- [ ] 记账模块
- [ ] 账户模块
- [ ] 报表模块

### Phase 2: 库存管理
- [ ] 商品入库登记
- [ ] 数量管理
- [ ] 库存预警

### Phase 3: 理财收益
- [ ] 投资产品管理
- [ ] 收益记录
- [ ] 收益率计算

### Phase 4: 数据联动
- [ ] 消费→库存联动
- [ ] 库存→投资联动
- [ ] 价格趋势分析

---

## 🔒 安全特性

- 本地 SQLite 存储，数据完全私有
- bcrypt 密码加密（salt rounds ≥ 10）
- JWT Token 认证（Access 24h / Refresh 7d）
- 登录失败锁定机制（5次失败锁定15分钟）

---

## 📄 License

MIT License - 自由使用、修改、分发

---

## 🤝 贡献

欢迎 Issue 和 Pull Request！

---

*最后更新：2026-08-25*
*版本：v0.1.0-mvp*
