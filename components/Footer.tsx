import { Sparkles, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-indigo-50 bg-white/80 backdrop-blur-xl py-10 mt-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold gradient-text">EduForge</span>
          </div>

          {/* Stack badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Next.js 14', 'Gemini Pro', 'Pexels API', 'PptxGenJS', 'docx', 'Vercel'].map((tech) => (
              <span key={tech} className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
                {tech}
              </span>
            ))}
          </div>

          {/* Credits */}
          <p className="text-xs text-gray-400 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-rose-400 fill-rose-400" /> for educators
          </p>
        </div>

        <div className="divider mt-6 mb-4" />

        <p className="text-center text-xs text-gray-400">
          © {new Date().getFullYear()} EduForge. Powered by Google Gemini &amp; Pexels.
          Content is AI-generated — please review before distribution.
        </p>
      </div>
    </footer>
  )
}
