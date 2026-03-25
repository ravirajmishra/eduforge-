'use client'
import { useState, useRef } from 'react'
import {
  Presentation, BookOpen, FileText, PenLine,
  Sparkles, Settings2, Globe, Zap, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import DocumentCard, { SliderOption, PillToggleOption, CheckToggle, TextInputOption } from '@/components/DocumentCard'
import LogoUpload from '@/components/LogoUpload'
import GeneratingProgress from '@/components/GeneratingProgress'
import ResultsSection from '@/components/ResultsSection'
import type { GenerationConfig, GenerateAllResponse, PPTStyle, NotesStyle, ExerciseStyle, ArticlePlatform, ArticleTone, Difficulty, ColorScheme } from '@/lib/types'

const DEFAULT_CONFIG: GenerationConfig = {
  topic: '',
  isTechTopic: 'auto',
  generatePPT: true,
  generateNotes: true,
  generateExercises: false,
  generateArticle: false,
  globalLogoBase64: undefined,
  globalWatermark: '',
  pptOptions: {
    slideCount: 10,
    style: 'balanced',
    colorScheme: 'indigo',
    includeImages: true,
    includeWorkflow: true,
    includeTableOfContents: true,
    includeSummarySlide: true,
    speakerNotes: true,
    addLogo: false,
    watermarkText: '',
  },
  notesOptions: {
    pageCount: 5,
    style: 'structured',
    includeCoding: true,
    includeExamples: true,
    includeKeyTerms: true,
    includeQuickRecap: true,
    addLogo: false,
    watermarkText: '',
  },
  exerciseOptions: {
    problemCount: 10,
    difficulty: 'mixed',
    includeCoding: true,
    includeAnswerKey: true,
    includeHints: true,
    exerciseStyle: 'worksheet',
    addLogo: false,
    watermarkText: '',
  },
  articleOptions: {
    platform: 'linkedin',
    tone: 'professional',
    wordCount: 800,
    includeHashtags: true,
    includeWorkflowDiagram: true,
    includeStats: true,
    includeCallToAction: true,
    hashtagCount: 8,
  },
}

const GENERATION_STEPS = [
  { label: 'Analyzing topic', key: 'analyzing' },
  { label: 'Generating presentation', key: 'generating-ppt' },
  { label: 'Writing study notes', key: 'generating-notes' },
  { label: 'Creating exercises', key: 'generating-exercises' },
  { label: 'Drafting article', key: 'generating-article' },
  { label: 'Finalizing files', key: 'finalizing' },
]

const COLOR_SCHEMES: Array<{ value: ColorScheme; label: string; hex: string }> = [
  { value: 'indigo', label: 'Indigo', hex: '#6366f1' },
  { value: 'violet', label: 'Violet', hex: '#7c3aed' },
  { value: 'emerald', label: 'Emerald', hex: '#059669' },
  { value: 'rose', label: 'Rose', hex: '#e11d48' },
  { value: 'amber', label: 'Amber', hex: '#d97706' },
  { value: 'slate', label: 'Slate', hex: '#475569' },
]

export default function GeneratorForm() {
  const [config, setConfig] = useState<GenerationConfig>(DEFAULT_CONFIG)
  const [step, setStep] = useState<string>('idle')
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState('')
  const [results, setResults] = useState<GenerateAllResponse | null>(null)
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false)
  const [topicFocused, setTopicFocused] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const updatePPT = (patch: Partial<typeof config.pptOptions>) =>
    setConfig((c) => ({ ...c, pptOptions: { ...c.pptOptions, ...patch } }))
  const updateNotes = (patch: Partial<typeof config.notesOptions>) =>
    setConfig((c) => ({ ...c, notesOptions: { ...c.notesOptions, ...patch } }))
  const updateExercise = (patch: Partial<typeof config.exerciseOptions>) =>
    setConfig((c) => ({ ...c, exerciseOptions: { ...c.exerciseOptions, ...patch } }))
  const updateArticle = (patch: Partial<typeof config.articleOptions>) =>
    setConfig((c) => ({ ...c, articleOptions: { ...c.articleOptions, ...patch } }))

  const anySelected = config.generatePPT || config.generateNotes || config.generateExercises || config.generateArticle

  const handleGenerate = async () => {
    if (!config.topic.trim()) {
      toast.error('Please enter a topic first')
      return
    }
    if (!anySelected) {
      toast.error('Select at least one document type')
      return
    }

    setStep('analyzing')
    setProgress(5)
    setCurrentMessage('Analyzing your topic with Gemini Pro...')
    setResults(null)

    // Simulate progress steps
    const progressSteps = [
      { pct: 15, msg: 'Analyzing topic...', key: 'analyzing' },
      { pct: 35, msg: 'Generating presentation slides...', key: 'generating-ppt' },
      { pct: 55, msg: 'Writing study notes...', key: 'generating-notes' },
      { pct: 70, msg: 'Creating exercises...', key: 'generating-exercises' },
      { pct: 85, msg: 'Drafting article...', key: 'generating-article' },
      { pct: 95, msg: 'Finalizing and packaging files...', key: 'finalizing' },
    ]

    let progressInterval: ReturnType<typeof setInterval>
    let stepIdx = 0

    progressInterval = setInterval(() => {
      if (stepIdx < progressSteps.length) {
        const s = progressSteps[stepIdx]
        setProgress(s.pct)
        setCurrentMessage(s.msg)
        setStep(s.key)
        stepIdx++
      }
    }, 3500)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      clearInterval(progressInterval)

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Generation failed')
      }

      const data: GenerateAllResponse = await res.json()
      setProgress(100)
      setCurrentMessage('Done!')
      setStep('done')
      setResults(data)
      toast.success('Documents generated successfully!')
    } catch (err) {
      clearInterval(progressInterval)
      setStep('error')
      toast.error(String(err).replace('Error: ', ''))
    }
  }

  const handleReset = () => {
    setStep('idle')
    setProgress(0)
    setResults(null)
    setConfig((c) => ({ ...c, topic: '' }))
    window.scrollTo({ top: formRef.current?.offsetTop ?? 0, behavior: 'smooth' })
  }

  // Build steps for progress component
  const progressStepsList = GENERATION_STEPS.map((s) => ({
    label: s.label,
    done: (() => {
      const order = GENERATION_STEPS.map((x) => x.key)
      const currentIdx = order.indexOf(step)
      const thisIdx = order.indexOf(s.key)
      return thisIdx < currentIdx
    })(),
    active: s.key === step,
  }))

  const isGenerating = !['idle', 'done', 'error'].includes(step)

  return (
    <section id="generator" ref={formRef} className="max-w-3xl mx-auto px-4 py-16">
      {/* Section header */}
      <div className="text-center mb-10 animate-fade-up">
        <span className="section-label">Generator</span>
        <h2 className="text-3xl font-bold text-gray-800 mt-2 mb-3">
          What do you want to create?
        </h2>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          Enter any topic. Select what to generate. Customize every detail. Download in seconds.
        </p>
      </div>

      {/* Results view */}
      {step === 'done' && results ? (
        <ResultsSection results={results} topic={config.topic} onReset={handleReset} />
      ) : isGenerating ? (
        <div className="glass rounded-3xl p-8">
          <GeneratingProgress
            message={currentMessage}
            progress={progress}
            steps={progressStepsList}
          />
        </div>
      ) : (
        <div className="space-y-5 animate-fade-up">

          {/* ── Topic Input ─────────────────────────────────────────────── */}
          <div className={`glass rounded-2xl p-5 transition-all duration-300 ${topicFocused ? 'ring-2 ring-indigo-300 shadow-card-hover' : ''}`}>
            <label className="section-label mb-3 block">Topic or Idea</label>
            <textarea
              className="input-glass resize-none text-base"
              rows={3}
              placeholder="e.g. Machine Learning fundamentals, The French Revolution, Digital Marketing strategy, React hooks..."
              value={config.topic}
              onChange={(e) => setConfig((c) => ({ ...c, topic: e.target.value }))}
              onFocus={() => setTopicFocused(true)}
              onBlur={() => setTopicFocused(false)}
            />
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-gray-400">Quick picks:</span>
              {['Machine Learning', 'Python Basics', 'Climate Change', 'Leadership Skills', 'React Hooks'].map((t) => (
                <button
                  key={t}
                  onClick={() => setConfig((c) => ({ ...c, topic: t }))}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tech Topic Toggle ───────────────────────────────────────── */}
          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <Globe className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700">Topic Type Detection</p>
              <p className="text-[10px] text-gray-400">Auto-detect adds coding problems for tech topics</p>
            </div>
            <div className="pill-toggle p-0.5">
              {(['auto', 'true', 'false'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setConfig((c) => ({ ...c, isTechTopic: v === 'true' ? true : v === 'false' ? false : 'auto' }))}
                  className={`pill-option text-xs ${(config.isTechTopic === 'auto' ? 'auto' : config.isTechTopic ? 'true' : 'false') === v ? 'active' : ''}`}
                >
                  {v === 'auto' ? '✨ Auto' : v === 'true' ? '💻 Tech' : '📚 Non-Tech'}
                </button>
              ))}
            </div>
          </div>

          {/* ── Document Type Selector ─────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="section-label">Select Documents</span>
              <span className="text-xs text-gray-400">Click to expand options</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* PPT Card */}
              <DocumentCard
                id="ppt"
                title="Presentation (PPTX)"
                description="Professional slides with images, layouts, speaker notes & workflows"
                icon={<Presentation className="w-4 h-4 text-white" />}
                color="#6366f1"
                gradient="from-indigo-500 to-violet-500"
                enabled={config.generatePPT}
                onToggle={() => setConfig((c) => ({ ...c, generatePPT: !c.generatePPT }))}
                badge="Most Popular"
              >
                <div className="grid grid-cols-2 gap-x-6">
                  <SliderOption label="Number of Slides" value={config.pptOptions.slideCount} min={5} max={30} onChange={(v) => updatePPT({ slideCount: v })} />
                  <div />
                  <PillToggleOption
                    label="Presentation Style"
                    options={[
                      { value: 'professional', label: 'Professional' },
                      { value: 'balanced', label: 'Balanced' },
                      { value: 'creative', label: 'Creative' },
                      { value: 'minimalist', label: 'Minimal' },
                      { value: 'bold', label: 'Bold' },
                    ]}
                    value={config.pptOptions.style}
                    onChange={(v) => updatePPT({ style: v as PPTStyle })}
                  />
                  <div>
                    <span className="text-xs font-medium text-gray-600 block mb-1.5">Color Scheme</span>
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_SCHEMES.map((cs) => (
                        <button
                          key={cs.value}
                          onClick={() => updatePPT({ colorScheme: cs.value })}
                          title={cs.label}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${config.pptOptions.colorScheme === cs.value ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-110'}`}
                          style={{ backgroundColor: cs.hex }}
                        />
                      ))}
                    </div>
                  </div>
                  <CheckToggle label="Include Images (Pexels)" checked={config.pptOptions.includeImages} onChange={(v) => updatePPT({ includeImages: v })} />
                  <CheckToggle label="Include Workflow Slide" checked={config.pptOptions.includeWorkflow} onChange={(v) => updatePPT({ includeWorkflow: v })} />
                  <CheckToggle label="Table of Contents" checked={config.pptOptions.includeTableOfContents} onChange={(v) => updatePPT({ includeTableOfContents: v })} />
                  <CheckToggle label="Summary Slide" checked={config.pptOptions.includeSummarySlide} onChange={(v) => updatePPT({ includeSummarySlide: v })} />
                  <CheckToggle label="Speaker Notes" checked={config.pptOptions.speakerNotes} onChange={(v) => updatePPT({ speakerNotes: v })} />
                  <CheckToggle label="Add Logo" checked={config.pptOptions.addLogo} onChange={(v) => updatePPT({ addLogo: v })} />
                </div>
                {config.pptOptions.addLogo && (
                  <div className="mt-2">
                    <LogoUpload
                      value={config.pptOptions.logoBase64 || config.globalLogoBase64}
                      onChange={(v) => updatePPT({ logoBase64: v })}
                    />
                  </div>
                )}
                <TextInputOption
                  label="Watermark Text (optional)"
                  value={config.pptOptions.watermarkText}
                  placeholder="e.g. CONFIDENTIAL or your brand name"
                  onChange={(v) => updatePPT({ watermarkText: v })}
                />
              </DocumentCard>

              {/* Notes Card */}
              <DocumentCard
                id="notes"
                title="Study Notes (DOCX)"
                description="Structured pages with key terms, examples, code blocks & recaps"
                icon={<BookOpen className="w-4 h-4 text-white" />}
                color="#10b981"
                gradient="from-emerald-500 to-teal-500"
                enabled={config.generateNotes}
                onToggle={() => setConfig((c) => ({ ...c, generateNotes: !c.generateNotes }))}
              >
                <div className="grid grid-cols-2 gap-x-6">
                  <SliderOption label="Number of Pages" value={config.notesOptions.pageCount} min={1} max={20} onChange={(v) => updateNotes({ pageCount: v })} />
                  <div />
                  <PillToggleOption
                    label="Notes Style"
                    options={[
                      { value: 'structured', label: 'Structured' },
                      { value: 'detailed', label: 'Detailed' },
                      { value: 'concise', label: 'Concise' },
                      { value: 'cornell', label: 'Cornell' },
                      { value: 'outline', label: 'Outline' },
                    ]}
                    value={config.notesOptions.style}
                    onChange={(v) => updateNotes({ style: v as NotesStyle })}
                  />
                  <div />
                  <CheckToggle label="Include Coding (for tech)" checked={config.notesOptions.includeCoding} onChange={(v) => updateNotes({ includeCoding: v })} />
                  <CheckToggle label="Include Examples" checked={config.notesOptions.includeExamples} onChange={(v) => updateNotes({ includeExamples: v })} />
                  <CheckToggle label="Key Terms / Glossary" checked={config.notesOptions.includeKeyTerms} onChange={(v) => updateNotes({ includeKeyTerms: v })} />
                  <CheckToggle label="Quick Recap Boxes" checked={config.notesOptions.includeQuickRecap} onChange={(v) => updateNotes({ includeQuickRecap: v })} />
                  <CheckToggle label="Add Logo" checked={config.notesOptions.addLogo} onChange={(v) => updateNotes({ addLogo: v })} />
                </div>
                {config.notesOptions.addLogo && (
                  <div className="mt-2">
                    <LogoUpload
                      value={config.notesOptions.logoBase64 || config.globalLogoBase64}
                      onChange={(v) => updateNotes({ logoBase64: v })}
                    />
                  </div>
                )}
                <TextInputOption
                  label="Watermark Text (optional)"
                  value={config.notesOptions.watermarkText}
                  placeholder="e.g. DRAFT or institute name"
                  onChange={(v) => updateNotes({ watermarkText: v })}
                />
              </DocumentCard>

              {/* Exercises Card */}
              <DocumentCard
                id="exercises"
                title="Exercise Sheet (DOCX)"
                description="Problems with MCQs, coding, hints & answer key — auto-graded layout"
                icon={<FileText className="w-4 h-4 text-white" />}
                color="#f59e0b"
                gradient="from-amber-500 to-orange-500"
                enabled={config.generateExercises}
                onToggle={() => setConfig((c) => ({ ...c, generateExercises: !c.generateExercises }))}
              >
                <div className="grid grid-cols-2 gap-x-6">
                  <SliderOption label="Number of Problems" value={config.exerciseOptions.problemCount} min={5} max={50} onChange={(v) => updateExercise({ problemCount: v })} />
                  <div />
                  <PillToggleOption
                    label="Difficulty Level"
                    options={[
                      { value: 'easy', label: 'Easy' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'hard', label: 'Hard' },
                      { value: 'mixed', label: 'Mixed' },
                    ]}
                    value={config.exerciseOptions.difficulty}
                    onChange={(v) => updateExercise({ difficulty: v as Difficulty })}
                  />
                  <PillToggleOption
                    label="Exercise Style"
                    options={[
                      { value: 'worksheet', label: 'Worksheet' },
                      { value: 'quiz', label: 'Quiz' },
                      { value: 'problem-set', label: 'Problem Set' },
                      { value: 'case-study', label: 'Case Study' },
                    ]}
                    value={config.exerciseOptions.exerciseStyle}
                    onChange={(v) => updateExercise({ exerciseStyle: v as ExerciseStyle })}
                  />
                  <CheckToggle label="Include Coding Problems" checked={config.exerciseOptions.includeCoding} onChange={(v) => updateExercise({ includeCoding: v })} description="Adds real code challenges for tech topics" />
                  <CheckToggle label="Include Answer Key" checked={config.exerciseOptions.includeAnswerKey} onChange={(v) => updateExercise({ includeAnswerKey: v })} />
                  <CheckToggle label="Include Hints" checked={config.exerciseOptions.includeHints} onChange={(v) => updateExercise({ includeHints: v })} />
                  <CheckToggle label="Add Logo" checked={config.exerciseOptions.addLogo} onChange={(v) => updateExercise({ addLogo: v })} />
                </div>
                {config.exerciseOptions.addLogo && (
                  <div className="mt-2">
                    <LogoUpload
                      value={config.exerciseOptions.logoBase64 || config.globalLogoBase64}
                      onChange={(v) => updateExercise({ logoBase64: v })}
                    />
                  </div>
                )}
                <TextInputOption
                  label="Watermark Text (optional)"
                  value={config.exerciseOptions.watermarkText}
                  placeholder="e.g. DO NOT DISTRIBUTE"
                  onChange={(v) => updateExercise({ watermarkText: v })}
                />
              </DocumentCard>

              {/* Article Card */}
              <DocumentCard
                id="article"
                title="Article / Post"
                description="Platform-ready LinkedIn, Medium or blog posts with hashtags & workflow diagrams"
                icon={<PenLine className="w-4 h-4 text-white" />}
                color="#ec4899"
                gradient="from-rose-500 to-pink-500"
                enabled={config.generateArticle}
                onToggle={() => setConfig((c) => ({ ...c, generateArticle: !c.generateArticle }))}
                badge="LinkedIn Ready"
              >
                <div className="grid grid-cols-2 gap-x-6">
                  <PillToggleOption
                    label="Platform"
                    options={[
                      { value: 'linkedin', label: 'LinkedIn' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'blog', label: 'Blog' },
                      { value: 'newsletter', label: 'Newsletter' },
                    ]}
                    value={config.articleOptions.platform}
                    onChange={(v) => updateArticle({ platform: v as ArticlePlatform })}
                  />
                  <PillToggleOption
                    label="Writing Tone"
                    options={[
                      { value: 'professional', label: 'Professional' },
                      { value: 'casual', label: 'Casual' },
                      { value: 'technical', label: 'Technical' },
                      { value: 'storytelling', label: 'Story' },
                    ]}
                    value={config.articleOptions.tone}
                    onChange={(v) => updateArticle({ tone: v as ArticleTone })}
                  />
                  <SliderOption label="Word Count" value={config.articleOptions.wordCount} min={300} max={3000} step={100} unit=" words" onChange={(v) => updateArticle({ wordCount: v })} />
                  <SliderOption label="Hashtag Count" value={config.articleOptions.hashtagCount} min={3} max={20} onChange={(v) => updateArticle({ hashtagCount: v })} />
                  <CheckToggle label="Include Hashtags" checked={config.articleOptions.includeHashtags} onChange={(v) => updateArticle({ includeHashtags: v })} />
                  <CheckToggle label="Workflow Diagram (SVG)" checked={config.articleOptions.includeWorkflowDiagram} onChange={(v) => updateArticle({ includeWorkflowDiagram: v })} description="Auto-generated if topic has a process/flow" />
                  <CheckToggle label="Include Statistics" checked={config.articleOptions.includeStats} onChange={(v) => updateArticle({ includeStats: v })} />
                  <CheckToggle label="Call to Action" checked={config.articleOptions.includeCallToAction} onChange={(v) => updateArticle({ includeCallToAction: v })} />
                </div>
              </DocumentCard>
            </div>
          </div>

          {/* ── Global Settings ────────────────────────────────────────── */}
          <div className="glass rounded-2xl overflow-hidden">
            <button
              onClick={() => setGlobalSettingsOpen((v) => !v)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-indigo-50/30 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Settings2 className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-gray-700">Global Settings</span>
                <span className="text-xs text-gray-400">Logo & watermark applied to all documents</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${globalSettingsOpen ? 'rotate-180' : ''}`} />
            </button>
            {globalSettingsOpen && (
              <div className="px-5 pb-5 border-t border-gray-100 animate-slide-down">
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LogoUpload
                    value={config.globalLogoBase64}
                    onChange={(v) => setConfig((c) => ({ ...c, globalLogoBase64: v }))}
                    label="Global Logo (applied to all enabled docs)"
                  />
                  <div>
                    <TextInputOption
                      label="Global Watermark Text"
                      value={config.globalWatermark || ''}
                      placeholder="e.g. © 2025 YourBrand"
                      onChange={(v) => setConfig((c) => ({ ...c, globalWatermark: v }))}
                    />
                    <p className="text-[10px] text-gray-400 -mt-1">
                      Per-document watermark overrides this if set
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Generate Button ────────────────────────────────────────── */}
          <button
            onClick={handleGenerate}
            disabled={!anySelected || !config.topic.trim()}
            className="w-full btn-primary py-4 text-base flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            <Sparkles className="w-5 h-5" />
            Generate
            {[
              config.generatePPT && 'Presentation',
              config.generateNotes && 'Notes',
              config.generateExercises && 'Exercises',
              config.generateArticle && 'Article',
            ].filter(Boolean).join(' + ') || 'Documents'}
            <Zap className="w-4 h-4 opacity-70" />
          </button>

          {!anySelected && (
            <p className="text-center text-xs text-amber-600 bg-amber-50 rounded-full py-2">
              ⚠️ Select at least one document type above
            </p>
          )}
        </div>
      )}
    </section>
  )
}
