#!/usr/bin/env node
// Cross-platform Claude Code status line.
// Reads the session JSON from stdin, prints a two-line plain-text status bar.
// No dependencies (Node built-ins only). Works on macOS and Windows (Git Bash / sh).
//
// Line 1: git branch · project path
// Line 2: ctx used/total (fill %) · ↑prompt (R cached hit % | W write) ↓output · api time · effort

const { execSync } = require('child_process');
const fs = require('fs');

// ---- ANSI colors (mid-luminance, legible on both black & white themes) ----
const C = {
  dim: '\x1b[2m',
  reset: '\x1b[0m',
};
const orange = '\x1b[38;5;208m'; // git branch
const green = '\x1b[38;5;34m'; // context
const blue = '\x1b[38;5;33m'; // cache
const pink = '\x1b[38;5;213m'; // effort fallback (unknown level)

// Effort levels as a "temperature" scale: stronger thinking = hotter color.
// All picked mid-luminance, distinguishable from branch/orange, ctx/green
// and cache/blue on both light & dark themes.
const effortColors = {
  low: '\x1b[38;5;75m', // indigo
  medium: '\x1b[38;5;118m', // light green
  high: '\x1b[38;5;178m', // amber
  xhigh: '\x1b[38;5;196m', // red
  max: '\x1b[38;5;196m', // red
};

// ---- Read stdin JSON ----
function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
}

// 1234 -> "1k", 31420 -> "31.4k", 1000000 -> "1M"
function fmtTokens(n) {
  if (n == null || isNaN(n)) return '';
  if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 ? 1 : 0).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 ? 1 : 0).replace(/\.0$/, '') + 'k';
  return String(n);
}

// 15123 -> "15.1s", 800 -> "0.8s"
function fmtSeconds(ms) {
  return (ms / 1000).toFixed(1).replace(/\.0$/, '') + 's';
}

// ~/.claude as a forward-slash path, or '' if HOME is unset. Used for the
// settings lookup and the duration state file.
const claudeHome = (() => {
  const h =
    process.env.HOMEDRIVE && process.env.HOMEPATH
      ? [process.env.HOMEDRIVE, process.env.HOMEPATH.replace(/\\/g, '/')].join('')
      : process.env.HOME
        ? process.env.HOME.replace(/\\/g, '/')
        : '';
  return h ? `${h}/.claude` : '';
})();

function gitBranch(cwd) {
  try {
    const out = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: cwd || process.cwd(),
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 1500,
      windowsHide: true,
    })
      .toString()
      .trim();
    return out && out !== 'HEAD' ? out : '';
  } catch {
    return '';
  }
}

// Read the tail `bytes` of a file as text; drop a possibly-truncated first
// line when the tail doesn't start at 0. Returns '' on any failure.
function readTail(filePath, bytes) {
  let text = '';
  let start = 0;
  try {
    const fd = fs.openSync(filePath, 'r');
    try {
      const size = fs.fstatSync(fd).size;
      start = Math.max(0, size - bytes);
      const buf = Buffer.alloc(size - start);
      fs.readSync(fd, buf, 0, size - start, start);
      text = buf.toString('utf8');
    } finally {
      fs.closeSync(fd);
    }
  } catch {
    return '';
  }
  if (start > 0) {
    const nl = text.indexOf('\n');
    if (nl !== -1) text = text.slice(nl + 1);
  }
  return text;
}

// Prompt size for one usage object.
//
// The local proxy always reports Anthropic's disjoint convention: input_tokens
// is ONLY the uncached tail, so the cached prefix has to be added back. The
// whole prompt is input + cache_creation + cache_read.
//
// Measured, not assumed. A compact boundary records preTokens — CC's own count
// of the prompt at that moment — next to the last assistant row just before it.
// Across 18 boundaries in three projects (2026-09-14..15):
//
//   disjoint   input + cache_creation + cache_read    -5.7% .. -0.0%
//   inclusive  input + cache_creation                 -47.7% .. -50.7% (all 18)
//
// e.g. pre=176291, in=91073, cr=81920 ->  91073+81920 = 172993 (1.9% low)
//                                                91073          (48%  low)
//
// So CC sums all three, and anything meant to predict a compact must too.
//
// The old discriminator (input_tokens >= cache_read -> inclusive) is refuted by
// the data: disjoint rows reach cache_read/input of 0.990, and the rows it
// called inclusive are disjoint as well — the boundary at pre=492876 with
// in=246965, cr=245760 is disjoint to within 0.0%, which the old rule reported
// as 246965, 49% low. No ratio separates the two, because this is a property of
// the proxy, not of the row; there is nothing left to guess per-row.
function promptTokens(u) {
  return (
    (u.input_tokens || 0) +
    (u.cache_creation_input_tokens || 0) +
    (u.cache_read_input_tokens || 0) +
    (u.output_tokens || 0)
  );
}

// Input half of promptTokens: the prompt without its output. cache_read is not
// a subset of input here, so it must be added back to reach the whole prompt.
function promptInputTokens(u) {
  return (
    (u.input_tokens || 0) +
    (u.cache_creation_input_tokens || 0) +
    (u.cache_read_input_tokens || 0)
  );
}

// Last real context fill from the transcript: largest prompt size across
// main-chain assistant lines (message.usage). Skips sidechains and zero
// usage. Used as fallback when CC's stdin counters are transiently empty.
function lastUsedFromTranscript(transcriptPath, tailBytes = 512 * 1024) {
  const text = readTail(transcriptPath, tailBytes);
  if (!text) return 0;
  let max = 0;
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    // A compaction rewrites the conversation. Anything earlier in this tail
    // describes the pre-compaction prompt, so drop the high-water mark.
    if (line.includes('"type":"summary"')) {
      max = 0;
      continue;
    }
    // Cheap skip: user/tool_result/attachment lines are the bulk of the file
    // and never carry a usage object.
    if (!line.includes('"usage"')) continue;
    let o;
    try {
      o = JSON.parse(line);
    } catch {
      continue;
    }
    if (o?.type !== 'assistant' || o.isSidechain) continue;
    const us = o.message?.usage;
    if (!us) continue;
    const v = promptTokens(us);
    if (v > max) max = v;
  }
  return max;
}

// Last completed request's API time, in ms. CC's stdin only carries the
// session-CUMULATIVE total (cost.total_api_duration_ms), so a per-turn figure is
// a delta between consecutive renders. That counter only advances when a request
// finishes, so the render right after a completion sees the whole jump and every
// later render sees 0 — hold the nonzero value until the next one replaces it
// instead of flickering 15.1s -> 0s.
//
// State is keyed by session_id: the counter resets to 0 in a fresh session, so a
// stale absolute value from a previous session would make every delta negative
// and block this bar permanently. Each render writes a small JSON file, which
// matters little given gitBranch already pays a full execSync per render.
//
// Time-to-first-token deliberately absent: CC exposes no per-request TTFT and the
// transcript stamps only when a message was stored, not when its first token
// arrived. Only the proxy observes it, so there is nothing local to reconstruct.
function lastRequestDuration(input, statePath) {
  const cur = input?.cost?.total_api_duration_ms;
  const sid = input?.session_id;
  if (!Number.isFinite(cur) || !sid || !statePath) return null;

  let prev = null;
  try {
    prev = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch {
    /* first render in a session — nothing to delta against */
  }

  if (!prev || prev.sid !== sid || !Number.isFinite(prev.apiMs)) {
    try {
      fs.writeFileSync(statePath, JSON.stringify({ sid, apiMs: cur, lastDelta: null }));
    } catch {
      /* statusline must never fail a render over its own state */
    }
    return null;
  }

  const delta = cur - prev.apiMs;
  let lastDelta = prev.lastDelta ?? null;
  // >=0.5s: a sub-second request is noise next to a 40k-token prompt.
  // <=10min: past that a single request is a stall, not a duration worth showing.
  if (delta >= 500 && delta <= 600000) lastDelta = delta;
  try {
    fs.writeFileSync(statePath, JSON.stringify({ sid, apiMs: cur, lastDelta }));
  } catch {
    /* keep the bar alive even if the write fails */
  }
  return lastDelta;
}

// statusline process doesn't inherit it. NaN on any failure.
//
// NOTE this variable is NOT CC's auto-compact lever. CC computes the compact
// threshold off the window from CLAUDE_CODE_AUTO_COMPACT_WINDOW (else the
// startup model's window); MAX_CONTEXT_TOKENS is what CC *reports* as the
// context window for an unknown model. Setting it does not change when
// auto-compact fires.
function readMaxContextTokensFromSettings() {
  const paths = [
    `${process.env.HOME ? process.env.HOME.replace(/\\/g, '/') : ''}/.claude/settings.json`,
  ];
  if (process.env.HOMEDRIVE && process.env.HOMEPATH) {
    paths.unshift(
      [process.env.HOMEDRIVE, process.env.HOMEPATH.replace(/\\/g, '/'), '.claude/settings.json'].join('/')
    );
  }
  for (const p of paths) {
    if (!p || !p.includes('/.claude/')) continue;
    try {
      const s = JSON.parse(fs.readFileSync(p, 'utf8'));
      const v = Number(s?.env?.CLAUDE_CODE_MAX_CONTEXT_TOKENS);
      if (Number.isFinite(v) && v > 0) return v;
    } catch {
      /* keep looking */
    }
  }
  return NaN;
}

function main() {
  readStdin().then((input) => {
    // (2) project path — normalize backslashes for clean display
    const rawCwd =
      input?.workspace?.current_dir || input?.workspace?.project_dir || input?.cwd || '';
    const cwd = rawCwd.replace(/\\/g, '/');

    // (1) git branch
    const branch = gitBranch(cwd);

    // Context tokens (field names verified against real CC captures):
    // - current_usage: live breakdown of the last request (input/output/cache chunks)
    // - total_input_tokens/total_output_tokens: sizes of the last request's prompt/response
    const ctx = input?.context_window || {};
    const u = ctx.current_usage || {};

    // Window size: prefer the configured CLAUDE_CODE_MAX_CONTEXT_TOKENS (env first,
    // then settings.json's env block in case the statusline process doesn't
    // inherit it); else CC's value.
    let total = ctx.context_window_size;
    let totalOverride = Number(process.env.CLAUDE_CODE_MAX_CONTEXT_TOKENS);
    if (!Number.isFinite(totalOverride) || totalOverride <= 0) {
      totalOverride = readMaxContextTokensFromSettings();
    }
    if (Number.isFinite(totalOverride) && totalOverride > 0) total = totalOverride;

    // Total context fill (the compact signal): the live current_usage, with
    // fallbacks while a response streams and CC's counters are transiently 0.
    // Sources in order:
    //   current_usage — same three-bucket split as the transcript rows.
    //   transcript — the last real request, same split.
    //   total_input_tokens — last resort and lossy: it is a session cumulative,
    //     not one prompt, so it can exceed the window on a long-running session.
    //     The `<= total` guard admits it only while it still fits.
    let used = promptTokens(u);
    if (!used) used = lastUsedFromTranscript(input?.transcript_path);
    if (!used && total) {
      const raw = (ctx.total_input_tokens || 0) + (ctx.total_output_tokens || 0);
      if (raw > 0 && raw <= total) used = raw;
    }
    // Cosmetic bound: a prompt larger than the window never renders here anyway,
    // and clamping keeps the bar from ever printing an impossible %. Left in as
    // a last line of defense against a counter that disagrees with CC's own.
    if (used > total) used = total;

    // This turn: the last request's prompt vs. the tokens its response produced.
    // Show the prompt whole, with the cached portion annotated rather than as
    // a second arrow — cache_read is a real bucket of the prompt, not part of
    // the raw input, so two additive arrows would double-count it. The
    // three-bucket sum matches CC's own preTokens at compact boundaries (the
    // data above), so the two can be cross-checked number for number.
    const turnIn = promptInputTokens(u);
    const turnCached = u.cache_read_input_tokens || 0;
    const turnCreate = u.cache_creation_input_tokens || 0;
    const turnOut =
      ctx.total_output_tokens != null ? ctx.total_output_tokens : u.output_tokens || 0;

    // cache hit rate % — computed from the buckets, not CC's prompt_cache.hit_ratio.
    // CC's field can't be reconstructed from the transcript and didn't match
    // read/input on measured rows (it read 24% where the buckets say 38%); ours
    // is checkable against the proxy's own cached column.
    // The denominator is the whole prompt, input+read — input alone is just the
    // uncached tail, and read/input reports 90% where the true cached share is
    // 47% (the 81920/172993 row above).
    const _in = u.input_tokens || 0;
    const _rd = u.cache_read_input_tokens || 0;
    const cachePct =
      _in || _rd ? Math.round((_rd / (_in + _rd)) * 100) : null;

    // This turn's API time — a delta off CC's session-cumulative counter.
    const durMs = lastRequestDuration(input, `${claudeHome}/.statusline-duration.json`);
    const dur = durMs ? fmtSeconds(durMs) : '';

    // thinking level — effort only makes sense while thinking is enabled
    const effort = input?.effort?.level || '';
    const thinkingOff = input?.thinking?.enabled === false;

    const sep = ` ${C.dim}·${C.reset} `;

    // Line 1: git branch · project path
    const l1 = [];
    if (branch) l1.push(`${orange}⎇ ${branch}${C.reset}`);
    if (cwd) l1.push(`${C.dim}${cwd}${C.reset}`);

    // Line 2: ctx used/total (fill %) · ↑this-turn prompt (R cached hit % | W write) ↓output · api time · effort
    const l2 = [];
    // Percentage consistent with the number we actually show. If a `used`
    // figure is displayed, derive % from that same figure (the transcript
    // backfill can legitimately differ from CC's own counter, so don't mix
    // the two). Only when no `used` figure is shown (transient 0 during
    // streaming, nothing to backfill) do we fall back to CC's used_percentage.
    let fillPct;
    if (used > 0 && total) {
      fillPct = Math.round((used / total) * 100);
    } else if (ctx.used_percentage != null) {
      // Same bound as `used`: CC's own percentage comes from the same bucket
      // counters, so it can overshoot 100 on an inclusive-counting proxy.
      fillPct = Math.min(Math.round(ctx.used_percentage), 100);
    }
    const fill =
      used > 0
        ? total
          ? `ctx ${fmtTokens(used)}/${fmtTokens(total)} (${fillPct}%)`
          : `ctx ${fmtTokens(used)}`
        : fillPct != null
          ? `ctx ${fmtTokens(total)} (${fillPct}%)`
          : total
            ? `ctx ${fmtTokens(total)}`
            : '';
    if (fill) l2.push(`${green}${fill}${C.reset}`);
    if (turnIn || turnOut) {
      // Cache ratio and absolute live in ONE annotation directly after ↑: they
      // describe that number, so keep them adjacent. A standalone `cache NN%`
      // between ctx and ↑ pointed at ↑ while sitting next to ctx, and split the
      // same quantity (73.7k / 89%) across two places in the bar.
      const up = `${C.dim}↑${fmtTokens(turnIn)}`;
      const hit =
        turnCached
          ? `${blue} (R${fmtTokens(turnCached)} ${cachePct}%)`
          : turnCreate
            // read === 0 with creation > 0 is a cold cache write — the prefix was
            // just stored, nothing was served. Worth showing: creation is billed
            // at the cache-write rate and the next turn is what gets the 0.1x read.
            ? `${blue} (W${fmtTokens(turnCreate)})`
            : '';
      const down = `${C.dim} ↓${fmtTokens(turnOut)}`;
      l2.push(`${up}${hit}${C.reset}${down}${C.reset}`);
    }
    // Independent of ↑/↓: the counters can be transiently 0 mid-stream while a
    // request has already completed, and duration is worth keeping then.
    if (dur) l2.push(`${C.dim}${dur}${C.reset}`);
    if (thinkingOff) {
      l2.push(`${C.dim}effort off${C.reset}`);
    } else if (effort) {
      const c = effortColors[effort.toLowerCase()] || pink; // unknown level -> fallback
      l2.push(`${c}effort ${effort}${C.reset}`);
    }

    const lines = [];
    if (l1.length) lines.push(l1.join(sep));
    if (l2.length) lines.push(l2.join(sep));
    process.stdout.write(lines.join('\n') + '\n');
  });
}

main();
