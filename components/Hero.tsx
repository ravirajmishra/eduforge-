'use client'
import { useState, useEffect } from 'react'
import { Sparkles, Zap, Shield, FileText, Presentation, BookOpen, PenLine, ArrowDown } from 'lucide-react'

const STATS = [
  { value: '4', label: 'Document Types' },
  { value: '∞', label: 'Topics' },
  { value: '10s', label: 'Generation Time' },
  { value: '100%', label: 'AI Powered' },
]

const FLOATING_CARDS = [
  { icon: Presentation, label: 'PowerPoint', color: 'from-indigo-500 to-violet-500', delay: 0 },
  { icon: BookOpen, label: 'Study Notes', color: 'from-emerald-500 to-teal-500', delay: 1.5 },
  { icon: FileText, label: 'Exercises', color: 'from-amber-500 to-orange-500', delay: 0.8 },
  { icon: PenLine, label: 'Articles', color: 'from-rose-500 to-pink-500', delay: 2.2 },
]

export default function Hero({ onScrollToGenerator }: { onScrollToGenerator: () => void }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-4 overflow-hidden mesh-bg">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-violet-100/50 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-10 w-64 h-64 bg-pink-100/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Floating document cards */}
      {FLOATING_CARDS.map((card, i) => {
        const positions = [
          'top-32 left-[8%]',
          'top-40 right-[7%]',
          'bottom-48 left-[6%]',
          'bottom-36 right-[8%]',
        ]
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={`absolute hidden lg:flex items-center gap-2.5 glass rounded-2xl px-4 py-2.5 shadow-glass animate-float ${positions[i]}`}
            style={{ animationDelay: `${card.delay}s`, opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease' }}
          >
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">{card.label}</span>
          </div>
        )
      })}

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 animate-fade-up ${loaded ? '' : 'opacity-0'}`}
        >
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-600">Powered by Gemini Pro</span>
          </div>
          <div className="w-px h-3 bg-indigo-200" />
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-medium text-indigo-600">AI-Powered Document Suite</span>
        </div>

        {/* Headline */}
        <h1
          className={`text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6 animate-fade-up delay-100 ${loaded ? '' : 'opacity-0'}`}
        >
          <span className="text-gray-900">Create anything</span>
          <br />
          <span className="gradient-text">from any topic</span>
        </h1>

        {/* Subheading */}
        <p
          className={`text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up delay-200 ${loaded ? '' : 'opacity-0'}`}
        >
          Generate professional <strong className="text-gray-700">presentations</strong>, structured <strong className="text-gray-700">notes</strong>,{' '}
          <strong className="text-gray-700">exercises</strong>, and platform-ready <strong className="text-gray-700">articles</strong> — all with AI, in seconds.
        </p>

        {/* CTA buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-3 mb-14 animate-fade-up delay-300 ${loaded ? '' : 'opacity-0'}`}
        >
          <button
            onClick={onScrollToGenerator}
            className="btn-primary flex items-center gap-2 px-8 py-4 text-base"
          >
            <Zap className="w-4 h-4" />
            Start Generating — Free
          </button>
          <button className="flex items-center gap-2 px-6 py-4 rounded-full text-sm font-medium text-gray-600 hover:text-indigo-600 glass hover:border-indigo-200 transition-all">
            <Shield className="w-4 h-4 text-gray-400" />
            No account required
          </button>
        </div>

        {/* Stats */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto animate-fade-up delay-400 ${loaded ? '' : 'opacity-0'}`}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl px-4 py-3 text-center">
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={onScrollToGenerator}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-gray-400 hover:text-indigo-500 transition-colors group"
      >
        <span className="text-xs font-medium">Scroll to generate</span>
        <ArrowDown className="w-4 h-4 animate-bounce-soft group-hover:text-indigo-500" />
      </button>
    </section>
  )
}
