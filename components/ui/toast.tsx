"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, X } from "lucide-react"
import { useEffect, useState } from "react"

export interface ToastItem {
  id: string
  type: "success" | "error"
  message: string
}

interface ToastProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export function Toaster({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: (id: string) => void
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 200)
    }, 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg shadow-lg border transition-all duration-200 bg-white",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2",
        toast.type === "success" && "border-success/30",
        toast.type === "error" && "border-error/30"
      )}
    >
      {toast.type === "success" ? (
        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
      )}
      <p className="text-sm flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-muted-foreground hover:text-foreground flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = (type: "success" | "error", message: string) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, type, message }])
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, addToast, dismissToast }
}
