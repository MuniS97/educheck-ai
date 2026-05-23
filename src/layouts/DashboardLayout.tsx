import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Plus,
  BookOpen,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { signOut } from '@/services/authService'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function DashboardLayout() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const isTeacher = user?.role === 'teacher'
  const base = isTeacher ? '/teacher' : '/student'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navItems = isTeacher
    ? [
        { to: base, label: 'Dashboard', icon: LayoutDashboard },
        { to: `${base}/assignments/new`, label: 'New Assignment', icon: Plus },
      ]
    : [
        { to: base, label: 'Dashboard', icon: LayoutDashboard },
        { to: `${base}/assignments`, label: 'Assignments', icon: BookOpen },
      ]

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-border bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-serif text-lg font-semibold">EduCheck AI</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === base}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted hover:bg-slate-50 hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted capitalize">{user?.role}</p>
          </div>
          <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:hidden">
          <Link to={base} className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-serif font-semibold">EduCheck AI</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
