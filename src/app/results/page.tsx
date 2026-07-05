"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function parseSections(text: string) {
  const sections: { title: string; body: string }[] = [];
  const parts = text.split(/^## /m);
  if (parts[0]?.trim()) sections.push({ title: "Summary", body: parts[0].trim() });
  for (let i = 1; i < parts.length; i++) {
    const lines = parts[i].split("\n");
    const title = lines[0].replace(/^[\d.\s]+/, "").trim();
    const body = lines.slice(1).join("\n").trim();
    sections.push({ title, body });
  }
  return sections;
}

function simpleMarkdown(md: string) {
  md = md.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  md = md.replace(/\*(.*?)\*/g, "<em>$1</em>");
  md = md.replace(/`(.*?)`/g, "<code>$1</code>");
  md = md.replace(/^- (.*)/gm, "<li>$1</li>");
  md = md.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
  md = md.replace(/<\/ul>\s*<ul>/g, "");
  md = md.replace(/\n\n/g, "<br><br>");
  return md;
}

const colors = ["bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-purple-100 text-purple-700", "bg-orange-100 text-orange-700", "bg-pink-100 text-pink-700", "bg-teal-100 text-teal-700", "bg-red-100 text-red-700"];

export default function ResultsPage() {
  const [sections, setSections] = useState<{ title: string; body: string }[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [rawResult, setRawResult] = useState("");

  useEffect(() => {
    const result = sessionStorage.getItem("analysisResult");
    if (result) {
      setRawResult(result);
      setSections(parseSections(result));
    }
  }, []);

  if (!sections.length) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">📭</div>
        <h2 className="text-xl font-bold mb-2">No Analysis Yet</h2>
        <p className="text-text-muted mb-6">Upload a resume first to see your analysis results.</p>
        <Link href="/upload" className="inline-flex px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors">
          Analyze Resume →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Analysis Results</h1>
          <p className="text-text-muted">{sections.length} sections generated</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setOpenIndex(null)} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Expand All</button>
          <button onClick={() => setOpenIndex(-1)} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Collapse All</button>
          <button onClick={() => { navigator.clipboard.writeText(rawResult); }} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Copy</button>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((sec, i) => (
          <div key={i} className="bg-white border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-md">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${colors[i % colors.length]}`}>
                  {i + 1}
                </span>
                <span className="font-semibold text-sm">{sec.title}</span>
              </div>
              <span className={`text-xs text-text-muted transition-transform ${openIndex === i ? "rotate-180" : ""}`}>▼</span>
            </button>
            {openIndex === i && (
              <div className="px-5 pb-5 text-sm leading-relaxed text-gray-600 border-t border-border pt-4" dangerouslySetInnerHTML={{ __html: simpleMarkdown(sec.body) }} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/upload" className="inline-flex px-6 py-3 border border-border rounded-xl font-medium hover:bg-gray-50 transition-colors">
          ← Analyze Another Resume
        </Link>
      </div>
    </div>
  );
}
