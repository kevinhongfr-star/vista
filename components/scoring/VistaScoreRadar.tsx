"use client"

import { cn } from "@/lib/utils"

interface VistaScoreRadarProps {
  vistaV: number | null | undefined
  vistaI: number | null | undefined
  vistaS: number | null | undefined
  vistaT: number | null | undefined
  vistaA: number | null | undefined
  composite: number | null | undefined
  size?: number
}

export function VistaScoreRadar({
  vistaV = 0,
  vistaI = 0,
  vistaS = 0,
  vistaT = 0,
  vistaA = 0,
  composite = 0,
  size = 200,
}: VistaScoreRadarProps) {
  const centerX = size / 2
  const centerY = size / 2
  const maxRadius = (size / 2) - 20

  const dimensions = [
    { label: "Vision", value: vistaV, max: 20, angle: -90 },
    { label: "Intelligence", value: vistaI, max: 20, angle: -18 },
    { label: "Signal", value: vistaS, max: 25, angle: 54 },
    { label: "Trust", value: vistaT, max: 20, angle: 126 },
    { label: "Action", value: vistaA, max: 15, angle: 198 },
  ]

  const getPoint = (value: number, max: number, angle: number) => {
    const radius = (value / max) * maxRadius
    const radians = (angle * Math.PI) / 180
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians),
    }
  }

  const points = dimensions.map((d) => getPoint(d.value || 0, d.max, d.angle))
  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"

  const getLabelPosition = (angle: number) => {
    const labelRadius = maxRadius + 15
    const radians = (angle * Math.PI) / 180
    return {
      x: centerX + labelRadius * Math.cos(radians),
      y: centerY + labelRadius * Math.sin(radians),
    }
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background pentagon */}
        <polygon
          points={dimensions.map((d) => getPoint(d.max, d.max, d.angle))
            .map((p) => `${p.x},${p.y}`)
            .join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-muted"
        />
        
        {/* Score polygon */}
        <path
          d={pathData}
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="2"
          className="text-accent-fuchsia"
        />
        
        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="currentColor"
            className="text-accent-fuchsia"
          />
        ))}
        
        {/* Labels */}
        {dimensions.map((d) => {
          const pos = getLabelPosition(d.angle)
          return (
            <text
              key={d.label}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-muted-foreground"
            >
              {d.label}
            </text>
          )
        })}
      </svg>
      
      {/* Composite score */}
      <div className="mt-2 text-center">
        <span className="text-2xl font-bold text-accent-fuchsia">{composite || 0}</span>
        <span className="text-xs text-muted-foreground ml-1">/100</span>
      </div>
    </div>
  )
}