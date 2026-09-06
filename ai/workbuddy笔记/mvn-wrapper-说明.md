---
title: "mvn wrapper 脚本说明"
summary: "总结 C:\\Users\\89333\\bin\\mvn 这个 wrapper 脚本的作用、原理与使用约束"
---

# `C:\Users\89333\bin\mvn` 说明

> WorkBuddy Bash 环境（Windows / MINGW64）下的 Maven 包装脚本，解决 `mvn` 在 WorkBuddy Bash 中"找不到主类"的问题。

## 脚本作用一句话版

**在 PATH 上排在真实 mvn 之前的包装器，只在自己这个进程内临时摘掉 `MSYS_NO_PATHCONV` / `MSYS2_ARG_CONV_EXCL` 两个变量，再委托给 PATH 中下一个真正的 mvn，使 Maven 启动脚本拼出的 Unix 风格路径能被 MSYS 正确转换为 Windows 路径，从而让 Windows 原生 `java.exe` 成功加载 classworlds。**

## 背景与触发场景

### 现象
在 WorkBuddy 的 Bash（Windows / Git Bash / MINGW64）中执行 `mvn` 命令时报错：

```
错误: 找不到或无法加载主类 org.codehaus.plexus.classworlds.launcher.Launcher
java.lang.ClassNotFoundException: org.codehaus.plexus.classworlds.launcher.Launcher
```

而同一台机器上用系统自带的 Git Bash 或 PowerShell 跑 `mvn` 却完全正常。

### 根因
WorkBuddy 的 Bash 环境会设置两个变量：

- `MSYS_NO_PATHCONV=1`
- `MSYS2_ARG_CONV_EXCL=*`

这两个变量**禁用了 MSYS 的 Unix→Windows 路径自动转换**。Maven 的启动脚本（POSIX 风格 shell 脚本）内部会把 `M2_HOME` 等拼成 Unix 风格路径（尤其**带空格**的路径，如 `/c/Program Files/...`）传给 Windows 原生 `java.exe`，后者只认 Windows 路径，于是加载失败。

> 注意：这两个变量由 WorkBuddy 在每次命令执行时重新设定，用户侧无法通过 `~/.bashrc` 等方式持久关闭——因为 WorkBuddy Bash 是**非交互式 shell**，不会 source 任何 rc 文件。

## 脚本原理（逐段拆解）

```sh
#!/bin/sh
# WorkBuddy Git Bash 专用包装：
# WorkBuddy 的 Bash 环境设了 MSYS_NO_PATHCONV=1 和 MSYS2_ARG_CONV_EXCL=*，
# 禁用了 MSYS 的 Unix→Windows 路径转换，导致 mvn 启动脚本把带空格的
# Unix 路径原样传给 Windows 原生 java.exe，Java 解析不了而加载不到 classworlds。
# 本脚本先定位 PATH 中下一个真正的 mvn（排除自己），然后去掉这两个变量再调用它。

self_path=$(readlink -f "$0" 2>/dev/null || realpath "$0" 2>/dev/null || echo "$0")

real_mvn=""
old_ifs=$IFS
IFS=':'
for dir in $PATH; do
    candidate="$dir/mvn"
    if [ -f "$candidate" ] && [ -x "$candidate" ]; then
        cand_path=$(readlink -f "$candidate" 2>/dev/null || realpath "$candidate" 2>/dev/null || echo "$candidate")
        if [ "$cand_path" != "$self_path" ]; then
            real_mvn="$candidate"
            break
        fi
    fi
done
IFS=$old_ifs

if [ -z "$real_mvn" ]; then
    echo "Error: could not find real 'mvn' executable in PATH after this wrapper." >&2
    exit 1
fi

exec env -u MSYS_NO_PATHCONV -u MSYS2_ARG_CONV_EXCL "$real_mvn" "$@"
```

### 关键步骤

| 步骤 | 代码 | 作用 |
|------|------|------|
| 1. 定位自己 | `self_path=$(readlink -f "$0" ...)` | 取得本 wrapper 脚本自身的绝对路径，用于后续排除 |
| 2. 遍历 PATH | `for dir in $PATH; do ...` | 按 PATH 顺序逐个目录查找名为 `mvn` 的可执行文件 |
| 3. 排除自己 | `[ "$cand_path" != "$self_path" ]` | 跳过 wrapper 自身，找到"下一个"真正的 mvn |
| 4. 委托执行 | `exec env -u MSYS_NO_PATHCONV -u MSYS2_ARG_CONV_EXCL "$real_mvn" "$@"` | 用 `env -u` 只在子进程内摘掉两个变量，再用 `exec` 替换当前进程调用真实 mvn |

### 设计要点

1. **不写死路径**：wrapper 在 PATH 中动态查找下一个同名可执行文件。Maven 升级、改路径、调整 PATH 顺序都**无需修改 wrapper**。
2. **多版本切换由 PATH 顺序决定**：wrapper 始终委托给 PATH 中排在它后面的第一个真实 mvn。
3. **唯一前提**：wrapper 所在目录（`C:\Users\89333\bin`）必须在真实 Maven `bin` 目录**之前**出现在 PATH 中。
4. **作用域隔离**：`env -u` 只在被 wrapper 的那个 mvn 进程内摘掉两个变量，**绝不修改全局环境**。Docker / Node / Git 等其它命令完全不受影响。

## 验证方法

```bash
which -a mvn          # 第一个应指向 wrapper，第二个指向真实 mvn
mvn -v                # 应正常输出版本信息
```

## 适用范围与安全边界

### 适用（白名单）
老式 POSIX 风格 shell 脚本包装器，内部拼出 Unix 路径并依赖 MSYS 在调用 Windows 原生 exe 时自动翻译路径。已确认：`mvn`（Maven）、`gradle`（Gradle）。

### 禁止套用（黑名单）
现代工具，它们期望参数原样传递、不能被路径转换改写。一旦套用 wrapper 恢复转换反而会破坏它们：

- `docker`（`-v` 挂载的 `:` 分隔符）
- `node` / `npm`
- `git`（refspec 的 `:`）
- 任何传 `key:value`、URL、正则、或已含 Windows 路径（`C:\...`）的参数

### 判断准则
只有当某命令在 WorkBuddy Bash 报"找不到类 / 路径解析失败"、且其本质是"shell 脚本把 Unix 路径传给 Windows 原生 exe"时，才用本 wrapper 机制。若命令本身期望原样传参，**不要**给它加 wrapper。

## 平台适用范围

- **仅 Windows**：本问题只出现在 Windows 上带 MSYS 路径转换层的 POSIX 环境（MINGW64 / Git Bash / Cygwin）。
- **Linux / macOS 无需**：`java` 为原生 Unix 二进制，直接认 `/usr/...`、`/home/...` 等 Unix 路径，且不存在 MSYS 转换层，Maven 开箱即用、无需任何 wrapper。
- **WSL 场景不适用**：WSL 调 Windows exe 等"路径格式错配"属不同机制，不属本 wrapper 范畴。

## 通用技能：workbuddy-msys-path-wrapper

本脚本源自 `workbuddy-msys-path-wrapper` 技能，是其在 `mvn` 命令上的具体落地实例。以下为该技能的完整内容，供理解全貌以及为其它命令（如 `gradle`）制作同类 wrapper 时参考。

### 触发场景

在 WorkBuddy 的 Bash（Windows / Git Bash / MINGW64）中执行某个命令时，该命令本身是一个 shell 脚本，内部会把 Unix 风格路径（尤其**带空格**的路径，如 `/c/Program Files/...`）传给 **Windows 原生 exe**，结果 exe 解析不了路径而报错。典型表现：

- Maven：`错误: 找不到或无法加载主类 org.codehaus.plexus.classworlds.launcher.Launcher` / `java.lang.ClassNotFoundException: org.codehaus.plexus.classworlds.launcher.Launcher`（即使 `mvn` 在系统自带 Git Bash/PowerShell 里正常）。

任何"Bash 脚本拼 Unix 路径 → 调用 Windows 原生 exe"的工具都可能中招（已确认：Maven / `mvn`）。
不受影响的有：curl、git、python、node、npm、pip、`java -version` 等不需要把文件路径传给 Windows exe 的命令。

### 根因

WorkBuddy 的 Bash 环境会设置：

- `MSYS_NO_PATHCONV=1`
- `MSYS2_ARG_CONV_EXCL=*`

这两个变量**禁用了 MSYS 的 Unix→Windows 路径自动转换**。于是 shell 脚本生成的 `/c/Program Files/...` 路径被原样传给 Windows 原生 exe（如 `java.exe`），而后者只认 Windows 路径，于是加载失败。

### 约束（重要）

WorkBuddy Bash 是**非交互式 shell**（`$-` 不含 `i`），**不会 source `~/.bashrc` 或 `~/.bash_profile`**。因此：

- alias / 环境变量 / shell 函数都**不持久**，每条命令都是全新 shell，加在 rc 文件里无效。
- 解决方案必须是**挂在 PATH 上的可执行 wrapper 脚本**，而非 alias。

### 适用对象（白名单）与禁止套用（黑名单）—— 关键安全边界

本技能的机制是**按命令隔离**的：`env -u` 只在被 wrapper 的那个命令进程内摘掉两个变量，**绝不修改全局环境**，因此 Docker / Node / Git 等其它命令完全不受影响（已实测验证：wrapper 跑完后当前 shell 的 `MSYS_NO_PATHCONV` 仍为 `1`）。所以本技能**可以安全地保持通用**，前提是只套用到正确的目标：

- ✅ **白名单（适用）**：老式 POSIX 风格 shell 脚本包装器，它们内部拼出 Unix 路径、并依赖 MSYS 在调用 Windows 原生 exe（如 `java.exe`）时自动翻译路径。已确认：`mvn`（Maven）、`gradle`（Gradle）。
- ❌ **黑名单（禁止套用）**：现代工具，它们**期望参数原样传递、不能被路径转换改写**，一旦套用 wrapper 恢复转换反而会破坏它们。典型：`docker`（`-v` 挂载的 `:` 分隔符）、`node` / `npm`、`git`（refspec 的 `:`），以及任何传 `key:value`、URL、正则、或已含 Windows 路径（`C:\...`）的参数。
- ⚠️ **判断准则**：只有当某命令在 WorkBuddy Bash 报"找不到类 / 路径解析失败"、且其本质是"shell 脚本把 Unix 路径传给 Windows 原生 exe"时，才用本技能。若命令本身期望原样传参，请**不要**给它加 wrapper。（注意根因是 WorkBuddy 默认关掉转换，本技能只是为个别老脚本局部恢复，绝非全局重开。）

### 修复步骤（通用）

**第 1 步（便携性关键）：自动选定 wrapper 的放置目录。**

WorkBuddy Bash 是全新 shell，不会 source rc 文件，所以无法靠改 rc 持久化；必须把 wrapper 放到 PATH 上、且**排在真实命令 `bin` 目录之前**的目录。不同机器 PATH 不同，智能体应自动选择，不要硬编码：

1. 用 `which -a <CMD>` 找到真实命令的目录 `REAL_DIR`（取非 wrapper 的那条）；
2. 遍历当前 PATH，选**第一个**满足「存在于 PATH 中、在 `REAL_DIR` 之前、且当前用户可写」的目录作为 `WRAP_DIR`；
3. 若 `$HOME/bin`（`/c/Users/<用户名>/bin`）已在 PATH 且排在前面，优先用它（Git Bash 通常会自动加入）；
4. 若没有任何合适目录，则在 `$HOME/bin` 创建 wrapper，并提示用户该目录需加入 PATH（或临时用 `export PATH="$HOME/bin:$PATH"` 验证）。

快速校验命令：
```bash
echo "$PATH" | tr ':' '\n' | grep -niE "<命令名>|/bin"
which -a <CMD>
```

**第 2 步：在选定的 `WRAP_DIR` 创建 wrapper 脚本**，把下面模板里的 `<CMD>` 换成实际命令名（如 `mvn`、`gradle`）：

```sh
#!/bin/sh
# 通用 WorkBuddy MSYS 路径转换修复 wrapper（将 <CMD> 替换为实际命令名）
CMD=<CMD>
self_path=$(readlink -f "$0" 2>/dev/null || realpath "$0" 2>/dev/null || echo "$0")

real_bin=""
old_ifs=$IFS
IFS=':'
for dir in $PATH; do
    candidate="$dir/$CMD"
    if [ -f "$candidate" ] && [ -x "$candidate" ]; then
        cand_path=$(readlink -f "$candidate" 2>/dev/null || realpath "$candidate" 2>/dev/null || echo "$candidate")
        if [ "$cand_path" != "$self_path" ]; then
            real_bin="$candidate"
            break
        fi
    fi
done
IFS=$old_ifs

if [ -z "$real_bin" ]; then
    echo "Error: could not find real '$CMD' in PATH after this wrapper." >&2
    exit 1
fi

exec env -u MSYS_NO_PATHCONV -u MSYS2_ARG_CONV_EXCL "$real_bin" "$@"
```

**第 3 步：赋予执行权限：**
```bash
chmod +x /c/Users/<用户名>/bin/<CMD>
```

**第 4 步：验证：**
```bash
which <CMD>   # 应指向 wrapper
<CMD> -v      # 或该命令的版本/诊断参数
```

### 设计要点：为什么不写死路径

wrapper 在 PATH 中查找下一个不是自己（按绝对路径比较）的同名可执行文件，再委托给它。因此：

- 命令升级 / 改路径 / 调整 PATH，都**无需修改 wrapper**；
- 多版本切换由 PATH 顺序决定，wrapper 始终委托给 PATH 中下一个真实命令。

唯一前提：wrapper 所在目录必须在真实命令的 `bin` 目录**之前**出现在 PATH 中。

### 适用范围与本质

- 该问题**与用户是否单独安装 Git Bash 无关**：WorkBuddy 在 Windows 上内置的是 MINGW64 / MSYS2 系 Bash（`MSYSTEM=MINGW64`），且由 WorkBuddy 自身设置 `MSYS_NO_PATHCONV=1` 与 `MSYS2_ARG_CONV_EXCL=*`，用户侧无法关闭这两个变量（每次命令由 WorkBuddy 重新设定）。
- 因此所有解法均为"绕开"而非"根治"。最稳、最通用的是不写死路径的 wrapper。
- **平台适用范围（重要）**：本问题**仅出现在 Windows 上带 MSYS 路径转换层的 POSIX 环境**（MINGW64 / Git Bash / Cygwin）。在 Linux / macOS 上，`java` 为原生 Unix 二进制、直接认 `/usr/...`、`/home/...` 等 Unix 路径，且不存在 MSYS 转换层，Maven 开箱即用、**无需任何 wrapper**。故本技能在 Linux/macOS 的 WorkBuddy 中既不会被触发也无必要；在 WSL 调 Windows exe 等"路径格式错配"场景属不同机制，不属本技能范畴。
