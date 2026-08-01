# 03 MCP 配置

## 什么是 MCP？

MCP（Model Context Protocol，模型上下文协议）是一种开放协议，用于让 AI 模型与外部工具和数据源进行交互。简单来说，MCP 相当于 AI 的 USB 接口——通过它，AI 可以连接各种外部能力，而不仅仅是靠自身的训练数据回答问题。

## MCP 有什么作用？

- **联网搜索**：让 AI 获取最新的网络信息，不局限于训练数据
- **文档查询**：实时查询库、框架的最新文档，避免给出过时的答案
- **工具调用**：扩展 AI 的能力边界，如调用 API、操作数据库等
- **上下文增强**：为 AI 提供更丰富的上下文，提升回答质量

## 为什么要配置 MCP？

OpenCode 本身不包含这些能力，需要配置 MCP 后才能使用。例如：

- 不配 MCP，AI 只能基于训练数据回答，可能给出过时信息
- 配置了 context7，AI 可以实时查询最新文档
- 配置了 tinyfish，AI 可以联网搜索和抓取网页内容

---

## 推荐 MCP 服务

### Context7

Context7 是一个文档查询 MCP，可以让 AI 实时查询各种库和框架的最新文档。

**注册地址**：[https://context7.com/sign-in](https://context7.com/sign-in)

推荐直接使用 **GitHub 账号**登录。登录后，在 [https://context7.com/dashboard](https://context7.com/dashboard) 创建一个 API Key。

> 每月有一定量的免费额度，基本够用。

### TinyFish

TinyFish 是一个联网搜索和抓取 MCP，可以让 AI 进行网络搜索、获取网页内容。

**注册地址**：[https://agent.tinyfish.ai/sign-up](https://agent.tinyfish.ai/sign-up)

推荐直接使用 **GitHub 账号**登录。登录后，在 [https://agent.tinyfish.ai/api-keys](https://agent.tinyfish.ai/api-keys) 创建一个 API Key。

> 每月有一定量的免费额度，也够用了。

---

## 配置文件示例

在 OpenCode 配置文件（`~/.config/opencode/opencode.jsonc`）中添加 `mcp` 字段：

```jsonc
{
    "$schema": "https://opencode.ai/config.json",
    "shell": "bash",
    "lsp": true,
    "mcp": {
        "context7": {
            "type": "local",
            "command": ["npx", "-y", "@upstash/context7-mcp@latest"],
            "enabled": true,
            "environment": {
                "CONTEXT7_API_KEY": "你的 Context7 API Key"
            }
        },
        "tinyfish": {
            "type": "remote",
            "url": "https://agent.tinyfish.ai/mcp",
            "enabled": true
        }
    },
    "provider": {
        // ... 此处省略模型配置，详见 02模型配置.md
    }
}
```

---

## 验证连接

### Context7

配置好 API Key 后，Context7 直接就能使用，无需额外操作。

### TinyFish

TinyFish 需要额外登录认证，在终端中执行：

```bash
opencode mcp auth tinyfish
```

执行后会弹出浏览器，使用你的 GitHub 账号登录即可。

### 确认连接状态

进入 OpenCode TUI 后，可以通过以下两种方式确认 MCP 连接状态：

1. 查看左下角，如果显示 **2 MCPs** 表示已连接
2. 输入 `/mcps` 命令，查看所有 MCP 状态

如果都显示 `connected` 即表示配置成功。