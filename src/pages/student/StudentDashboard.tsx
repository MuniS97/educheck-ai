import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getAllAssignments } from '@/services/assignmentService'
import { getStudentSubmissions } from '@/services/submissionService'
import type { Assignment, Submission } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { formatDate } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function StudentDashboard() {
  const user = useAuthStore((s) => s.user)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([getAllAssignments(), getStudentSubmissions(user.id)])
      .then(([a, s]) => {
        setAssignments(a)
        setSubmissions(s)
      })
      .finally(() => setLoading(false))
  }, [user])

  const submittedIds = new Set(submissions.map((s) => s.assignmentId))

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">My assignments</h1>
        <p className="mt-1 text-muted">Welcome, {user?.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Available assignments
          </CardTitle>
          <CardDescription>Submit your work before the deadline</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="py-8 text-center text-muted">No assignments available yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {assignments.map((a) => {
                const submitted = submittedIds.has(a.id)
                return (
                  <li key={a.id} className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{a.title}</p>
                      <p className="text-sm text-muted line-clamp-1">{a.description}</p>
                      {a.deadline && (
                        <p className="mt-1 text-xs text-muted">Due {formatDate(a.deadline)}</p>
                      )}
                      {submitted && (
                        <span className="mt-1 inline-block text-xs font-medium text-success">
                          Submitted
                        </span>
                      )}
                    </div>
                    {!submitted ? (
                      <Link
                        to={`/student/assignments/${a.id}/submit`}
                        className={cn(buttonVariants({ size: 'sm' }))}
                      >
                        Submit
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="text-sm text-muted">Done</span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
