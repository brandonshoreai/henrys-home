---
title: "Henry's Full Setup — How Everything Works"
category: "System"
summary: "Complete technical guide to replicating the Henry AI agent system — hardware, OpenClaw config, multi-agent architecture, Docker sandbox, elevated access, messaging, memory, skills, watchdog, and security model."
order: 1
createdAt: "2026-02-12"
---

# Henry's Full Setup — How Everything Works

A complete technical guide to how Brandon's AI agent system (Henry) is set up on OpenClaw. Written so someone can replicate the architecture for their own agent.

---

## Table of Contents

1. [Overview](#overview)
2. [Hardware](#hardware)
3. [Core Stack](#core-stack)
4. [OpenClaw Configuration](#openclaw-configuration)
5. [Agent Architecture](#agent-architecture)
6. [Sandbox & Docker](#sandbox--docker)
7. [Elevated Access (Host Commands)](#elevated-access-host-commands)
8. [Messaging Channels](#messaging-channels)
9. [Memory System](#memory-system)
10. [Skills & Tools](#skills--tools)
11. [Self-Healing (Watchdog)](#self-healing-watchdog)
12. [Services & Infrastructure](#services--infrastructure)
13. [Security Model](#security-model)
14. [Key File Paths](#key-file-paths)
15. [Replication Checklist](#replication-checklist)

---

## Overview

Henry is a **multi-agent AI system** running on OpenClaw. The main agent ("Henry") acts as CEO/orchestrator, with specialist agents for marketing, content, newsletters, coding, academic work, and planning. All agents run in Docker sandboxes but can execute commands on the host via "elevated access." Communication happens over iMessage (BlueBubbles) and Telegram.

**What Henry can do:**
- Send/receive iMessages and Telegram messages
- Send/read email (Gmail via `gog` CLI)
- Search the web, fetch URLs
- Read/write files on the host filesystem
- Run shell commands on the host (elevated)
- Manage GitHub repos (gh CLI, authenticated)
- Schedule cron jobs (`openclaw cron`)
- Spawn sub-agents for parallel work
- Maintain a persistent knowledge graph and memory system
- Generate images (nano-banana / Gemini)
- Manage Apple Notes and Reminders
- Monitor RSS feeds
- Run coding agents (Claude Code, Codex)

---

## Hardware

- **Mac Mini M4** (always-on, 24/7)
- macOS 15.x (Sequoia), ARM64
- Node.js v22.22.0
- Python 3.14 (Homebrew) + Python 3.9 (Xcode CommandLineTools)
- Docker Desktop for Mac
- Tailscale for remote access (IP: `100.119.114.113`)

---

## Core Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| OpenClaw | 2026.2.6-3 | Agent framework / gateway |
| Docker | Desktop for Mac | Sandbox containers |
| BlueBubbles | Server on Mac | iMessage bridge |
| Telegram Bot API | Multiple bots | Telegram messaging |
| Node.js | 22.22.0 | OpenClaw runtime |
| Python | 3.14 (brew) | Bot scripts, tools |
| Homebrew | Latest | Package management |

---

## OpenClaw Configuration

Config lives at: `~/.openclaw/openclaw.json`

### Gateway

```json
{
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "<generated-token>"
    }
  }
}
```

The gateway runs as a **macOS LaunchAgent** (`ai.openclaw.gateway`) so it auto-starts on boot and stays alive:

```xml
<!-- ~/Library/LaunchAgents/ai.openclaw.gateway.plist -->
<key>Label</key>
<string>ai.openclaw.gateway</string>
<key>RunAtLoad</key>
<true/>
<key>KeepAlive</key>
<true/>
<key>ProgramArguments</key>
<array>
  <string>/Users/brandonai/.openclaw/scripts/gateway-wrapper.sh</string>
  <string>gateway</string>
  <string>--port</string>
  <string>18789</string>
</array>
```

### Authentication

Uses **Claude Max token** (OAuth), not an API key:

```json
{
  "auth": {
    "profiles": {
      "anthropic:claude-max-token": {
        "provider": "anthropic",
        "mode": "token"
      }
    }
  }
}
```

The OAuth token is stored in `~/.openclaw/.env.secrets` as `CLAUDE_CODE_OAUTH_TOKEN`.

---

## Agent Architecture

Henry runs a **multi-agent setup** with 7 agents, each with their own workspace, identity, and Telegram bot:

| Agent | ID | Model | Role | Telegram Bot |
|-------|-----|-------|------|-------------|
| **Henry** | `main` | claude-opus-4-6 | CEO / orchestrator | @Henrytheceobot |
| **Samantha** | `marketing` | claude-sonnet-4-5 | Marketing strategist | @Samanthathemarketingbot |
| **Dan** | `content` | claude-sonnet-4-5 | Content creator | @Danthecontentbot |
| **Ryan** | `newsletter` | claude-sonnet-4-5 | Newsletter writer | @Ryanthenewsbot |
| **Spencer** | `coder` | claude-sonnet-4-5 | Software engineer | @Spencerthecodingbot |
| **Perfect Student** | `student` | claude-sonnet-4-5 | Academic coursework | (no bot) |
| **Archie** | `planner` | claude-opus-4-6 | Project planning | @ArchieBot |

### Agent Config Structure

Each agent in `openclaw.json` has:

```json
{
  "id": "main",
  "name": "Henry",
  "workspace": "/Users/brandonai/clawd",
  "identity": {
    "name": "Henry",
    "theme": "CEO and strategic advisor",
    "emoji": "🦞"
  },
  "tools": {
    "elevated": {
      "enabled": true,
      "allowFrom": {
        "bluebubbles": ["+15163989117"],
        "telegram": ["tg:8586188910"]
      }
    }
  }
}
```

### Agent Routing (Bindings)

Bindings tell OpenClaw which agent handles which messages:

```json
{
  "bindings": [
    { "agentId": "main", "match": { "channel": "bluebubbles" } },
    { "agentId": "main", "match": { "channel": "telegram", "accountId": "henry" } },
    { "agentId": "marketing", "match": { "channel": "telegram", "accountId": "marketing" } },
    { "agentId": "planner", "match": { "channel": "telegram", "accountId": "planner" } }
  ]
}
```

- All iMessage traffic → Henry
- Each Telegram bot → its respective agent
- Agents can message each other via `sessions_send`

---

## Sandbox & Docker

All agents run in **Docker containers** (sandboxed). This is the core security model.

### Docker Configuration

```json
{
  "sandbox": {
    "mode": "all",
    "workspaceAccess": "rw",
    "scope": "session",
    "docker": {
      "image": "74eed20979ee",
      "readOnlyRoot": true,
      "network": "bridge",
      "user": "1000:1000",
      "binds": [
        "/opt/homebrew/lib/node_modules/openclaw/docs:/opt/homebrew/lib/node_modules/openclaw/docs:ro",
        "/Users/brandonai/life:/Users/brandonai/life:rw"
      ]
    }
  }
}
```

**Key points:**
- `mode: "all"` — all exec commands run in the sandbox by default
- `readOnlyRoot: true` — can't modify the container filesystem
- `network: "bridge"` — containers have internet access
- `workspaceAccess: "rw"` — can read/write the agent's workspace
- `binds` — mount specific host directories into the container
- `scope: "session"` — each session gets its own container

### What the sandbox CAN do:
- Read/write files in the agent's workspace
- Access the internet (web search, API calls)
- Run Python, Node, shell commands within the container
- Read shared knowledge graph (`~/life/`)

### What the sandbox CANNOT do:
- Access the host filesystem outside mounted paths
- Run `sudo` or escalate privileges
- Access other containers directly
- Modify system settings

### Henry's Extra Mounts (CEO View)

Henry gets read-only access to all other agent workspaces for oversight:

```json
"binds": [
  "/Users/brandonai/.openclaw/workspace-marketing:/mnt/agent-workspaces/marketing:ro",
  "/Users/brandonai/.openclaw/workspace-content:/mnt/agent-workspaces/content:ro",
  "/Users/brandonai/.openclaw/workspace-newsletter:/mnt/agent-workspaces/newsletter:ro",
  "/Users/brandonai/.openclaw/workspace-coder:/mnt/agent-workspaces/coder:ro",
  "/Users/brandonai/.openclaw/openclaw.json:/mnt/system/openclaw.json:ro",
  "/Users/brandonai/.openclaw/logs:/mnt/system/logs:ro"
]
```

---

## Elevated Access (Host Commands)

This is the key feature that lets the sandboxed agent execute commands **on the host Mac**.

### How It Works

When the agent uses `exec` with `host: "gateway"`, the command runs on the actual Mac Mini, not in Docker. This is gated by the `elevated` config:

```json
{
  "tools": {
    "elevated": {
      "enabled": true,
      "allowFrom": {
        "bluebubbles": ["+15163989117"],
        "telegram": ["tg:8586188910"]
      }
    }
  }
}
```

**`allowFrom`** restricts which users can trigger elevated commands. Only messages from the specified phone number / Telegram ID are allowed.

### Elevated Levels

Set per-agent with `elevatedDefault`:

| Level | Behavior |
|-------|----------|
| `off` | No elevated access |
| `ask` | Agent asks for approval before each command |
| `on` | Auto-approves safe commands, asks for risky ones |
| `full` | Auto-approves everything (what Henry uses) |

Henry uses `"elevatedDefault": "full"` — he can run any command on the host without asking. This is because Brandon trusts the agent and wants maximum autonomy.

### Example: Running a host command from the sandbox

```python
# Inside the agent's tool call:
exec(command="brew install gh", host="gateway", elevated=True)
```

This runs `brew install gh` on the Mac Mini, not in Docker.

### What elevated access enables:
- Installing software (`brew install`, `pip install`)
- Managing services (launchd, cron)
- Sending emails (`gog gmail send`)
- Git push to GitHub
- Running any CLI tool installed on the Mac
- Reading/writing any file on the host

---

## Messaging Channels

### iMessage (BlueBubbles)

BlueBubbles server runs locally on the Mac Mini, bridging iMessage to OpenClaw:

```json
{
  "bluebubbles": {
    "serverUrl": "http://localhost:1234",
    "password": "<password>",
    "webhookPath": "/bluebubbles-webhook",
    "dmPolicy": "pairing",
    "groupPolicy": "open"
  }
}
```

- All iMessage DMs route to Henry
- Group chats work with `requireMention: false` (responds to all messages)
- Can send/receive images, files, reactions

### Telegram (Multiple Bots)

Each agent has its own Telegram bot:

```json
{
  "telegram": {
    "enabled": true,
    "accounts": {
      "henry": {
        "botToken": "<token>",
        "dmPolicy": "allowlist",
        "allowFrom": ["tg:8586188910"],
        "streamMode": "partial"
      },
      "marketing": {
        "botToken": "<different-token>",
        "dmPolicy": "allowlist",
        "allowFrom": ["tg:8586188910"]
      }
    }
  }
}
```

- Each bot is a separate Telegram bot (created via @BotFather)
- `dmPolicy: "allowlist"` + `allowFrom` restricts who can message each bot
- `streamMode: "partial"` enables streaming responses
- Brandon DMs the specific bot to talk to that agent

---

## Memory System

Three-layer persistent memory:

### Layer 1: Knowledge Graph (`~/life/`)

PARA-organized structured facts:
```
~/life/
├── projects/       # Active work with goals
├── areas/          # Ongoing responsibilities
│   └── people/
│       └── brandon/
│           ├── summary.md    # Quick overview
│           └── items.json    # Atomic facts
├── resources/      # Reference material
└── archives/       # Inactive items
```

- Shared across all agents (mounted rw)
- Semantic search via QMD (Gemini embeddings)
- Facts have temperature: Hot (7d) → Warm (30d) → Cold (archived)
- Weekly synthesis cron rewrites summaries

### Layer 2: Daily Notes (`~/clawd/memory/`)

Raw timeline files: `YYYY-MM-DD.md`
- What happened, conversations, decisions
- Created fresh each day, appended throughout

### Layer 3: Long-term Memory (`~/clawd/MEMORY.md`)

Curated distilled memories — the important stuff that persists.

### Memory Search

QMD backend with Gemini embeddings:

```json
{
  "memory": {
    "backend": "qmd",
    "qmd": {
      "paths": [
        { "path": "/Users/brandonai/life", "name": "life", "pattern": "**/*.md" }
      ],
      "update": { "interval": "5m", "onBoot": true }
    }
  }
}
```

---

## Skills & Tools

Skills are modular capabilities. 26 out of 51 available skills are active:

### Installed & Active Skills

| Skill | Purpose |
|-------|---------|
| `apple-notes` | Manage Apple Notes via `memo` CLI |
| `apple-reminders` | Manage Reminders via `remindctl` CLI |
| `blogwatcher` | Monitor RSS/Atom feeds |
| `bluebubbles` | iMessage integration |
| `clawhub` | Skill marketplace |
| `coding-agent` | Run Claude Code / Codex |
| `gemini` | Gemini API for Q&A |
| `github` | GitHub via `gh` CLI |
| `gog` | Google Workspace (Gmail, Calendar, Drive) |
| `healthcheck` | Security auditing |
| `himalaya` | Email via IMAP/SMTP |
| `nano-banana-pro` | Image generation (Gemini) |
| `nano-pdf` | PDF editing |
| `openai-whisper` | Speech-to-text |
| `peekaboo` | macOS UI automation |
| `sag` | Text-to-speech (ElevenLabs) |
| `session-logs` | Search session history |
| `skill-creator` | Create new skills |
| `summarize` | Summarize URLs/files |
| `tmux` | Terminal session control |
| `video-frames` | Extract video frames |
| `weather` | Weather forecasts |
| `bird` | X/Twitter |
| `evm-wallet` | Crypto wallet (EVM chains) |

### Tool Permissions Per Agent

Each agent has explicit tool allow/deny lists:

```json
// Henry (main) — full access
"tools": { "elevated": { "enabled": true } }

// Samantha (marketing) — no exec, no process
"tools": {
  "allow": ["read", "write", "edit", "web_search", "web_fetch", "memory_search", "sessions_send"],
  "deny": ["exec", "process", "browser", "cron"]
}

// Spencer (coder) — exec allowed, no process
"tools": {
  "allow": ["read", "write", "edit", "exec", "web_search", "web_fetch", ...],
  "deny": ["process", "browser", "cron"]
}
```

---

## Self-Healing (Watchdog)

A separate LaunchAgent (`ai.openclaw.watchdog`) runs every 60 seconds:

1. Checks if the gateway is alive
2. If dead: restores `openclaw.json` from `openclaw.json.last-good`
3. Restarts the gateway via launchd
4. Leaves a note at `memory/watchdog-restore.md`

**The agent can never permanently brick itself.** Even if it writes bad config, the watchdog restores the last working version within 60 seconds.

### Safe Config Edit Pattern

```bash
# 1. Backup first
cp openclaw.json openclaw.json.last-good

# 2. Make the edit
# (use python json.load/dump, NOT sed for complex edits)

# 3. Validate
openclaw doctor

# 4. Restart
openclaw gateway restart
```

---

## Services & Infrastructure

### Running Services

| Service | Port | Purpose |
|---------|------|---------|
| OpenClaw Gateway | 18789 | Agent framework |
| BlueBubbles | 1234 | iMessage bridge |
| Mission Control | 3100 | Next.js dashboard |
| Arb Bot | 8000 | Prediction market scanner |
| Cloudflare Tunnel | — | External access to Mission Control |

### Mission Control (Dashboard)

Next.js app at `~/clawd/mission-control/`:
- Docs section, chat UI, agent overview
- Runs in production mode: `npx next start -p 3100`
- Accessible via Cloudflare tunnel (free, URL changes on restart)

### Cron Jobs

Managed via `openclaw cron`:
```bash
# Example: daily scan at 7 AM
openclaw cron add --cron "0 7 * * *" --name "daily-scan" \
  --message "scan Canvas for assignments" \
  --agent student --tz America/New_York
```

---

## Security Model

### Defense in Depth

1. **Docker Sandbox** — All agent code runs in containers with read-only root
2. **Elevated Access Gating** — Only specific phone numbers / Telegram IDs can trigger host commands
3. **Tool Allow/Deny Lists** — Each agent only has the tools it needs
4. **Instruction Hierarchy** — System rules > Developer instructions > User messages > External content
5. **Prompt Injection Defense** — External content is marked as untrusted, never treated as commands
6. **Watchdog** — Auto-restores config if gateway crashes

### Secrets Management

All secrets stored in `~/.openclaw/.env.secrets`:
- API keys (Anthropic, Brave, Gemini, NVIDIA)
- Bot tokens
- Service passwords
- Never committed to git

---

## Key File Paths

| Path | Purpose |
|------|---------|
| `~/.openclaw/openclaw.json` | Main config |
| `~/.openclaw/.env.secrets` | API keys & secrets |
| `~/.openclaw/scripts/gateway-wrapper.sh` | Gateway startup script |
| `~/Library/LaunchAgents/ai.openclaw.gateway.plist` | Gateway LaunchAgent |
| `~/clawd/` | Henry's workspace |
| `~/clawd/AGENTS.md` | Agent behavior rules |
| `~/clawd/SOUL.md` | Agent personality |
| `~/clawd/TOOLS.md` | Local tool notes |
| `~/clawd/MEMORY.md` | Long-term memory |
| `~/clawd/memory/` | Daily notes |
| `~/life/` | Knowledge graph (shared) |
| `~/.openclaw/workspace-*/` | Other agent workspaces |
| `~/clawd/mission-control/` | Dashboard (Next.js) |
| `~/clawd/predictive-arbitrage/` | Arb bot |
| `~/clawd/instagram-pipeline/` | IG content pipeline |
| `~/clawd/newsletters/` | Newsletter templates |

---

## Replication Checklist

To set up a similar system:

1. **Install OpenClaw**: `npm install -g openclaw`
2. **Run setup wizard**: `openclaw configure`
3. **Set up auth**: Get Claude Max token or API key, add to `.env.secrets`
4. **Install Docker Desktop** and build/pull a sandbox image
5. **Configure sandbox** in `openclaw.json` with Docker image ID, binds, network
6. **Enable elevated access**: Set `elevatedDefault: "full"` and `allowFrom` with your phone number
7. **Set up messaging**:
   - iMessage: Install BlueBubbles server on Mac
   - Telegram: Create bot(s) via @BotFather, add tokens to config
8. **Add bindings** to route messages to the right agent
9. **Create agent workspace** with `AGENTS.md`, `SOUL.md`, `MEMORY.md`
10. **Install skills**: `openclaw skills install <skill-name>`
11. **Set up LaunchAgent** for auto-start on boot
12. **Set up watchdog** for self-healing
13. **Install host tools**: `brew install gh`, `pip install gog-cli`, etc.
14. **Configure memory**: Set up QMD with knowledge graph paths
15. **Test everything**: `openclaw doctor`, send a test message

### Critical Config for Full Autonomy

The magic sauce for making the agent truly autonomous:

```json
{
  "agents": {
    "defaults": {
      "elevatedDefault": "full",
      "sandbox": { "mode": "all" }
    }
  }
}
```

`elevatedDefault: "full"` + sandbox mode means the agent runs safely in Docker but can break out to the host for anything it needs. The sandbox is the safety net; elevated is the power.

---

*Generated by Henry 🦞 — Feb 12, 2026*
