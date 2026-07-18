"use client"

import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/supabase/auth"
import { useRouter } from "next/navigation"
import { Bell, Search, Moon, Sun, LogOut, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface HeaderProps {
  onQuickActions?: () => void
}

export function Header({ onQuickActions }: HeaderProps) {
  const { theme, setTheme, searchQuery, setSearchQuery, notifications, sidebarCollapsed } = useAppStore()
  const router = useRouter()

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/contacts?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <TooltipProvider delayDuration={200}>
      <header
        className={cn(
          "fixed top-0 z-50 h-16 border-t-[3px] border-accent border-b border-border transition-all duration-300 bg-white/90 backdrop-blur-xl",
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
                placeholder="Search VISTA contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="pl-9"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            {onQuickActions && (
              <Button onClick={onQuickActions} className="bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white">
                <Zap className="h-4 w-4 mr-2" />
                Quick Actions
              </Button>
            )}

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
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
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {notifications.length === 0 ? (
                  <DropdownMenuItem disabled className="text-center text-muted-foreground text-sm py-4">
                    No notifications yet
                  </DropdownMenuItem>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem key={n.id}>
                      <div>
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.message}</p>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle {theme === 'light' ? 'dark' : 'light'} mode</p>
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            {/* User info + logout */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary-navy flex items-center justify-center text-white text-sm font-medium">
                K
              </div>
              <span className="text-sm font-medium hidden sm:inline">Kevin</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
            </Tooltip>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  )
}