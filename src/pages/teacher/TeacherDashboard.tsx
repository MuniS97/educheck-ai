import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Users, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getTeacherAssignments } from '@/services/assignmentService'
import { getSubmissionsByAssignment } from '@/services/submissionService'
import type { Assignment, Submission } from '@/types'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { formatDate, cn } from '@/lib/utils'

export function TeacherDashboard() {
  const user = useAuthStore((s) => s.user)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const list = await getTeacherAssignments(user.id)
      setAssignments(list)

      const allSubs: Submission[] = []
      for (const a of list.slice(0, 5)) {
        const subs = await getSubmissionsByAssignment(a.id)
        allSubs.push(...subs)
      }
      setRecentSubmissions(
        allSubs.sort((a, b) => b.submittedAt - a.submittedAt).slice(0, 5),
      )
      setLoading(false)
    }
    load().catch(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-muted">Welcome back, {user?.name}</p>
        </div>
        <Link to="/teacher/assignments/new" className={cn(buttonVariants())}>
          <Plus className="h-4 w-4" />
          New assignment
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{assignments.length}</p>
              <p className="text-sm text-muted">Assignments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{recentSubmissions.length}</p>
              <p className="text-sm text-muted">Recent submissions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your assignments</CardTitle>
            <CardDescription>Manage and verify student work</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted">No assignments yet.</p>
              <Link
                to="/teacher/assignments/new"
                className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 inline-flex')}
              >
                Create your first assignment
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {assignments.map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/teacher/assignments/${a.id}`}
                    className="flex items-center justify-between py-4 transition-colors hover:bg-slate-50 -mx-2 px-2 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{a.title}</p>
                      <p className="text-sm text-muted line-clamp-1">{a.description}</p>
                      {a.deadline && (
                        <p className="mt-1 text-xs text-muted">Due {formatDate(a.deadline)}</p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {recentSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentSubmissions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{s.studentName ?? 'Student'}</p>
                    <p className="text-xs text-muted">{formatDate(s.submittedAt)}</p>
                  </div>
                  <Link
                    to={`/teacher/submissions/${s.id}/questions`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    Review
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
