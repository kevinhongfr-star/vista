"use client"

import { useState } from "react"
import { Keyboard, X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useGlobalShortcuts, useShortcutModal } from "@/lib/hooks/use-keyboard-shortcuts"

interface ShortcutGroup {
  title: string
  shortcuts: { keys: string[]; description: string }[]
}

const groups: ShortcutGroup[] = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["G", "D"], description: "Go to Dashboard" },
      { keys: ["G", "C"], description: "Go to Contacts" },
      { keys: ["G", "P"], description: "Go to Pipeline" },
      { keys: ["G", "S"], description: "Go to Signals" },
      { keys: ["G", "A"], description: "Go to Activities" },
    ],
  },
  {
    title: "Global",
    shortcuts: [
      { keys: ["⌘", "K"], description: "Open command palette" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Esc"], description: "Close modal / dialog" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["C"], description: "Create new contact" },
      { keys: ["E"], description: "Send email" },
      { keys: ["L"], description: "Log activity" },
    ],
  },
]

export function KeyboardShortcutsModal() {
  useGlobalShortcuts()
  const { isOpen, setIsOpen } = useShortcutModal()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Keyboard Shortcuts</DialogTitle>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-accent-fuchsia" />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="rounded p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{s.description}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, ki) => (
                        <kbd
                          key={ki}
                          className="inline-flex h-6 min-w-[24px] select-none items-center justify-center rounded border bg-muted px-1.5 font-mono text-xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
