'use client'
import { MessageSquare, SlidersHorizontal, Zap, Download } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: MessageSquare,
    title: 'Enter your topic',
    description: 'Type any subject, idea, or concept. Tech, non-tech, academic, business — anything works.',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    number: '02',
    icon: SlidersHorizontal,
    title: 'Customize each document',
    description: 'Choose slide count, style, difficulty, platform, logo, watermark — full control over every detail.',
    color: 'from-sky-500 to-cyan-500',
  },
  {
    number: '03',
    icon: Zap,
    title: 'AI generates everything',
    description: 'Gemini Pro creates structured content with semantic indexing. Pexels fetches matching images automatically.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    number: '04',
    icon: Download,
    title: 'Download & share',
    description: 'Download PPTX, DOCX, or copy your article directly to LinkedIn with hashtags ready to go.',
    color: 'from-amber-500 to-orange-500',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-5xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <span className="section-label">Process</span>
        <h2 className="text-3xl font-bold text-gray-800 mt-2 mb-3">
          How it works
        </h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          From topic to polished documents in under a minute.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {/* Connector line (desktop) */}
        <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-indigo-200 via-sky-200 via-emerald-200 to-amber-200 z-0" />

        {STEPS.map((step, i) => {
          const Icon = step.icon
          return (
            <div key={step.number} className="relative z-10 text-center animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              {/* Number circle */}
              <div className="relative inline-block mb-5">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex flex-col items-center justify-center shadow-glass mx-auto`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center">
                  <span className="text-[9px] font-black text-indigo-500">{step.number}</span>
                </div>
              </div>
              <h3 className="font-bold text-sm text-gray-800 mb-2">{step.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed px-2">{step.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
