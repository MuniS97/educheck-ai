export type UserRole = 'teacher' | 'student'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: number
}

export interface Assignment {
  id: string
  teacherId: string
  title: string
  description: string
  files: string[] // attachment file names (text stored in description)
  deadline: number | null
  createdAt: number
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string
  studentName?: string
  files: string[] // uploaded file names (content stored in text)
  text: string
  submittedAt: number
  status: 'pending' | 'reviewed'
}

export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | 'oral' | 'followup'
export type QuestionCategory = QuestionDifficulty

export interface Question {
  id: string
  submissionId: string
  difficulty: QuestionDifficulty
  question: string
  category: QuestionCategory
  createdAt: number
}

export interface GeneratedQuestions {
  easy: string[]
  medium: string[]
  hard: string[]
  oral: string[]
}

export interface VerificationSession {
  id: string
  submissionId: string
  teacherId: string
  notes: string
  scores: Record<string, number>
  confidenceLevel: number
  startedAt: number
  completedAt?: number
}

export interface Report {
  id: string
  submissionId: string
  confidenceScore: number
  understandingScore: number
  originalityScore: number
  notes: string
  questionScores: Record<string, number>
  questionsRated: number
  generatedAt: number
}
