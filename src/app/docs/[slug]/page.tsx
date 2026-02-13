"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Highlighter,
  MessageCircle,
  PanelRightOpen,
  PanelRightClose,
  Send,
  X,
  Trash2,
} from "lucide-react";

interface DocData {
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  createdAt: string;
}

interface Highlight {
  id: string;
  text: string;
  createdAt: string;
}

export default function DocViewerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [doc, setDoc] = useState<DocData | null>(null);
  const [loading, setLoading] = useState(true);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [showHighlights, setShowHighlights] = useState(false);
  const [toolbar, setToolbar] = useState<{ x: number; y: number; text: string } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatContext, setChatContext] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load doc
  useEffect(() => {
    fetch(`/api/docs/${slug}`)
      .then((r) => r.json())
      .then((d) => setDoc(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  // Load highlights from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`doc-highlights-${slug}`);
    if (stored) {
      try {
        setHighlights(JSON.parse(stored));
      } catch {}
    }
  }, [slug]);

  // Save highlights
  const saveHighlights = useCallback(
    (newHighlights: Highlight[]) => {
      setHighlights(newHighlights);
      localStorage.setItem(`doc-highlights-${slug}`, JSON.stringify(newHighlights));
    },
    [slug]
  );

  // Handle text selection
  useEffect(() => {
    const handleTouchEnd = () => {
      // Small delay to let the selection finalize on touch
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !contentRef.current) return;
        const text = selection.toString().trim();
        if (!text || text.length < 3) return;
        const range = selection.getRangeAt(0);
        if (!contentRef.current.contains(range.commonAncestorContainer)) return;
        const rect = range.getBoundingClientRect();
        setToolbar({
          x: Math.min(Math.max(rect.left + rect.width / 2, 80), window.innerWidth - 80),
          y: rect.top - 10,
          text,
        });
      }, 300);
    };

    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !contentRef.current) {
        setToolbar(null);
        return;
      }

      const text = selection.toString().trim();
      if (!text || text.length < 3) {
        setToolbar(null);
        return;
      }

      // Check if selection is within our content
      const range = selection.getRangeAt(0);
      if (!contentRef.current.contains(range.commonAncestorContainer)) {
        setToolbar(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      setToolbar({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        text,
      });
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const addHighlight = () => {
    if (!toolbar) return;
    const newHighlight: Highlight = {
      id: Date.now().toString(),
      text: toolbar.text,
      createdAt: new Date().toISOString(),
    };
    saveHighlights([...highlights, newHighlight]);
    setToolbar(null);
    window.getSelection()?.removeAllRanges();
  };

  const removeHighlight = (id: string) => {
    saveHighlights(highlights.filter((h) => h.id !== id));
  };

  const askHenry = () => {
    if (!toolbar) return;
    setChatContext(toolbar.text);
    setChatInput("");
    setChatMessages([]);
    setChatOpen(true);
    setToolbar(null);
    window.getSelection()?.removeAllRanges();
  };

  const sendChat = async () => {
    if (!chatInput.trim() && !chatContext) return;
    const userMessage = chatContext
      ? `Regarding this text from "${doc?.title}":\n\n"${chatContext}"\n\n${chatInput}`
      : chatInput;

    const newMessages = [...chatMessages, { role: "user", content: userMessage }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatContext("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setChatMessages([...newMessages, { role: "assistant", content: data.message || data.content || "No response" }]);
    } catch {
      setChatMessages([...newMessages, { role: "assistant", content: "Failed to get response" }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Highlight text in rendered content
  const highlightContent = (text: string): string => {
    let result = text;
    for (const h of highlights) {
      const escaped = h.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(
        new RegExp(escaped, "gi"),
        `<mark class="bg-yellow-200/70 rounded px-0.5">$&</mark>`
      );
    }
    return result;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-gray-400">Document not found</p>
        <button
          onClick={() => router.push("/docs")}
          className="mt-4 text-sm text-apple-blue hover:underline"
        >
          ← Back to Docs
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-0">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-200 ${showHighlights ? "md:mr-80" : ""}`}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <button onClick={() => router.push("/docs")} className="hover:text-apple-blue transition-colors">Docs</button>
          <span>›</span>
          {doc.category && <><span className="text-gray-500">{doc.category}</span><span>›</span></>}
          <span className="text-gray-600 font-medium">{doc.title}</span>
        </div>

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/docs")}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Docs
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-300">
              {new Date(doc.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <button
              onClick={() => setShowHighlights(!showHighlights)}
              className={`p-2 rounded-lg transition-colors ${
                showHighlights
                  ? "bg-yellow-50 text-yellow-600"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              }`}
              title="Toggle highlights panel"
            >
              {showHighlights ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
              {highlights.length > 0 && (
                <span className="ml-1 text-[10px] font-medium">{highlights.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* AI Summary */}
        {doc.summary && (
          <div className="mb-6 rounded-xl bg-blue-50/60 border border-blue-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">✨</span>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Summary</span>
            </div>
            <p className="text-sm text-blue-900/80 leading-relaxed">{doc.summary}</p>
          </div>
        )}

        {/* Markdown Content */}
        <div ref={contentRef} className="card p-4 md:p-8 lg:p-12">
          <article className="prose prose-gray max-w-none prose-headings:font-light prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-xl prose-h2:border-b prose-h2:border-gray-100 prose-h2:pb-2 prose-h2:mt-8 prose-h3:text-base prose-p:text-sm prose-p:leading-relaxed prose-p:text-gray-600 prose-li:text-sm prose-li:text-gray-600 prose-code:text-xs prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-pre:bg-gray-950 prose-pre:rounded-xl prose-table:text-sm prose-th:text-left prose-th:text-xs prose-th:font-semibold prose-th:uppercase prose-th:tracking-wider prose-th:text-gray-400 prose-td:text-sm prose-td:text-gray-600 prose-strong:text-gray-900 prose-a:text-apple-blue prose-a:no-underline hover:prose-a:underline prose-hr:border-gray-100 prose-blockquote:border-l-apple-blue prose-blockquote:text-gray-500">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
            >
              {doc.content}
            </ReactMarkdown>
          </article>
        </div>

        {/* Floating Selection Toolbar */}
        {toolbar && (
          <div
            className="fixed z-50 flex items-center gap-1 bg-gray-900 rounded-lg shadow-xl p-1 transform -translate-x-1/2 -translate-y-full"
            style={{ left: toolbar.x, top: toolbar.y }}
          >
            <button
              onClick={addHighlight}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <Highlighter size={14} />
              Highlight
            </button>
            <div className="w-px h-5 bg-gray-700" />
            <button
              onClick={askHenry}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <MessageCircle size={14} />
              Ask Henry
            </button>
          </div>
        )}

        {/* Chat Panel */}
        {chatOpen && (
          <div className="fixed inset-0 md:inset-auto md:bottom-4 md:right-4 md:w-96 bg-white md:rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden z-50 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} className="text-apple-blue" />
                <span className="text-sm font-medium text-gray-900">Ask Henry</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Context Badge */}
            {chatContext && (
              <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100">
                <p className="text-[10px] text-yellow-600 font-medium mb-0.5">Selected text:</p>
                <p className="text-xs text-yellow-800 line-clamp-2">&ldquo;{chatContext}&rdquo;</p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 max-h-64 md:max-h-64 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">
                  Ask a question about the selected text
                </p>
              )}
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "text-gray-900 bg-gray-50 rounded-lg p-3"
                      : "text-gray-600 bg-blue-50 rounded-lg p-3"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-4 h-4 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
                  Thinking...
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder="Ask a question..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-apple-blue/30 focus:border-apple-blue bg-white"
                />
                <button
                  onClick={sendChat}
                  disabled={chatLoading}
                  className="p-2 bg-apple-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Highlights Sidebar */}
      {showHighlights && (
        <div className="fixed inset-0 md:inset-auto md:right-0 md:top-0 md:h-screen md:w-80 bg-white border-l border-gray-200/60 p-5 overflow-y-auto z-40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Highlights</h3>
            <span className="text-xs text-gray-400">{highlights.length}</span>
          </div>
          {highlights.length === 0 ? (
            <div className="text-center py-8">
              <Highlighter size={24} className="mx-auto text-gray-200 mb-2" />
              <p className="text-xs text-gray-400">No highlights yet</p>
              <p className="text-[10px] text-gray-300 mt-1">Select text to highlight it</p>
            </div>
          ) : (
            <div className="space-y-3">
              {highlights.map((h) => (
                <div
                  key={h.id}
                  className="p-3 bg-yellow-50 border border-yellow-200/60 rounded-lg group"
                >
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-4">
                    &ldquo;{h.text}&rdquo;
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-gray-400">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => removeHighlight(h.id)}
                      className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
