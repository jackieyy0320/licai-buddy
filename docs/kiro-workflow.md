# Kiro 工作流指南

## 如何接收任务

1. **查看 GitHub Issues**
   - 打开 https://github.com/jackieyy0320/licai-buddy/issues
   - 每个 Issue 是一个独立任务

2. **在 Kiro 中打开仓库**
   ```bash
   kiro open https://github.com/jackieyy0320/licai-buddy
   ```

3. **读取任务 brief**
   - 每个任务对应的 brief 文件在 `.superpowers/sdd/` 目录下
   - 格式: `task-N-brief.md`

4. **执行任务**
   - 严格按照 brief 中的步骤执行
   - 写测试并验证通过
   - 提交 commit

5. **推送代码**
   ```bash
   git push origin master
   ```

6. **关闭 Issue**
   - 在 Issue 中回复完成报告
   - 标记为 Done

## 任务状态跟踪

- **progress.md**: 记录所有任务的完成情况
- **task-N-report.md**: 每个任务的详细报告

## 注意事项

- 不要修改 PRD 和 Schema（除非有必要）
- 保持代码简洁（遵循 Ponytail 原则）
- 先写测试，再写实现（TDD）
- 每个 Task 完成后立即推送
