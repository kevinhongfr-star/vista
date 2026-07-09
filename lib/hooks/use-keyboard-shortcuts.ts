"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

export interface ShortcutConfig {
  key: string
  description: string
  action: () => void
  modifier?: "mod" | "alt" | "shift"
  preventDefault?: boolean
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const router = useRouter()
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable

      for (const s of shortcuts) {
        const matchKey = e.key.toLowerCase() === s.key.toLowerCase()
        if (!matchKey) continue

        const isMod = s.modifier === "mod" && (e.metaKey || e.ctrlKey)
        const isAlt = s.modifier === "alt" && e.altKey
        const isShift = s.modifier === "shift" && e.shiftKey
        const noMod = !s.modifier && !e.metaKey && !e.ctrlKey && !e.altKey

        if (s.modifier === "mod" ? isMod : s.modifier === "alt" ? isAlt : s.modifier === "shift" ? isShift : noMod) {
          // Skip if focus is in an input (except for mod shortcuts)
          if (isInput && !s.modifier) continue

          if (s.preventDefault !== false) e.preventDefault()
          s.action()
          break
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [shortcuts])
}

export function useGlobalShortcuts() {
  const router = useRouter()
  useKeyboardShortcuts([
    {
      key: "g",
      description: "Go to dashboard",
      action: () => router.push("/dashboard"),
    },
    {
      key: "c",
      description: "Go to contacts",
      action: () => router.push("/contacts"),
    },
    {
      key: "p",
      description: "Go to pipeline",
      action: () => router.push("/pipeline"),
    },
    {
      key: "s",
      description: "Go to signals",
      action: () => router.push("/signals"),
    },
    {
      key: "a",
      description: "Go to activities",
      action: () => router.push("/activities"),
    },
    {
      key: "Escape",
      description: "Close modal",
      action: () => {
        // Dispatch a custom event that modals can listen to
        window.dispatchEvent(new CustomEvent("vista:close-modal"))
      },
    },
  ])
}

export function useShortcutModal() {
  const [isOpen, setIsOpen] = useState(false)
  useKeyboardShortcuts([
    {
      key: "?",
      description: "Show keyboard shortcuts",
      action: () => setIsOpen(true),
      modifier: "shift",
    },
  ])
  return { isOpen, setIsOpen }
}
