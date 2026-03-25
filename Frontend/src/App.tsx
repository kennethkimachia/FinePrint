import { useState } from "react"
import { UploadScreen } from "./components/UploadScreen"
import { RiskPanel } from "./components/RiskPanel"
import { PdfViewer } from "./components/PdfViewer"
import { uploadContract, type ContractAnalysis, type RiskFinding } from "./lib/api"

export function App() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null)
  const [activeFindingEvent, setActiveFindingEvent] = useState<{finding: RiskFinding, timestamp: number} | null>(null)

  const handleUpload = async (uploadedFile: File) => {
    setFile(uploadedFile)
    setIsUploading(true)
    try {
      const result = await uploadContract(uploadedFile)
      setAnalysis(result)
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Failed to analyze the contract. Please try again.")
      setFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRiskClick = (finding: RiskFinding) => {
    setActiveFindingEvent({ finding, timestamp: Date.now() })
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background font-sans text-foreground">
      {/* Header bar */}
      <div className="z-20 flex h-14 shrink-0 items-center justify-between border-b bg-background px-6 shadow-sm">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="rounded-md bg-blue-600 p-1.5 text-white">
            <svg
              className="h-5 w-5"
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
          </div>
          <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-lg font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-indigo-400">
            FinePrint
          </span>
        </a>
        <div className="max-w-[200px] truncate text-xs font-medium text-muted-foreground">
          {file ? file.name : ""}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {!analysis ? (
          <UploadScreen onUpload={handleUpload} isUploading={isUploading} />
        ) : (
          <div className="flex h-full w-full min-h-0">
            {/* Left side: PDF Viewer */}
            <div className="z-0 h-full w-[60%] shrink-0 border-r min-w-0 min-h-0">
              <PdfViewer file={file} activeFindingEvent={activeFindingEvent} />
            </div>

            {/* Right side: Risk Panel */}
            <div className="z-10 h-full w-[40%] min-w-[400px] shrink-0 min-h-0">
              <RiskPanel analysis={analysis} onRiskClick={handleRiskClick} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
