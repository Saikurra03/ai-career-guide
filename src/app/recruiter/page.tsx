"use client";

import { useState, useRef } from "react";
import { trackAnalysis } from "@/lib/track";

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

const colors = ["bg-red-100 text-red-700", "bg-orange-100 text-orange-700", "bg-yellow-100 text-yellow-700", "bg-green-100 text-green-700", "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700", "bg-pink-100 text-pink-700"];

export default function RecruiterPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
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

  const analyze = async () => {
    if (!resumeText.trim()) { alert("Please paste or upload your resume first."); return; }
    if (!jobDescription.trim()) { alert("Please paste the job description."); return; }
    setAnalyzing(true); setError(""); setSections([]);
    try {
      const res = await fetch("/api/recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText, jobDescription }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setAnalyzing(false); return; }
      setRawResult(data.result);
      setSections(parseSections(data.result));
      trackAnalysis("recruiter", "Recruiter Score");
      setOpenIndex(0);
    } catch { setError("Analysis failed. Please try again."); }
    setAnalyzing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Recruiter Score</h1>
      <p className="text-text-muted mb-8">Get feedback from an AI recruiter who&apos;s reviewed thousands of resumes for this role.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="font-bold mb-4">Your Resume</h2>
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
            rows={10}
            placeholder="Or paste your resume text here..."
            className="w-full px-3 py-2 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all resize-y min-h-[150px]"
          />
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="font-bold mb-4">Job Description</h2>
          <p className="text-xs text-text-muted mb-3">The role you&apos;re applying for</p>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={18}
            placeholder="Paste the job description here..."
            className="w-full px-3 py-2 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all resize-y min-h-[300px]"
          />
        </div>
      </div>

      <button
        onClick={analyze}
        disabled={analyzing || uploading}
        className="w-full py-4 bg-orange-500 text-white rounded-xl font-semibold text-base hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200 mb-6"
      >
        {analyzing ? "Recruiter is reviewing..." : "Get Recruiter Score"}
      </button>

      {(uploading || analyzing) && (
        <div className="flex items-center justify-center gap-3 py-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-600 font-medium mb-6">
          <div className="w-5 h-5 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <span>{uploading ? "Extracting text..." : "AI recruiter is reviewing your resume..."}</span>
        </div>
      )}

      {error && (
        <div className="py-4 px-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium mb-6">{error}</div>
      )}

      {sections.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recruiter Feedback ({sections.length} sections)</h2>
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

      {!sections.length && !analyzing && !error && (
        <div className="text-center py-16 text-text-muted">
          <div className="text-5xl mb-4">🧑‍💼</div>
          <p>Paste your resume and a job description above, then click &quot;Get Recruiter Score&quot;.</p>
        </div>
      )}
    </div>
  );
}
