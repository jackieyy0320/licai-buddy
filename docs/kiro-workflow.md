# Licai Buddy 项目开发工作流

## 核心原则

**Hermes (Louis) = PM，Kiro = 开发**

| 角色 | 职责 |
|------|------|
| Hermes (Louis) | 写 PRD、制定计划、派发任务、审查结果 |
| Kiro | 写代码、写测试、自查、提交 |
| Figma | UI/UX 设计 |

## 工作流程

```
1. Hermes 写 PRD → docs/prd.md
2. Hermes 写开发 brief → docs/kiro-dev-brief.md  
3. Figma 设计师出设计稿
4. Hermes 派发 Kiro 子代理执行任务
5. Kiro 读 brief + 设计稿 → 实现代码 → 写测试 → 自查
6. Hermes 审查结果 → 通过/驳回
7. Kiro 修复问题 → 再次审查
```

## 任务 Brief 格式

每个任务 brief 必须包含：

```markdown
# Task N Brief: [任务名称]

## Context
[任务在项目中的位置]

## Your Requirements
[详细的步骤清单，包括所有代码文件路径和内容]

## Global Constraints
[技术栈、命名规范、禁止行为等]

## Interfaces Consumed
[前置任务产出的接口]

## Interfaces Produced
[本任务产出的接口]

## Report File
[报告文件路径]

## Success Criteria
[验收标准]
```

## 关键约束

### 写代码必须由 Kiro 执行
- Hermes 不做写代码的工作
- Hermes 只做 PM 工作：计划、派发、审查

### npm 项目名不能有大写字母
- `npx create-next-app` 会拒绝大写字母
- 使用小写项目名称如 `licai-buddy`

### Kiro 未安装时的替代方案
- 使用 Hermes 内置子代理作为临时替代
- 子代理需要具备相同的开发纪律（TDD、Ponytail 规则）

## 技术栈

- Next.js 14 + TypeScript
- Prisma + SQLite
- Tailwind CSS + shadcn/ui
- Recharts (图表)
- Jest + Playwright (测试)
- JWT + bcrypt (认证)

## 认证流程

1. 邀请注册（7 天有效期，一次性使用）
2. 邮箱登录（JWT 24h + Refresh Token 7d）
3. 登录保护（5 次失败锁定 15 分钟）
4. 管理员用户管理

## 余额计算

- **不存储** Account.balance
- 动态计算：`SUM(收入) - SUM(支出) + SUM(转入) - SUM(转出)`
- 数据库索引优化查询性能
