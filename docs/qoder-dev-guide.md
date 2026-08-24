# Qoder 开发者指南

> **适用工具：** Qoder CN IDE  
> **更新日期：** 2026-08-24  
> **项目：** Licai Buddy

---

## 一、Qoder 简介

**Qoder** 是阿里巴巴推出的 AI 编程平台，提供：
- Qoder IDE（桌面编辑器）
- Qoder CLI（命令行工具）
- JetBrains Plugin
- Cloud Agents（云端AI代理）

**官网：** https://www.qoder.com/zh  
**下载：** https://www.qoder.com/download

---

## 二、项目接入

### 2.1 克隆仓库

```bash
git clone https://github.com/jackieyy0320/licai-buddy.git
cd licai-buddy
```

### 2.2 安装依赖

```bash
npm install
```

### 2.3 配置环境变量

复制 `.env.example` 为 `.env`：
```bash
cp .env.example .env
```

编辑 `.env` 填写实际值：
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret"
```

### 2.4 初始化数据库

```bash
npx prisma db push
npx prisma generate
```

---

## 三、开发工作流

### 3.1 使用 Qoder IDE

1. 打开 Qoder IDE
2. 文件 → 打开文件夹 → 选择 `licai-buddy`
3. 终端 → 新终端 → 运行开发服务器：
   ```bash
   npm run dev
   ```
4. 访问 http://localhost:3000 预览

### 3.2 使用 Qoder CLI

```bash
# 开发模式
qoder run "implement authentication module"

# 执行任务
qoder exec "write login page"
```

### 3.3 分支管理

```bash
# 创建任务分支
git checkout -b task/2-authentication

# 完成后提交
git add .
git commit -m "feat: implement authentication module"
git push origin task/2-authentication

# 合并到主分支
git checkout master
git merge task/2-authentication
git push origin master
```

---

## 四、任务执行规范

### 4.1 任务来源

每个 Task 的 brief 文件位于：
```
.superpowers/sdd/2026-08-23-mvp-feature/task-N-brief.md
```

### 4.2 执行步骤

1. **读取 Brief**
   - 打开对应的 `task-N-brief.md`
   - 理解需求和验收标准

2. **规划实现**
   - 确定需要创建/修改的文件
   - 设计 API 接口和数据模型

3. **TDD 开发**
   - 先写测试（失败）
   - 再写实现（通过）
   - 重构优化

4. **提交代码**
   - 运行测试确保通过
   - Commit 信息遵循约定
   - Push 到对应分支

5. **通知评审**
   - 在 Issue 中回复完成情况
   - 提供预览链接（如有）

---

## 五、代码规范

### 5.1 文件结构

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证相关页面
│   ├── (dashboard)/       # Dashboard 页面
│   ├── api/               # API 路由
│   └── layout.tsx
├── components/
│   └── ui/                # UI 组件库
├── lib/
│   ├── prisma.ts          # Prisma 客户端
│   ├── auth.ts            # 认证工具
│   └── utils.ts           # 通用工具
├── types/                 # TypeScript 类型
└── hooks/                 # React Hooks
```

### 5.2 命名规范

- **组件：** PascalCase，如 `TransactionItem.tsx`
- **工具函数：** camelCase，如 `formatCurrency.ts`
- **类型/接口：** PascalCase，如 `Transaction.ts`
- **文件：** 小写+连字符，如 `login-page.tsx`

### 5.3 提交规范

```
feat: 新增功能
fix: 修复bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

---

## 六、验收标准

每个 Task 完成后必须满足：

- [ ] 所有测试通过（`npm test`）
- [ ] 代码符合规范（`npm run lint`）
- [ ] 无 TypeScript 错误
- [ ] 文档已更新
- [ ] 预览链接可访问

---

## 七、问题反馈

遇到问题时：
1. 在 GitHub Issue 中描述问题
2. 附上错误日志和截图
3. 等待 Hermes Agent 指导

---

*文档版本：v1.0*
*更新日期：2026-08-24*
