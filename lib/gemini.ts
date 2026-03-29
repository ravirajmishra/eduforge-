import { GoogleGenerativeAI } from '@google/generative-ai'
import type {
  SlideContent, NotePage, ExerciseProblem, ArticleContent,
  PPTOptions, NotesOptions, ExerciseOptions, ArticleOptions,
  WorkflowStep
} from './types'

const getModel = (apiKey?: string) => {
  const key = apiKey || process.env.GEMINI_API_KEY
  if (!key) throw new Error('No Gemini API key found. Enter your key in the API Keys section above.')
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
}

function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned) as T
  } catch {
    return fallback
  }
}

export async function detectTopicType(topic: string, apiKey?: string): Promise<boolean> {
  const model = getModel(apiKey)
  const result = await model.generateContent(
    `Is this topic tech/programming/computer-science related? Topic: "${topic}". Respond with ONLY "true" or "false".`
  )
  return result.response.text().trim().toLowerCase() === 'true'
}

export async function generatePPTContent(
  topic: string,
  options: PPTOptions,
  isTech: boolean,
  apiKey?: string
): Promise<SlideContent[]> {
  const model = getModel(apiKey)

  const styleGuide: Record<string, string> = {
    professional: 'formal, structured, data-driven, minimal decoration, use statistics and facts',
    balanced: 'mix of engaging visuals and solid content, moderate use of bullet points',
    creative: 'storytelling approach, metaphors, engaging narrative, vivid descriptions',
    minimalist: 'clean, very minimal text per slide, white space is key, one idea per slide',
    bold: 'impactful statements, large ideas, strong contrast, high energy language',
  }

  const depthGuide: Record<string, string> = {
    concise: 'Keep bullets very short (max 8 words each). Minimal explanation. High-level overview only.',
    standard: 'Normal depth — 3-5 bullets per slide with brief explanations.',
    detailed: 'Rich content — 4-5 bullets each with sub-explanations, stats and examples where possible.',
  }

  const prompt = `You are an expert content creator. Generate exactly ${options.slideCount} slides for a presentation on: "${topic}"
Design Style: ${styleGuide[options.style] ?? styleGuide.balanced}
Content Depth: ${depthGuide[options.contentDepth ?? 'standard']}
Tech topic: ${isTech}

STRICT RULES:
1. Each slide MUST have a unique page index (0 to ${options.slideCount - 1})
2. Slide 0 is ALWAYS type "title"
3. ${options.includeTableOfContents ? 'Slide 1 is ALWAYS type "agenda"' : ''}
4. ${options.includeSummarySlide ? `Slide ${options.slideCount - 1} is ALWAYS type "summary"` : ''}
5. ${options.includeWorkflow ? 'Include at least 1 "workflow" slide if the topic naturally has a process/flow' : 'Do NOT include workflow slides'}
6. ${isTech ? 'Include at least 1 "code" slide with realistic, accurate code' : ''}
7. layoutHint: "left-text-right-image" | "full-text" | "centered" | "two-column" | "workflow" | "code"
8. imageKeyword: 2-3 word Pexels search term ONLY for slides with images
9. bulletPoints: max 5 bullets
10. speakerNote: 1-2 sentences for presenter

Return ONLY valid JSON array, no markdown:`

  const result = await model.generateContent(prompt)
  return safeJsonParse<SlideContent[]>(result.response.text(), [])
}

export async function generateNotesContent(
  topic: string,
  options: NotesOptions,
  isTech: boolean,
  apiKey?: string
): Promise<NotePage[]> {
  const model = getModel(apiKey)

  const styleGuide: Record<string, string> = {
    detailed: 'comprehensive explanations, full paragraphs, deep dives into concepts',
    concise: 'brief, to the point, key facts only, no fluff',
    structured: 'clear hierarchy, numbered sections, organized by importance',
    cornell: 'Cornell note format: main notes + cue column + summary',
    outline: 'hierarchical outline format, nested bullet points',
  }

  const depthGuide: Record<string, string> = {
    concise: 'Short sentences, minimal elaboration, bullet points preferred over paragraphs.',
    standard: 'Normal paragraph length with clear explanations and examples.',
    detailed: 'Thorough explanations, multiple examples per concept, include background context.',
  }

  const prompt = `Generate exactly ${options.pageCount} pages of study notes on: "${topic}"
Style: ${styleGuide[options.style] ?? styleGuide.structured}
Content Depth: ${depthGuide[options.contentDepth ?? 'standard']}
Include coding: ${options.includeCoding && isTech}

STRICT RULES:
1. Each page has a unique pageIndex (0 to ${options.pageCount - 1})
2. Each subsection has a unique lineIndex (sequential across all pages)
3. Subsection types: "text", "bullet-list", "code", "key-term", "example", "recap-box"
4. "code" type requires codeBlock (accurate, working code) and codeLanguage
5. ${options.includeKeyTerms ? 'Include at least 2 key-term subsections per page' : ''}
6. ${options.includeExamples ? 'Include at least 1 example per page' : ''}
7. Content must be accurate, no hallucination.

Return ONLY valid JSON array, no markdown:`

  const result = await model.generateContent(prompt)
  return safeJsonParse<NotePage[]>(result.response.text(), [])
}

export async function generateExercisesContent(
  topic: string,
  options: ExerciseOptions,
  isTech: boolean,
  apiKey?: string
): Promise<ExerciseProblem[]> {
  const model = getModel(apiKey)

  const depthGuide: Record<string, string> = {
    concise: 'Short direct questions. MCQs and fill-in-the-blank preferred. Minimal long-answer.',
    standard: 'Mix of MCQ, short-answer and coding. Balanced complexity.',
    detailed: 'In-depth questions, case studies, multi-part problems, detailed coding challenges.',
  }

  const prompt = `Generate exactly ${options.problemCount} exercises on: "${topic}"
Difficulty: ${options.difficulty}
Content Depth: ${depthGuide[options.contentDepth ?? 'standard']}
Include coding: ${options.includeCoding && isTech}
Include answers: ${options.includeAnswerKey}
Style: ${options.exerciseStyle}

STRICT RULES:
1. Each problem has a unique index (1 to ${options.problemCount})
2. Mix types: mcq, short-answer, long-answer${isTech && options.includeCoding ? ', coding' : ''}, true-false, fill-blank
3. MCQ must have exactly 4 options (A, B, C, D)
4. difficulty distribution for "mixed": 40% easy, 40% medium, 20% hard
5. marks: easy=1, medium=2, hard=3-5
6. ${options.includeHints ? 'Include a helpful hint for medium and hard problems' : ''}
7. Answers must be accurate. Coding problems need working starter code.

Return ONLY valid JSON array, no markdown:`

  const result = await model.generateContent(prompt)
  return safeJsonParse<ExerciseProblem[]>(result.response.text(), [])
}

export async function generateArticleContent(
  topic: string,
  options: ArticleOptions,
  apiKey?: string
): Promise<ArticleContent> {
  const model = getModel(apiKey)

  const platformGuide: Record<string, string> = {
    linkedin: 'LinkedIn post: story-driven, 3-5 short paragraphs, line breaks every 2-3 lines, emojis sparingly',
    medium: 'Medium article: SEO-friendly, subheadings every 250-300 words, in-depth analysis',
    blog: 'Blog post: conversational, SEO-optimized headings, practical tips',
    newsletter: 'Newsletter: personal, direct address ("you"), value-packed, concise',
  }

  const contentStyleGuide: Record<string, string> = {
    professional: 'Formal language, industry terminology, data-backed claims, authoritative tone.',
    creative: 'Storytelling, metaphors, vivid examples, engaging narrative arc.',
    concise: 'Short sentences, no filler, every word earns its place, punchy paragraphs.',
    'in-depth': 'Long-form, thorough analysis, multiple perspectives, detailed examples and statistics.',
  }

  const prompt = `Write a ~${options.wordCount} word article about: "${topic}"
Platform: ${platformGuide[options.platform]}
Writing Tone: ${options.tone}
Content Style: ${contentStyleGuide[options.contentStyle ?? 'professional']}

Return ONLY valid JSON (no markdown):
{
  "title": "Compelling headline",
  "hook": "Opening paragraph (2-3 sentences)",
  "sections": [{"heading": "...", "content": "...", "hasStats": false, "hasList": false, "listItems": []}],
  "callToAction": "${options.includeCallToAction ? 'Compelling CTA' : ''}",
  "hashtags": ${options.includeHashtags ? `["tag1","tag2"] — exactly ${options.hashtagCount} hashtags, no # prefix` : '[]'},
  "workflowDiagram": ${options.includeWorkflowDiagram ? '[{"id":"1","label":"Step","description":"desc","type":"process","nextIds":["2"]}]' : 'null'},
  "platform": "${options.platform}",
  "estimatedReadTime": 3
}
Rules: no hallucination, ${options.includeStats ? 'include 2 real statistics,' : ''} workflowDiagram only if topic has a natural process.`

  const result = await model.generateContent(prompt)
  return safeJsonParse<ArticleContent>(result.response.text(), {
    title: topic, hook: '', sections: [], platform: options.platform, estimatedReadTime: 3,
  })
}

export function generateWorkflowSVG(steps: WorkflowStep[]): string {
  const nodeWidth = 160, nodeHeight = 50, hGap = 60, vGap = 40
  const cols = Math.min(steps.length, 3)
  const rows = Math.ceil(steps.length / cols)
  const svgWidth = cols * nodeWidth + (cols - 1) * hGap + 80
  const svgHeight = rows * nodeHeight + (rows - 1) * vGap + 80

  const nodeColors: Record<string, string> = {
    start: '#6366f1', process: '#0ea5e9', decision: '#f59e0b', end: '#10b981', data: '#8b5cf6',
  }
  const pos: Record<string, { x: number; y: number }> = {}
  steps.forEach((s, i) => {
    pos[s.id] = { x: 40 + (i % cols) * (nodeWidth + hGap), y: 40 + Math.floor(i / cols) * (nodeHeight + vGap) }
  })

  const nodes = steps.map((s) => {
    const { x, y } = pos[s.id]
    const c = nodeColors[s.type] || '#6366f1'
    return `<g>
      <rect x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" rx="10" fill="${c}" opacity="0.12" stroke="${c}" stroke-width="2"/>
      <text x="${x + nodeWidth / 2}" y="${y + nodeHeight / 2 - 4}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="600" fill="${c}">${s.label}</text>
      ${s.description ? `<text x="${x + nodeWidth / 2}" y="${y + nodeHeight / 2 + 10}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9" fill="#64748b">${s.description.slice(0, 30)}</text>` : ''}
    </g>`
  })

  const arrows = steps.flatMap((s) => s.nextIds.map((nid) => {
    const f = pos[s.id], t = pos[nid]
    if (!f || !t) return ''
    return `<line x1="${f.x + nodeWidth / 2}" y1="${f.y + nodeHeight}" x2="${t.x + nodeWidth / 2}" y2="${t.y}" stroke="#6366f1" stroke-width="2" stroke-dasharray="4" marker-end="url(#arr)"/>`
  }))

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">
  <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#6366f1"/></marker></defs>
  <rect width="100%" height="100%" fill="white" rx="16"/>
  ${arrows.join('\n')}${nodes.join('\n')}
</svg>`
}
