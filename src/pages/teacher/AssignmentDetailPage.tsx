import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Sparkles, Play, FileText } from 'lucide-react'
import { getAssignment } from '@/services/assignmentService'
import { getSubmissionsByAssignment } from '@/services/submissionService'
import type { Assignment, Submission } from '@/types'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { formatDate, cn } from '@/lib/utils'

export function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([getAssignment(id), getSubmissionsByAssignment(id)])
      .then(([a, subs]) => {
        setAssignment(a)
        setSubmissions(subs)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!assignment) {
    return <p className="text-muted">Assignment not found.</p>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">{assignment.title}</h1>
        {assignment.deadline && (
          <p className="mt-1 text-sm text-muted">Due {formatDate(assignment.deadline)}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{assignment.description}</p>
          {assignment.files.length > 0 && (
            <ul className="mt-4 space-y-1">
              {assignment.files.map((name) => (
                <li key={name} className="flex items-center gap-2 text-sm text-muted">
                  <FileText className="h-4 w-4 shrink-0" />
                  {name}
                  <span className="text-xs">(text included in description)</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student submissions</CardTitle>
          <CardDescription>{submissions.length} submission(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="py-8 text-center text-muted">No submissions yet.</p>
          ) : (
            <ul className="space-y-3">
              {submissions.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{s.studentName ?? 'Student'}</p>
                    <p className="text-xs text-muted">{formatDate(s.submittedAt)}</p>
                    {s.text && (
                      <p className="mt-2 text-sm text-muted line-clamp-2">{s.text}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/teacher/submissions/${s.id}/questions`}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                    >
                      <Sparkles className="h-4 w-4" />
                      Questions
                    </Link>
                    <Link
                      to={`/teacher/submissions/${s.id}/verify`}
                      className={cn(buttonVariants({ size: 'sm' }))}
                    >
                      <Play className="h-4 w-4" />
                      Live verify
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
