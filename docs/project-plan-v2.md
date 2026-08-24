# Licai Buddy - 更新后的项目方案

> **Reviewer:** Hermes Agent (Louis) - 项目经理  
> **Update Date:** 2026-08-24  
> **Changes:** UI风格确认、开发工具切换

---

## 一、用户确认的决策

| 决策项 | 选择 |
|--------|------|
| **UI风格** | ✅ 温暖友好（参考Notion/Airtable） |
| **预览方式** | ✅ 实时部署预览链接 |
| **开发工具** | ✅ Qoder CN IDE（替代Kiro） |

---

## 二、角色分工（最终版）

| 角色 | 负责人 | 职责 | 产出 |
|------|--------|------|------|
| 产品负责人 | Jackie | 需求确认、方案审批、最终验收 | 需求确认、验收反馈 |
| 项目经理 | Hermes (Louis) | 需求管理、UI设计、进度跟踪、质量审核 | 计划文档、设计稿、周报 |
| 开发者 | **Qoder** | 按文档实现、编写测试、接受Review | 代码、测试报告 |

---

## 三、工作流程（最终版）

```
┌─────────────────────────────────────────────────────────────────────┐
│                        项目管理全流程（更新版）                       │
└─────────────────────────────────────────────────────────────────────┘

Phase 1: 需求确认 ✅
Jackie ──▶ [PRD v5.0] ──▶ Hermes 审核 ──▶ Jackie 确认

Phase 2: UI设计（Hermes负责）⏳
Hermes ──▶ [设计规范] ──▶ Hermes 实现 ──▶ Jackie 预览确认
                    ↓
              实时预览链接

Phase 3: 开发阶段（Qoder执行）
Qoder ──▶ [代码实现] ──▶ Hermes Review ──▶ 修复问题 ──▶ 验收
   │
   └──▶ 严格按 docs/kiro-dev-brief.md（已适配Qoder）执行
   └──▶ 每个功能必须通过验收标准
   └──▶ 通过 Review 才能标记完成

Phase 4: 迭代优化
Jackie 反馈 ──▶ Hermes 整理 ──▶ 规划下一期 ──▶ 循环
```

---

## 四、任务分解（9个Task）

| # | Task名称 | 负责人 | 前置条件 | 预计工时 | 状态 |
|---|---------|--------|---------|---------|------|
| 1 | 项目初始化 | Qoder | 无 | - | ✅ 已完成 |
| 2 | **UI组件库搭建** | **Hermes** | Task 1 | 2小时 | ⏳ 下一步 |
| 3 | 认证模块 | Qoder | Task 1 | 4小时 | ⏸️ |
| 4 | 记账模块 | Qoder | Task 3 | 6小时 | ⏸️ |
| 5 | 账户模块 | Qoder | Task 4 | 4小时 | ⏸️ |
| 6 | 类别/关键字管理 | Qoder | Task 5 | 3小时 | ⏸️ |
| 7 | 报表模块 | Qoder | Task 4 | 5小时 | ⏸️ |
| 8 | 布局与导航 | Qoder | Task 2 | 3小时 | ⏸️ |
| 9 | 集成测试 | Qoder | Task 8 | 4小时 | ⏸️ |

---

## 五、技术架构

### 5.1 技术栈

```
前端框架：Next.js 14 (App Router)
语言：TypeScript 5.x
样式：Tailwind CSS 3.x + shadcn/ui
数据库：SQLite + Prisma 5.x
认证：JWT (jsonwebtoken) + bcryptjs
图表：Recharts
表单：React Hook Form + Zod
测试：Jest + Playwright
```

### 5.2 部署方案

| 环境 | 工具 | URL |
|------|------|-----|
| 开发预览 | Vercel / Cloudflare Pages | https://licai-buddy-dev.vercel.app |
| 生产环境 | Vercel | https://licai-buddy.vercel.app |
| GitHub Repo | GitHub | https://github.com/jackieyy0320/licai-buddy |

### 5.3 Qoder 接入

**Qoder IDE 配置：**
- 访问 https://www.qoder.com/zh
- 下载 Qoder IDE 或 JetBrains Plugin
- 打开 GitHub 仓库：https://github.com/jackieyy0320/licai-buddy
- 使用 Qoder 执行开发任务

**Qoder 工作流：**
```
1. Hermes 派发任务 brief 到 GitHub Issue
2. Qoder 读取 brief 并执行开发
3. Qoder 提交代码到 GitHub
4. Hermes 审查代码并更新进度
5. 部署预览链接给 Jackie 确认
```

---

## 六、UI设计规范（温暖友好风格）

### 6.1 设计参考

| 参考产品 | 特点 |
|----------|------|
| **Notion** | 柔和色彩、圆角设计、友好的排版 |
| **Airtable** | 清晰的层次、温暖的色调、易用性优先 |
| **Linear** | 简洁但不冰冷、有温度的设计 |

### 6.2 色彩系统

**主色系（温暖色调）：**
```
主色：#6366F1（柔和靛蓝，替代原#4F46E5）
主色 hover：#4F46E3
主色 light：#EEF2FF
```

**辅助色（温暖感）：**
```
成功：#10B981（绿色，不变）
警告：#F59E0B（琥珀色，比纯黄更温暖）
危险：#EF4444（红色，不变）
信息：#3B82F6（蓝色，不变）
```

**中性色（柔和感）：**
```
文字主色：#1F2937（比纯黑更柔和）
文字次色：#6B7280（不变）
边框色：#E5E7EB（不变）
背景色：#FAFAF9（米白，比纯白更温暖）
卡片背景：#FFFFFF（不变）
```

### 6.3 字体系统

```
字体族：Inter（CDN可用）
字重：300（细）、400（常规）、500（ medium）、600（ semibold）
```

| 用途 | 大小 | 字重 | 行高 |
|------|------|------|------|
| 标题 | 24px | 600 | 1.3 |
| 副标题 | 18px | 600 | 1.4 |
| 正文 | 14px | 400 | 1.5 |
| 辅助文字 | 12px | 400 | 1.4 |

### 6.4 圆角系统（更圆润）

```
小：6px（原4px）
中：10px（原8px）
大：14px（原12px）
全圆：50px（按钮）
```

---

## 七、文档更新清单

| 文档 | 操作 | 说明 |
|------|------|------|
| `docs/project-review.md` | ✅ 已更新 | 添加用户决策和角色变更 |
| `docs/project-management-plan.md` | 🔄 待更新 | 修改开发工具为 Qoder |
| `docs/design-spec.md` | 🔄 待更新 | 调整为温暖友好风格 |
| `docs/figma-design-guide.md` | 🔄 待更新 | 更新为 Hermes 设计流程 |
| `docs/kiro-dev-brief.md` | 🔄 待更新 | 添加 Qoder 适配说明 |
| `docs/kiro-execution-guide.md` | 🔄 待更新 | 更新为 Qoder 工作流 |

---

## 八、立即执行计划

### 下一步行动：

1. **Hermes 执行 Task 2：UI组件库搭建**
   - 创建 `src/components/ui/` 目录
   - 实现 Button, Input, Card, Dialog 等基础组件
   - 定义全局样式变量（颜色、字体、间距）
   - 推送到 GitHub

2. **部署预览**
   - 使用 Vercel 部署开发版本
   - 提供预览链接给 Jackie

3. **继续 Task 3-9**
   - 等待 Jackie 确认 UI 组件库
   - 使用 Qoder 执行后续开发任务

---

## 九、风险与应对（更新）

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|----------|
| Qoder 集成复杂度 | 开发效率下降 | 中 | 提供清晰的任务 brief |
| UI 风格理解偏差 | 返工 | 中 | 快速原型 + 及时反馈 |
| 预览链接延迟 | 用户体验差 | 低 | 使用 Vercel 自动部署 |
| 文档更新不及时 | 信息不同步 | 中 | 每次更新后推送通知 |

---

## 十、关键里程碑

| 里程碑 | 时间 | 交付物 |
|--------|------|--------|
| M1: 项目初始化 | ✅ 已完成 | 技术栈搭建、Schema |
| M2: UI组件库 | 今天 | 基础组件、全局样式 |
| M3: 认证模块 | 明天 | 登录/注册/邀请码 |
| M4: 核心功能 | 后天 | 记账、账户、报表 |
| M5: 集成测试 | D+3 | 测试通过率>80% |
| M6: MVP 发布 | D+5 | 可访问的预览链接 |

---

*文档版本：v2.0*
*更新日期：2026-08-24*
*更新人：Hermes Agent (Louis)*
