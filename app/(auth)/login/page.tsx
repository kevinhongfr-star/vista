"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { signInWithEmail } from "@/lib/supabase/auth"
import { Mail, AlertCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const { error: authError } = await signInWithEmail(email)

    if (authError) {
      setError(authError.message)
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mb-4">
          <span className="text-4xl font-bold text-accent-fuchsia">VISTA</span>
        </div>
        <CardTitle className="text-xl">BD Intelligence Dashboard</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Kevin-only access — Phase 1
        </p>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-lg font-medium mb-2">Check your email</h3>
            <p className="text-sm text-muted-foreground">
              A login link has been sent to {email}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-error">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Magic Link
                </>
              )}
            </Button>

            <div className="text-center pt-4">
              <Badge variant="outline" className="text-xs">
                Phase 1: Kevin-only access via email OTP
              </Badge>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}