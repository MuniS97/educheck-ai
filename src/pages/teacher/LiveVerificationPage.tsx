import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Shuffle, ChevronRight, X, Star, StickyNote } from 'lucide-react'
import { getQuestionsBySubmission } from '@/services/questionService'
import { getSubmission, markSubmissionReviewed } from '@/services/submissionService'
import { createReport } from '@/services/reportService'
import { computeConfidenceFromScores, averageStarRating } from '@/lib/verificationScores'
import type { Question } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

export function LiveVerificationPage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [notes, setNotes] = useState('')
  const [scores, setScores] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [studentName, setStudentName] = useState('')
  const [showNotesMobile, setShowNotesMobile] = useState(false)

  useEffect(() => {
    if (!submissionId) return
    Promise.all([getQuestionsBySubmission(submissionId), getSubmission(submissionId)])
      .then(([qs, sub]) => {
        setQuestions(qs)
        setStudentName(sub?.studentName ?? 'Student')
      })
      .finally(() => setLoading(false))
  }, [submissionId])

  const shuffled = useMemo(() => [...questions].sort(() => Math.random() - 0.5), [questions])
  const [useRandom, setUseRandom] = useState(false)
  const list = useRandom ? shuffled : questions
  const current = list[index]

  const confidencePercent = computeConfidenceFromScores(scores)
  const avgStars = averageStarRating(scores)
  const ratedCount = Object.keys(scores).length

  const next = () => setIndex((i) => Math.min(i + 1, list.length - 1))

  const randomTricky = () => {
    const tricky = questions.filter((q) => q.difficulty === 'hard' || q.difficulty === 'oral')
    if (tricky.length) {
      const pick = tricky[Math.floor(Math.random() * tricky.length)]
      const idx = list.findIndex((q) => q.id === pick.id)
      if (idx >= 0) setIndex(idx)
    }
  }

  const handleFinish = async () => {
    if (!submissionId) return
    setSaveError('')
    setSaving(true)

    const confidenceScore = computeConfidenceFromScores(scores)

    try {
      await createReport(submissionId, {
        confidenceScore,
        understandingScore: confidenceScore,
        originalityScore: confidenceScore,
        notes: notes.trim(),
        questionScores: scores,
        questionsRated: ratedCount,
      })
      await markSubmissionReviewed(submissionId)
      navigate(`/teacher/submissions/${submissionId}/questions`)
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Could not save report. Check your connection.',
      )
    } finally {
      setSaving(false)
    }
  }

  const notesPanel = (
    <div className="flex min-h-0 flex-1 flex-col">
      <label htmlFor="session-notes" className="shrink-0 text-sm font-medium text-slate-400">
        Session notes
      </label>
      <Textarea
        id="session-notes"
        className="mt-2 min-h-0 flex-1 resize-none border-white/10 bg-white/5 text-white placeholder:text-slate-500"
        placeholder="Observations during the interview (saved with the report)..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </div>
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <Spinner className="h-8 w-8 border-white/30 border-t-white" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
        <p>No questions available. Generate questions first.</p>
        <Button className="mt-4" variant="secondary" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 text-white lg:flex-row">
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm text-slate-400">Live verification</p>
            <p className="font-medium">{studentName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 lg:hidden"
              onClick={() => setShowNotesMobile((v) => !v)}
            >
              <StickyNote className="h-4 w-4" />
              Notes
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={randomTricky}>
              <Shuffle className="h-4 w-4" />
              <span className="hidden sm:inline">Random tricky</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => navigate(-1)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {showNotesMobile && (
          <div className="flex min-h-0 flex-1 flex-col border-b border-white/10 p-4 lg:hidden">
            {notesPanel}
          </div>
        )}

        <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8 sm:px-6">
          {current && (
            <>
              <Badge
                variant={current.difficulty as 'easy' | 'medium' | 'hard' | 'oral'}
                className="mb-6"
              >
                {current.difficulty}
              </Badge>
              <p className="max-w-2xl text-center font-serif text-xl leading-relaxed sm:text-2xl md:text-3xl">
                {current.question}
              </p>
              <p className="mt-6 text-sm text-slate-400">
                Question {index + 1} of {list.length}
              </p>

              <div className="mt-8 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`Rate ${n} out of 5`}
                    onClick={() => setScores((s) => ({ ...s, [current.id]: n }))}
                    className={cn(
                      'rounded p-1 transition-colors',
                      (scores[current.id] ?? 0) >= n ? 'text-amber-400' : 'text-slate-600',
                    )}
                  >
                    <Star className="h-7 w-7 fill-current sm:h-8 sm:w-8" />
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center">
                <p className="text-sm text-slate-400">Understanding confidence</p>
                <p className="text-3xl font-semibold text-white">{confidencePercent}%</p>
                <p className="mt-1 text-xs text-slate-500">
                  {ratedCount === 0
                    ? 'Rate questions with stars to calculate'
                    : avgStars !== null
                      ? `${avgStars} / 5 avg · ${ratedCount} of ${list.length} rated`
                      : ''}
                </p>
              </div>
            </>
          )}
        </main>

        {saveError && (
          <p className="px-4 pb-2 text-center text-sm text-red-400 sm:px-6">{saveError}</p>
        )}

        <footer className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center justify-between gap-3 sm:justify-start">
            <Button
              variant="ghost"
              className="text-white"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              Previous
            </Button>
            <label className="flex items-center gap-2 text-sm text-slate-400 sm:hidden">
              <input
                type="checkbox"
                checked={useRandom}
                onChange={(e) => {
                  setUseRandom(e.target.checked)
                  setIndex(0)
                }}
                className="rounded"
              />
              Shuffle
            </label>
          </div>
          {index < list.length - 1 ? (
            <Button onClick={next} className="w-full sm:w-auto">
              Next question
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={saving} className="w-full sm:w-auto">
              {saving ? <Spinner /> : 'Finish & save report'}
            </Button>
          )}
        </footer>
      </div>

      <aside className="hidden min-h-0 w-80 shrink-0 flex-col border-l border-white/10 bg-slate-950/50 lg:flex">
        <div className="flex min-h-0 flex-1 flex-col p-6">{notesPanel}</div>
        <div className="shrink-0 border-t border-white/10 px-6 py-4">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={useRandom}
              onChange={(e) => {
                setUseRandom(e.target.checked)
                setIndex(0)
              }}
              className="rounded"
            />
            Shuffle question order
          </label>
        </div>
      </aside>
    </div>
  )
}
