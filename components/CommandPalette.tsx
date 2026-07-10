"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Command, Search, Users, BarChart3, Activity, Mail, Phone, Settings, Zap, Target, Trophy, X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  shortcut?: string
  action: () => void
  group: "Navigate" | "Actions" | "Help"
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setIsOpen((v) => !v)
        setSearch("")
        setActiveIndex(0)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const items: CommandItem[] = [
    { id: "dash", label: "Go to Dashboard", icon: <BarChart3 className="h-4 w-4" />, shortcut: "G D", action: () => router.push("/dashboard"), group: "Navigate" },
    { id: "contacts", label: "Go to Contacts", icon: <Users className="h-4 w-4" />, shortcut: "G C", action: () => router.push("/contacts"), group: "Navigate" },
    { id: "pipeline", label: "Go to Pipeline", icon: <Target className="h-4 w-4" />, shortcut: "G P", action: () => router.push("/pipeline"), group: "Navigate" },
    { id: "signals", label: "Go to Signals", icon: <Zap className="h-4 w-4" />, shortcut: "G S", action: () => router.push("/signals"), group: "Navigate" },
    { id: "activities", label: "Go to Activities", icon: <Activity className="h-4 w-4" />, shortcut: "G A", action: () => router.push("/activities"), group: "Navigate" },
    { id: "campaigns", label: "Go to Campaigns", icon: <Mail className="h-4 w-4" />, action: () => router.push("/campaigns"), group: "Navigate" },
    { id: "automation", label: "Go to Automation", icon: <Trophy className="h-4 w-4" />, action: () => router.push("/automation"), group: "Navigate" },
    { id: "strategy", label: "Go to Strategy", icon: <Target className="h-4 w-4" />, action: () => router.push("/strategy"), group: "Navigate" },
    { id: "settings", label: "Go to Settings", icon: <Settings className="h-4 w-4" />, action: () => router.push("/settings"), group: "Navigate" },
  ]

  const filtered = items.filter(
    (i) => i.label.toLowerCase().includes(search.toLowerCase()) || i.id.includes(search.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  const flat = filtered

  useEffect(() => {
    if (activeIndex >= flat.length) setActiveIndex(0)
  }, [activeIndex, flat.length])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % flat.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + flat.length) % flat.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = flat[activeIndex]
      if (item) {
        item.action()
        setIsOpen(false)
      }
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  let runningIndex = -1

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveIndex(0) }}
            onKeyDown={handleKey}
            placeholder="Type a command or search..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            autoFocus
          />
          <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {flat.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No results found.</div>
          ) : (
            Object.entries(grouped).map(([group, groupItems]) => (
              <div key={group} className="mb-2">
                <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </div>
                {groupItems.map((item) => {
                  runningIndex++
                  const isActive = runningIndex === activeIndex
                  return (
                    <button
                      key={item.id}
                      onClick={() => { item.action(); setIsOpen(false) }}
                      onMouseEnter={() => setActiveIndex(runningIndex)}
                      className={cn(
                        "w-full flex items-center gap-3 px-2 py-2 rounded-none text-left text-sm transition-colors",
                        isActive ? "bg-accent-fuchsia text-white" : "hover:bg-muted"
                      )}
                    >
                      <span className={cn("flex h-7 w-7 items-center justify-center rounded", isActive ? "bg-white/20" : "bg-muted")}>
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {item.shortcut && (
                        <kbd className={cn(
                          "inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px]",
                          isActive ? "border-white/30 bg-white/10" : "bg-muted"
                        )}>
                          {item.shortcut}
                        </kbd>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <div className="border-t px-3 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">↑</kbd>
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">↵</kbd>
              Select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Command className="h-3 w-3" />K
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
