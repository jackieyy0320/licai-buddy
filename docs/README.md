# Licai Buddy 文档索引

> 本目录包含项目的所有文档，按用途分类管理。

---

## 📚 核心文档

### 产品文档

| 文档 | 说明 | 版本 |
|------|------|------|
| [prd.md](./prd.md) | 产品需求文档，包含功能规格、用户故事、数据模型 | v5.0 |
| [architecture.md](./architecture.md) | 技术架构设计，包含前端/后端/数据库架构 | v1.0 |
| [design-spec.md](./design-spec.md) | UI设计规范，包含色彩/字体/间距/组件规范 | v1.0 |

### 项目管理文档

| 文档 | 说明 |
|------|------|
| [plans/mvp-feature.md](./plans/mvp-feature.md) | MVP功能实施计划，包含8个Task的详细规格 |
| [test-plan.md](./test-plan.md) | 测试计划，包含测试策略、用例、验收标准 |
| [deployment.md](./deployment.md) | 部署指南，包含开发/生产环境配置 |

### 参考资料

| 文档 | 说明 |
|------|------|
| [competitor-analysis.md](./competitor-analysis.md) | 竞品分析，分析市场格局和差异化定位 |

---

## 📂 目录结构

```
docs/
├── prd.md                  # 产品需求文档（最终版）
├── architecture.md         # 技术架构设计
├── design-spec.md          # UI设计规范
├── test-plan.md            # 测试计划
├── deployment.md           # 部署指南
├── competitor-analysis.md  # 竞品分析
├── plans/                  # 项目计划
│   └── mvp-feature.md     # MVP实施计划
├── tasks/                  # 任务Brief（运行时生成）
│   └── 2026-08-23-mvp-feature/
└── archive/                # 归档文档
    ├── kiro-dev-brief.md
    ├── kiro-execution-guide.md
    └── kiro-workflow.md
```

---

## 🔄 文档维护

### 更新规范

1. **PRD更新**：每次需求变更后更新版本号，记录变更日志
2. **架构更新**：技术选型变更时同步更新
3. **设计更新**：UI规范调整后更新颜色/字体/间距
4. **测试更新**：新增测试用例时更新测试计划

### 版本控制

- 所有文档使用 Markdown 格式
- 版本号遵循语义化版本（v主版本.次版本.修订号）
- 重要变更在文档顶部更新"最后更新"日期

---

## 📝 编写指南

### 命名规范

- 文件名：小写+连字符，如 `prd.md`
- 标题层级：使用 `#` 到 `####` 四级标题
- 表格：用于对比和清单，避免大段文字

### 内容规范

- 使用要点列表而非长段落
- 代码块标注语言类型
- 链接使用相对路径或完整URL

---

## 🔗 相关资源

- [GitHub 仓库](https://github.com/jackieyy0320/licai-buddy)
- [Qoder 开发者指南](../docs/qoder-dev-guide.md)
- [项目管理方案](./project-plan.md)

---

*最后更新：2026-08-25*
