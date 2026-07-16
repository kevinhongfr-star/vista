"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface DiscountFieldProps {
  serviceId: string
  value?: number
  onChange: (value: number | undefined) => void
  disabled?: boolean
  contactId?: string
}

export function DiscountField({ serviceId, value, onChange, disabled, contactId }: DiscountFieldProps) {
  const [maxAllowed, setMaxAllowed] = useState<number | null>(null)
  const [isDiscountable, setIsDiscountable] = useState<boolean>(true)
  const [frameAs, setFrameAs] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!serviceId) return

    const checkDiscount = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/discount-rules/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ service_id: serviceId, requested_discount_pct: 100, contact_id: contactId }),
        })
        const data = await response.json()

        setMaxAllowed(data.max_allowed_pct)
        setIsDiscountable(data.allowed || data.max_allowed_pct > 0)
        setFrameAs(data.frame_as || "")
        setReason(data.reason || "")
      } catch {
        setMaxAllowed(null)
        setIsDiscountable(true)
        setReason("")
      } finally {
        setLoading(false)
      }
    }

    checkDiscount()
  }, [serviceId, contactId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value ? parseFloat(e.target.value) : undefined
    if (maxAllowed !== null && newValue !== undefined && newValue > maxAllowed) {
      onChange(maxAllowed)
    } else {
      onChange(newValue)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Label htmlFor="discount">Discount %</Label>
        <Input
          id="discount"
          type="number"
          placeholder="Loading..."
          disabled
          className="w-32"
        />
      </div>
    )
  }

  if (!isDiscountable) {
    return (
      <div className="space-y-2">
        <Label htmlFor="discount" className="flex items-center gap-2 text-error">
          <AlertCircle className="h-4 w-4" />
          Discount Not Allowed
        </Label>
        <Input
          id="discount"
          type="number"
          value={0}
          disabled
          className="w-32 bg-error/10 border-error/30 text-error cursor-not-allowed"
        />
        {reason && (
          <p className="text-xs text-error flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {reason}
          </p>
        )}
        {frameAs && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" />
            {frameAs}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="discount" className="flex items-center justify-between">
        Discount %
        {maxAllowed !== null && (
          <span className="text-xs text-muted-foreground">
            Max {maxAllowed}%
          </span>
        )}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id="discount"
          type="number"
          min={0}
          max={maxAllowed || 100}
          value={value || ""}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "w-32",
            maxAllowed !== null && value && value >= maxAllowed && "border-warning"
          )}
          placeholder="0"
        />
        <span className="text-sm text-muted-foreground">%</span>
      </div>
      {frameAs && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          {frameAs}
        </p>
      )}
      {maxAllowed !== null && value && value > maxAllowed && (
        <p className="text-xs text-warning">
          Discount capped at {maxAllowed}%
        </p>
      )}
    </div>
  )
}