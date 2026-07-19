import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Page not found
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-none px-4 py-2 text-sm font-medium bg-accent-fuchsia text-white hover:bg-accent-fuchsia/90"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
