import { type FC } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type RiskFinding } from "@/lib/api"

interface RiskCardProps {
  finding: RiskFinding
  onClick: (finding: RiskFinding) => void
}

export const RiskCard: FC<RiskCardProps> = ({ finding, onClick }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "MEDIUM":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400"
      case "LOW":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400"
      default:
        return "bg-card text-card-foreground border-border"
    }
  }

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "bg-destructive hover:bg-destructive/90 text-white dark:text-zinc-950"
      case "MEDIUM":
        return "bg-orange-500 hover:bg-orange-600 text-white"
      case "LOW":
        return "bg-yellow-500 hover:bg-yellow-600 text-black"
      default:
        return "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
    }
  }

  return (
    <Card
      className={`mb-4 cursor-pointer overflow-hidden border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${getSeverityColor(finding.severity_level)}`}
      onClick={() => onClick(finding)}
    >
      <CardHeader className="px-4 pt-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight font-semibold">
            {finding.category}
          </CardTitle>
          <Badge
            className={`shrink-0 text-[10px] font-bold tracking-wider ${getSeverityBadgeColor(finding.severity_level)}`}
          >
            {finding.severity_level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <p className="mb-3 text-sm leading-relaxed opacity-90">
          {finding.risk_explanation}
        </p>

        {finding.suggested_alternative && (
          <div className="mt-3 rounded-md bg-muted/50 p-3 text-xs">
            <span className="mb-1 block font-semibold">Alternative:</span>
            <span className="opacity-90">{finding.suggested_alternative}</span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-end text-xs font-semibold opacity-70">
          <svg
            className="mr-1 h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Page {finding.page_number}
        </div>
      </CardContent>
    </Card>
  )
}
