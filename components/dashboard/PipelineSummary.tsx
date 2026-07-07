"use client"

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Label } from "recharts"
import { cn } from "@/lib/utils"
import type { PipelineSummaryView } from "@/lib/types"

interface PipelineSummaryProps {
  data: PipelineSummaryView[]
}

const tierColors: Record<string, string> = {
  cold: "#94a3b8",
  warm: "#3b82f6",
  engaged: "#22c55e",
  hot: "#f97316",
  committed: "#ef4444",
}

export function PipelineSummary({ data }: PipelineSummaryProps) {
  const sortedData = [...data].sort((a, b) => {
    const order = ['cold', 'warm', 'engaged', 'hot', 'committed']
    const aIndex = order.indexOf(a.engagement_tier?.toLowerCase() || 'cold')
    const bIndex = order.indexOf(b.engagement_tier?.toLowerCase() || 'cold')
    return aIndex - bIndex
  })

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{ left: 80, right: 30 }}
      >
        <XAxis type="number" domain={[0, 'auto']} tickFormatter={(value) => value.toFixed(0)} />
        <YAxis 
          type="category" 
          dataKey="engagement_tier" 
          tick={({ value, ...props }) => (
            <text 
              {...props} 
              fill="#333" 
              fontSize={12} 
              fontWeight={500}
              x={props.x - 10}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {(value || 'Cold').charAt(0).toUpperCase() + (value || 'Cold').slice(1)}
            </text>
          )}
        />
        <Bar 
          dataKey="contact_count" 
          radius={[4, 4, 4, 4]}
          label={({ value, x, y, width, height }) => (
            <text
              x={x + width + 10}
              y={y + height / 2}
              fill="#333"
              fontSize={12}
              dominantBaseline="middle"
            >
              {value}
            </text>
          )}
        >
          {sortedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={tierColors[entry.engagement_tier?.toLowerCase() || 'cold']} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}