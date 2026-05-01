export function chunkText(text, maxLength = 1200) {
  if (!text || typeof text !== 'string') return []

  const cleanText = text.replace(/\s+/g, ' ').trim()
  const chunks = []

  for (let i = 0; i < cleanText.length; i += maxLength) {
    chunks.push(cleanText.slice(i, i + maxLength))
  }

  return chunks
}