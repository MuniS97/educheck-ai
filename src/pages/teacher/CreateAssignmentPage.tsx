import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { createAssignment } from '@/services/assignmentService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileDropzone } from '@/components/FileDropzone'
import { Spinner } from '@/components/ui/spinner'
import { extractTextFromFiles, getFileNames } from '@/lib/extractFileText'

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  deadline: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function CreateAssignmentPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    if (!user) return
    setError('')
    try {
      const deadline = data.deadline ? new Date(data.deadline).getTime() : null
      const attachmentText = files.length > 0 ? await extractTextFromFiles(files) : ''
      const description = attachmentText
        ? `${data.description}\n\n--- From attachments ---\n${attachmentText}`
        : data.description
      const assignment = await createAssignment(
        user.id,
        { title: data.title, description, deadline },
        getFileNames(files),
      )
      navigate(`/teacher/assignments/${assignment.id}`)
    } catch {
      setError('Failed to create assignment. Check Firebase configuration.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl font-semibold">New assignment</h1>
      <p className="mt-1 text-muted">Describe the task students must complete</p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Assignment details</CardTitle>
          <CardDescription>Upload materials and set a deadline</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Climate Change Report" {...register('title')} />
              {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Create a 5-page report about climate change including causes, effects, and solutions..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-danger">{errors.description.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (optional)</Label>
              <Input id="deadline" type="datetime-local" {...register('deadline')} />
            </div>
            <div className="space-y-2">
              <Label>Attachment files (optional)</Label>
              <FileDropzone files={files} onChange={setFiles} />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : 'Create assignment'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/teacher')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
