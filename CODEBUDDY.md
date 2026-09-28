# CODEBUDDY.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## 仓库性质

这是一个**个人知识库 / 笔记仓库**（内容以中文为主），不是软件项目。仓库里没有构建系统、没有测试、没有 linter，主体内容是 Markdown 笔记和若干供 AI 编码工具 / 电视直播点播软件消费的配置文件（JSON / M3U / TXT）。

因此本仓库**没有** `build` / `lint` / `test` 这类命令。任何改动都是直接编辑文件并提交，不需要本地编译或校验流程。

## 目录结构

```
note/
├── ai/                      # AI 编码工具的使用笔记与配置示例
│   ├── ClaudeCode笔记/      # Claude Code 相关
│   │   ├── statusline.js            # ⚠️ 仓库内唯一可运行的代码（Claude Code 状态行脚本）
│   │   └── *大模型配置文件示例.md      # 第三方模型（agnes / sensenova 等）的 settings 配置示例
│   ├── opencode笔记/        # OpenCode 使用笔记
│   ├── pi笔记/              # PI 使用笔记
│   ├── workbuddy笔记/       # WorkBuddy 相关（如 mvn-wrapper 说明）
│   └── 环境探测命令.md        # 在 WorkBuddy Bash 里探测各类工具是否可达的命令清单
└── tv/                      # 电视软件 / 直播源 / 点播源
    ├── README.md            # 软件与源的索引（使用 gh-proxy 代理的 GitHub 链接）
    ├── my.m3u               # 直播源播放列表（#EXTM3U 格式）
    ├── *.json               # 点播源配置（fty/fm/og/ys18.* 等）
    └── ys.txt               # 更多点播源
```

### 两个内容域
- **`ai/`**：按工具分子目录组织（`ClaudeCode笔记/`、`opencode笔记/`、`pi笔记/`、`workbuddy笔记/`）。新增某工具的笔记时，沿用「`ai/<工具名>笔记/`」这个命名约定，并放 Markdown 文件。
- **`tv/`**：纯配置/资源，被外部电视软件直接引用。`README.md` 用 `https://gh-proxy.org/https://github.com/89333367/note/...` 形式给出可访问链接，新增源时保持同样的 gh-proxy 前缀。

## 唯一可运行代码：`ai/ClaudeCode笔记/statusline.js`

这是一个**零依赖**的 Node 脚本（仅用 Node 内置模块），作为 Claude Code 的 statusline：从 stdin 读取会话 JSON，输出两行纯文本状态栏。

- 运行（直接喂一段 JSON 测试）：
  ```bash
  echo '{"workspace":{"current_dir":"/c/GitLab/note"},"context_window":{"current_usage":{"input_tokens":100,"cache_read_input_tokens":900}},"cost":{}}' | node ai/ClaudeCode笔记/statusline.js
  ```
- 关键逻辑：上下文占用率优先取 `context_window.current_usage`，缺值时回退到会话 transcript 尾部（`lastUsedFromTranscript`）；API 耗时用 `cost.total_api_duration_ms` 相邻两次渲染做差（`lastRequestDuration`）。
- 修改时注意它依赖 Claude Code stdin 字段名，注释里已标注实测过的字段含义，**不要凭猜测改字段名**。

## 可选的本地校验（非强制）

仓库没有 CI，但提交前可手动确认配置文件没写坏：

```bash
# 校验 tv/ 下任意点播源 JSON 是否合法
node -e "JSON.parse(require('fs').readFileSync('tv/fm.json','utf8')); console.log('ok')"

# 校验直播源 M3U（仅检查文件头是否为合法 playlist）
head -c 20 tv/my.m3u
```

## 提交约定

- 提交信息用中文，动词前缀风格见现有历史（`docs:` 笔记增改、`chore:` 结构整理）。
- 笔记文件用中文命名；`tv/` 的源/软件链接通过 `gh-proxy.org` 代理访问，新增外链沿用该前缀。
