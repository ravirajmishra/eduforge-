import { GoogleGenerativeAI } from '@google/generative-ai'
import type {
  SlideContent, NotePage, ExerciseProblem, ArticleContent,
  PPTOptions, NotesOptions, ExerciseOptions, ArticleOptions,
  WorkflowStep
} from './types'

const getClient = () => {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is not set')
  return new GoogleGenerativeAI(key)
}

const getModel = () => getClient().getGenerativeModel({ model: 'gemini-1.5-pro' })

// ─── Utility: safe JSON parse ───────────────────────────────────────────────
function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned) as T
  } catch {
    return fallback
  }
}

// ─── Detect if topic is tech-related ────────────────────────────────────────
export async function detectTopicType(topic: string): Promise<boolean> {
  const model = getModel()
  const result = await model.generateContent(
    `Is this topic tech/programming/computer-science related? Topic: "${topic}". Respond with ONLY "true" or "false".`
  )
  return result.response.text().trim().toLowerCase() === 'true'
}

// ─── Generate PPT Slides ─────────────────────────────────────────────────────
export async function generatePPTContent(
  topic: string,
  options: PPTOptions,
  isTech: boolean
): Promise<SlideContent[]> {
  const model = getModel()

  const styleGuide = {
    professional: 'formal, structured, data-driven, minimal decoration, use statistics and facts',
    balanced: 'mix of engaging visuals and solid content, moderate use of bullet points',
    creative: 'storytelling approach, metaphors, engaging narrative, vivid descriptions',
    minimalist: 'clean, very minimal text per slide, white space is key, one idea per slide',
    bold: 'impactful statements, large ideas, strong contrast, high energy language',
  }[options.style]

  const prompt = `
You are an expert content creator. Generate exactly ${options.slideCount} slides for a presentation on: "${topic}"
Style: ${styleGuide}
Tech topic: ${isTech}

STRICT RULES:
1. Each slide MUST have a unique page index (0 to ${options.slideCount - 1})
2. Slide 0 is ALWAYS type "title"
3. ${options.includeTableOfContents ? 'Slide 1 is ALWAYS type "agenda"' : ''}
4. ${options.includeSummarySlide ? `Slide ${options.slideCount - 1} is ALWAYS type "summary"` : ''}
5. ${options.includeWorkflow ? 'Include at least 1 "workflow" slide if the topic naturally has a process/flow' : 'Do NOT include workflow slides'}
6. ${isTech ? 'Include at least 1 "code" slide with realistic, accurate code' : ''}
7. layoutHint must be chosen so text and image zones NEVER overlap:
   - "left-text-right-image": text occupies left 55%, image right 40%, gap 5%
   - "full-text": text spans full width, no image
   - "centered": title + subtitle centered, minimal text
   - "two-column": equal halves, no image needed
   - "workflow": diagram only, minimal text
   - "code": code block + brief explanation
8. imageKeyword: provide a 2-3 word Pexels search term ONLY for slides with images
9. bulletPoints: max 5 bullets, each max 12 words
10. speakerNote: 1-2 sentences for presenter

Return ONLY valid JSON array, no markdown, no extra text:
[
  {
    "index": 0,
    "type": "title",
    "title": "...",
    "subtitle": "...",
    "layoutHint": "centered",
    "speakerNote": "..."
  },
  {
    "index": 1,
    "type": "content",
    "title": "...",
    "bulletPoints": ["...", "..."],
    "imageKeyword": "...",
    "layoutHint": "left-text-right-image",
    "speakerNote": "..."
  }
]
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  return safeJsonParse<SlideContent[]>(text, [])
}

// ─── Generate Notes Pages ────────────────────────────────────────────────────
export async function generateNotesContent(
  topic: string,
  options: NotesOptions,
  isTech: boolean
): Promise<NotePage[]> {
  const model = getModel()

  const styleGuide = {
    detailed: 'comprehensive explanations, full paragraphs, deep dives into concepts',
    concise: 'brief, to the point, key facts only, no fluff',
    structured: 'clear hierarchy, numbered sections, organized by importance',
    cornell: 'Cornell note format: main notes + cue column + summary',
    outline: 'hierarchical outline format, nested bullet points',
  }[options.style]

  const prompt = `
Generate exactly ${options.pageCount} pages of study notes on: "${topic}"
Style: ${styleGuide}
Include coding: ${options.includeCoding && isTech}

STRICT RULES:
1. Each page has a unique pageIndex (0 to ${options.pageCount - 1})
2. Each subsection has a unique lineIndex (sequential across all pages)
3. Subsection types: "text", "bullet-list", "code", "key-term", "example", "recap-box"
4. "code" type requires codeBlock (accurate, working code) and codeLanguage
5. "key-term" type: heading = the term, content = clear definition
6. "recap-box" type: usually last subsection of a page, summarizes key points
7. ${options.includeKeyTerms ? 'Include at least 2 key-term subsections per page' : ''}
8. ${options.includeExamples ? 'Include at least 1 example per page' : ''}
9. Content must be accurate, no hallucination. Use real facts.
10. lineIndex must be globally unique and sequential

Return ONLY valid JSON array:
[
  {
    "pageIndex": 0,
    "sectionTitle": "...",
    "subsections": [
      {
        "lineIndex": 1,
        "heading": "...",
        "content": "...",
        "type": "text"
      },
      {
        "lineIndex": 2,
        "heading": "Key Term: ...",
        "content": "Definition...",
        "type": "key-term"
      }
    ]
  }
]
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  return safeJsonParse<NotePage[]>(text, [])
}

// ─── Generate Exercises ──────────────────────────────────────────────────────
export async function generateExercisesContent(
  topic: string,
  options: ExerciseOptions,
  isTech: boolean
): Promise<ExerciseProblem[]> {
  const model = getModel()

  const prompt = `
Generate exactly ${options.problemCount} exercises on: "${topic}"
Difficulty: ${options.difficulty}
Include coding: ${options.includeCoding && isTech}
Include answers: ${options.includeAnswerKey}
Style: ${options.exerciseStyle}

STRICT RULES:
1. Each problem has a unique index (1 to ${options.problemCount})
2. Mix types: mcq, short-answer, long-answer${isTech && options.includeCoding ? ', coding' : ''}, true-false, fill-blank
3. MCQ must have exactly 4 options (A, B, C, D)
4. "coding" type: include realistic starterCode template and codeLanguage
5. difficulty distribution for "mixed": 40% easy, 40% medium, 20% hard
6. marks: easy=1, medium=2, hard=3-5
7. ${options.includeHints ? 'Include a helpful hint for medium and hard problems' : ''}
8. answers must be accurate (not hallucinated)
9. Coding problems must have working, accurate starter code

Return ONLY valid JSON array:
[
  {
    "index": 1,
    "type": "mcq",
    "question": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "answer": "A",
    "hint": "...",
    "difficulty": "easy",
    "marks": 1
  },
  {
    "index": 2,
    "type": "coding",
    "question": "...",
    "starterCode": "...",
    "codeLanguage": "python",
    "answer": "...",
    "difficulty": "medium",
    "marks": 3
  }
]
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  return safeJsonParse<ExerciseProblem[]>(text, [])
}

// ─── Generate Article ────────────────────────────────────────────────────────
export async function generateArticleContent(
  topic: string,
  options: ArticleOptions
): Promise<ArticleContent> {
  const model = getModel()

  const platformGuide = {
    linkedin: `LinkedIn post: professional tone, story-driven, 3-5 short paragraphs, line breaks every 2-3 lines, emojis sparingly`,
    medium: `Medium article: SEO-friendly, subheadings every 250-300 words, in-depth analysis`,
    blog: `Blog post: conversational, SEO-optimized headings, practical tips`,
    newsletter: `Newsletter: personal, direct address ("you"), value-packed, concise`,
  }[options.platform]

  const prompt = `
Write a ~${options.wordCount} word article about: "${topic}"
Platform: ${platformGuide}
Tone: ${options.tone}

Return ONLY valid JSON:
{
  "title": "Compelling headline",
  "hook": "Opening paragraph that grabs attention (2-3 sentences)",
  "sections": [
    {
      "heading": "Section heading",
      "content": "Section content...",
      "hasStats": false,
      "hasList": false,
      "listItems": []
    }
  ],
  "callToAction": "${options.includeCallToAction ? 'Compelling CTA...' : ''}",
  "hashtags": ${options.includeHashtags ? `["hashtag1", "hashtag2"] (${options.hashtagCount} relevant hashtags, no # prefix)` : '[]'},
  "workflowDiagram": ${options.includeWorkflowDiagram ? `[{"id": "1", "label": "Step label", "description": "brief desc", "type": "process", "nextIds": ["2"]}]` : 'null'},
  "platform": "${options.platform}",
  "estimatedReadTime": 3
}

Rules:
- No hallucination, use real facts
- ${options.includeStats ? 'Include at least 2 real statistics with sources' : ''}
- workflowDiagram: include ONLY if the topic naturally has a sequence/process, otherwise null
- hashtags: relevant, mix of broad and niche
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  return safeJsonParse<ArticleContent>(text, {
    title: topic,
    hook: '',
    sections: [],
    platform: options.platform,
    estimatedReadTime: 3,
  })
}

// ─── Generate Workflow SVG ───────────────────────────────────────────────────
export function generateWorkflowSVG(steps: WorkflowStep[]): string {
  const nodeWidth = 160
  const nodeHeight = 50
  const hGap = 60
  const vGap = 40
  const cols = Math.min(steps.length, 3)
  const rows = Math.ceil(steps.length / cols)
  const svgWidth = cols * nodeWidth + (cols - 1) * hGap + 80
  const svgHeight = rows * nodeHeight + (rows - 1) * vGap + 80

  const nodeColors: Record<string, string> = {
    start: '#6366f1',
    process: '#0ea5e9',
    decision: '#f59e0b',
    end: '#10b981',
    data: '#8b5cf6',
  }

  const nodePositions: Record<string, { x: number; y: number }> = {}
  steps.forEach((step, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    nodePositions[step.id] = {
      x: 40 + col * (nodeWidth + hGap),
      y: 40 + row * (nodeHeight + vGap),
    }
  })

  const nodes = steps.map((step) => {
    const { x, y } = nodePositions[step.id]
    const color = nodeColors[step.type] || '#6366f1'
    const isDecision = step.type === 'decision'
    const shape = isDecision
      ? `<polygon points="${x + nodeWidth / 2},${y} ${x + nodeWidth},${y + nodeHeight / 2} ${x + nodeWidth / 2},${y + nodeHeight} ${x},${y + nodeHeight / 2}" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="2"/>`
      : `<rect x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" rx="10" fill="${color}" opacity="0.12" stroke="${color}" stroke-width="2"/>`

    return `
      <g>
        ${shape}
        <text x="${x + nodeWidth / 2}" y="${y + nodeHeight / 2 - 4}" text-anchor="middle" font-family="SF Pro Display, system-ui, sans-serif" font-size="12" font-weight="600" fill="${color}">${step.label}</text>
        ${step.description ? `<text x="${x + nodeWidth / 2}" y="${y + nodeHeight / 2 + 10}" text-anchor="middle" font-family="SF Pro Display, system-ui, sans-serif" font-size="9" fill="#64748b">${step.description.slice(0, 30)}</text>` : ''}
      </g>
    `
  })

  const arrows = steps.flatMap((step) =>
    step.nextIds.map((nextId) => {
      const from = nodePositions[step.id]
      const to = nodePositions[nextId]
      if (!from || !to) return ''
      const x1 = from.x + nodeWidth / 2
      const y1 = from.y + nodeHeight
      const x2 = to.x + nodeWidth / 2
      const y2 = to.y
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6366f1" stroke-width="2" stroke-dasharray="4" marker-end="url(#arrow)"/>`
    })
  )

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#6366f1"/>
    </marker>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="white" rx="16"/>
  ${arrows.join('\n')}
  ${nodes.join('\n')}
</svg>`
}
