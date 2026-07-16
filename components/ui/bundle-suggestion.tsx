"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Check, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface BundleSuggestionProps {
  serviceIds: string[]
  onApply?: (bundleId: string) => void
}

interface BundleCalculation {
  individual_total: number
  bundle_price: number
  savings_pct: number
  recommended_bundle: { id: string; name: string } | null
}

interface Bundle {
  id: string
  bundle_name: string
  component_service_names: string[]
  bundle_price_min_cny: number
  bundle_price_max_cny: number
  discount_pct: number
}

export function BundleSuggestion({ serviceIds, onApply }: BundleSuggestionProps) {
  const [calculation, setCalculation] = useState<BundleCalculation | null>(null)
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(false)

  const serviceIdsKey = serviceIds.join(",")

  useEffect(() => {
    if (!serviceIds || serviceIds.length === 0) {
      setCalculation(null)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const [calcRes, bundleRes] = await Promise.all([
          fetch("/api/bundles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ service_ids: serviceIds }),
          }),
          fetch("/api/bundles"),
        ])

        const calcData = await calcRes.json()
        const bundleData = await bundleRes.json()

        setCalculation(calcData)
        setBundles(bundleData.bundles || [])
      } catch {
        setCalculation(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [serviceIdsKey])

  const handleApply = () => {
    if (calculation?.recommended_bundle && onApply) {
      onApply(calculation.recommended_bundle.id)
      setApplied(true)
    }
  }

  const findNearMatch = () => {
    for (const bundle of bundles) {
      const bundleServices = Array.isArray(bundle.component_service_names)
        ? bundle.component_service_names
        : []

      const matchingServices = serviceIds.filter((id) => bundleServices.includes(id))
      const missingServices = bundleServices.filter((id) => !serviceIds.includes(id))

      if (matchingServices.length > 0 && missingServices.length === 1) {
        return {
          bundle,
          missingServiceId: missingServices[0],
          neededCount: 1,
        }
      }

      if (matchingServices.length > 0 && missingServices.length <= 2) {
        return {
          bundle,
          missingServiceId: missingServices[0],
          neededCount: missingServices.length,
        }
      }
    }
    return null
  }

  if (loading) {
    return (
      <div className="p-4 border rounded-lg bg-muted/30 animate-pulse">
        <div className="h-4 w-48 bg-muted rounded" />
      </div>
    )
  }

  if (!calculation || !serviceIds.length) {
    return null
  }

  if (calculation.recommended_bundle) {
    return (
      <div className="p-4 border rounded-lg bg-success/5 border-success/20">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-success/10 rounded-lg">
            <Lightbulb className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              Save {calculation.savings_pct}% by bundling into{" "}
              <span className="font-semibold">{calculation.recommended_bundle.name}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Individual: ¥{calculation.individual_total.toLocaleString()} → Bundle: ¥{calculation.bundle_price.toLocaleString()}
            </p>
            {onApply && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-1"
                onClick={handleApply}
                disabled={applied}
              >
                {applied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Applied
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-3 w-3" />
                    Apply Bundle
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const nearMatch = findNearMatch()

  if (nearMatch) {
    return (
      <div className="p-4 border rounded-lg bg-warning/5 border-warning/20">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-warning/10 rounded-lg">
            <Lightbulb className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Add{" "}
              <Badge variant="outline" className="text-xs">
                {nearMatch.neededCount} more service{nearMatch.neededCount > 1 ? "s" : ""}
              </Badge>{" "}
              to qualify for{" "}
              <span className="font-semibold">{nearMatch.bundle.bundle_name}</span>{" "}
              at{" "}
              <span className="font-semibold text-success">{nearMatch.bundle.discount_pct}%</span>{" "}
              savings
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
