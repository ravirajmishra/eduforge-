import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, ShadingType,
  Header, Footer, PageNumber, NumberFormat,
  ImageRun, Table, TableRow, TableCell, WidthType,
  PageBreak, HorizontalPositionAlign, VerticalPositionRelativeFrom,
  HorizontalPositionRelativeFrom, VerticalPositionAlign, TextWrappingType,
} from 'docx'
import type { NotePage, ExerciseProblem, NotesOptions, ExerciseOptions } from '../types'

// ─── Color constants ─────────────────────────────────────────────────────────
const COLORS = {
  primary: '4F46E5',
  secondary: '6366F1',
  accent: '818CF8',
  text: '1E1B4B',
  subtext: '4C4580',
  lightBg: 'F0F4FF',
  codeBg: 'F8FAFC',
  border: 'C7D2FE',
  success: '059669',
  warning: 'D97706',
}

// ─── Shared: Logo + Watermark in header ──────────────────────────────────────
function buildHeader(logoBase64?: string, watermarkText?: string): Header {
  const children: Paragraph[] = []

  if (logoBase64) {
    try {
      const base64 = logoBase64.includes(',') ? logoBase64.split(',')[1] : logoBase64
      const imgBuffer = Buffer.from(base64, 'base64')
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: imgBuffer,
              transformation: { width: 80, height: 35 },
              floating: {
                horizontalPosition: { align: HorizontalPositionAlign.LEFT, relative: HorizontalPositionRelativeFrom.MARGIN },
                verticalPosition: { align: VerticalPositionAlign.TOP, relative: VerticalPositionRelativeFrom.MARGIN },
                wrap: { type: TextWrappingType.SQUARE },
                margins: { top: 0, bottom: 0 },
              },
            }),
          ],
        })
      )
    } catch { /* skip logo */ }
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      border: { bottom: { color: COLORS.primary, style: BorderStyle.SINGLE, size: 4 } },
      children: [
        new TextRun({
          text: watermarkText ? `${watermarkText}  ` : '  ',
          color: COLORS.primary,
          size: 18,
          bold: true,
          font: 'Arial',
        }),
      ],
    })
  )

  return new Header({ children })
}

function buildFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { color: COLORS.border, style: BorderStyle.SINGLE, size: 2 } },
        children: [
          new TextRun({ text: 'Page ', color: COLORS.subtext, size: 16, font: 'Arial' }),
          new TextRun({
            children: [PageNumber.CURRENT],
            color: COLORS.subtext,
            size: 16,
            font: 'Arial',
          }),
          new TextRun({ text: ' of ', color: COLORS.subtext, size: 16, font: 'Arial' }),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES],
            color: COLORS.subtext,
            size: 16,
            font: 'Arial',
          }),
        ],
      }),
    ],
  })
}

// ─── Code block paragraph ─────────────────────────────────────────────────────
function codeBlock(code: string, lang?: string): Paragraph[] {
  const lines = code.split('\n')
  return [
    new Paragraph({
      spacing: { before: 200, after: 0 },
      shading: { type: ShadingType.SOLID, color: COLORS.codeBg, fill: COLORS.codeBg },
      border: {
        left: { color: COLORS.primary, style: BorderStyle.THICK, size: 8 },
      },
      children: [
        new TextRun({
          text: lang ? `  ${lang.toUpperCase()}` : '  CODE',
          color: COLORS.primary,
          size: 14,
          bold: true,
          font: 'Arial',
        }),
      ],
    }),
    ...lines.map((line) =>
      new Paragraph({
        spacing: { before: 0, after: 0 },
        shading: { type: ShadingType.SOLID, color: COLORS.codeBg, fill: COLORS.codeBg },
        children: [
          new TextRun({
            text: `  ${line}`,
            font: 'Courier New',
            size: 18,
            color: '1E293B',
          }),
        ],
      })
    ),
    new Paragraph({
      spacing: { before: 0, after: 200 },
      shading: { type: ShadingType.SOLID, color: COLORS.codeBg, fill: COLORS.codeBg },
      children: [new TextRun({ text: ' ' })],
    }),
  ]
}

// ─── Highlighted box ──────────────────────────────────────────────────────────
function highlightBox(text: string, bgColor: string, borderColor: string): Paragraph {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    shading: { type: ShadingType.SOLID, color: bgColor, fill: bgColor },
    border: {
      left: { color: borderColor, style: BorderStyle.THICK, size: 12 },
    },
    indent: { left: 200 },
    children: [
      new TextRun({ text, color: COLORS.text, size: 20, font: 'Arial', italics: true }),
    ],
  })
}

// ─── Generate Notes DOCX ──────────────────────────────────────────────────────
export async function generateNotesBuffer(
  pages: NotePage[],
  options: NotesOptions,
  topic: string
): Promise<Buffer> {
  const allParagraphs: Paragraph[] = []

  // Cover title
  allParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 400 },
      children: [
        new TextRun({
          text: topic,
          bold: true,
          size: 52,
          color: COLORS.primary,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 400 },
      children: [
        new TextRun({
          text: `Study Notes  ·  ${pages.length} Pages`,
          size: 22,
          color: COLORS.subtext,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      border: { bottom: { color: COLORS.primary, style: BorderStyle.SINGLE, size: 6 } },
      spacing: { before: 0, after: 600 },
      children: [],
    })
  )

  for (let pi = 0; pi < pages.length; pi++) {
    const page = pages[pi]
    if (pi > 0) {
      allParagraphs.push(new Paragraph({ children: [new PageBreak()] }))
    }

    // Page index indicator
    allParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 80 },
        children: [
          new TextRun({
            text: `Page ${page.pageIndex + 1} / ${pages.length}`,
            size: 16,
            color: COLORS.accent,
            font: 'Arial',
          }),
        ],
      })
    )

    // Section title
    allParagraphs.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        shading: { type: ShadingType.SOLID, color: COLORS.lightBg, fill: COLORS.lightBg },
        children: [
          new TextRun({
            text: `  ${page.sectionTitle}`,
            bold: true,
            size: 34,
            color: COLORS.primary,
            font: 'Arial',
          }),
        ],
      })
    )

    for (const sub of page.subsections) {
      switch (sub.type) {
        case 'text':
          allParagraphs.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 80 },
              children: [
                new TextRun({ text: sub.heading, bold: true, size: 24, color: COLORS.text, font: 'Arial' }),
              ],
            }),
            new Paragraph({
              spacing: { before: 0, after: 160 },
              children: [
                new TextRun({ text: sub.content, size: 20, color: '334155', font: 'Arial' }),
              ],
            })
          )
          break

        case 'bullet-list':
          allParagraphs.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 80 },
              children: [
                new TextRun({ text: sub.heading, bold: true, size: 24, color: COLORS.text, font: 'Arial' }),
              ],
            })
          )
          if (sub.items?.length) {
            for (const item of sub.items) {
              allParagraphs.push(
                new Paragraph({
                  spacing: { before: 60, after: 60 },
                  indent: { left: 360 },
                  bullet: { level: 0 },
                  children: [
                    new TextRun({ text: item, size: 20, color: '334155', font: 'Arial' }),
                  ],
                })
              )
            }
            allParagraphs.push(new Paragraph({ spacing: { before: 0, after: 120 }, children: [] }))
          }
          break

        case 'code':
          allParagraphs.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 80 },
              children: [
                new TextRun({ text: sub.heading, bold: true, size: 24, color: COLORS.text, font: 'Arial' }),
              ],
            }),
            ...codeBlock(sub.codeBlock || sub.content, sub.codeLanguage)
          )
          break

        case 'key-term':
          allParagraphs.push(
            highlightBox(`🔑  ${sub.heading}\n${sub.content}`, 'EEF2FF', COLORS.primary)
          )
          break

        case 'example':
          allParagraphs.push(
            highlightBox(`📘  Example: ${sub.heading}\n${sub.content}`, 'F0FDF4', COLORS.success)
          )
          break

        case 'recap-box':
          allParagraphs.push(
            new Paragraph({
              spacing: { before: 240, after: 80 },
              shading: { type: ShadingType.SOLID, color: 'FFF7ED', fill: 'FFF7ED' },
              border: {
                top: { color: COLORS.warning, style: BorderStyle.SINGLE, size: 4 },
                bottom: { color: COLORS.warning, style: BorderStyle.SINGLE, size: 4 },
                left: { color: COLORS.warning, style: BorderStyle.THICK, size: 12 },
                right: { color: COLORS.warning, style: BorderStyle.THICK, size: 12 },
              },
              children: [
                new TextRun({ text: `  📌 Quick Recap`, bold: true, size: 22, color: COLORS.warning, font: 'Arial' }),
              ],
            }),
            new Paragraph({
              spacing: { before: 0, after: 200 },
              shading: { type: ShadingType.SOLID, color: 'FFF7ED', fill: 'FFF7ED' },
              children: [
                new TextRun({ text: `  ${sub.content}`, size: 20, color: '334155', font: 'Arial' }),
              ],
            })
          )
          break
      }
    }
  }

  const doc = new Document({
    numbering: {
      config: [{
        reference: 'bullet',
        levels: [{
          level: 0,
          format: NumberFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 180 } } },
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 900, right: 900 },
        },
      },
      headers: { default: buildHeader(options.logoBase64, options.watermarkText) },
      footers: { default: buildFooter() },
      children: allParagraphs,
    }],
  })

  return Packer.toBuffer(doc)
}

// ─── Generate Exercises DOCX ──────────────────────────────────────────────────
export async function generateExercisesBuffer(
  problems: ExerciseProblem[],
  options: ExerciseOptions,
  topic: string
): Promise<Buffer> {
  const allParagraphs: Paragraph[] = []

  const totalMarks = problems.reduce((sum, p) => sum + p.marks, 0)

  // Cover
  allParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 200 },
      children: [
        new TextRun({ text: topic, bold: true, size: 48, color: COLORS.primary, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100 },
      children: [
        new TextRun({
          text: `Exercise Sheet  ·  ${problems.length} Problems  ·  Total: ${totalMarks} Marks`,
          size: 22, color: COLORS.subtext, font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 400 },
      children: [
        new TextRun({
          text: `Difficulty: ${options.difficulty.charAt(0).toUpperCase() + options.difficulty.slice(1)}`,
          size: 20, color: COLORS.subtext, font: 'Arial', italics: true,
        }),
      ],
    }),
    new Paragraph({
      border: { bottom: { color: COLORS.primary, style: BorderStyle.SINGLE, size: 6 } },
      spacing: { before: 0, after: 400 },
      children: [],
    })
  )

  // Table for student info
  allParagraphs.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [new Paragraph({
                children: [new TextRun({ text: 'Name: _____________________________', size: 20, font: 'Arial', color: COLORS.text })],
              })],
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [new Paragraph({
                children: [new TextRun({ text: 'Date: ________________', size: 20, font: 'Arial', color: COLORS.text })],
              })],
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [new Paragraph({
                children: [new TextRun({ text: 'Score: ___ / ' + totalMarks, size: 20, font: 'Arial', color: COLORS.text })],
              })],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 200, after: 200 }, children: [] })
  )

  // Problems
  for (const problem of problems) {
    const diffColor = problem.difficulty === 'easy' ? COLORS.success : problem.difficulty === 'medium' ? COLORS.warning : 'DC2626'

    allParagraphs.push(
      new Paragraph({
        spacing: { before: 300, after: 80 },
        shading: { type: ShadingType.SOLID, color: COLORS.lightBg, fill: COLORS.lightBg },
        children: [
          new TextRun({ text: `  Q${problem.index}. `, bold: true, size: 22, color: COLORS.primary, font: 'Arial' }),
          new TextRun({ text: `[${problem.difficulty.toUpperCase()}]`, size: 18, color: diffColor, font: 'Arial', bold: true }),
          new TextRun({ text: `   ${problem.marks} mark${problem.marks > 1 ? 's' : ''}`, size: 18, color: COLORS.subtext, font: 'Arial' }),
        ],
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        indent: { left: 240 },
        children: [
          new TextRun({ text: problem.question, size: 20, color: COLORS.text, font: 'Arial' }),
        ],
      })
    )

    // MCQ options
    if (problem.type === 'mcq' && problem.options?.length) {
      for (const opt of problem.options) {
        allParagraphs.push(
          new Paragraph({
            spacing: { before: 60, after: 60 },
            indent: { left: 480 },
            children: [
              new TextRun({ text: `○  ${opt}`, size: 20, font: 'Arial', color: '334155' }),
            ],
          })
        )
      }
    }

    // Coding starter
    if (problem.type === 'coding' && problem.starterCode) {
      allParagraphs.push(...codeBlock(problem.starterCode, problem.codeLanguage))
    }

    // True/False blanks
    if (problem.type === 'true-false') {
      allParagraphs.push(
        new Paragraph({
          spacing: { before: 60, after: 120 },
          indent: { left: 480 },
          children: [
            new TextRun({ text: '○  True       ○  False', size: 20, font: 'Arial', color: '334155' }),
          ],
        })
      )
    }

    // Answer lines for short/long answer
    if (problem.type === 'short-answer' || problem.type === 'fill-blank') {
      allParagraphs.push(
        new Paragraph({
          spacing: { before: 60, after: 60 },
          indent: { left: 240 },
          border: { bottom: { color: COLORS.border, style: BorderStyle.SINGLE, size: 2 } },
          children: [new TextRun({ text: 'Answer: ', size: 20, font: 'Arial', color: COLORS.subtext })],
        }),
        new Paragraph({ spacing: { before: 60, after: 120 }, children: [] })
      )
    }
    if (problem.type === 'long-answer' || problem.type === 'case-study') {
      for (let i = 0; i < 4; i++) {
        allParagraphs.push(
          new Paragraph({
            spacing: { before: 60, after: 60 },
            border: { bottom: { color: COLORS.border, style: BorderStyle.SINGLE, size: 2 } },
            children: [new TextRun({ text: ' ', size: 20 })],
          })
        )
      }
    }

    // Hint
    if (options.includeHints && problem.hint) {
      allParagraphs.push(
        highlightBox(`💡 Hint: ${problem.hint}`, 'FEFCE8', COLORS.warning)
      )
    }
  }

  // Answer key (separate section)
  if (options.includeAnswerKey) {
    allParagraphs.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 300 },
        shading: { type: ShadingType.SOLID, color: COLORS.lightBg, fill: COLORS.lightBg },
        children: [
          new TextRun({ text: '  ✓  Answer Key', bold: true, size: 36, color: COLORS.success, font: 'Arial' }),
        ],
      })
    )
    for (const problem of problems) {
      if (problem.answer) {
        allParagraphs.push(
          new Paragraph({
            spacing: { before: 160, after: 80 },
            children: [
              new TextRun({ text: `Q${problem.index}.  `, bold: true, size: 20, color: COLORS.primary, font: 'Arial' }),
              new TextRun({ text: problem.answer, size: 20, color: COLORS.text, font: 'Arial' }),
            ],
          })
        )
      }
    }
  }

  const doc = new Document({
    numbering: {
      config: [{
        reference: 'bullet',
        levels: [{
          level: 0,
          format: NumberFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 180 } } },
        }],
      }],
    },
    sections: [{
      properties: {
        page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } },
      },
      headers: { default: buildHeader(options.logoBase64, options.watermarkText) },
      footers: { default: buildFooter() },
      children: allParagraphs,
    }],
  })

  return Packer.toBuffer(doc)
}
