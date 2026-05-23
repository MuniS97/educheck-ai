import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-accent text-accent-foreground',
        easy: 'bg-emerald-50 text-emerald-700',
        medium: 'bg-amber-50 text-amber-700',
        hard: 'bg-rose-50 text-rose-700',
        oral: 'bg-indigo-50 text-indigo-700',
        followup: 'bg-violet-50 text-violet-700',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
