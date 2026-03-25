'use client'
import { Presentation, BookOpen, FileText, PenLine, Image, Droplets, Cpu, Layers, Shield, Zap, Code2, Globe } from 'lucide-react'

const FEATURES = [
  {
    icon: Layers,
    title: 'Uniform Layouts',
    description: 'Semantic zone indexing ensures text and images never overlap in any document.',
    color: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-50',
  },
  {
    icon: Image,
    title: 'Pexels Images',
    description: 'Every slide gets contextually relevant, high-quality images auto-fetched from Pexels.',
    color: 'from-sky-500 to-cyan-500',
    bg: 'bg-sky-50',
  },
  {
    icon: Droplets,
    title: 'Logo & Watermark',
    description: 'Add your brand logo and watermark to PPTs, notes and exercises with one click.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: Code2,
    title: 'Coding Problems',
    description: 'Tech topics auto-include working code blocks, starter templates and coding exercises.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
  },
  {
    icon: Globe,
    title: 'LinkedIn Workflow',
    description: 'AI-generated SVG workflow diagrams, ready to post or embed in LinkedIn articles.',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
  },
  {
    icon: Cpu,
    title: 'Gemini Pro AI',
    description: 'Powered by Gemini 1.5 Pro — accurate, current and hallucination-minimized content.',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50',
  },
  {
    icon: Shield,
    title: 'Content Moderation',
    description: 'Structured prompts with semantic page/line indexing eliminate content overlap issues.',
    color: 'from-slate-500 to-gray-500',
    bg: 'bg-slate-50',
  },
  {
    icon: Zap,
    title: 'All-in-One',
    description: 'Generate PPTX, DOCX notes, DOCX exercises and platform-ready articles in one click.',
    color: 'from-yellow-500 to-amber-400',
    bg: 'bg-yellow-50',
  },
]

const DOC_TYPES = [
  { icon: Presentation, label: 'PowerPoint', sub: '.pptx', color: 'text-indigo-500 bg-indigo-50' },
  { icon: BookOpen, label: 'Study Notes', sub: '.docx', color: 'text-emerald-500 bg-emerald-50' },
  { icon: FileText, label: 'Exercises', sub: '.docx', color: 'text-amber-500 bg-amber-50' },
  { icon: PenLine, label: 'Article', sub: '.txt / copy', color: 'text-rose-500 bg-rose-50' },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 py-20">
      {/* Doc types strip */}
      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {DOC_TYPES.map((d) => {
          const Icon = d.icon
          return (
            <div key={d.label} className={`flex items-center gap-2.5 glass rounded-2xl px-5 py-3`}>
              <div className={`w-8 h-8 rounded-xl ${d.color} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">{d.label}</p>
                <p className="text-[10px] text-gray-400">{d.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Features header */}
      <div className="text-center mb-12">
        <span className="section-label">Features</span>
        <h2 className="text-3xl font-bold text-gray-800 mt-2 mb-3">
          Everything you need, nothing you don't
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto text-sm">
          Every document is structured with semantic page indexing so content is always uniform, professional and ready to share.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f, i) => {
          const Icon = f.icon
          return (
            <div
              key={f.title}
              className="glass-card p-5 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-sm text-gray-800 mb-1.5">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
