"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Check, X, Edit3 } from "lucide-react"

interface InlineCellEditorProps {
  value: string | null | undefined
  onSave: (newValue: string) => Promise<void> | void
  type?: "text" | "select"
  options?: { value: string; label: string }[]
  placeholder?: string
  className?: string
  displayTransform?: (value: string | null | undefined) => string
}

/**
 * Notion-style inline cell editor.
 * Click to edit, Enter/blur to save, Escape to cancel.
 * Supports text input and select dropdown modes.
 */
export function InlineCellEditor({
  value,
  onSave,
  type = "text",
  options = [],
  placeholder = "Click to edit",
  className,
  displayTransform,
}: InlineCellEditorProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value || "")
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    if (editing) {
      if (type === "text") inputRef.current?.focus()
      else selectRef.current?.focus()
    }
  }, [editing, type])

  useEffect(() => {
    setDraft(value || "")
  }, [value])

  const handleSave = async () => {
    if (draft === (value || "")) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await onSave(draft)
      setEditing(false)
    } catch {
      // Keep editing if save fails
    }
    setSaving(false)
  }

  const handleCancel = () => {
    setDraft(value || "")
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave()
    if (e.key === "Escape") handleCancel()
  }

  const displayValue = displayTransform ? displayTransform(value) : (value || placeholder)

  if (editing) {
    if (type === "select") {
      return (
        <div className={cn("relative inline-flex items-center", className)}>
          <select
            ref={selectRef}
            value={draft}
            onChange={(e) => { setDraft(e.target.value); }}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="h-7 px-2 text-sm border border-accent bg-white outline-none min-w-[100px]"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )
    }

    return (
      <div className={cn("relative inline-flex items-center gap-1", className)}>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="h-7 px-2 text-sm border border-accent bg-white outline-none min-w-[120px]"
          placeholder={placeholder}
        />
        <button onClick={handleSave} className="p-0.5 hover:bg-teal/10" disabled={saving}>
          <Check className="h-3 w-3 text-teal" />
        </button>
        <button onClick={handleCancel} className="p-0.5 hover:bg-red-50">
          <X className="h-3 w-3 text-red-500" />
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group/cell relative cursor-pointer px-1 -mx-1 py-0.5 hover:bg-accent-5 transition-colors",
        className
      )}
      onClick={() => setEditing(true)}
      title={`Click to edit: ${value || placeholder}`}
    >
      <span className={cn(!value && "text-muted-foreground italic")}>
        {displayValue}
      </span>
      <Edit3 className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground opacity-0 group-hover/cell:opacity-100 transition-opacity" />
    </div>
  )
}
