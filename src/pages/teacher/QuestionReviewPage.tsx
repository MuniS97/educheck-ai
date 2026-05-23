import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Sparkles, Trash2, Save, Play, Star } from 'lucide-react'
import {
  getSubmission,
  resetSubmissionToPending,
} from '@/services/submissionService'
import { getAssignment } from '@/services/assignmentService'
import { getReportBySubmission, deleteReportsBySubmission } from '@/services/reportService'
import {
  getQuestionsBySubmission,
  generateQuestionsViaAI,
  saveGeneratedQuestions,
  updateQuestion,
  deleteQuestion,
  deleteQuestionsBySubmission,
} from '@/services/questionService'
import type { Question, Report, Submission } from '@/types'
import { formatDate } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const difficultyLabels: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Tricky',
  oral: 'Oral / Viva',
  followup: 'Follow-up',
}

export function QuestionReviewPage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState<Report | null>(null)

  const load = async () => {
    if (!submissionId) return
    const [sub, qs, rep] = await Promise.all([
      getSubmission(submissionId),
      getQuestionsBySubmission(submissionId),
      getReportBySubmission(submissionId),
    ])
    setSubmission(sub)
    setQuestions(qs)
    setReport(rep)
    setEdits(Object.fromEntries(qs.map((q) => [q.id, q.question])))
    setLoading(false)
  }

  useEffect(() => {
    load().catch(() => setLoading(false))
  }, [submissionId])

  const handleGenerate = async () => {
    if (!submission || !submissionId) return
    setGenerating(true)
    setError('')
    try {
      const isRegenerate = questions.length > 0

      if (isRegenerate) {
        await Promise.all([
          deleteQuestionsBySubmission(submissionId),
          deleteReportsBySubmission(submissionId),
          resetSubmissionToPending(submissionId),
        ])
        setReport(null)
      }

      const assignment = await getAssignment(submission.assignmentId)
      if (!assignment) throw new Error('Assignment not found')

      const generated = await generateQuestionsViaAI(
        assignment.description,
        submission.text,
        submissionId,
      )
      const saved = await saveGeneratedQuestions(submissionId, generated)
      setQuestions(saved)
      setEdits(Object.fromEntries(saved.map((q) => [q.id, q.question])))
      if (isRegenerate) {
        setSubmission((prev) => (prev ? { ...prev, status: 'pending' } : prev))
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate questions. Check VITE_GEMINI_API_KEY in .env',
      )
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async (id: string) => {
    const text = edits[id]
    if (!text) return
    await updateQuestion(id, text)
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, question: text } : q)))
  }

  const handleDelete = async (id: string) => {
    await deleteQuestion(id)
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const grouped = questions.reduce(
    (acc, q) => {
      if (!acc[q.difficulty]) acc[q.difficulty] = []
      acc[q.difficulty].push(q)
      return acc
    },
    {} as Record<string, Question[]>,
  )

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Question review</h1>
          <p className="mt-1 text-muted">
            {submission?.studentName ?? 'Student'} — edit or regenerate questions
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? <Spinner /> : <Sparkles className="h-4 w-4" />}
            {questions.length ? 'Regenerate' : 'Generate questions'}
          </Button>
          {questions.length > 0 && submissionId && (
            <Link
              to={`/teacher/submissions/${submissionId}/verify`}
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              <Play className="h-4 w-4" />
              Live verify
            </Link>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {report && (
        <Card className="border-primary/20 bg-accent/30">
          <CardHeader>
            <CardTitle className="text-base">Verification report</CardTitle>
            <p className="text-xs text-muted">Saved {formatDate(report.generatedAt)}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs font-medium text-muted">Understanding confidence</p>
                <p className="text-2xl font-semibold text-primary">{report.confidenceScore}%</p>
                <p className="text-xs text-muted">
                  From star ratings ({report.questionsRated} question
                  {report.questionsRated === 1 ? '' : 's'})
                </p>
              </div>
            </div>
            {report.notes ? (
              <div>
                <p className="text-xs font-medium text-muted">Session notes</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{report.notes}</p>
              </div>
            ) : (
              <p className="text-sm text-muted">No session notes were recorded.</p>
            )}
            {Object.keys(report.questionScores).length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted">Per-question ratings</p>
                <ul className="space-y-2">
                  {questions
                    .filter((q) => report.questionScores[q.id] != null)
                    .map((q) => (
                      <li
                        key={q.id}
                        className="flex items-start justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      >
                        <span className="line-clamp-2 flex-1">{q.question}</span>
                        <span className="flex shrink-0 items-center gap-0.5 text-amber-600">
                          {report.questionScores[q.id]}
                          <Star className="h-3.5 w-3.5 fill-current" />
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {questions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted">No questions yet. Generate AI questions from the submission.</p>
            <Button className="mt-4" onClick={handleGenerate} disabled={generating}>
              {generating ? <Spinner /> : 'Generate questions'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([difficulty, items]) => (
          <Card key={difficulty}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Badge variant={difficulty as 'easy' | 'medium' | 'hard' | 'oral'}>
                  {difficultyLabels[difficulty] ?? difficulty}
                </Badge>
                <span className="text-muted font-normal">({items.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((q, i) => (
                <div key={q.id} className="rounded-lg border border-border p-4">
                  <p className="mb-2 text-xs font-medium text-muted">Question {i + 1}</p>
                  <Textarea
                    value={edits[q.id] ?? q.question}
                    onChange={(e) => setEdits((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    rows={2}
                  />
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleSave(q.id)}>
                      <Save className="h-3 w-3" />
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(q.id)}>
                      <Trash2 className="h-3 w-3 text-danger" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
