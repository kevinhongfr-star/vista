"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { GlobalModals } from "@/components/layout/GlobalModals"

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [emailComposerOpen, setEmailComposerOpen] = useState(false)

  return (
    <>
      <Header onQuickActions={() => setEmailComposerOpen(true)} />
      <main className="ml-64 pt-16 min-h-screen transition-all duration-300">
        <div className="p-6">
          {children}
        </div>
      </main>
      <GlobalModals />
    </>
  )
}