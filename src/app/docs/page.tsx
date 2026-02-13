"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Clock, ChevronRight } from "lucide-react";

interface Doc {
  slug: string;
  title: string;
  category: string;
  summary: string;
  order: number;
  createdAt: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  "Money Machine": "💰",
  "Strategy": "🎯",
};

export default function DocsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/docs")
      .then((r) => r.json())
      .then((d) => setDocs(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Group by category
  const grouped = docs.reduce<Record<string, Doc[]>>((acc, doc) => {
    (acc[doc.category] ??= []).push(doc);
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-light text-gray-900 tracking-tight">Docs</h1>
        <p className="text-sm text-gray-400 mt-1">
          Reports, guides, and documentation — {docs.length} document{docs.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <FileText size={20} className="text-indigo-500" />
          </div>
          <div>
            <p className="text-2xl font-light text-gray-900">{docs.length}</p>
            <p className="text-xs text-gray-400">Total Documents</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg">
            📁
          </div>
          <div>
            <p className="text-2xl font-light text-gray-900">{Object.keys(grouped).length}</p>
            <p className="text-xs text-gray-400">Categories</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <FileText size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">No documents yet</p>
          <p className="text-xs text-gray-300 mt-1">
            Add .md files to data/docs/ to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, categoryDocs]) => (
            <div key={category}>
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{CATEGORY_ICONS[category] || "📄"}</span>
                <h2 className="text-lg font-medium text-gray-900">{category}</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {categoryDocs.length}
                </span>
              </div>

              {/* Doc Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryDocs.map((doc) => (
                  <Link
                    key={doc.slug}
                    href={`/docs/${doc.slug}`}
                    className="card p-5 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                          <FileText size={18} className="text-indigo-500" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-apple-blue transition-colors">
                          {doc.title}
                        </h3>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-apple-blue transition-colors flex-shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-3 mb-3 leading-relaxed">
                      {doc.summary}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-300">
                      <Clock size={12} />
                      <span>
                        {new Date(doc.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone hint */}
      <div className="mt-6 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
        <p className="text-sm text-gray-400">
          Push .md files to <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">data/docs/</code> to add documents
        </p>
      </div>
    </div>
  );
}
