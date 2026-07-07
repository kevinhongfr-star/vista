"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ScoreGauge } from "@/components/scoring/ScoreGauge"
import { TierBadge } from "@/components/scoring/TierBadge"
import { EncirclementBadge } from "@/components/scoring/EncirclementBadge"
import { DeltaIndicator } from "@/components/scoring/DeltaIndicator"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import type { Top7View } from "@/lib/types"

interface Top7RankingProps {
  data: Top7View[]
}

export function Top7Ranking({ data }: Top7RankingProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No top contacts found. Run LENS scoring to populate.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">Score</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Company</TableHead>
          <TableHead className="w-[80px]">Tier</TableHead>
          <TableHead className="w-[100px]">Level</TableHead>
          <TableHead className="w-[80px]">Delta</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((contact, index) => (
          <TableRow 
            key={contact.id}
            className={cn(
              "cursor-pointer hover:bg-muted/50",
              index === 0 && "bg-accent-gold/5"
            )}
          >
            <TableCell>
              <ScoreGauge score={contact.priority_score || 0} size="sm" showLabel={false} />
            </TableCell>
            <TableCell>
              <Link 
                href={`/contacts/${contact.id}`}
                className="font-medium hover:underline"
              >
                {contact.name || "Unknown"}
              </Link>
              {contact.role && (
                <div className="text-xs text-muted-foreground">{contact.role}</div>
              )}
            </TableCell>
            <TableCell>
              <div className="font-medium">{contact.company || "-"}</div>
              {contact.region && (
                <div className="text-xs text-muted-foreground">{contact.region}</div>
              )}
            </TableCell>
            <TableCell>
              <TierBadge tier={contact.engagement_tier} size="sm" />
            </TableCell>
            <TableCell>
              <EncirclementBadge level={contact.encirclement_level} size="sm" />
            </TableCell>
            <TableCell>
              <DeltaIndicator delta={contact.score_delta} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}