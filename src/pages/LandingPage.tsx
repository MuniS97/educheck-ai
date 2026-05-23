import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  Brain,
  MessageCircleQuestion,
  Shield,
  ArrowRight,
  CheckCircle2,
  Users,
  Sparkles,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const features = [
  {
    icon: Brain,
    title: 'AI Question Generation',
    description:
      'Creates easy, medium, tricky, and oral viva questions tailored to each submission.',
  },
  {
    icon: MessageCircleQuestion,
    title: 'Live Verification Mode',
    description: 'Conduct oral exams with one-click questions, notes, and confidence scoring.',
  },
  {
    icon: Shield,
    title: 'Understanding, Not Detection',
    description: 'Verify what students actually know instead of unreliable AI detectors.',
  },
]

const steps = [
  { step: '1', title: 'Create assignment', desc: 'Teachers upload task descriptions and materials.' },
  { step: '2', title: 'Student submits', desc: 'Students upload PDFs, docs, code, or text answers.' },
  { step: '3', title: 'AI generates questions', desc: 'Layered questions test real understanding.' },
  { step: '4', title: 'Live verification', desc: 'Teachers conduct quick oral checks with confidence scores.' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="font-serif text-xl font-semibold">EduCheck AI</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#problem" className="hover:text-foreground">Problem</a>
            <a href="#solution" className="hover:text-foreground">Solution</a>
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className={cn(buttonVariants({ variant: 'ghost' }))}>
              Sign in
            </Link>
            <Link to="/register" className={cn(buttonVariants())}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/80 via-background to-background" />
        <motion.div
          className="relative mx-auto max-w-4xl text-center"
          {...fadeUp}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
            <Sparkles className="h-4 w-4" />
            Understanding verification for educators
          </span>
          <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Verify student understanding,
            <span className="text-primary"> not AI text.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            EduCheck AI generates tailored verification questions from assignments and submissions —
            helping teachers conduct fast, reliable oral checks.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register?role=teacher"
              className={cn(buttonVariants({ size: 'lg' }))}
            >
              Start as teacher
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register?role=student"
              className={cn(buttonVariants({ size: 'lg', variant: 'secondary' }))}
            >
              I'm a student
            </Link>
          </div>
        </motion.div>
      </section>

      <section id="problem" className="border-y border-border bg-white px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-semibold">The problem with AI detectors</h2>
          <p className="mt-4 text-muted leading-relaxed">
            False positives, easy rewrites, and inconsistent models leave teachers unable to trust
            detection tools. What educators need is a practical way to confirm whether students
            truly understand their submitted work.
          </p>
        </div>
      </section>

      <section id="solution" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-semibold">Our solution</h2>
            <p className="mt-3 text-muted">Smart questions. Live verification. Real confidence.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-border/80">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-serif text-3xl font-semibold">How it works</h2>
          <div className="mt-12 space-y-8">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="flex gap-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-2xl bg-primary p-10 text-center text-white md:p-14">
          <Users className="mx-auto h-10 w-10 text-indigo-200" />
          <h2 className="mt-4 font-serif text-3xl font-semibold">Built for teachers</h2>
          <p className="mx-auto mt-3 max-w-lg text-indigo-100">
            Simple dashboards, assignment management, question review, exportable reports, and
            fullscreen live verification mode.
          </p>
          <ul className="mx-auto mt-8 max-w-sm space-y-2 text-left text-sm">
            {['Easy / medium / hard / oral questions', 'Confidence scoring', 'File upload support', 'Firebase-secured data'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-200" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            to="/register"
            className={cn(buttonVariants({ size: 'lg', variant: 'secondary' }), 'mt-8 inline-flex')}
          >
            Create free account
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} EduCheck AI. Understanding verification for education.
      </footer>
    </div>
  )
}
