import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Report } from '@/types'

function mapReport(id: string, data: Record<string, unknown>): Report {
  const generatedAt = data.generatedAt as Timestamp | undefined
  return {
    id,
    submissionId: data.submissionId as string,
    confidenceScore: data.confidenceScore as number,
    understandingScore: data.understandingScore as number,
    originalityScore: data.originalityScore as number,
    notes: (data.notes as string) ?? '',
    questionScores: (data.questionScores as Record<string, number>) ?? {},
    questionsRated: (data.questionsRated as number) ?? 0,
    generatedAt: generatedAt?.toMillis?.() ?? (data.generatedAt as number) ?? Date.now(),
  }
}

export async function createReport(
  submissionId: string,
  data: {
    confidenceScore: number
    understandingScore: number
    originalityScore: number
    notes: string
    questionScores: Record<string, number>
    questionsRated: number
  },
): Promise<Report> {
  const docRef = await addDoc(collection(db, 'reports'), {
    submissionId,
    ...data,
    generatedAt: serverTimestamp(),
  })
  return {
    id: docRef.id,
    submissionId,
    ...data,
    generatedAt: Date.now(),
  }
}

export async function getReportBySubmission(submissionId: string): Promise<Report | null> {
  const q = query(
    collection(db, 'reports'),
    where('submissionId', '==', submissionId),
    orderBy('generatedAt', 'desc'),
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return mapReport(d.id, d.data())
}

export async function getReport(id: string): Promise<Report | null> {
  const snap = await getDoc(doc(db, 'reports', id))
  if (!snap.exists()) return null
  return mapReport(snap.id, snap.data())
}

export async function deleteReportsBySubmission(submissionId: string): Promise<void> {
  const q = query(collection(db, 'reports'), where('submissionId', '==', submissionId))
  const snap = await getDocs(q)
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
}
