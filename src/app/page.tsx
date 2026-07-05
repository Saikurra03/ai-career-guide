import Link from "next/link";

const features = [
  { href: "/upload", icon: "📄", color: "bg-indigo-50", title: "Resume Analysis", desc: "Get a detailed breakdown of your resume with scores and improvement tips." },
  { href: "/ats", icon: "🎯", color: "bg-green-50", title: "ATS Scoring", desc: "Check if your resume passes Applicant Tracking Systems." },
  { href: "/recruiter", icon: "🧑‍💼", color: "bg-orange-50", title: "Recruiter Score", desc: "See how a real recruiter would rate your resume." },
  { href: "/parser", icon: "🔍", color: "bg-purple-50", title: "Resume Parser", desc: "Extract structured data from your resume automatically." },
  { href: "/jd", icon: "💼", color: "bg-teal-50", title: "JD Parser", desc: "Parse job descriptions into structured requirements." },
  { href: "/tailor", icon: "✨", color: "bg-violet-50", title: "Tailor Resume", desc: "Rewrite your resume to match any specific job." },
  { href: "/chat", icon: "💬", color: "bg-emerald-50", title: "AI Chat", desc: "Ask questions and get advice about your resume." },
  { href: "/interview", icon: "🎤", color: "bg-rose-50", title: "Interview Prep", desc: "Practice interview questions tailored to your resume." },
  { href: "/skills", icon: "📊", color: "bg-red-50", title: "Skill Gaps", desc: "Find missing skills and get a learning plan." },
  { href: "/builder", icon: "📝", color: "bg-amber-50", title: "Resume Builder", desc: "Pick a template and let AI format your resume." },
  { href: "/download", icon: "📥", color: "bg-cyan-50", title: "Download PDF", desc: "Export your resume as a clean PDF file." },
  { href: "/history", icon: "📑", color: "bg-pink-50", title: "Version History", desc: "Save, compare, and manage resume versions." },
];

export default function Dashboard() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-text-muted">Upload your resume and get AI-powered feedback to land your dream job.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {features.map((f) => (
          <Link key={f.href} href={f.href} className="bg-white border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all group">
            <div className={`w-11 h-11 ${f.color} rounded-xl flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform`}>{f.icon}</div>
            <h3 className="font-bold text-sm mb-1">{f.title}</h3>
            <p className="text-xs text-text-muted">{f.desc}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-border rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-4">Get Started</h2>
        <p className="text-text-muted mb-6">Upload your resume to receive instant feedback from our AI analyzer.</p>
        <Link href="/upload" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors">
          Analyze My Resume →
        </Link>
      </div>
    </div>
  );
}
