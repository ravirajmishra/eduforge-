const PEXELS_BASE = 'https://api.pexels.com/v1'

export async function fetchPexelsImage(keyword: string, apiKey?: string): Promise<string | null> {
  const key = apiKey || process.env.PEXELS_API_KEY
  if (!key) return null
  try {
    const res = await fetch(`${PEXELS_BASE}/search?query=${encodeURIComponent(keyword)}&per_page=5&orientation=landscape`, {
      headers: { Authorization: key },
    })
    if (!res.ok) return null
    const data = await res.json()
    const photos = data.photos
    if (!photos?.length) return null
    const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 3))]
    return pick.src.large || pick.src.medium || pick.src.original
  } catch {
    return null
  }
}

export async function resolveSlideImages(
  slides: Array<{ imageKeyword?: string; imageUrl?: string }>,
  apiKey?: string
): Promise<void> {
  await Promise.all(
    slides.map(async (slide) => {
      if (slide.imageKeyword && !slide.imageUrl) {
        const url = await fetchPexelsImage(slide.imageKeyword, apiKey)
        if (url) slide.imageUrl = url
      }
    })
  )
}
