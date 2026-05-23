import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getAssignment } from '@/services/assignmentService'
import { createSubmission } from '@/services/submissionService'
import type { Assignment } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileDropzone } from '@/components/FileDropzone'
import { Spinner } from '@/components/ui/spinner'
import { formatDate } from '@/lib/utils'
import { extractTextFromFiles, getFileNames } from '@/lib/extractFileText'

export function SubmitAssignmentPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    getAssignment(id)
      .then(setAssignment)
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id || (!text.trim() && files.length === 0)) {
      setError('Please provide text or upload at least one file.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const fileText = files.length > 0 ? await extractTextFromFiles(files) : ''
      const fullText = [text.trim(), fileText].filter(Boolean).join('\n\n')
      await createSubmission(id, user.id, user.name, fullText, getFileNames(files))
      navigate('/student')
    } catch {
      setError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!assignment) return <p>Assignment not found.</p>

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl font-semibold">{assignment.title}</h1>
      {assignment.deadline && (
        <p className="mt-1 text-sm text-muted">Due {formatDate(assignment.deadline)}</p>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Assignment instructions</CardTitle>
          <CardDescription className="whitespace-pre-wrap">{assignment.description}</CardDescription>
        </CardHeader>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your submission</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Written answer</Label>
              <Textarea
                rows={8}
                placeholder="Paste or write your answer here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Upload files</Label>
              <FileDropzone files={files} onChange={setFiles} />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? <Spinner /> : 'Submit assignment'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/student')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
