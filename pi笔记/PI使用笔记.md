# PI 使用笔记

## Pi 简介

> 来源：https://pi.dev/

### 什么是 Pi？

Pi 是一个**最小化的智能体 harness（工具框架）**。它的核心理念是"适配你的工作流，而不是反过来"。

### 核心特性

| 特性 | 说明 |
|------|------|
| **灵活定制** | 通过 [extensions](https://github.com/earendil-works/pi/tree/main/packages/coding-agent#extensions)、[skills](https://github.com/earendil-works/pi/tree/main/packages/coding-agent#skills)、[prompt templates](https://github.com/earendil-works/pi/tree/main/packages/coding-agent#prompt-templates) 和 [themes](https://github.com/earendil-works/pi/tree/main/packages/coding-agent#themes) 自定义 |
| **多模型支持** | 支持 15+ 提供商、数百个模型（Anthropic、OpenAI、Google、Azure、Bedrock、Mistral、Groq、Cerebras、xAI、Hugging Face、Kimi For Coding、MiniMax、NVIDIA、OpenRouter、Ollama 等） |
| **会话树形结构** | 会话以树状存储，可用 `/tree` 导航到历史任意节点继续，支持 `/export` 导出 HTML 和 `/share` 分享到 GitHub Gist |
| **上下文工程** | 支持 AGENTS.md、SYSTEM.md、自动压缩（compaction）、Skill 按需加载、Prompt 模板等 |
| **四种模式** | Interactive（完整 TUI）、Print/JSON（脚本用）、RPC（JSON 协议）、SDK（嵌入应用） |
| **边用边改** | 可以让 Pi 直接修改自身，执行 `/reload` 后继续，无需重启 |

### 快速入门命令

```bash
# 切换模型
/model <模型名>   # 或 Ctrl+L
/模型列表         # Ctrl+P 循环切换喜欢的模型

# 会话管理
/tree           # 查看会话树，导航到历史节点
/export         # 导出为 HTML
/share          # 上传到 GitHub Gist，生成分享链接

# 上下文管理
/compaction     # 控制上下文压缩
```

### 扩展与包

Pi 默认不带子智能体（sub-agents）和规划模式（plan mode）等功能，但可以：
- 让 Pi 自己构建你需要的功能
- 从 npm 或 git 安装社区包：
  ```bash
  pi install npm:@foo/pi-tools
  pi install git:github.com/badlogic/pi-doom
  ```
- 已有一个包含 50+ 示例的 [extensions 仓库](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions)

### 与 OpenClaw 的关系

[OpenClaw](https://github.com/OpenClaw/OpenClaw) 是 Pi 的一个真实世界集成示例，展示了如何使用 SDK 将 Pi 嵌入到应用中。

### 文档

- 官方文档：[pi.dev/docs/latest](https://pi.dev/docs/latest)
- GitHub 仓库：[github.com/earendil-works/pi](https://github.com/earendil-works/pi)

---

## 已安装插件

> 安装命令均为 `pi install npm:<包名>`，安装后需 `/reload` 或重启 Pi 生效。

### 1. pi-web-access

| 项目 | 说明 |
|------|------|
| **版本** | 0.24.0 |
| **安装** | `pi install npm:pi-web-access` |
| **配置文件** | `~/.pi/web-search.json` |

**功能：** 为 Pi 提供 Web 搜索、URL 内容抓取、GitHub 仓库克隆、PDF 提取、YouTube 视频理解和本地视频分析能力。

**支持的搜索提供商（20+）：**
- **零配置开箱即用**：Exa MCP（无需 API Key）、DuckDuckGo
- **需要 API Key**：OpenAI、Brave、Parallel、TinyFish、Search1API、Searchinfinity、Querit、Tavily、Firecrawl、Jina、SERPdive、Kagi、Bocha、Ollama、AnySearch、Valyu、xAI/Grok、Bright Data SERP、SerpBase、Perplexity、Gemini API、SearXNG（自托管）

**其他能力：**
- YouTube/本地视频理解：提问视频中发生了什么
- GitHub 仓库克隆：自动克隆到本地而非抓取 HTML
- PDF 提取：直接从 PDF URL 提取文本
- 智能回退链：配置了 SearXNG 优先本地搜索，否则依次尝试各提供商

**配置示例（`~/.pi/web-search.json`）：**
```json
{
  "autoOpenBrowser": false,
  "tinyfishApiKey": "sk-tinyfish-...",
  "braveApiKey": "BSA_...",
  "exaApiKey": "exa-..."
}
```

---

### 2. pi-mcp-adapter

| 项目 | 说明 |
|------|------|
| **版本** | 2.26.1 |
| **安装** | `pi install npm:pi-mcp-adapter` |
| **配置文件** | `~/.pi/agent/mcp.json` / `.mcp.json` |

**功能：** 让 Pi 能够使用 MCP（Model Context Protocol）服务器，但通过一个统一的代理工具（~200 tokens）来调用，而不是将每个 MCP 工具都加载到上下文中。

**解决的核心问题：**
传统 MCP 会一次性将所有工具定义加载到系统提示中，一个服务器就可能消耗 10k+ tokens。此扩展只占用 ~200 tokens，工具按需发现。

**配置来源优先级（从高到低）：**
1. `.pi/mcp.json`（项目级覆盖）
2. `~/.pi/agent/mcp.json`（全局 Pi 覆盖）
3. `~/.agents/mcp.json`（通用 MCP 配置）
4. `~/.config/mcp/mcp.json`（用户级共享配置）

**常用命令：**
- `/mcp` — 打开 MCP 管理面板
- `/mcp setup` — 首次设置，自动扫描已有配置并导入
- `/mcp disable <server>` / `/mcp enable <server>` — 禁用/启用特定服务器
- `pi-mcp-adapter init` — 终端初始化，扫描并导入宿主配置

---

### 3. pi-subagents

| 项目 | 说明 |
|------|------|
| **版本** | 0.52.1 |
| **安装** | `pi install npm:pi-subagents` |

**功能：** 允许 Pi 将工作委托给子智能体（child agents），用于代码审查、调研、并行审计、后台任务等场景。

**典型用法（自然语言即可）：**
```
Use reviewer to review this diff.
Ask oracle for a second opinion on my current plan.
Run parallel reviewers: one for correctness, one for tests, one for complexity.
```

**工作流程模式：**
- `clarify → scout → worker → fresh reviewers → worker`（推荐循环）
- 快捷命令：`/parallel-review`、`/review-loop`
- 支持前台运行（流式输出）和后台运行（事后检查）
- 可与 pi-intercom 配合，子智能体可主动联系父会话

**文档：** `/subagents-guide [topic]`，topic 包括 overview、workflows、agents、observability 等。

---

### 4. pi-intercom

| 项目 | 说明 |
|------|------|
| **版本** | 0.11.0 |
| **安装** | `pi install npm:pi-intercom` |

**功能：** 同一台机器上不同 Pi 会话之间的 1:1 消息通信。

**使用场景：**
- 一个会话负责调研，另一个负责执行，调研结果可直接发送过去
- 子智能体需要澄清时主动联系父会话
- 多会话并行工作时共享上下文

**操作方式：**
- 快捷键 `Alt+M` 或命令 `/intercom` 选择目标会话并发送消息
- 子智能体可通过 `contact_supervisor` 工具联系父会话
- 消息以扩展条目形式存储在会话历史中

---

### 5. pi-powerline-footer

| 项目 | 说明 |
|------|------|
| **版本** | 0.15.1 |
| **安装** | `pi install npm:pi-powerline-footer` |
| **配置文件** | `~/.pi/agent/settings.json`（`powerline` 字段） |

**功能：** 为 Pi 提供 Powerline 风格的底部状态栏，替代默认的简洁 footer。

**主要特性：**
- **Powerline 队列** — 压缩过程中的消息被暂存，压缩成功后才投递
- **Working Vibes** — AI 生成的主题化加载消息（如 `/vibe star trek` → "Running diagnostics..."）
- **欢迎-overlay** — 启动时显示品牌化欢迎界面，30秒自动消失或按任意键关闭
- **思考层级指示器** — 实时显示当前 thinking level（off/low/med/high/xhigh/max），高/极高/最大级别有彩虹效果
- **Git 集成** — 显示当前分支、暂存/未暂存/未跟踪文件数量
- **上下文感知** — 70% 以上黄色警告，90% 以上红色警告；流式传输时实时更新
- **Token 智能格式化** — 1.2k、45M 等格式，显示已用/上限/百分比
- **Sticky Bash 模式** — `Ctrl+Shift+B` 或 `/bash-mode`，保持 shell 会话存活，命令输出嵌入显示
- **Shell 幽灵提示** — 基于历史命令的自动补全建议
- **编辑器缓存** — `Alt+S` 保存编辑器内容，输入快速提示后自动恢复

**配置示例（`settings.json`）：**
```json
{
  "powerline": {
    "preset": "default",
    "welcome": false,
    "cost": { "currency": "CNY" }
  }
}
```

---

## 当前插件配置总览

```json
// ~/.pi/agent/settings.json
{
  "packages": [
    "npm:pi-web-access",
    "npm:pi-subagents",
    "npm:pi-intercom",
    "npm:pi-mcp-adapter",
    "npm:pi-powerline-footer"
  ]
}
```

安装后需执行 `/reload` 使插件生效（pi-web-access 的配置修改也需 `/reload` 才能重新读取）。

> 综合参考：bswen.com、c-daniele.github.io、sanj.dev 等社区评测（截至 2026 年）

### 同类工具一览

| 工具 | 厂商 | 许可证 | 核心理念 | 多模型支持 | MCP 支持 | 形态 |
|------|------|--------|---------|-----------|---------|------|
| **Pi** | earendil-works | MIT | 最小化可扩展 harness | 15+ 提供商 | 插件式 | CLI / TUI / SDK |
| **Claude Code** | Anthropic | 闭源 | 电池全配的全功能 Agent | Anthropic + 代理 | 内置 | CLI |
| **OpenCode** | — | MIT | 最大灵活性，75+ 提供商 | 75+ | 内置 | CLI |
| **Aider** | — | Apache 2.0 | Git 原生，每次编辑自动提交 | OpenAI 兼容格式 | 无 | CLI |
| **Goose** (Block) | Block | Apache 2.0 | 规划优先，系统级编排 | 多模型配置 | 内置 | Desktop |
| **Codex CLI** (OpenAI) | OpenAI | 开源 | OpenAI 生态原生 | OpenAI + 代理 | 内置 | CLI |
| **Continue** | — | 开源 | IDE 插件优先 | OpenAI 兼容格式 | 插件式 | IDE 插件 |
| **CodeBuddy** | 腾讯云 | 闭源 | AI 编程助手，双产品融合 | 内置 + 自定义 | 内置 | VS Code / JetBrains |
| **WorkBuddy** | 腾讯云 | 闭源 | AI 桌面智能体工作站 | 多模型路由 | 插件式 | Desktop (Mac/Win) |
| **Trae** | 字节跳动 | 闭源 | AI 编程 IDE + 工作助手 | 内置模型 + 自定义 | 内置 | Desktop / Web / Mobile |
| **Trae Work** | 字节跳动 | 闭源 | Trae 的非编码办公模式 | 同上 | 同上 | Desktop |
| **千问办公 / Qoder** | 阿里云 | 闭源 | 增强上下文工程，自主智能体 | GLM/DeepSeek/Kimi/MiniMax | 内置 | IDE / JetBrains / CLI |
| **Qoder** | — | 闭源 | 同千问办公，海外版 | 同上 | 内置 | Desktop / JetBrains / CLI |

### 核心差异对比

#### 1. 设计理念：「造轮子」vs「开箱即用」

| 维度 | Pi | Claude Code / OpenCode / Aider |
|------|----|-------------------------------|
| 默认功能 | 精简核心（5 个基础工具），计划模式/子智能体/MCP 需插件实现 | 内置完整功能集 |
| 扩展方式 | TypeScript 插件，50+ 示例可参考 | 各有专用 SDK / 插件系统 |
| 学习曲线 | 较陡，需要先理解「harness」概念 | 较低，安装即用 |
| 适合人群 | 想深度定制工作流的高级用户 | 想要即装即用的普通用户 |

#### 2. 成本与 Token 效率

以单次简单交互（"just say hello"）为例（2026 年实测数据，相同模型）：

| 工具 | 首轮输入 Token | 首轮成本（USD） | 备注 |
|------|-------------|---------------|------|
| Pi | ~2,768 | $0.0031 | 最轻量 |
| OpenCode | ~12,374 | $0.0170 | 中等 |
| Claude Code | ~28,407 | $0.0391 | 约是 Pi 的 10 倍 |

> **注意**：上述数字仅为首轮冷启动开销。实际使用中 prompt caching 会大幅降低稳态成本，且 Claude Code 的多出 Token 中包含了 Git 安全规则、子智能体指令等重要 guardrails，并非单纯「臃肿」。Pi 虽然默认轻量，但若要达到同等安全性，用户往往需要自行补充类似规则。[来源](https://c-daniele.github.io/en/posts/2026-05-18-coding-harness-comparison/)

#### 3. 关键特性对比

| 特性 | Pi | Claude Code | OpenCode | Aider | Goose | CodeBuddy | WorkBuddy | Trae | 千问办公/Qoder |
|------|----|-------------|----------|-------|-------|----------|-----------|------|---------------|
| **子智能体** | 插件 | ✅ 内置 | 插件 | ❌ | ✅ 内置 | ✅ 内置 | ✅ 内置 | ✅ 内置 | ✅ 内置 |
| **计划模式** | 插件 | ✅ 内置 | ✅ 内置 | 结构化模式 | ✅ 内置 | ✅ 内置 | ✅ 内置 | ✅ 内置 | ✅ 内置 (Quest) |
| **MCP** | 插件 | ✅ 内置 | ✅ 内置 | ❌ | ✅ 内置 | ✅ 内置 | ✅ 内置 | ✅ 内置 | ✅ 内置 |
| **权限控制** | 无内置 | ✅ 内置弹窗 | ✅ 内置 | ✅ 内置 | 扩展实现 | ✅ PreToolUse Hook | ✅ 安全扫描 | ✅ 本地优先 | ✅ 企业级 |
| **沙箱** | 容器化（外置） | ✅ 内置 | 权限控制 | ✅ 内置 | 容器化 | ✅ | ✅ | ✅ 本地优先 | ✅ 私有部署 |
| **后台任务** | tmux | ✅ 内置 | 有限 | 有限 | ✅ 内置 | ✅ | ✅ 并行任务 | ✅ 云端并发 | ✅ 并行 Agent |
| **会话树形结构** | ✅ 内置 | ❌ 线性 | ❌ 线性 | ❌ 线性 | ❌ 线性 | ✅ | ✅ | ✅ | ✅ |
| **SDK/API** | RPC + SDK | Headless 模式 | SDK | CLI 为主 | API | IDE/CLI | CLI / IDE | SDK | CLI / SDK |
| **本地模型** | ✅ Ollama 等 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ GLM/DeepSeek 等 |
| **复用订阅** | ❌ | ❌ | ✅ ChatGPT/Copilot | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **多端支持** | CLI/TUI | CLI | CLI | CLI | Desktop | VS Code/JB | Mac/Win | Desktop/Web/Mobile | Desktop/JB/CLI |
| **开源** | ✅ MIT | ❌ | ✅ MIT | ✅ Apache 2.0 | ✅ Apache 2.0 | ❌ | ❌ | ❌ | ❌ |

#### 4. 各工具最适合的场景

| 你的需求 | 推荐工具 | 原因 |
|---------|---------|------|
| 深度定制工作流，用 TypeScript 写插件 | **Pi** | 最灵活的扩展体系，TypeScript 原生，MIT 开源 |
| 开箱即用，不想折腾配置 | **Claude Code** | 功能最全，guardrails 内置 |
| 想用任何模型，不想被供应商锁定 | **OpenCode** | 75+ 提供商，支持复用 ChatGPT/Copilot 订阅 |
| 重视 Git 历史，每次修改可追溯 | **Aider** | 自动提交，`git revert` 随时回退 |
| 复杂系统架构和编排 | **Goose** | 规划优先，Block 内部验证，Recipes |
| 在 VS Code/JetBrains 里直接用 | **Continue** | IDE 插件体验最佳 |
| 国内团队，需要中文大模型 + 企业安全 | **千问办公/Qoder** | 支持 GLM/DeepSeek/Kimi，私有部署可选 |
| 腾讯生态，双场景（编程+办公）融合 | **WorkBuddy + CodeBuddy** | 一个账号双产品，腾讯云生态整合 |
| 字节生态，全平台覆盖 | **Trae** | Desktop/Web/Mobile 三端同步 |
| 免费起步 + 渐进式付费 | **Trae / Qoder** | 均有免费层，按需升级 |

### 新增工具详解

#### CodeBuddy & WorkBuddy（腾讯云）

**CodeBuddy** 是腾讯云的 AI 编程助手，作为 VS Code 和 JetBrains 插件运行。支持 Agent 模式、子智能体、MCP、Skills 系统、Remote SSH、Checkpoint 回滚等。

**WorkBuddy** 是腾讯云的 AI 桌面智能体工作站，支持两种模式：
- **Work Mode**：文档生成、数据分析、PPT 制作、深度调研等办公任务
- **Coding Mode**：代码生成、审查、Bug 修复、重构、全栈开发

两者已融合为一个账号，支持 GitHub/GitLab 连接、Diff 对比、实时预览。
- **价格**：个人 Pro $10/月（2,000 Credits/月），Team $40/座/月

#### Trae & Trae Work（字节跳动）

**Trae** 是字节跳动推出的 AI 编程 IDE，支持桌面端、Web 端和移动端三端同步。特色功能：
- AI 智能体自主规划、编写代码、修复 Bug、测试变更、部署项目
- 支持多行智能代码预测
- 内置终端和浏览器预览
- 一键部署到 Vercel
- 本地优先的隐私控制
- 团队规则文件支持

**Trae Work** 是 Trae 的非编码模式，用于研究、报告、总结等办公场景。
- **价格**：Free 有限额，Lite $3/月，Pro $10/月，Pro+ $30/月，Ultra $100/月

#### 千问办公 / Qoder（阿里云）

**千问办公**（原通义灵码）是阿里云的 AI 编程套件，海外版名为 **Qoder**。

核心能力：
- **Agent 模式**：自主决策、环境感知、工具调用，端到端完成任务
- **Quest 2.0**：自动拆解复杂任务，配合 Repo Wiki 项目知识库
- **专家协作**：前端/后端/数据库/运维/测试等专家智能体并行
- **Next 预测**：基于最近编辑预测下一步修改，跨文件联动
- **模型选择**：支持 GLM、DeepSeek、Kimi、MiniMax 等国产大模型
- **多种形态**：IDE 独立应用、JetBrains 插件、VS Code 插件、CLI

- **价格**：Free（2 周试用 300 Credits），Pro $20/月，Pro+ $60/月，Ultra $200/月

#### 5. 与 Pi 最直接的对比：Claude Code

**Claude Code 的优势：**
- 内置计划模式、子智能体、MCP、权限弹窗——不用自己组装
- 每个工具都有详细的 guardrails 描述（比如 bash 工具内置了 Git 安全协议：禁止 force push、禁止 `git add -A` 等）
- 跨会话记忆系统（file-based memory）
- 企业级支持

**Pi 的优势：**
- 支持 15+ 提供商，中途可切换模型，不被单一供应商锁定
- 完全开源（MIT），代码可读可审计
- 会话以树形结构存储，可回溯任意历史节点
- 四种运行模式（TUI / Print / JSON / RPC / SDK），易于脚本化和集成
- 用 TypeScript 写扩展，与项目技术栈统一
- 「边用边改」——可以让 Pi 自己修改自身配置并热重载

**一句话总结：**
> Claude Code 是一个功能完备的「成品」，Pi 是一个给你工具的「工作台」。前者适合想要开箱即用的团队，后者适合愿意投入时间打造个性化工作流的高级用户。

### 如何选择？

```
你的痛点是这些 → 选 Pi：
  - 被单一供应商锁定（只想用 Claude 却被 Claude Code 绑死）
  - 想要精细控制上下文窗口和系统提示
  - 想在脚本/CI/SDK 中集成 AI 能力
  - 喜欢用 TypeScript 自定义工具链

维持现状即可 → 不急着换：
  - 依赖内置权限弹窗和计划模式
  - 不想花时间为 Agent 组装安全规则
  - 团队已深度使用 Claude Code / Codex CLI
```

### 参考资料

- [Pi vs Claude Code vs Codex CLI vs OpenCode 详细对比](https://docs.bswen.com/blog/2026-08-10-pi-vs-claude-code-vs-codex-vs-opencode/)
- [Token 开销实测分析：Pi vs Claude Code vs OpenCode](https://c-daniele.github.io/en/posts/2026-05-18-coding-harness-comparison/)
- [开源 CLI AI Agent 对比：OpenCode / Aider / Goose / Pi](https://sanj.dev/post/open-source-cli-ai-agents-comparison/)

---

## 国内访问 GitHub 的 fetch 问题（SSL 证书错误）

### 问题现象

在使用 PI 的 `fetch` 工具访问 GitHub 时，会遇到 SSL 证书错误，无法正常访问。

### 原因分析

1. **Watt Toolkit 的工作原理**：该软件通过向系统 HOSTS 文件注入一些地址，将 github.com 等域名指向 127.0.0.1，并安装了一个本地证书，让**系统浏览器**通过该证书访问 GitHub，因此浏览器可以正常访问。

2. **PI 的 fetch 不走浏览器**：PI 底层使用 Node.js 执行 fetch，不走浏览器的证书体系，因此无法识别 Watt Toolkit 安装的本地证书，导致 SSL 验证失败。

### 解决方案

在**用户环境变量**中设置：

```
NODE_OPTIONS=--use-system-ca
```

设置后，Node.js 会使用系统证书库进行 SSL 验证，从而兼容 Watt Toolkit 的本地证书。

### 验证方式

```bash
# ✅ 配置后：正常访问
node --use-system-ca -e "fetch('https://github.com').then(r => console.log('OK', r.status))"

# ❌ 未配置：SSL 证书错误
node -e "fetch('https://github.com').then(r => console.log('OK', r.status))"
```

### 注意事项

- 只要 **Watt Toolkit 保持开启状态**，上述配置即可生效，Node.js 访问 GitHub 不再有问题。
- 配置完成后无需重启 PI，但新建会话时会生效。
- 如果 Watt Toolkit 关闭，该配置可能无效，需提前告知用户。

### 相关环境配置方法（Windows）

```powershell
# 查看当前值
[System.Environment]::GetEnvironmentVariable("NODE_OPTIONS", "User")

# 设置值
[Environment]::SetEnvironmentVariable("NODE_OPTIONS", "--use-system-ca", "User")
```
