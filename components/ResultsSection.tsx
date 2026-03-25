'use client'
import { useState } from 'react'
import { Download, FileText, Presentation, BookOpen, PenLine, CheckCircle, AlertCircle, Copy, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import type { GenerateAllResponse, GenerationResult } from '@/lib/types'

interface ResultsSectionProps {
  results: GenerateAllResponse
  topic: string
  onReset: () => void
}

const DOC_META = {
  ppt: {
    label: 'Presentation',
    icon: Presentation,
    color: '#6366f1',
    gradient: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    ext: 'pptx',
  },
  notes: {
    label: 'Study Notes',
    icon: BookOpen,
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    ext: 'docx',
  },
  exercises: {
    label: 'Exercises',
    icon: FileText,
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    ext: 'docx',
  },
  article: {
    label: 'Article',
    icon: PenLine,
    color: '#ec4899',
    gradient: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200',
    ext: 'txt',
  },
}

function downloadFile(base64: string, fileName: string, mimeType: string) {
  const byteChars = atob(base64)
  const byteNums = new Array(byteChars.length).fill(0).map((_, i) => byteChars.charCodeAt(i))
  const byteArray = new Uint8Array(byteNums)
  const blob = new Blob([byteArray], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function ResultCard({ type, result, topic }: { type: string; result: GenerationResult; topic: string }) {
  const meta = DOC_META[type as keyof typeof DOC_META]
  const Icon = meta.icon
  const [articleOpen, setArticleOpen] = useState(false)

  const handleDownload = () => {
    if (!result.fileBase64 || !result.fileName || !result.mimeType) return
    downloadFile(result.fileBase64, result.fileName, result.mimeType)
    toast.success(`${meta.label} downloaded!`)
  }

  const handleCopyArticle = () => {
    if (!result.articleContent) return
    const text = document.getElementById(`article-text-${type}`)?.innerText || ''
    navigator.clipboard.writeText(text).then(() => toast.success('Article copied to clipboard!'))
  }

  const handleDownloadWorkflow = () => {
    if (!result.workflowSvg) return
    const blob = new Blob([result.workflowSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}_workflow.svg`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Workflow SVG downloaded!')
  }

  if (result.status === 'error') {
    return (
      <div className={`glass rounded-2xl p-5 border ${meta.borderColor} opacity-70`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${meta.bgColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${meta.textColor}`} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-700">{meta.label}</p>
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Generation failed
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`glass rounded-2xl border result-glow transition-all duration-300 ${meta.borderColor} overflow-hidden`}>
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-800">{meta.label}</p>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xs text-gray-500">{result.fileName}</p>
          </div>
        </div>

        {/* Download button */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex-1 justify-center"
            style={{ background: `linear-gradient(135deg, ${meta.color}CC, ${meta.color})` }}
          >
            <Download className="w-4 h-4" />
            Download {meta.ext.toUpperCase()}
          </button>

          {/* Article-specific actions */}
          {type === 'article' && result.articleContent && (
            <>
              <button
                onClick={handleCopyArticle}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-gray-600 glass hover:border-rose-200 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
              <button
                onClick={() => setArticleOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-gray-600 glass hover:border-rose-200 transition-all"
              >
                {articleOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                Preview
              </button>
            </>
          )}

          {/* Workflow SVG download */}
          {result.workflowSvg && (
            <button
              onClick={handleDownloadWorkflow}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Workflow SVG
            </button>
          )}
        </div>
      </div>

      {/* Article preview */}
      {type === 'article' && articleOpen && result.articleContent && (
        <div className="border-t border-gray-100 p-5 animate-slide-down">
          <div id={`article-text-${type}`} className="space-y-3">
            <h3 className="font-bold text-lg text-gray-800 leading-snug">{result.articleContent.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{result.articleContent.hook}</p>
            {result.articleContent.sections.slice(0, 3).map((section, i) => (
              <div key={i}>
                {section.heading && (
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">{section.heading}</h4>
                )}
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{section.content}</p>
              </div>
            ))}
            {result.articleContent.hashtags?.length ? (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {result.articleContent.hashtags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-600">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Workflow diagram preview */}
          {result.workflowSvg && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Workflow Diagram</p>
              <div
                className="rounded-xl overflow-hidden border border-gray-200"
                dangerouslySetInnerHTML={{ __html: result.workflowSvg }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ResultsSection({ results, topic, onReset }: ResultsSectionProps) {
  const types = ['ppt', 'notes', 'exercises', 'article'] as const
  const available = types.filter((t) => results[t])

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-semibold text-emerald-600">All documents generated!</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Your content for <span className="gradient-text">"{topic}"</span>
        </h2>
        <p className="text-sm text-gray-500">
          {available.length} document{available.length !== 1 ? 's' : ''} ready to download
        </p>
      </div>

      {/* Result cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {available.map((type) => (
          <ResultCard
            key={type}
            type={type}
            result={results[type]!}
            topic={topic}
          />
        ))}
      </div>

      {/* Tech badge */}
      {results.isTechTopic && (
        <div className="flex justify-center mb-6">
          <div className="glass rounded-full px-4 py-2 text-xs font-medium text-indigo-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Tech topic detected — coding problems included
          </div>
        </div>
      )}

      {/* Generate again */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-full text-sm font-semibold text-indigo-600 glass hover:border-indigo-300 transition-all hover:-translate-y-0.5"
        >
          Generate something new
        </button>
      </div>
    </div>
  )
}
