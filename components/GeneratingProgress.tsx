'use client'
import { Loader2, CheckCircle, Sparkles } from 'lucide-react'

interface GeneratingProps {
  message: string
  progress: number
  steps: Array<{ label: string; done: boolean; active: boolean }>
}

export default function GeneratingProgress({ message, progress, steps }: GeneratingProps) {
  return (
    <div className="text-center py-12 animate-fade-in">
      {/* Animated spinner */}
      <div className="relative w-20 h-20 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin"
          style={{ animationDuration: '0.8s' }}
        />
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
      </div>

      {/* Status message */}
      <p className="text-lg font-semibold text-gray-800 mb-1">{message}</p>
      <p className="text-sm text-gray-500 mb-6">Please wait, this usually takes 20–60 seconds</p>

      {/* Progress bar */}
      <div className="max-w-sm mx-auto mb-8">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full progress-bar rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex flex-col gap-2 max-w-xs mx-auto">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300 ${
              step.active ? 'bg-indigo-50 border border-indigo-200' : step.done ? 'opacity-50' : 'opacity-30'
            }`}
          >
            <div className="w-5 h-5 flex-shrink-0">
              {step.done ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : step.active ? (
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
              )}
            </div>
            <span className={`text-xs font-medium ${step.active ? 'text-indigo-700' : step.done ? 'text-gray-500' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
