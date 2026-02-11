import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TASKS_FILE = path.join(process.cwd(), "data", "tasks.json");

function readTasks() {
  try {
    const data = fs.readFileSync(TASKS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeTasks(tasks: unknown[]) {
  fs.mkdirSync(path.dirname(TASKS_FILE), { recursive: true });
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export async function GET() {
  return NextResponse.json(readTasks());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const tasks = readTasks();
  const newTask = {
    id: Date.now().toString(),
    title: body.title || "Untitled",
    description: body.description || "",
    priority: body.priority || "medium",
    status: body.status || "todo",
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  writeTasks(tasks);
  return NextResponse.json(newTask, { status: 201 });
}
