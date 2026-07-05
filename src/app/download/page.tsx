"use client";

import { useState, useRef } from "react";

function parseResumeForPDF(text: string) {
  const lines = text.split("\n");
  const sections: { title: string; content: string[] }[] = [];
  let current: { title: string; content: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(SUMMARY|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|CONTACT|OBJECTIVE|ACHIEVEMENTS|LANGUAGES|AWARDS|VOLUNTEER|REFERENCES|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|TECHNICAL SKILLS)/i.test(trimmed)) {
      if (current) sections.push(current);
      current = { title: trimmed, content: [] };
    } else if (current) {
      current.content.push(trimmed);
    }
  }
  if (current) sections.push(current);
  return sections;
}

export default function DownloadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const downloadPDF = async () => {
    if (!resumeText.trim()) { alert("Please paste or upload your resume first."); return; }
    setError("");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const pageW = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxW = pageW - margin * 2;
      let y = margin;

      const addText = (text: string, size: number, isBold: boolean, color: [number, number, number]) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, maxW);
        for (const line of lines) {
          if (y > 275) { doc.addPage(); y = margin; }
          doc.text(line, margin, y);
          y += size * 0.4;
        }
      };

      // Title
      const titleMatch = resumeText.match(/^(.+?)(?:\n|$)/);
      if (titleMatch) {
        addText(titleMatch[1].trim(), 16, true, [0, 0, 0]);
        y += 2;
      }

      // Contact info
      const contactMatch = resumeText.match(/\n((?:[\w.-]+@[\w.-]+\.\w+|[\d\s()+-]+|linkedin\.com|github\.com|[\w\s]+,\s*[\w\s]+).*)/i);
      if (contactMatch) {
        addText(contactMatch[1].trim(), 9, false, [80, 80, 80]);
        y += 2;
      }

      // Sections
      const sections = parseResumeForPDF(resumeText);
      for (const sec of sections) {
        y += 3;
        addText(sec.title, 11, true, [30, 60, 120]);
        y += 1;
        doc.setDrawColor(30, 60, 120);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageW - margin, y);
        y += 3;

        for (const line of sec.content) {
          if (line.trim()) {
            const isBullet = /^[-•*]\s/.test(line.trim());
            const indent = isBullet ? margin + 4 : margin;
            const cleanLine = line.trim().replace(/^[-•*]\s/, "");
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(40, 40, 40);
            const subLines = doc.splitTextToSize(isBullet ? `• ${cleanLine}` : cleanLine, maxW - (indent - margin));
            for (const sl of subLines) {
              if (y > 275) { doc.addPage(); y = margin; }
              doc.text(sl, indent, y);
              y += 3.8;
            }
          }
        }
      }

      // If no sections found, just dump all text
      if (sections.length === 0) {
        const allLines = resumeText.split("\n");
        for (const line of allLines) {
          if (line.trim()) {
            if (y > 275) { doc.addPage(); y = margin; }
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(40, 40, 40);
            const subLines = doc.splitTextToSize(line.trim(), maxW);
            for (const sl of subLines) {
              doc.text(sl, margin, y);
              y += 3.8;
            }
          }
        }
      }

      doc.save("resume.pdf");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`PDF generation failed: ${msg}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Download as PDF</h1>
      <p className="text-text-muted mb-8">Upload your resume and download it as a clean PDF file.</p>

      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4 ${
            dragOver ? "border-primary bg-indigo-50" : "border-border hover:border-primary/50"
          }`}
        >
          <div className="text-3xl mb-3">📁</div>
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
          rows={15}
          placeholder="Or paste your resume text here..."
          className="w-full px-3 py-2 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all resize-y min-h-[200px]"
        />
      </div>

      <button
        onClick={downloadPDF}
        disabled={uploading || !resumeText.trim()}
        className="w-full py-4 bg-emerald-500 text-white rounded-xl font-semibold text-base hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 mb-4"
      >
        {uploading ? "Loading..." : "Download PDF"}
      </button>

      {error && (
        <div className="py-3 px-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium mb-4">{error}</div>
      )}

      {!resumeText && !uploading && (
        <div className="text-center py-8 text-text-muted">
          <div className="text-4xl mb-3">📄</div>
          <p>Upload or paste your resume, then click &quot;Download PDF&quot;.</p>
        </div>
      )}
    </div>
  );
}
