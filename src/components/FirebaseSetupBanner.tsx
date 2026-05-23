import { isFirebaseConfigured } from '@/lib/firebase'
import { isGeminiConfigured } from '@/services/aiService'
import { AlertCircle } from 'lucide-react'

export function FirebaseSetupBanner() {
  const missingFirebase = !isFirebaseConfigured
  const missingGemini = !isGeminiConfigured

  if (!missingFirebase && !missingGemini) return null

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>
          {missingFirebase && (
            <>
              Add Firebase config to <code className="rounded bg-amber-100 px-1">.env</code>
            </>
          )}
          {missingFirebase && missingGemini && ' · '}
          {missingGemini && (
            <>
              Add <code className="rounded bg-amber-100 px-1">VITE_GEMINI_API_KEY</code> to{' '}
              <code className="rounded bg-amber-100 px-1">.env</code> for AI questions
            </>
          )}
        </span>
      </div>
    </div>
  )
}
