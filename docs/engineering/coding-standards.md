# 编码规范

- TypeScript 开启 strict，不用 `any` 绕过公开边界。
- 公共类型和函数必须由 package root export 并有 API 注释。
- Core 函数优先不可变、纯函数和显式依赖注入。
- 环境全局只在 runtime 的生命周期函数内访问。
- 错误使用稳定 code 和结构化 details，不要求解析 message。
- Token parser/compiler 不接收任意 CSS 字符串替代结构化类型。
- 资源注册必须返回 cleanup；destroy 后不得继续通知。
- 测试描述行为，不绑定不必要的内部实现。
- 不优化未测量热点，但必须遵守 stylesheet 单次提交和状态去重约束。
- 公开行为变化必须同步规范；重要取舍创建 ADR。

## 文档与日志

- 规范写当前事实；不把废弃方案长期留在正文。
- 日志只追加；更正通过新条目说明。
- 状态文档每次任务结束更新。
- Phase checklist 只有实际实现并验证后才能勾选。

