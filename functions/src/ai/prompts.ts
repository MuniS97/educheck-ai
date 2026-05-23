export const SYSTEM_PROMPT = `You are an educational verification assistant for EduCheck AI.
Your role is to help teachers verify whether students truly understand their submitted work.
You do NOT detect AI-generated content. You generate questions that test real understanding.
Be specific to the assignment and submission. Avoid generic textbook questions.
Questions should be fair, clear, and appropriate for oral verification.`

export function buildQuestionPrompt(
  assignmentDescription: string,
  submissionText: string,
): string {
  return `Given the following:

## Assignment
${assignmentDescription}

## Student Submission
${submissionText || '(No text provided — generate questions based on the assignment context and note that file content may need teacher review.)'}

Generate verification questions as JSON with exactly this structure:
{
  "easy": ["5 easy understanding questions"],
  "medium": ["5 medium reasoning questions"],
  "hard": ["5 tricky deep-understanding questions"],
  "oral": ["3 oral viva-style questions for live discussion"]
}

Requirements:
- Each array must have the exact count specified above
- Questions must reference specific ideas from the submission when possible
- Hard questions should test originality, reasoning, and edge cases
- Oral questions should be conversational and suitable for live interviews
- Return ONLY valid JSON, no markdown or extra text`
}
