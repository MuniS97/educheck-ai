import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { registerUser } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['teacher', 'student']),
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const defaultRole = (searchParams.get('role') as UserRole) || 'teacher'
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  })

  const role = watch('role')

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const user = await registerUser(data.email, data.password, data.name, data.role)
      setUser(user)
      navigate(data.role === 'teacher' ? '/teacher' : '/student')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Registration failed'
      setError(message.includes('email-already-in-use')
        ? 'This email is already registered.'
        : 'Could not create account. Please try again.')
    }
  }

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Create account</CardTitle>
        <CardDescription>Join EduCheck AI as a teacher or student</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          {(['teacher', 'student'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setValue('role', r)}
              className={cn(
                'rounded-md py-2 text-sm font-medium capitalize transition-colors',
                role === r ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-foreground',
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('role')} />
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Jane Smith" {...register('name')} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@school.edu" {...register('email')} />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
