import type { ArticleContent, ArticleOptions } from '../types'

// Format for LinkedIn (character-limited, emoji-friendly, line-spaced)
function formatLinkedIn(article: ArticleContent, options: ArticleOptions): string {
  const lines: string[] = []

  lines.push(article.title)
  lines.push('')
  lines.push(article.hook)
  lines.push('')
  lines.push('─'.repeat(30))
  lines.push('')

  for (const section of article.sections) {
    if (section.heading) {
      lines.push(`🔹 ${section.heading}`)
      lines.push('')
    }
    lines.push(section.content)
    if (section.hasList && section.listItems?.length) {
      lines.push('')
      for (const item of section.listItems) {
        lines.push(`  ✅ ${item}`)
      }
    }
    lines.push('')
  }

  if (article.callToAction) {
    lines.push('─'.repeat(30))
    lines.push('')
    lines.push(article.callToAction)
    lines.push('')
  }

  if (options.includeHashtags && article.hashtags?.length) {
    lines.push(article.hashtags.map((h) => `#${h}`).join(' '))
  }

  return lines.join('\n')
}

// Format for Medium (markdown-style)
function formatMedium(article: ArticleContent): string {
  const lines: string[] = []

  lines.push(`# ${article.title}`)
  lines.push('')
  lines.push(`*${article.estimatedReadTime} min read*`)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push(article.hook)
  lines.push('')

  for (const section of article.sections) {
    if (section.heading) {
      lines.push(`## ${section.heading}`)
      lines.push('')
    }
    lines.push(section.content)
    if (section.hasList && section.listItems?.length) {
      lines.push('')
      for (const item of section.listItems) {
        lines.push(`- ${item}`)
      }
    }
    lines.push('')
  }

  if (article.callToAction) {
    lines.push('---')
    lines.push('')
    lines.push(`> ${article.callToAction}`)
    lines.push('')
  }

  if (article.hashtags?.length) {
    lines.push(`*Tags: ${article.hashtags.join(', ')}*`)
  }

  return lines.join('\n')
}

// Format for generic blog / newsletter
function formatBlog(article: ArticleContent): string {
  const lines: string[] = []

  lines.push(`# ${article.title}`)
  lines.push('')
  lines.push(article.hook)
  lines.push('')

  for (const section of article.sections) {
    if (section.heading) {
      lines.push(`### ${section.heading}`)
      lines.push('')
    }
    lines.push(section.content)
    if (section.hasList && section.listItems?.length) {
      lines.push('')
      for (const item of section.listItems) {
        lines.push(`• ${item}`)
      }
    }
    lines.push('')
  }

  if (article.callToAction) {
    lines.push(`**${article.callToAction}**`)
    lines.push('')
  }

  if (article.hashtags?.length) {
    lines.push(`Tags: ${article.hashtags.map((h) => `#${h}`).join(' ')}`)
  }

  return lines.join('\n')
}

export function formatArticle(article: ArticleContent, options: ArticleOptions): string {
  switch (options.platform) {
    case 'linkedin':
      return formatLinkedIn(article, options)
    case 'medium':
      return formatMedium(article)
    case 'blog':
    case 'newsletter':
    default:
      return formatBlog(article)
  }
}

// Convert article to plain text buffer for download
export function articleToBuffer(text: string): Buffer {
  return Buffer.from(text, 'utf-8')
}
