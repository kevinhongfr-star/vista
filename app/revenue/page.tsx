import { Metadata } from "next"
import { RevenueDashboard } from "@/components/revenue/revenue-dashboard"

export const metadata: Metadata = {
  title: "Revenue Dashboard — VISTA",
  description: "Revenue analytics and performance tracking",
}

export default function RevenuePage() {
  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <RevenueDashboard />
    </div>
  )
}