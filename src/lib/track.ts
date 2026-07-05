export function trackAnalysis(type: string, title: string, score?: string) {
  try {
    const saved = localStorage.getItem("resume_analytics");
    const analyses = saved ? JSON.parse(saved) : [];
    const a = {
      id: Date.now().toString(),
      type,
      date: new Date().toLocaleString(),
      title,
      score,
    };
    analyses.unshift(a);
    localStorage.setItem("resume_analytics", JSON.stringify(analyses));
  } catch {}
}
