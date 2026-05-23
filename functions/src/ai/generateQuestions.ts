import OpenAI from 'openai'
import { buildQuestionPrompt, SYSTEM_PROMPT } from './prompts.js'

export interface GeneratedQuestions {
  easy: string[]
  medium: string[]
  hard: string[]
  oral: string[]
}

export async function generateQuestionsWithOpenAI(
  assignmentDescription: string,
  submissionText: string,
): Promise<GeneratedQuestions> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const openai = new OpenAI({ apiKey })
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildQuestionPrompt(assignmentDescription, submissionText) },
    ],
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('Empty response from OpenAI')

  const parsed = JSON.parse(content) as GeneratedQuestions

  return {
    easy: parsed.easy ?? [],
    medium: parsed.medium ?? [],
    hard: parsed.hard ?? [],
    oral: parsed.oral ?? [],
  }
}
