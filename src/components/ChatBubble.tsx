"use client";
import { Message } from "@/lib/types";
import { ChevronDown, ChevronRight, Wrench } from "lucide-react";
import { useState } from "react";

export default function ChatBubble({ message }: { message: Message }) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[75%] ${isUser ? "order-1" : ""}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-apple-blue text-white rounded-br-md"
              : "bg-gray-100 text-gray-900 rounded-bl-md"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        {message.toolCalls && message.toolCalls.length > 0 && (
          <button
            onClick={() => setToolsOpen(!toolsOpen)}
            className="flex items-center gap-1 mt-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Wrench size={11} />
            {message.toolCalls.length} tool call{message.toolCalls.length > 1 ? "s" : ""}
            {toolsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
        )}
        {toolsOpen && message.toolCalls?.map((tc) => (
          <div key={tc.id} className="mt-2 p-3 bg-gray-50 rounded-xl text-xs border border-gray-100">
            <div className="font-medium text-gray-600 mb-1">{tc.name}</div>
            <pre className="text-gray-400 overflow-x-auto">{JSON.stringify(tc.args, null, 2)}</pre>
            {tc.result && <pre className="mt-2 text-gray-500 border-t border-gray-100 pt-2">{tc.result.slice(0, 200)}</pre>}
          </div>
        ))}
        <div className={`text-[10px] text-gray-300 mt-1 ${isUser ? "text-right" : ""}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
