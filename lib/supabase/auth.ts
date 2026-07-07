"use client"

import { createBrowserClient } from './client'

export async function signInWithEmail(email: string) {
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  })
  return { error }
}

export async function signOut() {
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.auth.getUser()
  return { user: data?.user, error }
}

export async function getSession() {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.auth.getSession()
  return { session: data?.session, error }
}