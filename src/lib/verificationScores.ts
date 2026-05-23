/** Convert 1–5 star ratings to a 0–100 understanding confidence score. */
export function computeConfidenceFromScores(scores: Record<string, number>): number {
  const values = Object.values(scores).filter((n) => n >= 1 && n <= 5)
  if (values.length === 0) return 0
  const average = values.reduce((sum, n) => sum + n, 0) / values.length
  return Math.round((average / 5) * 100)
}

export function averageStarRating(scores: Record<string, number>): number | null {
  const values = Object.values(scores).filter((n) => n >= 1 && n <= 5)
  if (values.length === 0) return null
  return Math.round((values.reduce((sum, n) => sum + n, 0) / values.length) * 10) / 10
}
