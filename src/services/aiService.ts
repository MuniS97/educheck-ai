import { buildQuestionPrompt, SYSTEM_PROMPT } from '@/lib/ai/prompts'
import type { GeneratedQuestions } from '@/types'

export const isGeminiConfigured = Boolean(
  import.meta.env.VITE_GEMINI_API_KEY &&
    import.meta.env.VITE_GEMINI_API_KEY !== 'undefined',
)

/** @deprecated use isGeminiConfigured */
export const isOpenAIConfigured = isGeminiConfigured

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] }
  }[]
  error?: { message?: string }
}

export async function generateQuestionsWithGemini(
  assignmentDescription: string,
  submissionText: string,
): Promise<GeneratedQuestions> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Add VITE_GEMINI_API_KEY to your .env file')
  }

  const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: buildQuestionPrompt(assignmentDescription, submissionText) }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    }),
  })

  const data = (await response.json()) as GeminiResponse

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Gemini request failed (${response.status})`)
  }

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error('Empty response from Gemini')

  const parsed = JSON.parse(content) as GeneratedQuestions

  return {
    easy: parsed.easy ?? [],
    medium: parsed.medium ?? [],
    hard: parsed.hard ?? [],
    oral: parsed.oral ?? [],
  }
}

/** @deprecated use generateQuestionsWithGemini */
export const generateQuestionsWithOpenAI = generateQuestionsWithGemini
