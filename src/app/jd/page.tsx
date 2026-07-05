"use client";

import { useState } from "react";
import { trackAnalysis } from "@/lib/track";

interface JD {
  title: string; company: string; location: string; type: string; salary: string;
  remote: string; summary: string;
  requirements: { required: string[]; nice_to_have: string[] };
  skills: { technical: string[]; soft: string[]; tools: string[]; certifications: string[]; languages: string[] };
  experience: { min_years: string; level: string; domains: string[] };
  education: { degree: string; field: string; alternative: string };
  responsibilities: string[]; benefits: string[]; keywords: string[];
  application: { deadline: string; url: string; notes: string };
}

const Badge = ({ label, color = "bg-indigo-50 text-indigo-700 border-indigo-200" }: { label: string; color?: string }) => (
  <span className={`px-3 py-1 border rounded-full text-xs font-medium ${color}`}>{label}</span>
);

const Card = ({ title, icon, children, color = "bg-indigo-100 text-indigo-700" }: { title: string; icon: string; children: React.ReactNode; color?: string }) => (
  <div className="bg-card border border-border rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${color}`}>{icon}</span>
      <h3 className="font-bold text-base">{title}</h3>
    </div>
    {children}
  </div>
);

const Field = ({ label, value }: { label: string; value: string }) => (
  value ? (
    <div className="flex gap-2 text-sm"><span className="font-medium text-text-muted min-w-[120px]">{label}:</span><span>{value}</span></div>
  ) : null
);

export default function JDPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<JD | null>(null);
  const [error, setError] = useState("");

  const parse = async () => {
    if (!jobDescription.trim()) { alert("Please paste a job description."); return; }
    setParsing(true); setError(""); setParsed(null);
    try {
      const res = await fetch("/api/jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setParsing(false); return; }
      setParsed(data.parsed);
      trackAnalysis("jd", "JD Parser");
    } catch { setError("Parsing failed. Please try again."); }
    setParsing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Job Description Parser</h1>
      <p className="text-text-muted mb-8">Paste a job posting to extract structured data: requirements, skills, keywords, and more.</p>

      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-bold mb-4">Paste Job Description</h2>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={15}
          placeholder="Paste the full job posting here...&#10;&#10;Include title, company, requirements, responsibilities, and any other details."
          className="w-full px-3 py-2 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all resize-y min-h-[250px]"
        />
      </div>

      <button
        onClick={parse}
        disabled={parsing}
        className="w-full py-4 bg-teal-500 text-white rounded-xl font-semibold text-base hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-200 mb-6"
      >
        {parsing ? "Parsing Job Description..." : "Parse Job Description"}
      </button>

      {parsing && (
        <div className="flex items-center justify-center gap-3 py-3 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-600 font-medium mb-6">
          <div className="w-5 h-5 border-3 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
          <span>AI is parsing the job description...</span>
        </div>
      )}

      {error && (
        <div className="py-4 px-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium mb-6">{error}</div>
      )}

      {parsed && (
        <div className="space-y-6">
          {/* Overview */}
          <Card title="Overview" icon="📋" color="bg-blue-100 text-blue-700">
            <div className="space-y-2">
              <Field label="Title" value={parsed.title} />
              <Field label="Company" value={parsed.company} />
              <Field label="Location" value={parsed.location} />
              <Field label="Type" value={parsed.type} />
              <Field label="Salary" value={parsed.salary} />
              <Field label="Remote" value={parsed.remote} />
            </div>
            {parsed.summary && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{parsed.summary}</p>}
          </Card>

          {/* Requirements */}
          {parsed.requirements && (parsed.requirements.required.length > 0 || parsed.requirements.nice_to_have.length > 0) && (
            <Card title="Requirements" icon="✅" color="bg-green-100 text-green-700">
              {parsed.requirements.required.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-text-muted uppercase mb-2">Required</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {parsed.requirements.required.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {parsed.requirements.nice_to_have.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase mb-2">Nice to Have</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {parsed.requirements.nice_to_have.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </Card>
          )}

          {/* Skills */}
          {parsed.skills && Object.values(parsed.skills).some((v) => v.length > 0) && (
            <Card title="Skills" icon="🛠️" color="bg-orange-100 text-orange-700">
              <div className="space-y-3">
                {Object.entries(parsed.skills).map(([cat, list]) =>
                  list.length > 0 ? (
                    <div key={cat}>
                      <p className="text-xs font-semibold text-text-muted uppercase mb-2">{cat}</p>
                      <div className="flex flex-wrap gap-2">{list.map((s) => <Badge key={s} label={s} color="bg-orange-50 text-orange-700 border-orange-200" />)}</div>
                    </div>
                  ) : null
                )}
              </div>
            </Card>
          )}

          {/* Experience & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {parsed.experience && (parsed.experience.level || parsed.experience.min_years) && (
              <Card title="Experience" icon="💼" color="bg-purple-100 text-purple-700">
                <Field label="Level" value={parsed.experience.level} />
                <Field label="Min Years" value={parsed.experience.min_years} />
                {parsed.experience.domains.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-text-muted uppercase mb-1">Domains</p>
                    <div className="flex flex-wrap gap-1.5">{parsed.experience.domains.map((d) => <Badge key={d} label={d} color="bg-purple-50 text-purple-700 border-purple-200" />)}</div>
                  </div>
                )}
              </Card>
            )}
            {parsed.education && (parsed.education.degree || parsed.education.field) && (
              <Card title="Education" icon="🎓" color="bg-teal-100 text-teal-700">
                <Field label="Degree" value={parsed.education.degree} />
                <Field label="Field" value={parsed.education.field} />
                <Field label="Alternative" value={parsed.education.alternative} />
              </Card>
            )}
          </div>

          {/* Responsibilities */}
          {parsed.responsibilities && parsed.responsibilities.length > 0 && (
            <Card title="Responsibilities" icon="📝" color="bg-indigo-100 text-indigo-700">
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {parsed.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </Card>
          )}

          {/* ATS Keywords */}
          {parsed.keywords && parsed.keywords.length > 0 && (
            <Card title="ATS Keywords" icon="🔑" color="bg-amber-100 text-amber-700">
              <div className="flex flex-wrap gap-2">{parsed.keywords.map((k) => <Badge key={k} label={k} color="bg-amber-50 text-amber-700 border-amber-200" />)}</div>
            </Card>
          )}

          {/* Benefits */}
          {parsed.benefits && parsed.benefits.length > 0 && (
            <Card title="Benefits" icon="🎁" color="bg-pink-100 text-pink-700">
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {parsed.benefits.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </Card>
          )}

          {/* Application Info */}
          {parsed.application && (parsed.application.deadline || parsed.application.url || parsed.application.notes) && (
            <Card title="Application Info" icon="📮" color="bg-red-100 text-red-700">
              <Field label="Deadline" value={parsed.application.deadline} />
              <Field label="URL" value={parsed.application.url} />
              <Field label="Notes" value={parsed.application.notes} />
            </Card>
          )}
        </div>
      )}

      {!parsed && !parsing && !error && (
        <div className="text-center py-16 text-text-muted">
          <div className="text-5xl mb-4">💼</div>
          <p>Paste a job description above, then click &quot;Parse Job Description&quot;.</p>
        </div>
      )}
    </div>
  );
}
