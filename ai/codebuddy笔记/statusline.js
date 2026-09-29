#!/usr/bin/env node
'use strict';

// CodeBuddy Code 状态栏脚本
// 通过 stdin 接收 Status 事件的 JSON
// 依据 CodeBuddy 实际传入的结构：
//   context_window: { context_window_size, used_percentage, remaining_percentage,
//                     total_input_tokens, total_output_tokens,
//                     current_usage: { input_tokens, output_tokens,
//                                      cache_creation_input_tokens, cache_read_input_tokens } }
// 输出单行文本到 stdout 作为状态栏内容

const { execSync } = require('child_process');
const fs = require('fs');

// ANSI 颜色
const C = {
  reset: '\x1b[0m',
  green: '\x1b[0;32m',
  yellow: '\x1b[1;33m',
  cyan: '\x1b[0;36m',
  blue: '\x1b[0;34m',
  red: '\x1b[0;31m',
  dim: '\x1b[2m',
};

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(''));
  });
}

function getGitBranch(cwd) {
  try {
    const out = execSync('git branch --show-current', {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 2000,
    })
      .trim()
      .replace(/\n/g, '');
    if (!out) return '';
    let dirty = '';
    try {
      const status = execSync('git status --porcelain', {
        cwd,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
        timeout: 2000,
      }).trim();
      if (status) dirty = '*';
    } catch (_) {}
    return out + dirty;
  } catch (_) {
    return '';
  }
}

// 思考状态代理：读取 settings.json 的 reasoningEffort 作为"思考级别"
// 注意：这是静态配置代理，非运行时实时开关状态
function getThinking() {
  try {
    const s = JSON.parse(fs.readFileSync('C:/Users/89333/.codebuddy/settings.json', 'utf8'));
    const lvl = s.reasoningEffort;
    if (!lvl || lvl === 'none' || lvl === 'off') {
      return `${C.dim}思考：关${C.reset}`;
    }
    return `${C.yellow}思考:(${lvl})${C.reset}`;
  } catch (_) {
    return '';
  }
}

function truncatePath(p) {
  if (!p) return '';
  const parts = p.split(/[/\\]/).filter(Boolean);
  if (parts.length <= 2) return parts.join('/');
  return '…/' + parts.slice(-2).join('/');
}

// 从 transcript 兜底计算当前上下文 token
function tokensFromTranscript(transcriptPath) {
  try {
    if (!transcriptPath || !fs.existsSync(transcriptPath)) return 0;
    const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
    let last = 0;
    for (const l of lines) {
      if (!l) continue;
      try {
        const o = JSON.parse(l);
        const u = o && o.message && o.message.usage;
        if (u && typeof u.input_tokens === 'number') {
          const t =
            (u.input_tokens || 0) +
            (u.cache_creation_input_tokens || 0) +
            (u.cache_read_input_tokens || 0);
          if (t > 0) last = t;
        }
      } catch (_) {}
    }
    return last;
  } catch (_) {
    return 0;
  }
}

(async () => {
  const raw = await readStdin();

  // —— 调试：把真实 stdin 原样写入文件，便于核对字段（确认后可移除） ——
  try {
    fs.writeFileSync('C:/Users/89333/.codebuddy/statusline-debug.json', raw || '(empty)', 'utf8');
  } catch (_) {}

  let data = {};
  try {
    data = JSON.parse(raw);
  } catch (_) {}

  const ws = data.workspace || {};
  const cwd = ws.current_dir || data.cwd || process.cwd();
  const projectDir = ws.project_dir || cwd;
  const model = (data.model && (data.model.display_name || data.model.id)) || '';

  const pathStr = projectDir;
  const branch = getGitBranch(cwd);
  const branchStr = branch ? `${C.green}🌿 ${branch}${C.reset}` : '';

  // —— token / 上下文（动态取自 CodeBuddy 传入的 context_window 对象）——
  const cw = data.context_window || {};
  const windowSize = Number(cw.context_window_size) || 0;
  const cu = cw.current_usage || {};
  let usedTokens =
    (Number(cu.input_tokens) || 0) +
    (Number(cu.cache_creation_input_tokens) || 0) +
    (Number(cu.cache_read_input_tokens) || 0);

  // 若 current_usage 缺失，从 transcript 兜底
  if (!usedTokens) {
    usedTokens = tokensFromTranscript(data.transcript_path);
  }

  let pct = Number(cw.used_percentage);
  if (!Number.isFinite(pct)) {
    pct = windowSize > 0 && usedTokens > 0 ? (usedTokens / windowSize) * 100 : null;
  }

  let tokenStr = '';
  if (usedTokens > 0) {
    tokenStr = `${C.cyan}🔢 ${usedTokens.toLocaleString()}${C.reset}`;
    if (windowSize > 0) {
      const pctStr = pct != null ? `${pct.toFixed(1)}%` : '?';
      tokenStr += `${C.dim}/${windowSize.toLocaleString()}(${pctStr})${C.reset}`;
    }
    // 缓存命中率（当前窗口）：cache_read / (input + cache_creation + cache_read)
    const cacheRead = Number(cu.cache_read_input_tokens) || 0;
    const cacheCreation = Number(cu.cache_creation_input_tokens) || 0;
    const freshInput = Number(cu.input_tokens) || 0;
    const cacheTotal = cacheRead + cacheCreation + freshInput;
    if (cacheRead > 0) {
      const hitPct = (cacheRead / cacheTotal) * 100;
      tokenStr += `${C.green} ♻️ ${hitPct.toFixed(0)}%${C.reset}`;
    }
  }

  const modelStr = model ? `${C.blue}[${model}]${C.reset}` : '';
  const brainStr = `${C.yellow}🧠${C.reset}`;
  const segs = [`${C.green}📁 ${pathStr}${C.reset}`, branchStr, tokenStr, brainStr, modelStr, getThinking()].filter(Boolean);

  process.stdout.write(segs.join('  ') + '\n');
})();
