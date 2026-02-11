"use client";

import { useEffect, useState } from "react";
import {
  CheckSquare,
  Plus,
  ArrowRight,
  ArrowLeft,
  Trash2,
  X,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  createdAt: string;
}

const columns: { key: Task["status"]; label: string; color: string }[] = [
  { key: "todo", label: "TODO", color: "text-gray-500" },
  { key: "in-progress", label: "IN PROGRESS", color: "text-apple-blue" },
  { key: "done", label: "DONE", color: "text-apple-green" },
];

const priorityStyles: Record<string, string> = {
  high: "bg-red-50 text-red-600 border-red-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  low: "bg-green-50 text-green-600 border-green-200",
};

const statusOrder: Task["status"][] = ["todo", "in-progress", "done"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" });

  const fetchTasks = () => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((d) => setTasks(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, []);

  const addTask = async () => {
    if (!form.title.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", priority: "medium" });
    setShowForm(false);
    fetchTasks();
  };

  const moveTask = async (task: Task, direction: number) => {
    const idx = statusOrder.indexOf(task.status);
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= statusOrder.length) return;
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: statusOrder[newIdx] }),
    });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Tasks</h1>
          <p className="text-sm text-gray-400 mt-1">Kanban board for tracking work</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-apple-blue text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">New Task</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-apple-blue/30 focus:border-apple-blue bg-white"
            />
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-apple-blue/30 focus:border-apple-blue bg-white resize-none"
            />
            <div className="flex items-center gap-3">
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-apple-blue/30 focus:border-apple-blue bg-white"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <button
                onClick={addTask}
                className="px-4 py-2 bg-apple-blue text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center gap-2 px-1 mb-2">
                  <span className={`text-xs font-semibold tracking-wider uppercase ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-xs text-gray-300 font-medium">{colTasks.length}</span>
                </div>
                {colTasks.length === 0 ? (
                  <div className="card p-6 text-center border-dashed">
                    <p className="text-xs text-gray-300">No tasks</p>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const statusIdx = statusOrder.indexOf(task.status);
                    return (
                      <div key={task.id} className="card p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-medium text-gray-900 leading-snug">
                            {task.title}
                          </h4>
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded border whitespace-nowrap ${
                              priorityStyles[task.priority] || priorityStyles.medium
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-300">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-1">
                            {statusIdx > 0 && (
                              <button
                                onClick={() => moveTask(task, -1)}
                                className="p-1 text-gray-300 hover:text-gray-600 transition-colors"
                                title="Move left"
                              >
                                <ArrowLeft size={14} />
                              </button>
                            )}
                            {statusIdx < statusOrder.length - 1 && (
                              <button
                                onClick={() => moveTask(task, 1)}
                                className="p-1 text-gray-300 hover:text-apple-blue transition-colors"
                                title="Move right"
                              >
                                <ArrowRight size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
