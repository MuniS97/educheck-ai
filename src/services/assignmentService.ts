import {
  addDoc,
  collection,
  deleteDoc,
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
import type { Assignment } from '@/types'

function mapAssignment(id: string, data: Record<string, unknown>): Assignment {
  const deadline = data.deadline as Timestamp | null | undefined
  const createdAt = data.createdAt as Timestamp | undefined
  return {
    id,
    teacherId: data.teacherId as string,
    title: data.title as string,
    description: data.description as string,
    files: (data.files as string[]) ?? [],
    deadline: deadline?.toMillis?.() ?? (data.deadline as number | null) ?? null,
    createdAt: createdAt?.toMillis?.() ?? (data.createdAt as number) ?? Date.now(),
  }
}

export async function createAssignment(
  teacherId: string,
  data: { title: string; description: string; deadline: number | null },
  fileNames: string[] = [],
): Promise<Assignment> {
  const docRef = await addDoc(collection(db, 'assignments'), {
    teacherId,
    title: data.title,
    description: data.description,
    files: fileNames,
    deadline: data.deadline,
    createdAt: serverTimestamp(),
  })

  return {
    id: docRef.id,
    teacherId,
    title: data.title,
    description: data.description,
    files: fileNames,
    deadline: data.deadline,
    createdAt: Date.now(),
  }
}

export async function getTeacherAssignments(teacherId: string): Promise<Assignment[]> {
  const q = query(
    collection(db, 'assignments'),
    where('teacherId', '==', teacherId),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => mapAssignment(d.id, d.data()))
}

export async function getAssignment(id: string): Promise<Assignment | null> {
  const snap = await getDoc(doc(db, 'assignments', id))
  if (!snap.exists()) return null
  return mapAssignment(snap.id, snap.data())
}

export async function updateAssignment(
  id: string,
  data: Partial<Pick<Assignment, 'title' | 'description' | 'deadline'>>,
): Promise<void> {
  await updateDoc(doc(db, 'assignments', id), data)
}

export async function deleteAssignment(id: string): Promise<void> {
  await deleteDoc(doc(db, 'assignments', id))
}

export async function getAllAssignments(): Promise<Assignment[]> {
  const q = query(collection(db, 'assignments'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => mapAssignment(d.id, d.data()))
}
