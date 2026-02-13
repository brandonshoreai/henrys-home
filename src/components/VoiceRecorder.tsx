"use client";

import { useState, useRef, useCallback } from "react";
import { Square, Mic } from "lucide-react";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onTranscript, onCancel }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showReview, setShowReview] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startRecording = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported"); return; }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    let lastText = "";

    recognition.onresult = (e: any) => {
      let full = "";
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript + " ";
      lastText = full.trim();
      setTranscript(lastText);
    };

    recognition.onerror = (e: any) => {
      if (e.error !== "no-speech") setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
      setTimeout(() => {
        setTranscript(prev => {
          const text = prev || lastText;
          if (text.trim()) setShowReview(true);
          return text;
        });
      }, 100);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
    setTranscript("");
    setShowReview(false);
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const handleToggle = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  const handleSend = () => {
    if (transcript.trim()) onTranscript(transcript.trim());
    setTranscript("");
    setShowReview(false);
  };

  const handleCancel = () => {
    setTranscript("");
    setShowReview(false);
    onCancel();
  };

  const handleReRecord = () => {
    setShowReview(false);
    startRecording();
  };

  // Recording overlay
  if (recording) {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <button onClick={stopRecording} className="relative mb-6 block mx-auto">
            <div className="absolute inset-0 -m-4 rounded-full bg-red-100 animate-ping opacity-30" />
            <div className="absolute inset-0 -m-2 rounded-full bg-red-50 animate-pulse opacity-50" />
            <div className="relative w-24 h-24 rounded-full bg-[#FF3B30] flex items-center justify-center shadow-lg shadow-red-200">
              <Square size={28} className="text-white fill-white" />
            </div>
          </button>
          <p className="text-sm font-medium text-[#FF3B30] mb-1">Listening...</p>
          {transcript && (
            <p className="text-sm text-gray-500 max-w-[280px] mx-auto mt-3 leading-relaxed">{transcript}</p>
          )}
          <p className="text-xs text-gray-300 mt-3">Tap to stop</p>
        </div>
      </div>
    );
  }

  // Review overlay
  if (showReview && transcript) {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center w-full max-w-sm mx-auto px-4">
          <p className="text-5xl mb-6">🦞</p>
          <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left">
            <p className="text-[15px] text-gray-700 leading-relaxed">{transcript}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCancel} className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 active:scale-95 transition-transform">
              Cancel
            </button>
            <button onClick={handleSend} className="flex-1 py-3 rounded-xl text-sm font-medium text-white bg-[#FF3B30] active:scale-95 transition-transform">
              Send
            </button>
          </div>
          <button onClick={handleReRecord} className="mt-3 text-xs text-gray-400 hover:text-gray-600">
            Re-record
          </button>
        </div>
      </div>
    );
  }

  // Mic button (inline)
  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      title="Voice input"
    >
      <Mic size={20} />
    </button>
  );
}
