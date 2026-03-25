'use client'
import { ReactNode, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface DocumentCardProps {
  id: string
  title: string
  description: string
  icon: ReactNode
  color: string
  gradient: string
  enabled: boolean
  onToggle: () => void
  children: ReactNode  // options panel content
  badge?: string
}

export default function DocumentCard({
  title, description, icon, color, gradient,
  enabled, onToggle, children, badge,
}: DocumentCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`doc-card ${enabled ? 'selected' : ''}`} style={{ borderColor: enabled ? color : 'transparent' }}>
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Toggle checkbox */}
        <button
          onClick={onToggle}
          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border-2 transition-all duration-200 ${
            enabled
              ? 'border-transparent text-white'
              : 'border-gray-300 bg-white'
          }`}
          style={{ backgroundColor: enabled ? color : 'white' }}
        >
          {enabled && <Check className="w-3 h-3" />}
        </button>

        {/* Icon + info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div
              className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}
            >
              {icon}
            </div>
            <span className="font-semibold text-sm text-gray-800">{title}</span>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">{badge}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 leading-snug">{description}</p>
        </div>

        {/* Expand toggle */}
        {enabled && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className={`mt-0.5 p-1 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all ${expanded ? 'rotate-180' : ''}`}
            style={{ transition: 'transform 0.25s ease' }}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Options panel (animated expand) */}
      {enabled && expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 animate-slide-down">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Reusable option components used inside DocumentCard ────────────────────

interface SliderOptionProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
}

export function SliderOption({ label, value, min, max, step = 1, unit = '', onChange }: SliderOptionProps) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs font-bold text-indigo-600 tabular-nums">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #6366f1 ${pct}%, #e5e7eb ${pct}%)`,
        }}
      />
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-gray-400">{min}</span>
        <span className="text-[10px] text-gray-400">{max}</span>
      </div>
    </div>
  )
}

interface PillToggleProps {
  label: string
  options: Array<{ value: string; label: string }>
  value: string
  onChange: (v: string) => void
}

export function PillToggleOption({ label, options, value, onChange }: PillToggleProps) {
  return (
    <div className="mb-3">
      <span className="text-xs font-medium text-gray-600 block mb-1.5">{label}</span>
      <div className="pill-toggle p-0.5 inline-flex flex-wrap gap-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`pill-option text-xs ${value === opt.value ? 'active' : ''}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

interface CheckToggleProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  description?: string
}

export function CheckToggle({ label, checked, onChange, description }: CheckToggleProps) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group mb-2">
      <div
        className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
          checked ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 bg-white'
        }`}
        onClick={() => onChange(!checked)}
      >
        {checked && <Check className="w-2.5 h-2.5 text-white" />}
      </div>
      <div>
        <span className="text-xs font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">{label}</span>
        {description && <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>}
      </div>
    </label>
  )
}

interface TextInputOptionProps {
  label: string
  value: string
  placeholder?: string
  onChange: (v: string) => void
}

export function TextInputOption({ label, value, placeholder, onChange }: TextInputOptionProps) {
  return (
    <div className="mb-3">
      <span className="text-xs font-medium text-gray-600 block mb-1.5">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white/80 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
      />
    </div>
  )
}
