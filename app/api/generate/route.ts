import { NextRequest, NextResponse } from 'next/server'
import {
  detectTopicType,
  generatePPTContent,
  generateNotesContent,
  generateExercisesContent,
  generateArticleContent,
  generateWorkflowSVG,
} from '@/lib/gemini'
import { resolveSlideImages } from '@/lib/pexels'
import { generatePPTBuffer } from '@/lib/generators/pptGenerator'
import { generateNotesBuffer, generateExercisesBuffer } from '@/lib/generators/docxGenerator'
import { formatArticle } from '@/lib/generators/articleFormatter'
import type { GenerationConfig, GenerationResult } from '@/lib/types'

export const maxDuration = 120 // 2 minutes for Vercel Pro
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const config: GenerationConfig = await req.json()
    const { topic } = config

    if (!topic?.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Step 1: Detect topic type
    const isTechTopic = config.isTechTopic === 'auto'
      ? await detectTopicType(topic)
      : Boolean(config.isTechTopic)

    const results: Record<string, GenerationResult> = {}

    // Step 2: Generate PPT
    if (config.generatePPT) {
      try {
        const slides = await generatePPTContent(topic, config.pptOptions, isTechTopic)

        // Resolve Pexels images
        if (config.pptOptions.includeImages) {
          await resolveSlideImages(slides)
        }

        // Apply global logo/watermark overrides
        const pptOpts = {
          ...config.pptOptions,
          logoBase64: config.pptOptions.addLogo
            ? (config.pptOptions.logoBase64 || config.globalLogoBase64)
            : undefined,
          watermarkText: config.pptOptions.watermarkText || config.globalWatermark || '',
        }

        const buffer = await generatePPTBuffer(slides, pptOpts, topic)
        results.ppt = {
          type: 'ppt',
          status: 'success',
          fileBase64: buffer.toString('base64'),
          fileName: `${topic.replace(/[^a-zA-Z0-9]/g, '_')}_Presentation.pptx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        }
      } catch (err) {
        results.ppt = { type: 'ppt', status: 'error', error: String(err) }
      }
    }

    // Step 3: Generate Notes
    if (config.generateNotes) {
      try {
        const pages = await generateNotesContent(topic, config.notesOptions, isTechTopic)
        const notesOpts = {
          ...config.notesOptions,
          logoBase64: config.notesOptions.addLogo
            ? (config.notesOptions.logoBase64 || config.globalLogoBase64)
            : undefined,
          watermarkText: config.notesOptions.watermarkText || config.globalWatermark || '',
        }
        const buffer = await generateNotesBuffer(pages, notesOpts, topic)
        results.notes = {
          type: 'notes',
          status: 'success',
          fileBase64: buffer.toString('base64'),
          fileName: `${topic.replace(/[^a-zA-Z0-9]/g, '_')}_Notes.docx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }
      } catch (err) {
        results.notes = { type: 'notes', status: 'error', error: String(err) }
      }
    }

    // Step 4: Generate Exercises
    if (config.generateExercises) {
      try {
        const problems = await generateExercisesContent(topic, config.exerciseOptions, isTechTopic)
        const exOpts = {
          ...config.exerciseOptions,
          logoBase64: config.exerciseOptions.addLogo
            ? (config.exerciseOptions.logoBase64 || config.globalLogoBase64)
            : undefined,
          watermarkText: config.exerciseOptions.watermarkText || config.globalWatermark || '',
        }
        const buffer = await generateExercisesBuffer(problems, exOpts, topic)
        results.exercises = {
          type: 'exercises',
          status: 'success',
          fileBase64: buffer.toString('base64'),
          fileName: `${topic.replace(/[^a-zA-Z0-9]/g, '_')}_Exercises.docx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }
      } catch (err) {
        results.exercises = { type: 'exercises', status: 'error', error: String(err) }
      }
    }

    // Step 5: Generate Article
    if (config.generateArticle) {
      try {
        const article = await generateArticleContent(topic, config.articleOptions)
        const formatted = formatArticle(article, config.articleOptions)

        // Workflow SVG if requested and steps were generated
        let workflowSvg: string | undefined
        if (config.articleOptions.includeWorkflowDiagram && article.workflowDiagram?.length) {
          workflowSvg = generateWorkflowSVG(article.workflowDiagram)
        }

        results.article = {
          type: 'article',
          status: 'success',
          fileBase64: Buffer.from(formatted, 'utf-8').toString('base64'),
          fileName: `${topic.replace(/[^a-zA-Z0-9]/g, '_')}_Article.txt`,
          mimeType: 'text/plain',
          articleContent: article,
          workflowSvg,
        }
      } catch (err) {
        results.article = { type: 'article', status: 'error', error: String(err) }
      }
    }

    return NextResponse.json({ ...results, isTechTopic })
  } catch (err) {
    console.error('Generation error:', err)
    return NextResponse.json({ error: 'Generation failed', details: String(err) }, { status: 500 })
  }
}
