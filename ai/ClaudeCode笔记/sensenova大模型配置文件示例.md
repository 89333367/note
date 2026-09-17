# sensenova 大模型配置文件示例

```json
{
  "attribution": {
    "commit": "",
    "pr": ""
  },
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-vQ6W496EjjICt5i7VnQU7ABxA14gVC4",
    "ANTHROPIC_BASE_URL": "https://token.sensenova.cn",
    "ANTHROPIC_DEFAULT_FABLE_MODEL": "sensenova-6.8-flash-lite",
    "ANTHROPIC_DEFAULT_FABLE_MODEL_NAME": "sensenova-6.8-flash-lite",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "sensenova-6.8-flash-lite",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME": "sensenova-6.8-flash-lite",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "sensenova-6.8-flash-lite",
    "ANTHROPIC_DEFAULT_OPUS_MODEL_NAME": "sensenova-6.8-flash-lite",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "sensenova-6.8-flash-lite",
    "ANTHROPIC_DEFAULT_SONNET_MODEL_NAME": "sensenova-6.8-flash-lite",
    "ANTHROPIC_MODEL": "sensenova-6.8-flash-lite",
    "CLAUDE_CODE_DISABLE_ARTIFACT": "1",
    "CLAUDE_CODE_EFFORT_LEVEL": "max",
    "CLAUDE_CODE_MAX_CONTEXT_TOKENS": "256000",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "64000",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "204800",
    "CLAUDE_CODE_SUBAGENT_MODEL": "sensenova-6.8-flash-lite",
    "DISABLE_AUTOUPDATER": "1"
  },
  "permissions": {
    "defaultMode": "bypassPermissions",
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
    ]
  },
  "skipDangerousModePermissionPrompt": true,
  "statusLine": {
    "command": "node ~/.claude/statusline.js",
    "type": "command"
  }
}
```
