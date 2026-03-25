// ─── Document Style Types ──────────────────────────────────────────────────

export type PPTStyle = 'professional' | 'balanced' | 'creative' | 'minimalist' | 'bold'
export type NotesStyle = 'detailed' | 'concise' | 'structured' | 'cornell' | 'outline'
export type ExerciseStyle = 'worksheet' | 'quiz' | 'problem-set' | 'case-study'
export type ArticlePlatform = 'linkedin' | 'medium' | 'blog' | 'newsletter'
export type ArticleTone = 'professional' | 'casual' | 'technical' | 'storytelling'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed'
export type ColorScheme = 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate' | 'violet'

// ─── Per-Document Options ──────────────────────────────────────────────────

export interface PPTOptions {
  slideCount: number          // 5–30
  style: PPTStyle
  colorScheme: ColorScheme
  includeImages: boolean
  includeWorkflow: boolean
  includeTableOfContents: boolean
  includeSummarySlide: boolean
  speakerNotes: boolean
  addLogo: boolean
  watermarkText: string
  logoBase64?: string
}

export interface NotesOptions {
  pageCount: number           // 1–20
  style: NotesStyle
  includeCoding: boolean      // adds code blocks for tech topics
  includeExamples: boolean
  includeKeyTerms: boolean
  includeQuickRecap: boolean
  addLogo: boolean
  watermarkText: string
  logoBase64?: string
}

export interface ExerciseOptions {
  problemCount: number        // 5–50
  difficulty: Difficulty
  includeCoding: boolean
  includeAnswerKey: boolean
  includeHints: boolean
  exerciseStyle: ExerciseStyle
  addLogo: boolean
  watermarkText: string
  logoBase64?: string
}

export interface ArticleOptions {
  platform: ArticlePlatform
  tone: ArticleTone
  wordCount: number           // 300–3000
  includeHashtags: boolean
  includeWorkflowDiagram: boolean
  includeStats: boolean
  includeCallToAction: boolean
  hashtagCount: number
}

// ─── Main Config ────────────────────────────────────────────────────────────

export interface GenerationConfig {
  topic: string
  isTechTopic: boolean | 'auto'

  generatePPT: boolean
  generateNotes: boolean
  generateExercises: boolean
  generateArticle: boolean

  // Global logo (can override per-doc)
  globalLogoBase64?: string
  globalWatermark?: string

  pptOptions: PPTOptions
  notesOptions: NotesOptions
  exerciseOptions: ExerciseOptions
  articleOptions: ArticleOptions
}

// ─── Generated Content Structures ──────────────────────────────────────────

export interface SlideContent {
  index: number               // semantic page index
  type: 'title' | 'agenda' | 'content' | 'workflow' | 'image-text' | 'code' | 'summary' | 'section-divider'
  title: string
  subtitle?: string
  bulletPoints?: string[]
  codeBlock?: string
  codeLanguage?: string
  workflowSteps?: WorkflowStep[]
  imageKeyword?: string       // for Pexels search
  imageUrl?: string           // resolved Pexels URL
  speakerNote?: string
  layoutHint: 'left-text-right-image' | 'full-text' | 'centered' | 'two-column' | 'workflow' | 'code'
}

export interface WorkflowStep {
  id: string
  label: string
  description?: string
  type: 'start' | 'process' | 'decision' | 'end' | 'data'
  nextIds: string[]
}

export interface NotePage {
  pageIndex: number           // semantic page index
  sectionTitle: string
  subsections: NoteSubsection[]
}

export interface NoteSubsection {
  lineIndex: number           // semantic line index within page
  heading: string
  content: string
  type: 'text' | 'bullet-list' | 'code' | 'key-term' | 'example' | 'recap-box'
  items?: string[]            // for bullet-list type
  codeBlock?: string
  codeLanguage?: string
}

export interface ExerciseProblem {
  index: number               // semantic line index
  type: 'mcq' | 'short-answer' | 'long-answer' | 'coding' | 'true-false' | 'fill-blank' | 'case-study'
  question: string
  options?: string[]          // for MCQ
  starterCode?: string        // for coding
  codeLanguage?: string
  answer?: string             // if includeAnswerKey
  hint?: string
  difficulty: 'easy' | 'medium' | 'hard'
  marks: number
}

export interface ArticleContent {
  title: string
  hook: string
  sections: ArticleSection[]
  callToAction?: string
  hashtags?: string[]
  workflowDiagram?: WorkflowStep[]
  platform: ArticlePlatform
  estimatedReadTime: number
}

export interface ArticleSection {
  heading: string
  content: string
  hasStats?: boolean
  hasList?: boolean
  listItems?: string[]
}

// ─── API Response Types ─────────────────────────────────────────────────────

export interface GenerationResult {
  type: 'ppt' | 'notes' | 'exercises' | 'article'
  status: 'success' | 'error'
  fileBase64?: string
  fileName?: string
  mimeType?: string
  articleContent?: ArticleContent   // for article preview
  workflowSvg?: string              // SVG workflow diagram
  error?: string
}

export interface GenerateAllResponse {
  ppt?: GenerationResult
  notes?: GenerationResult
  exercises?: GenerationResult
  article?: GenerationResult
  isTechTopic: boolean
}

// ─── UI State Types ─────────────────────────────────────────────────────────

export type GenerationStep = 'idle' | 'analyzing' | 'generating-ppt' | 'generating-notes' | 'generating-exercises' | 'generating-article' | 'finalizing' | 'done' | 'error'

export interface UIState {
  step: GenerationStep
  progress: number
  currentMessage: string
  results?: GenerateAllResponse
}
