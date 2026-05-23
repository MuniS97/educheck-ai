import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generateQuestionsWithGemini } from '@/services/aiService'
import type { GeneratedQuestions, Question, QuestionDifficulty } from '@/types'

function mapQuestion(id: string, data: Record<string, unknown>): Question {
  const createdAt = data.createdAt as Timestamp | undefined
  return {
    id,
    submissionId: data.submissionId as string,
    difficulty: data.difficulty as QuestionDifficulty,
    question: data.question as string,
    category: data.category as Question['category'],
    createdAt: createdAt?.toMillis?.() ?? (data.createdAt as number) ?? Date.now(),
  }
}

export async function getQuestionsBySubmission(submissionId: string): Promise<Question[]> {
  const q = query(
    collection(db, 'questions'),
    where('submissionId', '==', submissionId),
    orderBy('createdAt', 'asc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => mapQuestion(d.id, d.data()))
}

export async function saveGeneratedQuestions(
  submissionId: string,
  generated: GeneratedQuestions,
): Promise<Question[]> {
  const batch = writeBatch(db)
  const questions: Question[] = []
  const now = Date.now()

  const entries: { difficulty: QuestionDifficulty; items: string[] }[] = [
    { difficulty: 'easy', items: generated.easy },
    { difficulty: 'medium', items: generated.medium },
    { difficulty: 'hard', items: generated.hard },
    { difficulty: 'oral', items: generated.oral },
  ]

  for (const { difficulty, items } of entries) {
    for (const questionText of items) {
      const ref = doc(collection(db, 'questions'))
      const q: Question = {
        id: ref.id,
        submissionId,
        difficulty,
        question: questionText,
        category: difficulty,
        createdAt: now,
      }
      batch.set(ref, {
        submissionId,
        difficulty,
        question: questionText,
        category: difficulty,
        createdAt: serverTimestamp(),
      })
      questions.push(q)
    }
  }

  await batch.commit()
  return questions
}

export async function generateQuestionsViaAI(
  assignmentDescription: string,
  submissionText: string,
  _submissionId?: string,
): Promise<GeneratedQuestions> {
  return generateQuestionsWithGemini(assignmentDescription, submissionText)
}

export async function updateQuestion(id: string, question: string): Promise<void> {
  await updateDoc(doc(db, 'questions', id), { question })
}

export async function deleteQuestion(id: string): Promise<void> {
  await deleteDoc(doc(db, 'questions', id))
}

export async function deleteQuestionsBySubmission(submissionId: string): Promise<void> {
  const q = query(collection(db, 'questions'), where('submissionId', '==', submissionId))
  const snap = await getDocs(q)
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
}

export async function addQuestion(
  submissionId: string,
  difficulty: QuestionDifficulty,
  question: string,
): Promise<Question> {
  const docRef = await addDoc(collection(db, 'questions'), {
    submissionId,
    difficulty,
    question,
    category: difficulty,
    createdAt: serverTimestamp(),
  })
  return {
    id: docRef.id,
    submissionId,
    difficulty,
    question,
    category: difficulty,
    createdAt: Date.now(),
  }
}
