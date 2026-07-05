"use client";

import { useState, useRef } from "react";
import { trackAnalysis } from "@/lib/track";

const templates = [
  { id: "professional", name: "Professional", desc: "Clean, traditional format", color: "bg-blue-500", preview: "bg-card border-2 border-blue-200" },
  { id: "modern", name: "Modern", desc: "Two-column with sidebar", color: "bg-violet-500", preview: "bg-card border-2 border-violet-200" },
  { id: "minimal", name: "Minimal", desc: "Clean with whitespace", color: "bg-gray-500", preview: "bg-card border-2 border-gray-200" },
  { id: "creative", name: "Creative", desc: "Color accents & visual", color: "bg-pink-500", preview: "bg-card border-2 border-pink-200" },
];

export default function BuilderPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [instructions, setInstructions] = useState("");
  const [formatting, setFormatting] = useState(false);
  const [formatted, setFormatted] = useState("");
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

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

  const format = async () => {
    if (!resumeText.trim()) { alert("Please paste or upload your resume first."); return; }
    setFormatting(true); setError(""); setFormatted("");
    try {
      const res = await fetch("/api/builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, template: selectedTemplate, instructions: instructions || undefined }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setFormatting(false); return; }
      setFormatted(data.result);
      trackAnalysis("builder", "Resume Builder");
      setShowPreview(true);
    } catch { setError("Formatting failed. Please try again."); }
    setFormatting(false);
  };

  const applyFormat = () => {
    setResumeText(formatted);
    setShowPreview(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Resume Builder</h1>
      <p className="text-text-muted mb-8">Pick a template and let AI format your resume professionally.</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Editor */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upload */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-bold mb-4">Your Resume</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all mb-4 ${
                dragOver ? "border-primary bg-indigo-50" : "border-border hover:border-primary/50"
              }`}
            >
              <p className="text-sm text-text-muted">{fileName || "📁 Drop PDF or click to browse"}</p>
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
              ref={textareaRef}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={20}
              placeholder="Paste your resume text here to edit and format..."
              className="w-full px-3 py-2 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all resize-y min-h-[300px] font-mono"
            />
          </div>

          {/* Instructions */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-bold mb-3">Custom Instructions (Optional)</h2>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              placeholder="e.g. Make my summary more concise, emphasize my leadership experience..."
              className="w-full px-3 py-2 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all resize-none"
            />
          </div>
        </div>

        {/* Right: Templates & Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Templates */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-bold mb-4">Choose Template</h2>
            <div className="space-y-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTemplate === t.id
                      ? "border-primary bg-indigo-50"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <span className={`w-10 h-10 rounded-xl ${t.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {t.id[0].toUpperCase()}
                  </span>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-text-muted">{t.desc}</div>
                  </div>
                  {selectedTemplate === t.id && <span className="ml-auto text-primary font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={format}
            disabled={formatting || uploading}
            className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-base hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
          >
            {formatting ? "Formatting..." : "Format Resume"}
          </button>

          {formatting && (
            <div className="flex items-center justify-center gap-3 py-3 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-primary font-medium">
              <div className="w-5 h-5 border-3 border-indigo-200 border-t-primary rounded-full animate-spin" />
              <span>AI is formatting your resume...</span>
            </div>
          )}

          {error && (
            <div className="py-3 px-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">{error}</div>
          )}

          {/* Preview */}
          {showPreview && formatted && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold">Formatted Preview</h2>
                <div className="flex gap-2">
                  <button onClick={applyFormat} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover">Apply</button>
                  <button onClick={() => navigator.clipboard.writeText(formatted)} className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-hover-bg">Copy</button>
                  <button onClick={() => setShowPreview(false)} className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-hover-bg">✕</button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono leading-relaxed">{formatted}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
