# OpenCode 使用笔记

## 1. 环境安装与配置

### 1.1 什么是 OpenCode？

**OpenCode** 是一个开源的 AI 编码代理（coding agent），可在终端、桌面应用或 IDE 扩展中使用。它由 anomalyco 团队开发，GitHub 上拥有 **190K+ stars**（24.2K forks），月活跃开发者 **7.5M+**（750万+），是目前最受欢迎的开源 AI 编码代理。

与传统的代码补全工具不同，OpenCode 能：
- 读取你的整个代码库，理解项目结构和编码模式
- 规划并执行多文件更改，不限于单行建议
- 运行终端命令、执行测试、迭代修复
- 通过内置的 Plan 模式先分析再执行，避免盲目修改

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **多提供商支持** | 支持 75+ LLM 提供商，可随时切换 Claude、GPT、Gemini、DeepSeek 或本地模型 |
| **双模式内置** | Build 模式（完整权限）和 Plan 模式（只读分析），Tab 键一键切换 |
| **TUI 交互界面** | 终端原生 UI，支持 Vim 键位绑定，体验流畅 |
| **LSP 集成** | 语言服务器协议支持，智能代码导航 |
| **会话管理** | 持久化会话存储在 SQLite 中，可随时继续 |
| **本地优先** | 代码不离开本机（除非你主动选择云端模型） |
| **零工具成本** | 工具本身免费，只需为调用的 LLM API 付费 |
| **并行多会话** | 支持同时运行多个 AI 代理在同一项目上工作 |

### 1.3 为什么选择 OpenCode？

1. **开源 + 免费** — MIT 许可，无订阅费，只需自带模型 API Key
2. **无供应商锁定** — 不被绑定在 Anthropic 或 OpenAI 生态，随时可切换
3. **终端原生** — 不依赖特定 IDE，任何终端都能用
4. **隐私可控** — 本地优先架构，代码不强制上传
5. **社区活跃** — 190K+ stars（24.2K forks），7.5M+ 月活，插件生态丰富

### 1.4 与其他工具对比

| 维度 | OpenCode | Claude Code | OpenAI Codex | Cursor |
|------|----------|-------------|--------------|--------|
| **开源** | ✅ MIT 开源 | ❌ 闭源 | ❌ 闭源（CLI 部分开源） | ❌ 闭源 |
| **价格** | 免费（自备模型 API） | $20-200/月 | $20-200/月 | $20-200/月 |
| **模型选择** | 75+ 提供商，自由切换 | 仅 Claude | 仅 OpenAI | 多模型但有限 |
| **运行环境** | 终端 / 桌面 / IDE | 终端 / IDE | 终端 / 云端 | IDE（VS Code 分支） |
| **并行代理** | ✅ 多会话并行 | ✅ Agent Teams | ✅ 多工作树 | ✅ 8 个并行代理 |
| **SWE-bench 得分** | 取决于接入模型 | 88.6%（Opus 4.8） | 82.7%（GPT-5.5） | 中等（Composer 2.5） |
| **隐私控制** | 本地优先，完全可控 | 数据发送到 Anthropic | 数据发送到 OpenAI | 代码会上传云端 |
| **社区生态** | 190K+ stars（24.2K forks），插件丰富 | 官方支持 | 官方支持 | 360K+ 付费用户 |

#### 1.4.1 适用场景速览

- **OpenCode** → 想要开源、免费、终端原生、无供应商锁定的开发者
- **Claude Code** → 需要最强推理能力处理复杂架构任务
- **Codex** → 追求高速代码生成和异步云端任务委托
- **Cursor** → 想要一体化 AI IDE 的全栈开发体验

### 1.5 安装方式

#### 1.5.1 前提条件

建议先安装以下工具，工作中基本都会用到：

- [Node.js](https://nodejs.org/zh-cn)（建议 LTS 版本）— OpenCode 运行所需
- [Git](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git) — 版本控制。**Windows 用户尤其建议安装**，详见 `7.1`
- [Python](https://www.python.org/downloads/) — 数据脚本、自动化等

安装完成后在终端中验证：

```bash
node -v
npm -v
git --version
python --version
```

#### 1.5.2 配置 npm 国内镜像（可选，推荐国内用户配置）

由于国内网络环境，直接使用 npm 官方源可能很慢或无法下载，建议配置为淘宝镜像。

在终端（cmd / PowerShell / Git Bash 均可，**无需管理员权限**）中执行：

```bash
npm config set registry https://registry.npmmirror.com
```

配置完成后验证：

```bash
npm config get registry
```

输出应为 `https://registry.npmmirror.com` 即配置成功。

如需恢复官方源：

```bash
npm config set registry https://registry.npmjs.org
```

#### 1.5.3 配置 pip 国内镜像（可选，推荐国内用户配置）

同样，Python 的 pip 官方源在国内也可能较慢，建议配置为清华镜像。

在终端（cmd / PowerShell / Git Bash 均可，**无需管理员权限**）中执行：

```bash
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

配置完成后验证：

```bash
pip config list
```

输出中应包含 `global.index-url=https://pypi.tuna.tsinghua.edu.cn/simple` 即配置成功。

如需恢复官方源：

```bash
pip config unset global.index-url
```

#### 1.5.4 配置 GitHub 网络加速（可选，推荐国内用户配置）

文档中多处提到使用 GitHub 账号登录，但国内网络访问 GitHub 可能不稳定。推荐使用 **Watt Toolkit**（原名 Steam++）来加速 GitHub 访问：

**下载地址**：[https://steampp.net/](https://steampp.net/)

安装后使用方法：

1. 打开 Watt Toolkit
2. 左侧导航栏点击 **网络加速**
3. 在平台列表中 **务必勾选 GitHub**（可根据需要勾选其他平台）
4. 点击上方刷新按钮旁的 **一键加速**

加速成功后，GitHub 即可正常访问，后续登录、克隆等操作将不再受网络限制。

> 该工具免费开源，不仅加速 GitHub，也支持 Steam、Discord 等平台，日常开发中很实用。

#### 1.5.5 OpenCode 安装

在终端中执行：

```bash
npm install -g opencode-ai
```

安装完成后验证：

```bash
opencode --version
```

输出版本号（如 `x.x.x`）即表示安装成功。

> 其他安装方式（Scoop、Chocolatey、Homebrew、一键脚本等）请参考 https://opencode.ai/docs/

---

### 1.6 使用

在终端中进入项目目录，然后运行 OpenCode 即可进入 TUI 交互界面：

```bash
cd /path/to/your/project
opencode
```

> 更多 OpenCode 配置项（主题、Shell、LSP 等）请参考中文文档：[https://www.opencodecn.com/docs/config](https://www.opencodecn.com/docs/config)

## 2. 模型配置

### 2.1 方式一：OpenCode Zen（推荐）

在 TUI 中运行 `/connect` 命令，选择 `opencode`，然后前往 `opencode.ai/auth` 登录并获取 API Key。

```bash
/connect
```

> 注意：Zen 没有独立的注册入口，需要使用 **GitHub 账号**或 **Google 账号**登录。如果没有这两个账号，请先注册。登录后 Zen 提供几个免费模型可直接使用（有使用限制），也可充值解锁更多模型。

### 2.2 方式二：其他提供商

TUI 中运行 `/connect`，选择其他提供商（如 Anthropic、OpenAI、Google 等），按照提示输入 API Key。

### 2.3 方式三：命令行配置

```bash
opencode auth login
```

---

### 2.4 免费模型配置

#### 2.4.1 商汤 SenseNova

注册地址：[https://platform.sensenova.cn](https://platform.sensenova.cn)

注册成功后，在 [https://platform.sensenova.cn/console/keys](https://platform.sensenova.cn/console/keys) 创建一个 API Key。

> 商汤提供免费模型额度，适合入门体验和日常开发使用。可在 [https://platform.sensenova.cn/console](https://platform.sensenova.cn/console) 查看使用量。

#### 2.4.2 Agnes

注册地址：[https://platform.agnes-ai.cn](https://platform.agnes-ai.cn)

注册成功后，在 [https://platform.agnes-ai.cn/settings/apiKeys](https://platform.agnes-ai.cn/settings/apiKeys) 创建一个 API Key。

#### 2.4.3 通过配置文件配置

直接修改 OpenCode 配置文件（如果文件不存在，直接新建即可），路径如下：

- **macOS / Linux**：`~/.config/opencode/opencode.jsonc`
- **Windows**：`C:\Users\您的用户名\.config\opencode\opencode.jsonc`

`provider` 下可以配置任意多个大模型，选择其中一个或多个使用即可，不需要全部配置。将以下内容中的 `apiKey` 替换为你的实际密钥：

```jsonc
{
    "$schema": "https://opencode.ai/config.json",
    "shell": "bash", // 默认 shell；Windows 需安装 Git Bash 并配置此项
    "lsp": true, // 启用 LSP
    "provider": {
        "agnes": {
            "name": "agnes",
            "npm": "@ai-sdk/openai-compatible",
            "options": {
                "baseURL": "https://api.agnes-ai.cn/v1",
                "apiKey": "密钥",
                "setCacheKey": true // 启用缓存，可降低 token 费用
            },
            "models": {
                "agnes-2.5-flash": {
                    "name": "agnes 2.5 flash",
                    "limit": {
                        "context": 512000, // 上下文窗口大小（token 数）
                        "output": 64000 // 最大输出 token 数
                    },
                    "modalities": {
                        "input": ["text", "image"], // 支持输入类型：文本和图片
                        "output": ["text"] // 支持输出类型：文本
                    },
                    "options": {
                        "chat_template_kwargs": {
                            "enable_thinking": true, // 启用思考/推理过程
                            "budget_tokens": 4096 // 思考 token 预算上限
                        }
                    }
                }
            }
        },
        "sense-nova": {
            "npm": "@ai-sdk/openai-compatible",
            "name": "Sense Nova",
            "options": {
                "baseURL": "https://token.sensenova.cn/v1",
                "apiKey": "API Key",
                "setCacheKey": true // 启用缓存，可降低 token 费用
            },
            "models": {
                "sensenova-6.7-flash-lite": {
                    "name": "SenseNova 6.7 Flash-Lite",
                    "modalities": {
                        "input": ["text", "image"], // 支持输入类型：文本和图片
                        "output": ["text"] // 支持输出类型：文本
                    },
                    "limit": {
                        "context": 256000, // 上下文窗口大小（token 数）
                        "output": 64000 // 最大输出 token 数
                    },
                    "options": {
                        "reasoning_effort": "high" // 思考模式：none / low / medium / high
                    }
                },
                "deepseek-v4-flash": {
                    "name": "DeepSeek v4 Flash",
                    "modalities": {
                        "input": ["text"], // 支持输入类型：文本
                        "output": ["text"] // 支持输出类型：文本
                    },
                    "limit": {
                        "context": 1000000, // 上下文窗口大小（token 数）
                        "output": 64000 // 最大输出 token 数
                    },
                    "options": {
                        "reasoning_effort": "high" // 思考模式：none / low / medium / high
                    }
                }
            }
        }
    }
}
```

---

### 2.5 切换模型

在终端中进入项目目录启动 OpenCode：

```bash
cd /path/to/your/project
opencode
```

在 TUI 中有两种方式切换模型：

1. 按 `Ctrl+P` 打开命令面板，选择 **Switch Model**，然后选择要使用的模型
2. 直接输入 `/models` 命令，查看并切换模型

## 3. MCP 配置

### 3.1 什么是 MCP？

MCP（Model Context Protocol，模型上下文协议）是一种开放协议，用于让 AI 模型与外部工具和数据源进行交互。简单来说，MCP 相当于 AI 的 USB 接口——通过它，AI 可以连接各种外部能力，而不仅仅是靠自身的训练数据回答问题。

### 3.2 MCP 有什么作用？

- **联网搜索**：让 AI 获取最新的网络信息，不局限于训练数据
- **文档查询**：实时查询库、框架的最新文档，避免给出过时的答案
- **工具调用**：扩展 AI 的能力边界，如调用 API、操作数据库等
- **上下文增强**：为 AI 提供更丰富的上下文，提升回答质量

### 3.3 为什么要配置 MCP？

OpenCode 本身不包含这些能力，需要配置 MCP 后才能使用。例如：

- 不配 MCP，AI 只能基于训练数据回答，可能给出过时信息
- 配置了 context7，AI 可以实时查询最新文档
- 配置了 tinyfish，AI 可以联网搜索和抓取网页内容

---

### 3.4 推荐 MCP 服务

#### 3.4.1 Context7

Context7 是一个文档查询 MCP，可以让 AI 实时查询各种库和框架的最新文档。

**注册地址**：[https://context7.com/sign-in](https://context7.com/sign-in)

推荐直接使用 **GitHub 账号**登录。登录后，在 [https://context7.com/dashboard](https://context7.com/dashboard) 创建一个 API Key。

> 每月有一定量的免费额度，基本够用。

#### 3.4.2 TinyFish

TinyFish 是一个联网搜索和抓取 MCP，可以让 AI 进行网络搜索、获取网页内容。

**注册地址**：[https://agent.tinyfish.ai/sign-up](https://agent.tinyfish.ai/sign-up)

推荐直接使用 **GitHub 账号**登录。登录后，在 [https://agent.tinyfish.ai/api-keys](https://agent.tinyfish.ai/api-keys) 创建一个 API Key。

> 每月有一定量的免费额度，也够用了。

---

### 3.5 配置文件示例

在 OpenCode 配置文件（**macOS / Linux**：`~/.config/opencode/opencode.jsonc`，**Windows**：`C:\Users\你的用户名\.config\opencode\opencode.jsonc`）中添加 `mcp` 字段：

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
        // ... 此处省略模型配置
    }
}
```

---

### 3.6 验证连接

#### 3.6.1 Context7

配置好 API Key 后，Context7 直接就能使用，无需额外操作。

#### 3.6.2 TinyFish

TinyFish 需要额外登录认证，在终端中执行：

```bash
opencode mcp auth tinyfish
```

执行后会弹出浏览器，使用你的 GitHub 账号登录即可。

#### 3.6.3 确认连接状态

进入 OpenCode TUI 后，可以通过以下两种方式确认 MCP 连接状态：

1. 查看左下角，如果显示 **2 MCPs** 表示已连接
2. 输入 `/mcps` 命令，查看所有 MCP 状态

如果都显示 `connected` 即表示配置成功。

## 4. 在不同终端中使用

OpenCode 不局限于某个特定终端，可以在以下环境中使用：

- 系统终端（PowerShell、cmd、Git Bash 等）
- IDE 内置终端（VS Code、JetBrains IDEA 等）
- 第三方终端（WezTerm、Alacritty、Windows Terminal 等）

### 4.1 推荐：在 VS Code 终端中使用

[VS Code](https://code.visualstudio.com/)（Visual Studio Code）是微软推出的一款免费、开源代码编辑器，拥有丰富的扩展生态和强大的集成终端，是目前最主流的编辑器之一。

我个人比较喜欢在 VS Code 的集成终端中使用 OpenCode，因为可以同时看到项目文件目录，操作更方便。

#### 4.1.1 VS Code 快捷键冲突问题

在 VS Code 终端中运行 OpenCode 时，VS Code 会拦截很多快捷键，导致 OpenCode 的快捷键无法正常使用。例如 `Ctrl+P` 会被 VS Code 拦截为"快速打开文件"，而不是发送给终端。

#### 4.1.2 VS Code 配置

需要在 VS Code 的 `settings.json` 中配置以下内容，将快捷键交还给终端处理：

```jsonc
{
    "chat.titleBar.openInAgentsWindow.enabled": false, // 在智能体窗口中打开聊天 — 禁用
    "files.autoSave": "onFocusChange", // 自动保存：当编辑器失去焦点时保存
    "git.autofetch": true, // 自动从远程仓库 fetch
    "git.openRepositoryInParentFolders": "always", // 始终在父文件夹中查找并打开仓库
    "security.workspace.trust.enabled": false, // 关闭工作区信任授信弹窗
    "security.workspace.trust.untrustedFiles": "open", // 不受信任工作区中的文件：直接打开（不询问）
    "terminal.integrated.allowChords": false, // 关闭终端内 VSCode 和弦捕获，放行 OpenCode Ctrl+x leader 先导键
    "terminal.integrated.commandsToSkipShell": [ // 以下快捷键不发送给终端，由 VS Code 自身处理（前面加 - 表示从默认列表中移除，交由终端处理）
        "-workbench.action.quickOpen", // Ctrl+P — 快速打开文件（交还给终端）
        "-workbench.action.showAllSymbols", // Ctrl+T — 显示所有符号（交还给终端）
        "-workbench.action.toggleSidebarVisibility", // Ctrl+B — 切换侧栏可见性（交还给终端）
        "-workbench.action.findInFiles", // Ctrl+F — 在文件中查找（交还给终端）
        "-workbench.action.navigateEditorGroupsForward", // Ctrl+E — 在编辑器组间导航（交还给终端）
        "-workbench.action.terminal.clear", // Ctrl+K — 清除终端（交还给终端）
        "-workbench.action.inspectEditorTokens", // Ctrl+U — 检查编辑器 Token（交还给终端）
        "-workbench.action.goToSymbol", // Ctrl+A — 转到符号（交还给终端）
        "-workbench.action.duplicateSelection", // Ctrl+D — 复制选择（交还给终端）
        "-workbench.action.closeActiveEditor" // Ctrl+W — 关闭当前编辑器（交还给终端）
    ],
    "workbench.colorTheme": "Light 2026", // 颜色主题：Light 2026
    "workbench.iconTheme": "material-icon-theme" // 图标主题：Material Icon Theme
}
```

#### 4.1.3 关键参数说明

| 参数 | 作用 |
|------|------|
| `terminal.integrated.allowChords` | 关闭 VS Code 终端内的和弦键捕获，放行 OpenCode 的 `Ctrl+X` leader 先导键 |
| `terminal.integrated.commandsToSkipShell` | 控制哪些快捷键不发送给终端。前面加 `-` 表示从默认拦截列表中移除，将这些快捷键交还给终端处理 |

配置完成后，在 VS Code 中打开终端，进入项目目录运行 `opencode` 即可正常使用。

## 5. 快捷键配置

### 5.1 为什么需要配置快捷键？

OpenCode 默认按下 `Ctrl+C` 会直接退出 TUI，这在日常使用中很容易误触，导致正在进行的对话中断。通过配置快捷键，可以将退出操作改为其他组合键，避免误触。

### 5.2 推荐配置

在用户目录下创建 OpenCode 的 TUI 配置文件：

- **macOS / Linux**：`~/.config/opencode/tui.json`
- **Windows**：`C:\Users\您的用户名\.config\opencode\tui.json`

如果该文件不存在，直接新建即可。内容如下：

```jsonc
{
    "$schema": "https://opencode.ai/tui.json",
    "keybinds": {
        "app_exit": "ctrl+d,<leader>q"
    }
}
```

配置后，`Ctrl+C` 将不再退出 TUI，而是由终端处理（例如复制文本）。退出 TUI 直接在输入框中输入 `/exit` 命令即可。

> 如果不小心退出了，可以在终端中执行 `opencode -c` 恢复上一个会话。

更多快捷键配置请参考官方文档：[https://opencode.ai/docs/zh-cn/keybinds/](https://opencode.ai/docs/zh-cn/keybinds/)

## 6. 推荐技能合集

### 6.1 什么是技能（Skill）？

**技能（Skill）** 是一组预先编写好的指令文件（Markdown），它告诉 AI 在特定场景下应该按照什么流程、什么标准来工作。可以理解为给 AI 装上"行业专家的操作手册"。

举个例子：你直接让 AI"帮我把需求整理成文档"，它只能凭自己的理解发挥，结果可能五花八门；而如果装上了 `/to-spec` 技能，AI 就会严格按照技能的步骤来执行——先确认需求、再按规范格式生成 Spec、最后发布到 Issue 跟踪器，输出质量稳定可靠。

**为什么要安装技能？**

- **标准化工作流程** — 技能的每一步都是经过验证的最佳实践，AI 按部就班执行，不遗漏关键环节
- **提升输出质量** — 从"自由发挥"变成"按规范执行"，结果更可靠、更可预期
- **沉淀领域经验** — 好的技能把资深工程师的思维方式固化下来，普通开发者也能享受专业级的工作流
- **无需重复交代** — 装好技能后，一句话就能触发完整流程，不用每次给 AI 长篇大论解释怎么做

### 6.2 如何使用技能

在 OpenCode TUI 中有两种方式调用技能：

1. 按 `Ctrl+P` 打开命令面板，选择 **Skills**，即可看到已安装的技能列表并选择使用
2. 直接输入 `/skills` 命令，同样会弹出技能列表供选择

### 6.3 技能集合

#### 6.3.1 mattpocock 技能集合

推荐 [mattpocock/skills](https://github.com/mattpocock/skills) 技能合集，GitHub 上 **198K+ stars**，是目前最受欢迎的 AI 编码代理技能集。这些技能适合真实工程场景，而非简单的"氛围编码"。

##### 6.3.1.1 安装

```bash
npx skills@latest add mattpocock/skills
```

按提示选择需要的技能，**务必选中 `/setup-matt-pocock-skills`**。安装时选择目标代理选择 **Claude Code** 即可，因为列表中可能没有 OpenCode，但 OpenCode 可以读取 Claude Code 的技能文件。

> **重要**：安装完成后，**每个项目都必须运行一次 `/setup-matt-pocock-skills`** 完成该项目的基础配置（选择 Issue 跟踪器、标签等）。在使用该技能集**任何技能之前**，请确保已执行过此命令，否则技能可能因缺少配置而无法正常工作。

##### 6.3.1.2 我常用的技能

###### 6.3.1.2.1 `/grill-with-docs`（最常用）

**作用**：Grilling 面试 + 领域建模。在深度追问你的需求的同时，自动构建项目的领域模型，更新 `CONTEXT.md` 和 ADR 文档。

**使用场景**：每次开始一个新功能或修改前使用。帮你对齐需求、理清术语、记录架构决策。

**使用方式**：在 OpenCode 中直接输入 `/grill-with-docs` 即可启动。

---

##### 6.3.1.3 全部技能一览

###### 6.3.1.3.1 工程类技能（用户主动调用）

| 技能 | 用途 | 使用场景 |
|------|------|----------|
| `/grill-with-docs` | 深度追问 + 领域建模，生成 CONTEXT.md 和 ADR | 每次开始新功能前 |
| `/ask-matt` | 技能路由器，询问当前该用哪个技能 | 不确定该用哪个技能时 |
| `/triage` | 状态机驱动的 Issue 分类处理 | 管理 GitHub Issues |
| `/improve-codebase-architecture` | 扫描代码库，找出架构改进点，生成 HTML 报告 | 代码库变得混乱时，建议每隔几天跑一次 |
| `/setup-matt-pocock-skills` | 初始化项目配置（选择 Issue 跟踪器、标签等） | **每个项目使用任何技能前必须运行一次** |
| `/to-spec` | 将当前对话转为 Spec 并发布到 Issue 跟踪器 | 需求已讨论清楚，需要正式记录下来 |
| `/to-tickets` | 将计划/对话拆分为可追踪的 Ticket | 需要将大任务拆解为小任务 |
| `/implement` | 根据 Spec 或 Ticket 实现功能，驱动 TDD 和 Code Review | 有了明确的 Spec 后开始编码 |
| `/wayfinder` | 规划超大型工作量，通过调查 Ticket 逐步明确路径 | 面对庞大且不确定的项目时 |

###### 6.3.1.3.2 工程类技能（模型自动调用）

| 技能 | 用途 | 使用场景 |
|------|------|----------|
| `/tdd` | 测试驱动开发，红-绿-重构循环 | 需要确保代码质量时 |
| `/diagnosing-bugs` | 结构化 Bug 诊断流程：复现→最小化→假设→修复→回归测试 | 遇到难以复现或复杂的 Bug |
| `/research` | 在高可信度来源中调查问题，生成 Markdown 报告 | 需要研究技术方案或 API 用法 |
| `/prototype` | 构建可丢弃的原型来验证设计思路 | 不确定某个设计是否可行时 |
| `/domain-modeling` | 构建和打磨项目领域模型，挑战术语一致性 | 需要明确领域概念和边界时 |
| `/codebase-design` | 深度模块设计：小接口背后的大行为 | 需要设计或重构模块接口时 |
| `/code-review` | 双轴审查：编码规范 + 是否符合 Spec | 提交代码前进行审查 |
| `/resolving-merge-conflicts` | 逐块解决 Git 合并冲突，保留双方意图 | 遇到合并冲突时 |

###### 6.3.1.3.3 效率类技能（用户主动调用）

| 技能 | 用途 | 使用场景 |
|------|------|----------|
| `/grill-me` | 对计划/设计进行深度追问 | 非代码类的决策需要厘清思路 |
| `/handoff` | 将当前对话压缩为交接文档 | 需要让另一个 AI 继续当前工作 |
| `/teach` | 在多个会话中教授用户新技能 | 想学习某个新概念或技术 |
| `/writing-great-skills` | 编写高质量技能的参考指南 | 想自己编写或修改技能时 |

###### 6.3.1.3.4 效率类技能（模型自动调用）

| 技能 | 用途 | 使用场景 |
|------|------|----------|
| `/grilling` | 对计划/决策进行持续追问，厘清每个分支 | 作为 `/grill-me` 和 `/grill-with-docs` 的底层循环 |

---

##### 6.3.1.4 推荐工作流

1. **开始新功能前** → `/grill-with-docs`（对齐需求 + 构建领域模型）
2. **需求明确后** → `/to-spec` 或 `/to-tickets`（生成 Spec 或 Ticket）
3. **开始编码** → `/implement`（驱动 TDD + Code Review）
4. **遇到 Bug** → `/diagnosing-bugs`（结构化排查）
5. **代码库变混乱** → `/improve-codebase-architecture`（改善架构）
6. **做重大决策** → `/grill-me`（厘清思路）
7. **需要交接** → `/handoff`（生成交接文档）

#### 6.3.2 superpowers 技能集合

待补充（预留章节）

## 7. 推荐配置

### 7.1 Windows 用户：安装 Git 并配置 Shell

OpenCode 默认使用系统终端（Windows 下为 PowerShell），但 PowerShell 对 bash 命令支持不佳，可能导致中文乱码或命令执行失败。

**解决方案**：安装 Git，并在 OpenCode 配置文件中将 Shell 切换为 Git Bash。

#### 步骤 1：安装 Git

下载地址：[https://git-scm.com/downloads/win](https://git-scm.com/downloads/win)

安装时保持默认选项即可，安装完成后 Git Bash 会自动可用。

#### 步骤 2：配置 `"shell": "bash"`

打开 OpenCode 配置文件（`C:\Users\你的用户名\.config\opencode\opencode.jsonc`），添加或修改 `shell` 字段：

```jsonc
{
    "$schema": "https://opencode.ai/config.json",
    "shell": "bash",   // ← 将默认 shell 从 PowerShell 切换为 Git Bash
    "lsp": true,
    // ... 其他配置
}
```

配置后重启 OpenCode，所有命令将通过 Git Bash 执行，中文乱码和命令兼容问题将不再出现。

### 7.2 LSP 配置

LSP（Language Server Protocol，语言服务器协议）为 OpenCode 提供代码智能导航能力——跳转到定义、查找引用、悬停提示等。开启后 OpenCode 能更好地理解代码结构，提升代码修改的准确性。

打开 OpenCode 配置文件（**macOS / Linux**：`~/.config/opencode/opencode.jsonc`，**Windows**：`C:\Users\你的用户名\.config\opencode\opencode.jsonc`），设置 `"lsp": true` 即可启用：

```jsonc
{
    "$schema": "https://opencode.ai/config.json",
    "shell": "bash",
    "lsp": true,   // ← 启用 LSP
    // ... 其他配置
}
```

启用后 OpenCode 会自动检测已安装的语言服务器。TypeScript / JavaScript 内置支持，无需额外安装。其他语言需要手动安装对应的语言服务器，以下是常见语言的安装方式：

| 语言 | 安装命令 | 说明 |
|------|----------|------|
| Python | `pip install pyright` 或 `pip install pylsp` | 推荐 Pyright，性能更好 |
| Go | `go install golang.org/x/tools/gopls@latest` | Go 官方语言服务器 |
| Rust | `rustup component add rust-analyzer` | Rust 官方语言服务器 |
| Lua | `npm install -g lua-language-server` | 需要 Lua 5.1+ |
| C / C++ | `npm install -g clangd` | 需要已安装 clangd |
| Java | 安装 JDK 21+ 后自动启用 | OpenCode 内置 jdtls，无需手动配置；需要 JDK 21+ 运行语言服务器，与项目 JDK 版本无关 |

> **如果系统默认 JDK 版本低于 21**：jdtls 启动时会因版本不足而失败。不需要修改全局的 `JAVA_HOME`（否则项目编译版本会被改变），只需在 OpenCode 配置中指定 jdtls 使用 JDK 21 即可：
>
> ```jsonc
> {
>     "lsp": {
>         "jdtls": {
>             "env": {
>                 "JAVA_HOME": "C:\\Program Files\\Java\\jdk-21的路径"
>             }
>         }
>     }
> }
> ```

配置完成后，在 OpenCode 中运行 `/lsp` 命令即可查看当前已连接的语言服务器状态。

## 8. 常用命令

OpenCode 内置了大量斜杠命令（输入 `/` 即可查看全部），以下三个是我日常使用频率最高的：

### 8.1 `/models` — 切换模型

**作用**：列出当前已配置的所有模型，并可在列表中直接切换。

**使用场景**：
- 当前模型响应变慢或效果不佳时，切换到其他模型试试
- 需要节省 token 费用时，切换为便宜的轻量模型（如 DeepSeek、flash 类模型）
- 处理复杂任务时，切换为推理能力更强的模型

**使用方式**：直接输入 `/models`，在弹出的模型列表中选择即可。

**切换思考模式**：按 `Ctrl+P` 打开命令面板，搜索 **Switch model variant** 可以切换模型的思考强度，一般有 `default`、`high`、`max` 三档可选：

- `default` — 默认思考强度，响应快、消耗少，适合日常简单任务
- `high` — 较强的思考推理，适合复杂编码任务
- `max` — 最大思考强度，推理最充分但耗时和 token 消耗最多，适合疑难问题

> 注意：并非所有模型都支持切换 variant，只有支持思考模式（reasoning）的模型才有该选项。

### 8.2 `/new` — 开启新会话

**作用**：清空当前对话，开启一个全新的会话，与 AI 从零开始交流。

**使用场景**：
- 上一个任务已结束，准备开始新任务时
- 当前对话上下文过长（token 消耗大、响应变慢），需要重新开始
- 对话跑偏了，与其继续纠正，不如直接开新会话重新描述需求

**使用方式**：直接输入 `/new`，确认后当前会话被清空。

> **配合 `/handoff` 技能无缝交接**：如果你安装了 mattpocock 技能合集（见 `6.3.1`），在结束当前任务、准备开新会话前，可以先运行 `/handoff` 技能。它会把当前对话压缩成一份交接文档（Markdown），记录任务背景、已完成的工作和待办事项。开新会话后，在输入框中用 `@` 引用这份交接文档，AI 就能快速了解之前的全部上下文，继续未完成的工作，不会因为 `/new` 而丢失记忆。

> 注意：`/new` 清空的是当前会话的上下文，不会删除已保存的历史会话。误清空后可用 `/sessions` 找回。

### 8.3 `/skills` — 查看技能

**作用**：列出当前项目已安装的全部技能（Skills），可查看说明并直接选择调用。

**使用场景**：
- 安装了技能合集（见 `6.3.1`）后，想查看有哪些技能可用
- 不确定该用什么技能时，浏览列表选择最合适的（例如想整理需求，用 `/grill-with-docs`）
- 确认某个技能是否安装成功

**使用方式**：直接输入 `/skills`，在技能列表中选择要使用的技能即可。也可以用 `Ctrl+P` 打开命令面板搜索 **Skills**。

## 9. 其他技巧

### 9.1 让 AI 始终使用中文回复

**作用**：OpenCode 接入的部分模型（尤其是国外模型）默认会用英文回复。在用户目录创建全局 `AGENTS.md` 文件，可以强制所有项目的 AI 都使用中文交流。

**使用方式**：在 OpenCode 配置目录（**Windows**：`C:\Users\你的用户名\.config\opencode\AGENTS.md`，**macOS / Linux**：`~/.config/opencode/AGENTS.md`）创建 `AGENTS.md` 文件。如果该文件不存在，直接新建即可，内容如下：

```markdown
# 全局强制必须遵守规范

- **全中文输出**：所有回复（含思考、推理、注释及说明）必须使用中文；技术术语可保留英文，但解释与上下文必须为中文。
```

创建后所有项目的 OpenCode 会话都会自动加载该文件，AI 将以中文回复。

> 提示：`AGENTS.md` 是 OpenCode 的全局指令文件，类似项目内的 `AGENTS.md` 但作用范围是全局。如果你只想让某个项目使用中文，把同样的内容放到该项目的 `AGENTS.md` 即可。
### 9.2 关注上下文使用量，避免"降智"

**作用**：提醒你留意当前会话的上下文占用情况，防止对话过长导致 AI 变笨。

在 OpenCode 输入框下方会实时显示当前的**上下文使用量**，格式类似 `125.1K (63%)`——即已用 token 数和占总上下文窗口的百分比。建议养成习惯，时常看一眼这个数值：

- **占用越多，AI 越容易"降智"** — 当上下文接近上限时，大模型的注意力会分散，经常出现忘记需求、逻辑混乱、回答质量明显下降的情况，这是所有大模型共有的特性，不是错觉
- **建议在 60%~70% 之前处理** — 当上下文进度条进入后段时，就该考虑收尾当前工作了，不要等到快满了才行动
- **与轮数有关** — 每多一轮对话、每多一次工具执行结果都会占用上下文，交流的轮数越多，AI 的"记忆负担"越重

**正确的做法**：

1. 当一个任务快完成、上下文也占用较多时，先运行 `/handoff`（见 `8.2`）生成交接文档，把当前进展和待办事项保存下来
2. 用 `/new` 开启新会话，通过 `@` 引用交接文档继续工作
3. 这样既能保住工作成果，又能让 AI 在新会话中保持清醒的状态

> 简单总结：**多开新会话、勤用 handoff，别让单个会话拖太长。**

### 9.3 自动批准权限

OpenCode 对当前项目内的文件操作默认不会有权限询问，但对项目外的操作（如修改系统文件、执行敏感命令）会弹出权限提示。如果你完全信任 OpenCode，可以开启自动批准，避免反复确认：

按 `Ctrl+P` 打开命令面板，搜索 **auto**，找到并开启 **Enable auto-approve permissions** 即可。

开启后所有操作将自动批准，不再弹权限提示。

### 9.4 查看 Token 用量统计

**作用**：查看 OpenCode 所有会话的 token 消耗和费用统计，方便掌握模型用量、控制成本。

**使用方式**：在 TUI 输入框中以 `!` 开头输入命令即可在终端中执行 shell 命令（`!` 是 OpenCode 的命令行模式入口）：

```
!opencode stats
```

常用参数：

| 参数 | 作用 |
|------|------|
| `--days N` | 只看最近 N 天的统计（默认全部） |
| `--models` | 按模型维度查看用量明细 |
| `--tools` | 查看各工具调用次数统计（默认全部显示） |
| `--project` | 只统计某个项目的用量 |

例如只看最近 7 天、按模型统计：

```
!opencode stats --days 7 --models
```

> **更简单的办法**：不想记命令参数的话，可以直接用自然语言让 AI 帮你统计，在输入框中输入：
>
> ```
> 使用 opencode stats 命令给我概要统计一下所有信息
> ```
>
> OpenCode 会自动执行命令并把统计结果整理成易读的概要回复你，无需手动输入任何参数。