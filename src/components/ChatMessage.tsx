"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isLast?: boolean;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[85%] md:max-w-[70%]">
          <div className="bg-gray-100 text-[#1D1D1F] rounded-2xl px-5 py-3 text-[15px] leading-[1.7] whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-6">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base mt-1">
        🦞
      </div>
      <div className="flex-1 min-w-0 text-[15px] leading-[1.7] text-[#1D1D1F] chat-markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
