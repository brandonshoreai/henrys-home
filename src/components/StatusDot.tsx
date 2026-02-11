"use client";

interface StatusDotProps {
  status: "online" | "offline" | "busy" | "connected" | "disconnected" | "pending" | "running" | "error" | "idle" | "success";
  size?: number;
  pulse?: boolean;
}

const colorMap: Record<string, string> = {
  online: "bg-apple-green",
  connected: "bg-apple-green",
  success: "bg-apple-green",
  idle: "bg-gray-300",
  offline: "bg-gray-300",
  disconnected: "bg-gray-300",
  busy: "bg-apple-orange",
  pending: "bg-apple-orange",
  running: "bg-apple-blue",
  error: "bg-apple-red",
};

export default function StatusDot({ status, size = 8, pulse = false }: StatusDotProps) {
  const shouldPulse = pulse || ["online", "connected", "running"].includes(status);
  return (
    <span
      className={`inline-block rounded-full ${colorMap[status] || "bg-gray-300"} ${shouldPulse ? "animate-pulse-dot" : ""}`}
      style={{ width: size, height: size, minWidth: size }}
    />
  );
}
