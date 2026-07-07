import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return '0'
  return score.toString()
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

export function getTierColor(tier: string | null | undefined): string {
  switch (tier?.toLowerCase()) {
    case 'cold': return 'tier-cold'
    case 'warm': return 'tier-warm'
    case 'engaged': return 'tier-engaged'
    case 'hot': return 'tier-hot'
    case 'committed': return 'tier-committed'
    default: return 'tier-cold'
  }
}

export function getEncirclementColor(level: string | null | undefined): string {
  switch (level?.toLowerCase()) {
    case 'scout': return 'encirclement-scout'
    case 'patrol': return 'encirclement-patrol'
    case 'encirclement': return 'encirclement-encirclement'
    case 'siege': return 'encirclement-siege'
    case 'occupation': return 'encirclement-occupation'
    default: return 'encirclement-scout'
  }
}

export function getSignalStrengthColor(strength: string | null | undefined): string {
  switch (strength?.toLowerCase()) {
    case 'low': return 'text-muted-foreground'
    case 'medium': return 'text-info'
    case 'medium-high': return 'text-warning'
    case 'high': return 'text-error'
    default: return 'text-muted-foreground'
  }
}

export function getDeltaIndicator(delta: string | null | undefined): { icon: string; color: string } {
  if (!delta) return { icon: '—', color: 'text-muted-foreground' }
  
  const increase = delta.includes('+') || delta.includes('↑')
  const decrease = delta.includes('-') || delta.includes('↓')
  
  if (increase) return { icon: '↑', color: 'text-success' }
  if (decrease) return { icon: '↓', color: 'text-error' }
  return { icon: '—', color: 'text-muted-foreground' }
}

export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}