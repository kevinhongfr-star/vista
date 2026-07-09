"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import {
  LayoutDashboard,
  Users,
  Activity,
  Mail,
  Map,
  Calendar,
  Lightbulb,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Cpu,
  GitBranch,
  ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/signals", label: "Signals", icon: Activity },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/activities", label: "Activities", icon: ClipboardList },
  { href: "/campaigns", label: "Campaigns", icon: Mail },
  { href: "/clusters", label: "Clusters", icon: Map },
  { href: "/programs", label: "Programs", icon: Calendar },
  { href: "/conversions", label: "Conversions", icon: TrendingUp },
  { href: "/automation", label: "Automation", icon: Cpu },
  { href: "/strategy", label: "Strategy", icon: Lightbulb },
]

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-primary-navy text-white transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex flex-col leading-tight">
            <span className="text-[10px] font-semibold tracking-widest text-white/70 uppercase">LYC Partners</span>
            <span className="text-lg font-bold text-accent-fuchsia tracking-wide">VISTA</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-white hover:bg-white/10"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <Separator className="bg-white/20" />

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent-fuchsia text-white font-semibold"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <Separator className="bg-white/20" />

      {/* Bottom items */}
      <div className="px-2 py-4">
        <ul className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent-fuchsia text-white font-semibold"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}