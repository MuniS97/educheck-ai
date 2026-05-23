import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Submission } from '@/types'

function mapSubmission(id: string, data: Record<string, unknown>): Submission {
  const submittedAt = data.submittedAt as Timestamp | undefined
  return {
    id,
    assignmentId: data.assignmentId as string,
    studentId: data.studentId as string,
    studentName: data.studentName as string | undefined,
    files: (data.files as string[]) ?? [],
    text: (data.text as string) ?? '',
    submittedAt: submittedAt?.toMillis?.() ?? (data.submittedAt as number) ?? Date.now(),
    status: (data.status as Submission['status']) ?? 'pending',
  }
}

export async function createSubmission(
  assignmentId: string,
  studentId: string,
  studentName: string,
  text: string,
  fileNames: string[] = [],
): Promise<Submission> {
  const docRef = await addDoc(collection(db, 'submissions'), {
    assignmentId,
    studentId,
    studentName,
    files: fileNames,
    text,
    status: 'pending',
    submittedAt: serverTimestamp(),
  })

  return {
    id: docRef.id,
    assignmentId,
    studentId,
    studentName,
    files: fileNames,
    text,
    submittedAt: Date.now(),
    status: 'pending',
  }
}

export async function getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
  const q = query(
    collection(db, 'submissions'),
    where('assignmentId', '==', assignmentId),
    orderBy('submittedAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => mapSubmission(d.id, d.data()))
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const snap = await getDoc(doc(db, 'submissions', id))
  if (!snap.exists()) return null
  return mapSubmission(snap.id, snap.data())
}

export async function markSubmissionReviewed(submissionId: string): Promise<void> {
  await updateDoc(doc(db, 'submissions', submissionId), { status: 'reviewed' })
}

export async function resetSubmissionToPending(submissionId: string): Promise<void> {
  await updateDoc(doc(db, 'submissions', submissionId), { status: 'pending' })
}

export async function getStudentSubmissions(studentId: string): Promise<Submission[]> {
  const q = query(
    collection(db, 'submissions'),
    where('studentId', '==', studentId),
    orderBy('submittedAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => mapSubmission(d.id, d.data()))
}
