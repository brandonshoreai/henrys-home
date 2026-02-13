"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:pb-4">
      <div className="flex items-end gap-2 border border-gray-200 rounded-2xl bg-white px-4 py-2 focus-within:ring-2 focus-within:ring-[#FF3B30]/20 focus-within:border-[#FF3B30]/30 transition-all shadow-sm">
        <VoiceRecorder
          onTranscript={(text) => onSend(text)}
          onCancel={() => {}}
        />
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Henry..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-[15px] text-[#1D1D1F] placeholder-gray-400 focus:outline-none py-2 max-h-[200px] leading-relaxed"
        />
        {input.trim() && (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF3B30] text-white flex items-center justify-center hover:bg-[#E0352B] active:scale-95 transition-all disabled:opacity-50 mb-0.5"
          >
            <ArrowUp size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
