import { type FC } from "react"
import { type ContractAnalysis, type RiskFinding } from "@/lib/api"
import { RiskCard } from "./RiskCard"
import { ScrollArea } from "@/components/ui/scroll-area"

interface RiskPanelProps {
  analysis: ContractAnalysis
  onRiskClick: (finding: RiskFinding) => void
}

export const RiskPanel: FC<RiskPanelProps> = ({
  analysis,
  onRiskClick,
}) => {
  const { summary, risk_findings } = analysis

  // Score interpretation
  const isHighRisk = summary.overall_score >= 70
  const isMediumRisk = summary.overall_score >= 30 && summary.overall_score < 70

  const scoreColor = isHighRisk
    ? "text-red-500"
    : isMediumRisk
      ? "text-orange-500"
      : "text-green-500"

  return (
    <ScrollArea className="h-full w-full border-l bg-background shadow-xl">
      <div className="flex flex-col">
        {/* Header / Summary Section */}
        <div className="border-b bg-card p-6">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground">
            Contract Analysis
          </h2>

          <div className="mb-6 flex items-center gap-6">
            <div className="relative flex shrink-0 items-center justify-center">
              {/* Circular representation of score using SVGs for better control */}
              <svg className="h-20 w-20 -rotate-90 transform">
                <circle
                  className="text-muted"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="36"
                  cx="40"
                  cy="40"
                />
                <circle
                  className={scoreColor}
                  strokeWidth="8"
                  strokeDasharray={36 * 2 * Math.PI}
                  strokeDashoffset={
                    36 * 2 * Math.PI -
                    (summary.overall_score / 100) * (36 * 2 * Math.PI)
                  }
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="36"
                  cx="40"
                  cy="40"
                  style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-2xl font-black ${scoreColor}`}>
                  {summary.overall_score}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col">
              <span className="mb-1 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                Final Verdict
              </span>
              <span
                className={`text-base leading-snug font-medium ${isHighRisk ? "text-destructive" : "text-foreground"}`}
              >
                {summary.verdict}
              </span>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 text-sm leading-relaxed text-foreground">
            <span className="mb-1 block font-semibold">Executive Summary</span>
            {summary.executive_summary}
          </div>
        </div>

        {/* Findings List Section */}
        <div className="flex flex-col bg-background p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              Detected Risks
            </h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
              {risk_findings.length} findings
            </span>
          </div>

          <div className="flex flex-col">
            {risk_findings.map((finding) => (
              <RiskCard
                key={finding.id}
                finding={finding}
                onClick={onRiskClick}
              />
            ))}
            
            <div className="mt-6 mb-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              AI-generated analysis may contain inaccuracies. Please verify independently.
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
