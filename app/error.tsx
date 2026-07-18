'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Log error server-side (only accessible in dev/console, not to user)
  console.error('[App Error]', error.message, error.digest)

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-none border border-border p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
          <svg className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6">
          An unexpected error occurred. Our team has been notified.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-none px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
