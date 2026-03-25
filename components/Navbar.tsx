'use client'
import { useState, useEffect } from 'react'
import { Sparkles, Github, BookOpen, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-indigo-100/60 shadow-glass'
          : 'bg-transparent border-b border-transparent'
      }`}
      style={{ backdropFilter: scrolled ? 'blur(24px)' : 'none' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight gradient-text">EduForge</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium">
              How it works
            </a>
            <a href="#generator" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium">
              Generate
            </a>
            <a href="#features" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium">
              Features
            </a>
            <div className="w-px h-4 bg-indigo-100" />
            <a
              
            <a href="#generator" className="btn-primary px-4 py-2 text-sm">
              Start Creating
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-indigo-50 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-slide-down">
            <div className="flex flex-col gap-1 pt-2 border-t border-indigo-50">
              {['How it works', 'Generate', 'Features'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  {item}
                </a>
              ))}
              <a href="#generator" className="btn-primary mt-2 px-4 py-2.5 text-sm text-center">
                Start Creating
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
