'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-lg w-full bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-4">{error.message || 'Unknown error'}</p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4">Digest: {error.digest}</p>
        )}
        <pre className="text-xs text-red-600 bg-error/5 p-3 overflow-auto max-h-60 mb-4">
          {error.stack || 'No stack trace'}
        </pre>
        <button
          onClick={reset}
          className="px-4 py-2 bg-accent text-white text-sm hover:bg-accent-hover"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
