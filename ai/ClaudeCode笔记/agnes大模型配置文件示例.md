# agnes 大模型配置文件示例

```json
{
  "attribution": {
    "commit": "",
    "pr": ""
  },
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "wk-WKTSaKSnl4Mv0zXiAUBNLJ4AqmU8pRq0eATBKpd0eDWwUKI",
    "ANTHROPIC_BASE_URL": "https://api.agnes-ai.cn/v1",
    "ANTHROPIC_DEFAULT_FABLE_MODEL": "agnes-3.0-flash",
    "ANTHROPIC_DEFAULT_FABLE_MODEL_NAME": "agnes-3.0-flash",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "agnes-3.0-flash",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME": "agnes-3.0-flash",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "agnes-3.0-flash",
    "ANTHROPIC_DEFAULT_OPUS_MODEL_NAME": "agnes-3.0-flash",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "agnes-3.0-flash",
    "ANTHROPIC_DEFAULT_SONNET_MODEL_NAME": "agnes-3.0-flash",
    "ANTHROPIC_MODEL": "agnes-3.0-flash",
    "CLAUDE_CODE_DISABLE_ARTIFACT": "1",
    "CLAUDE_CODE_EFFORT_LEVEL": "max",
    "CLAUDE_CODE_MAX_CONTEXT_TOKENS": "512000",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "64000",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "204800",
    "CLAUDE_CODE_SUBAGENT_MODEL": "agnes-3.0-flash",
    "DISABLE_AUTOUPDATER": "1"
  },
  "permissions": {
    "deny": [
      "WebFetch",
      "WebSearch",
      "Bash(rm -rf /)",
      "Bash(rm -rf /*)",
      "Bash(rm -fr /)",
      "Bash(rm -fr /*)",
      "Bash(rm -Rf /)",
      "Bash(rm -Rf /*)",
      "Bash(rm -fR /)",
      "Bash(rm -fR /*)",
      "Bash(rm -rf ~)",
      "Bash(rm -rf ~/*)",
      "Bash(rm -fr ~/*)",
      "Bash(rmdir /)",
      "Bash(mkfs*)",
      "Bash(dd *of=/dev/*)"
    ],
    "defaultMode": "bypassPermissions"
  },
  "skipDangerousModePermissionPrompt": true,
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/statusline.js"
  }
}
```
