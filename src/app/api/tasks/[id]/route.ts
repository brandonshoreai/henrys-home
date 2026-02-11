import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TASKS_FILE = path.join(process.cwd(), "data", "tasks.json");

function readTasks() {
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeTasks(tasks: unknown[]) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const tasks = readTasks();
  const idx = tasks.findIndex((t: { id: string }) => t.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  tasks[idx] = { ...tasks[idx], ...body };
  writeTasks(tasks);
  return NextResponse.json(tasks[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let tasks = readTasks();
  tasks = tasks.filter((t: { id: string }) => t.id !== id);
  writeTasks(tasks);
  return NextResponse.json({ ok: true });
}
