export interface GatewayEnvelope<T = unknown> {
  ok: boolean;
  result?: {
    content: Array<{ type: string; text: string }>;
    details?: T;
  };
  error?: string;
}

export interface GatewayHealth {
  status: string;
  pid?: number;
  uptime?: number;
  memory?: { rss: number; heapUsed: number; heapTotal: number };
  version?: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: "online" | "offline" | "busy";
  model: string;
  workspace: string;
  skills: string[];
  sessions: string[];
  currentTask?: string;
}

export interface Session {
  id: string;
  agentId: string;
  model: string;
  channelType: "dm" | "group" | "cron" | "subagent";
  contextPercent: number;
  tokenCount: number;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: string;
}

export interface CronJob {
  id: string;
  name: string;
  expression: string;
  humanReadable: string;
  enabled: boolean;
  model: string;
  lastRun?: number;
  nextRun?: number;
  duration?: number;
  status: "idle" | "running" | "error";
  history: CronRun[];
}

export interface CronRun {
  id: string;
  startedAt: number;
  completedAt?: number;
  status: "success" | "error" | "running";
  duration?: number;
  error?: string;
}

export interface Skill {
  name: string;
  description: string;
  enabled: boolean;
  type: "bundled" | "managed" | "workspace";
  config?: Record<string, unknown>;
  icon?: string;
}

export interface Node {
  id: string;
  name: string;
  os: string;
  status: "online" | "offline";
  capabilities: string[];
}

export interface Channel {
  id: string;
  type: string;
  name: string;
  status: "connected" | "disconnected" | "pending";
  config?: Record<string, unknown>;
}

export interface UsageData {
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  requests: number;
}

export interface CostOverview {
  today: number;
  allTime: number;
  projectedMonthly: number;
  byModel: UsageData[];
}

export interface ActivityEvent {
  id: string;
  type: "session" | "cron" | "skill" | "agent" | "system";
  title: string;
  detail?: string;
  timestamp: number;
}
