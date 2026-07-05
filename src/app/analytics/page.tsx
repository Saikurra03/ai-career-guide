"use client";

import { useState, useEffect } from "react";

interface Analysis {
  id: string;
  type: string;
  date: string;
  score?: string;
  title: string;
}

const typeIcons: Record<string, string> = {
  analyze: "📄", ats: "🎯", recruiter: "🧑‍💼", parser: "🔍", jd: "💼",
  tailor: "✨", chat: "💬", interview: "🎤", skills: "📊", builder: "📝",
};

const typeColors: Record<string, string> = {
  analyze: "bg-blue-100 text-blue-700", ats: "bg-indigo-100 text-indigo-700",
  recruiter: "bg-orange-100 text-orange-700", parser: "bg-purple-100 text-purple-700",
  jd: "bg-teal-100 text-teal-700", tailor: "bg-violet-100 text-violet-700",
  chat: "bg-green-100 text-green-700", interview: "bg-rose-100 text-rose-700",
  skills: "bg-red-100 text-red-700", builder: "bg-emerald-100 text-emerald-700",
};

export default function AnalyticsPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("resume_analytics");
    if (saved) setAnalyses(JSON.parse(saved));
  }, []);

  // Track a new analysis (call this from other pages)
  const trackAnalysis = (type: string, title: string, score?: string) => {
    const a: Analysis = {
      id: Date.now().toString(),
      type,
      date: new Date().toLocaleString(),
      title,
      score,
    };
    const updated = [a, ...analyses];
    setAnalyses(updated);
    localStorage.setItem("resume_analytics", JSON.stringify(updated));
  };

  const clearAnalytics = () => {
    if (!confirm("Clear all analytics?")) return;
    setAnalyses([]);
    localStorage.removeItem("resume_analytics");
  };

  const typeCounts = analyses.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalAnalyses = analyses.length;
  const thisWeek = analyses.filter((a) => {
    const d = new Date(a.date);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-text-muted">Track all your resume analyses and usage.</p>
        </div>
        {analyses.length > 0 && (
          <button onClick={clearAnalytics} className="px-4 py-2 text-sm text-red-500 hover:text-red-700 border border-red-200 rounded-xl hover:bg-red-50 transition-all">
            Clear All
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-border rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-primary">{totalAnalyses}</div>
          <div className="text-sm text-text-muted mt-1">Total Analyses</div>
        </div>
        <div className="bg-white border border-border rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-emerald-500">{thisWeek}</div>
          <div className="text-sm text-text-muted mt-1">This Week</div>
        </div>
        <div className="bg-white border border-border rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-orange-500">{Object.keys(typeCounts).length}</div>
          <div className="text-sm text-text-muted mt-1">Feature Types Used</div>
        </div>
      </div>

      {/* Feature Usage */}
      {Object.keys(typeCounts).length > 0 && (
        <div className="bg-white border border-border rounded-2xl p-6 mb-8">
          <h2 className="font-bold mb-4">Feature Usage</h2>
          <div className="space-y-3">
            {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${typeColors[type] || "bg-gray-100 text-gray-700"}`}>
                  {typeIcons[type] || "📋"}
                </span>
                <span className="flex-1 text-sm font-medium capitalize">{type}</span>
                <div className="flex-1 max-w-[200px] bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{ width: `${(count / totalAnalyses) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-text-muted w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h2 className="font-bold mb-4">Recent Activity</h2>
        {analyses.length > 0 ? (
          <div className="space-y-3">
            {analyses.slice(0, 20).map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${typeColors[a.type] || "bg-gray-100 text-gray-700"}`}>
                  {typeIcons[a.type] || "📋"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{a.title}</div>
                  <div className="text-xs text-text-muted">{a.date}</div>
                </div>
                {a.score && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">{a.score}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-text-muted">
            <div className="text-4xl mb-3">📈</div>
            <p>No analyses yet. Start using the app to see your analytics!</p>
          </div>
        )}
      </div>

      {/* Hidden: expose trackAnalysis for other pages */}
      <div className="hidden" data-track={JSON.stringify({ trackAnalysis })} />
    </div>
  );
}
