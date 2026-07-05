"use client";

import { useState, useRef } from "react";
import { trackAnalysis } from "@/lib/track";

interface Contact { name: string; email: string; phone: string; location: string; linkedin: string; website: string; github: string; }
interface Job { company: string; title: string; location: string; startDate: string; endDate: string; bullets: string[]; }
interface Edu { institution: string; degree: string; field: string; startDate: string; endDate: string; gpa: string; details: string[]; }
interface Skills { programming: string[]; frameworks: string[]; tools: string[]; databases: string[]; cloud: string[]; soft: string[]; other: string[]; }
interface Project { name: string; description: string; technologies: string[]; link: string; }
interface Parsed {
  contact: Contact; summary: string; experience: Job[]; education: Edu[];
  skills: Skills; certifications: string[]; projects: Project[];
  languages: string[]; awards: string[]; publications: string[]; volunteer: string[];
}

const SkillBadge = ({ label }: { label: string }) => (
  <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-medium text-indigo-700">{label}</span>
);

const Section = ({ title, icon, children, color = "bg-indigo-100 text-indigo-700" }: { title: string; icon: string; children: React.ReactNode; color?: string }) => (
  <div className="bg-card border border-border rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${color}`}>{icon}</span>
      <h3 className="font-bold text-base">{title}</h3>
    </div>
    {children}
  </div>
);

export default function ParserPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<Parsed | null>(null);
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

  const parseResume = async () => {
    if (!resumeText.trim()) { alert("Please paste or upload your resume first."); return; }
    setParsing(true); setError(""); setParsed(null);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setParsing(false); return; }
      setParsed(data.parsed);
      trackAnalysis("parser", "Resume Parser");
    } catch { setError("Parsing failed. Please try again."); }
    setParsing(false);
  };

  const allSkills = parsed?.skills
    ? Object.entries(parsed.skills).flatMap(([cat, list]) => list.map((s: string) => ({ skill: s, category: cat })))
    : [];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Resume Parser</h1>
      <p className="text-text-muted mb-8">Upload your resume to extract structured data: contact info, skills, experience, education, and more.</p>

      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-bold mb-4">Upload Resume</h2>
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

      <button
        onClick={parseResume}
        disabled={parsing || uploading}
        className="w-full py-4 bg-purple-500 text-white rounded-xl font-semibold text-base hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200 mb-6"
      >
        {parsing ? "Parsing Resume..." : "Parse Resume"}
      </button>

      {(uploading || parsing) && (
        <div className="flex items-center justify-center gap-3 py-3 bg-purple-50 border border-purple-200 rounded-xl text-sm text-purple-600 font-medium mb-6">
          <div className="w-5 h-5 border-3 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
          <span>{uploading ? "Extracting text..." : "AI is parsing your resume..."}</span>
        </div>
      )}

      {error && (
        <div className="py-4 px-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium mb-6">{error}</div>
      )}

      {parsed && (
        <div className="space-y-6">
          {/* Contact */}
          {parsed.contact && (
            <Section title="Contact Information" icon="👤" color="bg-blue-100 text-blue-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {parsed.contact.name && <div className="flex items-center gap-2 text-sm"><span className="font-medium">Name:</span> {parsed.contact.name}</div>}
                {parsed.contact.email && <div className="flex items-center gap-2 text-sm"><span className="font-medium">Email:</span> {parsed.contact.email}</div>}
                {parsed.contact.phone && <div className="flex items-center gap-2 text-sm"><span className="font-medium">Phone:</span> {parsed.contact.phone}</div>}
                {parsed.contact.location && <div className="flex items-center gap-2 text-sm"><span className="font-medium">Location:</span> {parsed.contact.location}</div>}
                {parsed.contact.linkedin && <div className="flex items-center gap-2 text-sm"><span className="font-medium">LinkedIn:</span> {parsed.contact.linkedin}</div>}
                {parsed.contact.website && <div className="flex items-center gap-2 text-sm"><span className="font-medium">Website:</span> {parsed.contact.website}</div>}
                {parsed.contact.github && <div className="flex items-center gap-2 text-sm"><span className="font-medium">GitHub:</span> {parsed.contact.github}</div>}
              </div>
            </Section>
          )}

          {/* Summary */}
          {parsed.summary && (
            <Section title="Professional Summary" icon="📝" color="bg-green-100 text-green-700">
              <p className="text-sm text-gray-600 leading-relaxed">{parsed.summary}</p>
            </Section>
          )}

          {/* Skills */}
          {allSkills.length > 0 && (
            <Section title="Skills" icon="🛠️" color="bg-orange-100 text-orange-700">
              <div className="space-y-3">
                {Object.entries(parsed.skills!).map(([cat, list]) =>
                  list.length > 0 ? (
                    <div key={cat}>
                      <p className="text-xs font-semibold text-text-muted uppercase mb-2">{cat}</p>
                      <div className="flex flex-wrap gap-2">{list.map((s: string) => <SkillBadge key={s} label={s} />)}</div>
                    </div>
                  ) : null
                )}
              </div>
            </Section>
          )}

          {/* Experience */}
          {parsed.experience && parsed.experience.length > 0 && (
            <Section title="Work Experience" icon="💼" color="bg-indigo-100 text-indigo-700">
              <div className="space-y-4">
                {parsed.experience.map((job, i) => (
                  <div key={i} className="border-l-2 border-indigo-200 pl-4">
                    <div className="flex flex-wrap items-baseline gap-2 mb-1">
                      <span className="font-bold text-sm">{job.title}</span>
                      {job.company && <span className="text-sm text-gray-500">@ {job.company}</span>}
                    </div>
                    <div className="flex gap-3 text-xs text-text-muted mb-2">
                      {job.location && <span>📍 {job.location}</span>}
                      <span>📅 {job.startDate}{job.endDate ? ` – ${job.endDate}` : ""}</span>
                    </div>
                    {job.bullets && job.bullets.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {job.bullets.map((b, j) => <li key={j}>{b}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Education */}
          {parsed.education && parsed.education.length > 0 && (
            <Section title="Education" icon="🎓" color="bg-teal-100 text-teal-700">
              <div className="space-y-3">
                {parsed.education.map((edu, i) => (
                  <div key={i} className="border-l-2 border-teal-200 pl-4">
                    <div className="font-bold text-sm">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</div>
                    <div className="text-sm text-gray-500">{edu.institution}</div>
                    <div className="flex gap-3 text-xs text-text-muted mt-1">
                      <span>📅 {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}</span>
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Projects */}
          {parsed.projects && parsed.projects.length > 0 && (
            <Section title="Projects" icon="🚀" color="bg-pink-100 text-pink-700">
              <div className="space-y-3">
                {parsed.projects.map((proj, i) => (
                  <div key={i} className="border-l-2 border-pink-200 pl-4">
                    <div className="font-bold text-sm">{proj.name}</div>
                    <p className="text-sm text-gray-600 mt-1">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {proj.technologies.map((t) => <SkillBadge key={t} label={t} />)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Certifications */}
          {parsed.certifications && parsed.certifications.length > 0 && (
            <Section title="Certifications" icon="📜" color="bg-yellow-100 text-yellow-700">
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {parsed.certifications.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </Section>
          )}

          {/* Languages */}
          {parsed.languages && parsed.languages.length > 0 && (
            <Section title="Languages" icon="🌐" color="bg-cyan-100 text-cyan-700">
              <div className="flex flex-wrap gap-2">
                {parsed.languages.map((l) => <SkillBadge key={l} label={l} />)}
              </div>
            </Section>
          )}

          {/* Awards */}
          {parsed.awards && parsed.awards.length > 0 && (
            <Section title="Awards" icon="🏆" color="bg-amber-100 text-amber-700">
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {parsed.awards.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </Section>
          )}
        </div>
      )}

      {!parsed && !parsing && !error && (
        <div className="text-center py-16 text-text-muted">
          <div className="text-5xl mb-4">🔍</div>
          <p>Upload or paste your resume above, then click &quot;Parse Resume&quot;.</p>
        </div>
      )}
    </div>
  );
}
