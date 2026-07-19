"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { GlobalModals } from "@/components/layout/GlobalModals"
import { CommandPalette } from "@/components/CommandPalette"
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal"
import { useAppStore } from "@/lib/store"
import { TooltipProvider } from "@/components/ui/tooltip"

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [emailComposerOpen, setEmailComposerOpen] = useState(false)
  const { sidebarCollapsed } = useAppStore()

  return (
    <TooltipProvider>
      <Header onQuickActions={() => setEmailComposerOpen(true)} />
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "ml-0 md:ml-16" : "ml-0 md:ml-64"
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
      <GlobalModals />
      <CommandPalette />
      <KeyboardShortcutsModal />
    </TooltipProvider>
  )
}