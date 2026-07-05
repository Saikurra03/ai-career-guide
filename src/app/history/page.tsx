"use client";

import { useState, useEffect } from "react";

interface Version {
  id: string;
  name: string;
  text: string;
  date: string;
  tags: string[];
}

export default function HistoryPage() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [newName, setNewName] = useState("");
  const [newText, setNewText] = useState("");
  const [newTags, setNewTags] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewing, setViewing] = useState<Version | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("resume_versions");
    if (saved) setVersions(JSON.parse(saved));
  }, []);

  const saveVersions = (v: Version[]) => {
    setVersions(v);
    localStorage.setItem("resume_versions", JSON.stringify(v));
  };

  const addVersion = () => {
    if (!newName.trim() || !newText.trim()) { alert("Name and resume text are required."); return; }
    const v: Version = {
      id: Date.now().toString(),
      name: newName,
      text: newText,
      date: new Date().toLocaleString(),
      tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    saveVersions([...versions, v]);
    setNewName(""); setNewText(""); setNewTags("");
  };

  const deleteVersion = (id: string) => {
    if (!confirm("Delete this version?")) return;
    saveVersions(versions.filter((v) => v.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 2 ? [...prev, id] : [prev[1], id]
    );
  };

  const selectedVersions = versions.filter((v) => selectedIds.includes(v.id));

  const diffLines = (a: string, b: string) => {
    const aLines = a.split("\n");
    const bLines = b.split("\n");
    const max = Math.max(aLines.length, bLines.length);
    const result: { line: string; type: "same" | "added" | "removed" }[] = [];
    for (let i = 0; i < max; i++) {
      if (i >= aLines.length) { result.push({ line: bLines[i], type: "added" }); }
      else if (i >= bLines.length) { result.push({ line: aLines[i], type: "removed" }); }
      else if (aLines[i] === bLines[i]) { result.push({ line: aLines[i], type: "same" }); }
      else { result.push({ line: aLines[i], type: "removed" }); result.push({ line: bLines[i], type: "added" }); }
    }
    return result;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Version History</h1>
      <p className="text-text-muted mb-8">Save, compare, and manage different versions of your resume.</p>

      {/* Add Version */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-bold mb-4">Save New Version</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Version name (e.g. v1 - Backend Focus)"
            className="px-3 py-2 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary"
          />
          <input
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="px-3 py-2 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          rows={8}
          placeholder="Paste your resume text here..."
          className="w-full px-3 py-2 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-y min-h-[120px] mb-4"
        />
        <button onClick={addVersion} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-all">
          Save Version
        </button>
      </div>

      {/* Version List */}
      {versions.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Saved Versions ({versions.length})</h2>
            {selectedIds.length === 2 && (
              <span className="text-xs text-primary font-medium">Comparing {selectedIds.length} versions</span>
            )}
          </div>
          <div className="space-y-3">
            {versions.map((v) => (
              <div key={v.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                selectedIds.includes(v.id) ? "border-primary bg-indigo-50" : "border-border hover:border-primary/30"
              }`}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(v.id)}
                  onChange={() => toggleSelect(v.id)}
                  className="w-4 h-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{v.name}</div>
                  <div className="text-xs text-text-muted">{v.date}</div>
                  {v.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-1.5">
                      {v.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-medium">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setViewing(v)} className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-hover-bg">View</button>
                <button onClick={() => { navigator.clipboard.writeText(v.text); }} className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-hover-bg">Copy</button>
                <button onClick={() => deleteVersion(v.id)} className="px-3 py-1.5 text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diff View */}
      {selectedVersions.length === 2 && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-bold mb-4">Comparison: {selectedVersions[0].name} vs {selectedVersions[1].name}</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 max-h-[400px] overflow-y-auto font-mono text-xs">
            {(() => {
              const diffs = diffLines(selectedVersions[0].text, selectedVersions[1].text);
              return diffs.map((d, i) => (
                <div key={i} className={`px-2 py-0.5 rounded ${
                  d.type === "added" ? "bg-green-100 text-green-800" :
                  d.type === "removed" ? "bg-red-100 text-red-800" :
                  "text-gray-600"
                }`}>
                  {d.type === "added" ? "+ " : d.type === "removed" ? "- " : "  "}{d.line || "\u00A0"}
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewing(null)}>
          <div className="bg-card rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 className="font-bold">{viewing.name}</h3>
                <p className="text-xs text-text-muted">{viewing.date}</p>
              </div>
              <button onClick={() => setViewing(null)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">{viewing.text}</pre>
            </div>
          </div>
        </div>
      )}

      {versions.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <div className="text-5xl mb-4">📑</div>
          <p>No saved versions yet. Add your first version above!</p>
        </div>
      )}
    </div>
  );
}
