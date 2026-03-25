// Using dynamic import to avoid SSR issues
import type { SlideContent, PPTOptions, ColorScheme } from '../types'

// Color palettes per scheme
const PALETTES: Record<ColorScheme, { primary: string; secondary: string; accent: string; bg: string; text: string; subtext: string }> = {
  indigo: { primary: '4F46E5', secondary: '818CF8', accent: '6366F1', bg: 'FAFAFF', text: '1E1B4B', subtext: '4C4580' },
  emerald: { primary: '059669', secondary: '34D399', accent: '10B981', bg: 'F0FDF4', text: '064E3B', subtext: '065F46' },
  rose: { primary: 'E11D48', secondary: 'FB7185', accent: 'F43F5E', bg: 'FFF1F2', text: '881337', subtext: '9F1239' },
  amber: { primary: 'D97706', secondary: 'FCD34D', accent: 'F59E0B', bg: 'FFFBEB', text: '78350F', subtext: '92400E' },
  slate: { primary: '475569', secondary: '94A3B8', accent: '64748B', bg: 'F8FAFC', text: '0F172A', subtext: '334155' },
  violet: { primary: '7C3AED', secondary: 'A78BFA', accent: '8B5CF6', bg: 'F5F3FF', text: '4C1D95', subtext: '5B21B6' },
}

// STRICT layout zones (inches) — text and image zones never overlap
const LAYOUTS = {
  'left-text-right-image': {
    titleZone: { x: 0.3, y: 0.15, w: 9.4, h: 0.6 },
    textZone: { x: 0.3, y: 0.85, w: 5.0, h: 5.5 },
    imageZone: { x: 5.5, y: 0.85, w: 4.2, h: 5.5 },
  },
  'full-text': {
    titleZone: { x: 0.3, y: 0.15, w: 9.4, h: 0.6 },
    textZone: { x: 0.3, y: 0.85, w: 9.4, h: 5.5 },
    imageZone: null,
  },
  'centered': {
    titleZone: { x: 0.5, y: 2.2, w: 9.0, h: 1.2 },
    textZone: { x: 1.0, y: 3.6, w: 8.0, h: 1.5 },
    imageZone: null,
  },
  'two-column': {
    titleZone: { x: 0.3, y: 0.15, w: 9.4, h: 0.6 },
    textZone: { x: 0.3, y: 0.85, w: 4.4, h: 5.5 },
    imageZone: { x: 5.1, y: 0.85, w: 4.6, h: 5.5 },
  },
  'workflow': {
    titleZone: { x: 0.3, y: 0.15, w: 9.4, h: 0.5 },
    textZone: { x: 0.3, y: 0.75, w: 9.4, h: 5.7 },
    imageZone: null,
  },
  'code': {
    titleZone: { x: 0.3, y: 0.15, w: 9.4, h: 0.5 },
    textZone: { x: 0.3, y: 0.75, w: 3.5, h: 5.7 },
    imageZone: { x: 4.0, y: 0.75, w: 5.7, h: 5.7 },
  },
}

// Logo zone (bottom-left corner, fixed)
const LOGO_ZONE = { x: 0.15, y: 6.9, w: 0.8, h: 0.5 }
// Watermark zone (center, diagonal-ish)
const WATERMARK_ZONE = { x: 2.5, y: 3.2, w: 5.0, h: 1.0 }

export async function generatePPTBuffer(
  slides: SlideContent[],
  options: PPTOptions,
  topic: string
): Promise<Buffer> {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()

  pptx.layout = 'LAYOUT_WIDE' // 13.33" × 7.5"
  pptx.author = 'EduForge'
  pptx.subject = topic
  pptx.title = topic

  const palette = PALETTES[options.colorScheme]

  for (const slide of slides) {
    const s = pptx.addSlide()
    const layout = LAYOUTS[slide.layoutHint] || LAYOUTS['full-text']

    // ── Background ──────────────────────────────────────────────────────────
    s.background = { color: palette.bg }

    // ── Colored accent bar (top) ─────────────────────────────────────────────
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.12,
      fill: { color: palette.primary },
      line: { type: 'none' },
    })

    // ── Logo (if enabled) ────────────────────────────────────────────────────
    if (options.addLogo && options.logoBase64) {
      try {
        const base64Data = options.logoBase64.includes(',')
          ? options.logoBase64.split(',')[1]
          : options.logoBase64
        s.addImage({
          data: base64Data,
          x: LOGO_ZONE.x, y: LOGO_ZONE.y, w: LOGO_ZONE.w, h: LOGO_ZONE.h,
          sizing: { type: 'contain', w: LOGO_ZONE.w, h: LOGO_ZONE.h },
        })
      } catch { /* logo failed silently */ }
    }

    // ── Watermark ────────────────────────────────────────────────────────────
    if (options.watermarkText) {
      s.addText(options.watermarkText.toUpperCase(), {
        x: WATERMARK_ZONE.x, y: WATERMARK_ZONE.y,
        w: WATERMARK_ZONE.w, h: WATERMARK_ZONE.h,
        fontSize: 36,
        color: palette.primary + '22', // very transparent
        bold: true,
        align: 'center',
        rotate: -30,
        fontFace: 'Arial',
      })
    }

    // ── Slide number ─────────────────────────────────────────────────────────
    if (slide.type !== 'title') {
      s.addText(`${slide.index + 1}`, {
        x: 12.9, y: 7.1, w: 0.3, h: 0.3,
        fontSize: 8,
        color: palette.subtext,
        align: 'right',
      })
    }

    // ── Title ─────────────────────────────────────────────────────────────────
    if (slide.type === 'title') {
      // Full-page title slide
      s.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: '100%',
        fill: { color: palette.bg },
        line: { type: 'none' },
      })
      s.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.5,
        fill: { color: palette.primary },
        line: { type: 'none' },
      })
      s.addText(slide.title, {
        x: 0.5, y: 2.0, w: 12.33, h: 1.5,
        fontSize: 40, bold: true,
        color: palette.text,
        align: 'center',
        fontFace: 'Arial',
      })
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: 1.0, y: 3.8, w: 11.33, h: 0.8,
          fontSize: 20,
          color: palette.subtext,
          align: 'center',
          fontFace: 'Arial',
        })
      }
    } else if (slide.type === 'section-divider') {
      s.addShape(pptx.ShapeType.rect, {
        x: 0, y: 2.5, w: '100%', h: 2.5,
        fill: { color: palette.primary },
        line: { type: 'none' },
      })
      s.addText(slide.title, {
        x: 0.5, y: 3.0, w: 12.33, h: 1.5,
        fontSize: 32, bold: true,
        color: 'FFFFFF',
        align: 'center',
        fontFace: 'Arial',
      })
    } else {
      // ── Non-title slides: use layout zones ──────────────────────────────

      // Accent bar (left side)
      s.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0.12, w: 0.06, h: 7.38,
        fill: { color: palette.secondary + '55' },
        line: { type: 'none' },
      })

      // Title
      const tz = layout.titleZone
      s.addText(slide.title, {
        x: tz.x, y: tz.y, w: tz.w, h: tz.h,
        fontSize: 22, bold: true,
        color: palette.text,
        fontFace: 'Arial',
      })

      // Divider under title
      s.addShape(pptx.ShapeType.rect, {
        x: tz.x, y: tz.y + tz.h + 0.05, w: tz.w, h: 0.03,
        fill: { color: palette.primary + '55' },
        line: { type: 'none' },
      })

      // ── Content ────────────────────────────────────────────────────────────
      const contentZone = layout.textZone

      if (slide.type === 'code' && slide.codeBlock) {
        // Code block in text zone
        s.addText(slide.codeBlock, {
          x: contentZone.x, y: contentZone.y,
          w: contentZone.w, h: contentZone.h,
          fontSize: 9,
          fontFace: 'Courier New',
          color: '1E293B',
          fill: { color: 'F1F5F9' },
          valign: 'top',
          wrap: true,
        })
        // Short description in image zone
        if (layout.imageZone && slide.bulletPoints?.length) {
          const iz = layout.imageZone
          s.addText(slide.bulletPoints.join('\n\n'), {
            x: iz.x, y: iz.y, w: iz.w, h: iz.h,
            fontSize: 13,
            color: palette.subtext,
            valign: 'top',
            wrap: true,
          })
        }
      } else if (slide.type === 'workflow' || slide.type === 'agenda') {
        // Agenda / workflow as numbered list
        const items = slide.bulletPoints || []
        const formatted = items.map((b, i) => `${i + 1}.  ${b}`)
        s.addText(formatted.join('\n'), {
          x: contentZone.x, y: contentZone.y,
          w: contentZone.w, h: contentZone.h,
          fontSize: 14,
          color: palette.subtext,
          bullet: false,
          lineSpacingMultiple: 1.4,
          valign: 'top',
        })
      } else {
        // Regular bullet points
        const bullets = slide.bulletPoints || []
        const bulletObjects = bullets.map((b) => ({
          text: b,
          options: { bullet: { indent: 20 }, fontSize: 14, color: palette.text },
        }))
        if (bulletObjects.length > 0) {
          s.addText(bulletObjects, {
            x: contentZone.x, y: contentZone.y,
            w: contentZone.w, h: contentZone.h,
            lineSpacingMultiple: 1.5,
            valign: 'top',
          })
        }
      }

      // ── Image (in image zone only, never overlapping text) ─────────────────
      if (layout.imageZone && slide.imageUrl) {
        const iz = layout.imageZone
        try {
          s.addImage({
            path: slide.imageUrl,
            x: iz.x, y: iz.y, w: iz.w, h: iz.h,
            sizing: { type: 'cover', w: iz.w, h: iz.h },
            rounding: true,
          })
        } catch {
          // Image load failed — add placeholder
          s.addShape(pptx.ShapeType.rect, {
            x: iz.x, y: iz.y, w: iz.w, h: iz.h,
            fill: { color: palette.secondary + '22' },
            line: { color: palette.secondary, pt: 1, dashType: 'dash' },
          })
        }
      }

      // ── Summary slide ──────────────────────────────────────────────────────
      if (slide.type === 'summary' && slide.bulletPoints?.length) {
        s.addText('Key Takeaways', {
          x: contentZone.x, y: contentZone.y,
          w: contentZone.w, h: 0.5,
          fontSize: 16, bold: true,
          color: palette.primary,
        })
      }
    }

    // ── Speaker notes ─────────────────────────────────────────────────────────
    if (options.speakerNotes && slide.speakerNote) {
      s.addNotes(slide.speakerNote)
    }
  }

  // Return as Buffer
  const data = await pptx.write({ outputType: 'nodebuffer' })
  return data as Buffer
}
