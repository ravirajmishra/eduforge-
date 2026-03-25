const PEXELS_BASE = 'https://api.pexels.com/v1'

export async function fetchPexelsImage(keyword: string): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY
  if (!key) return null

  try {
    const res = await fetch(`${PEXELS_BASE}/search?query=${encodeURIComponent(keyword)}&per_page=5&orientation=landscape`, {
      headers: { Authorization: key },
    })
    if (!res.ok) return null
    const data = await res.json()
    const photos = data.photos
    if (!photos || photos.length === 0) return null
    // Pick a random one from top 5 for variety
    const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 3))]
    return pick.src.large || pick.src.medium || pick.src.original
  } catch {
    return null
  }
}

export async function fetchPexelsImageAsBase64(keyword: string): Promise<string | null> {
  const imageUrl = await fetchPexelsImage(keyword)
  if (!imageUrl) return null

  try {
    const res = await fetch(imageUrl)
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    return `data:${contentType};base64,${base64}`
  } catch {
    return null
  }
}

export async function resolveSlideImages(slides: Array<{ imageKeyword?: string; imageUrl?: string }>): Promise<void> {
  await Promise.all(
    slides.map(async (slide) => {
      if (slide.imageKeyword && !slide.imageUrl) {
        const url = await fetchPexelsImage(slide.imageKeyword)
        if (url) slide.imageUrl = url
      }
    })
  )
}
