"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { trackAnalysis } from "@/lib/track";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [level, setLevel] = useState("fresher");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      alert("Only PDF files are supported");
      return;
    }
    setUploading(true);
    setFileName(file.name);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        setUploading(false);
        setFileName("");
        return;
      }
      setResumeText(data.text);
      setFileName(`${file.name} (${data.pages} pages)`);
    } catch {
      alert("Upload failed");
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  };

  const analyze = async () => {
    if (!resumeText.trim()) {
      alert("Please paste or upload your resume first.");
      return;
    }
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText, role: jobRole, level }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        setAnalyzing(false);
        return;
      }
      sessionStorage.setItem("analysisResult", data.result);
      trackAnalysis("analyze", `Analyzed: ${jobRole || "Resume"}`);
      router.push("/results");
    } catch {
      alert("Analysis failed. Please try again.");
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Analyze Your Resume</h1>
      <p className="text-text-muted mb-8">Upload a PDF or paste your resume text, then get AI-powered feedback.</p>

      <div className="bg-white border border-border rounded-2xl p-8">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Target Job Role</label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g. Software Engineer, Data Analyst"
              className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-indigo-50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Experience Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-indigo-50 transition-all"
            >
              <option value="fresher">Fresher / Student</option>
              <option value="mid_level">Mid-Level (2-5 years)</option>
              <option value="experienced">Senior (5+ years)</option>
            </select>
          </div>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all mb-4 ${
            dragOver ? "border-primary bg-indigo-50 scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-gray-50"
          }`}
        >
          <div className="text-4xl mb-3">📁</div>
          <h4 className="font-semibold mb-1">Drop your resume PDF here or click to browse</h4>
          <p className="text-sm text-text-muted">Supports .pdf files</p>
          <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => {
            if (e.target.files?.length) handleFile(e.target.files[0]);
          }} />
        </div>

        {fileName && (
          <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium mb-4">
            <span>✅</span>
            <span>{fileName}</span>
            <button onClick={() => { setFileName(""); setResumeText(""); }} className="ml-auto text-red-500 hover:text-red-700 text-lg">×</button>
          </div>
        )}

        <div className="flex items-center gap-4 my-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
          <div className="flex-1 h-px bg-border" />
          <span>or paste text</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Resume Content</label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={12}
            placeholder="Paste your resume text here..."
            className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-indigo-50 transition-all resize-y min-h-[200px] leading-relaxed"
          />
        </div>

        <button
          onClick={analyze}
          disabled={analyzing || uploading}
          className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-base hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
        >
          {analyzing ? "Analyzing..." : "Analyze Resume"}
        </button>

        {(uploading || analyzing) && (
          <div className="flex items-center justify-center gap-3 mt-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-primary font-medium">
            <div className="w-5 h-5 border-3 border-indigo-200 border-t-primary rounded-full animate-spin" />
            <span>{uploading ? "Extracting text from PDF..." : "AI is analyzing your resume..."}</span>
          </div>
        )}
      </div>
    </div>
  );
}
