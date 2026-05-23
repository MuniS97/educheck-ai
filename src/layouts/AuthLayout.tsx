import { Link, Outlet } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2 text-white">
          <GraduationCap className="h-8 w-8" />
          <span className="font-serif text-2xl font-semibold">EduCheck AI</span>
        </Link>
        <div>
          <h2 className="font-serif text-3xl font-semibold leading-tight">
            Verify understanding,<br />not AI detection.
          </h2>
          <p className="mt-4 max-w-md text-indigo-100">
            Generate tailored verification questions from assignments and student submissions.
            Conduct live oral checks with confidence.
          </p>
        </div>
        <p className="text-sm text-indigo-200">Trusted by educators worldwide</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="font-serif text-xl font-semibold">EduCheck AI</span>
        </Link>
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
