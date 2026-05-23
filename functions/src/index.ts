import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeApp } from 'firebase-admin/app'

// Load functions/.env for local emulator (production uses Firebase secrets)
const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

import { getFirestore } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { setGlobalOptions } from 'firebase-functions/v2'
import { generateQuestionsWithOpenAI } from './ai/generateQuestions.js'

initializeApp()
setGlobalOptions({ region: 'us-central1', maxInstances: 10 })

interface GenerateQuestionsRequest {
  assignmentDescription: string
  submissionText: string
  submissionId: string
}

export const generateQuestions = onCall(
  { secrets: ['OPENAI_API_KEY'], timeoutSeconds: 120 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required')
    }

    const data = request.data as GenerateQuestionsRequest
    const { assignmentDescription, submissionText, submissionId } = data

    if (!assignmentDescription || !submissionId) {
      throw new HttpsError('invalid-argument', 'Missing required fields')
    }

    const db = getFirestore()
    const userSnap = await db.collection('users').doc(request.auth.uid).get()
    if (!userSnap.exists || userSnap.data()?.role !== 'teacher') {
      throw new HttpsError('permission-denied', 'Only teachers can generate questions')
    }

    // Text is extracted in the browser and stored in Firestore (no Storage on free plan)
    let fullSubmissionText = submissionText ?? ''
    const submissionSnap = await db.collection('submissions').doc(submissionId).get()
    if (submissionSnap.exists) {
      const stored = submissionSnap.data()?.text as string | undefined
      if (stored?.trim()) fullSubmissionText = stored
    }

    try {
      return await generateQuestionsWithOpenAI(assignmentDescription, fullSubmissionText)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed'
      throw new HttpsError('internal', message)
    }
  },
)
