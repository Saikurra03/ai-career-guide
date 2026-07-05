"use client";

import { useState, useRef } from "react";
import { trackAnalysis } from "@/lib/track";

function parseSections(text: string) {
  const sections: { title: string; body: string }[] = [];
  const parts = text.split(/^## /m);
  if (parts[0]?.trim()) sections.push({ title: "Introduction", body: parts[0].trim() });
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

const categories = [
  { id: "all", label: "All Questions", icon: "🎯", desc: "Comprehensive mix" },
  { id: "behavioral", label: "Behavioral", icon: "🧠", desc: "STAR method questions" },
  { id: "technical", label: "Technical", icon: "💻", desc: "Tech stack deep dive" },
  { id: "situational", label: "Situational", icon: "🔮", desc: "Hypothetical scenarios" },
  { id: "resume", label: "Resume Based", icon: "📄", desc: "About your experience" },
  { id: "culture-fit", label: "Culture Fit", icon: "🤝", desc: "Work style & values" },
];

const colors = ["bg-indigo-100 text-indigo-700", "bg-emerald-100 text-emerald-700", "bg-sky-100 text-sky-700", "bg-rose-100 text-rose-700", "bg-amber-100 text-amber-700", "bg-teal-100 text-teal-700", "bg-violet-100 text-violet-700", "bg-pink-100 text-pink-700", "bg-orange-100 text-orange-700", "bg-cyan-100 text-cyan-700"];

export default function InterviewPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [generating, setGenerating] = useState(false);
  const [sections, setSections] = useState<{ title: string; body: string }[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [rawResult, setRawResult] = useState("");
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".pdf")) { alert("Only PDF files are supported"); return; }
    setUploading(true);
    setFileName(file.name);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) { alert(data.error); setUploading(false); setFileName(""); return; }
      setResumeText(data.text);
      setFileName(`${file.name} (${data.pages} pages)`);
    } catch { alert("Upload failed"); }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  };

  const generate = async () => {
    if (!resumeText.trim()) { alert("Please paste or upload your resume first."); return; }
    setGenerating(true); setError(""); setSections([]);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText, jobDescription: jobDescription || undefined, category: selectedCategory }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setGenerating(false); return; }
      setRawResult(data.result);
      setSections(parseSections(data.result));
      trackAnalysis("interview", "Interview Prep");
      setOpenIndex(0);
    } catch { setError("Generation failed. Please try again."); }
    setGenerating(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Interview Preparation</h1>
      <p className="text-text-muted mb-8">Practice interview questions tailored to your resume and target role.</p>

      {/* Resume Upload */}
      <div className="bg-white border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-bold mb-4">Your Resume</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-4 ${
                dragOver ? "border-primary bg-indigo-50" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="text-2xl mb-2">📁</div>
              <p className="text-sm text-text-muted">Drop PDF or click to browse</p>
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => {
                if (e.target.files?.length) handleFile(e.target.files[0]);
              }} />
            </div>
            {fileName && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium mb-3">
                <span>✅</span><span>{fileName}</span>
                <button onClick={() => { setFileName(""); setResumeText(""); }} className="ml-auto text-red-500 hover:text-red-700">×</button>
              </div>
            )}
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={6}
              placeholder="Or paste your resume text here..."
              className="w-full px-3 py-2 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all resize-y min-h-[100px]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Optional: Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              placeholder="Paste the job description for more targeted questions..."
              className="w-full px-3 py-2 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all resize-y min-h-[180px]"
            />
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="bg-white border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-bold mb-4">Question Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedCategory === cat.id
                  ? "border-primary bg-indigo-50"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="text-xl mb-1">{cat.icon}</div>
              <div className="font-semibold text-sm">{cat.label}</div>
              <div className="text-xs text-text-muted">{cat.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={generate}
        disabled={generating || uploading}
        className="w-full py-4 bg-emerald-500 text-white rounded-xl font-semibold text-base hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 mb-6"
      >
        {generating ? "Preparing Interview Questions..." : "Generate Interview Prep"}
      </button>

      {(uploading || generating) && (
        <div className="flex items-center justify-center gap-3 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-600 font-medium mb-6">
          <div className="w-5 h-5 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          <span>{uploading ? "Extracting text..." : "AI is preparing your interview questions..."}</span>
        </div>
      )}

      {error && (
        <div className="py-4 px-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium mb-6">{error}</div>
      )}

      {sections.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Interview Prep ({sections.length} sections)</h2>
            <div className="flex gap-2">
              <button onClick={() => setOpenIndex(null)} className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-gray-50">Expand All</button>
              <button onClick={() => setOpenIndex(-1)} className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-gray-50">Collapse All</button>
              <button onClick={() => navigator.clipboard.writeText(rawResult)} className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-gray-50">Copy</button>
            </div>
          </div>
          <div className="space-y-3">
            {sections.map((sec, i) => (
              <div key={i} className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${colors[i % colors.length]}`}>{i + 1}</span>
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
        </div>
      )}

      {!sections.length && !generating && !error && (
        <div className="text-center py-16 text-text-muted">
          <div className="text-5xl mb-4">🎤</div>
          <p>Upload your resume, pick a category, then click &quot;Generate Interview Prep&quot;.</p>
        </div>
      )}
    </div>
  );
}
