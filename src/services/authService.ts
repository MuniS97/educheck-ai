import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { User, UserRole } from '@/types'

export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: UserRole,
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const user: User = {
    id: credential.user.uid,
    name,
    email,
    role,
    createdAt: Date.now(),
  }
  await setDoc(doc(db, 'users', user.id), {
    ...user,
    createdAt: serverTimestamp(),
  })
  return user
}

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  const profile = await getUserProfile(credential.user.uid)
  if (!profile) throw new Error('User profile not found')
  return profile
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    id: snap.id,
    name: data.name,
    email: data.email,
    role: data.role,
    createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? Date.now(),
  }
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      callback(null)
      return
    }
    const profile = await getUserProfile(firebaseUser.uid)
    callback(profile)
  })
}
