"use client"

import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Bell, Search, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function Header() {
  const { theme, setTheme, searchQuery, setSearchQuery, notifications, sidebarCollapsed } = useAppStore()

  return (
    <header
      className={cn(
        "fixed top-0 z-30 h-16 bg-white border-b border-gray-200 transition-all duration-300",
        sidebarCollapsed ? "left-16" : "left-64",
        "right-0"
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contacts, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {notifications.length}
              </Badge>
            )}
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* User info placeholder */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary-navy flex items-center justify-center text-white text-sm font-medium">
              K
            </div>
            <span className="text-sm font-medium hidden sm:inline">Kevin</span>
          </div>
        </div>
      </div>
    </header>
  )
}