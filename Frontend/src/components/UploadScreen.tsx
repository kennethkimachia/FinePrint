import { useState, useRef, type FC } from "react"
import { Card } from "@/components/ui/card"

interface UploadScreenProps {
  onUpload: (file: File, industry: string, additionalContext: string) => void
  isUploading: boolean
}

interface IndustryOption {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  legislation: string
}

export const UploadScreen: FC<UploadScreenProps> = ({
  onUpload,
  isUploading,
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("general")
  const [additionalContext, setAdditionalContext] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const industries: IndustryOption[] = [
    {
      id: "employment",
      name: "Employment / Labor",
      description: "NDAs, non-competes, IP trap, exit traps",
      legislation: "FLSA, FTC non-compete rules, Labor Codes",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: "real_estate",
      name: "Real Estate / Rental",
      description: "Leases, rentals, tenancy, deposits",
      legislation: "URLTA, Fair Housing Act, tenant rights",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: "finance",
      name: "Consumer Finance",
      description: "Loans, cards, interest spikes, penalty APR",
      legislation: "TILA, CFPA, usury limits, CFPB",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      id: "entertainment",
      name: "Entertainment / IP",
      description: "Artist deals, Copyrights, NIL rights, AI training",
      legislation: "Copyright Act Sec 203, NIL replication",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      )
    },
    {
      id: "automotive",
      name: "Automotive / Transit",
      description: "Car leasing, rentals, P2P ridesharing, liability",
      legislation: "FTC Used Car rules, rental disclaimers",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      id: "education",
      name: "Education / Academic",
      description: "Private student debt, enrollments, release traps",
      legislation: "Higher Education Act, private lender rules",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      )
    },
    {
      id: "technology",
      name: "Tech / ToS / SaaS",
      description: "Services, EULAs, data CCPA/GDPR, AI model scans",
      legislation: "FTC Section 5, GDPR privacy, ToS updates",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: "general",
      name: "General / Other",
      description: "Standard agreements, fallback scopes",
      legislation: "Federal Arbitration Act (FAA), UCC",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    }
  ]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (isUploading) return
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (isUploading) return
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (isValidFileType(file)) {
        setSelectedFile(file)
      } else {
        alert("Unsupported file type. Please upload a PDF.")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const isValidFileType = (file: File) => {
    return file.type === "application/pdf" || file.name.endsWith(".pdf")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleTriggerAnalysis = () => {
    if (!selectedFile || isUploading) return
    onUpload(selectedFile, selectedIndustry, additionalContext)
  }

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isUploading) return
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-background p-6 md:p-10">
      <div className="mx-auto w-full max-w-6xl shrink-0">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Analyze your contract
          </h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
            Supply context and upload your financial document safely. We will identify predatory
            clauses, examine industry-specific regulations, and highlight structural traps using AI.
          </p>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid gap-8 md:grid-cols-12">
          
          {/* Left Form Pane (7 Cols) */}
          <div className="flex flex-col gap-6 md:col-span-7">
            <Card className="flex flex-col rounded-3xl border bg-card/45 p-6 shadow-xl backdrop-blur-md">
              <h2 className="mb-4 text-lg font-bold text-foreground flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Contract Context & Industry
              </h2>
              
              <p className="mb-4 text-xs text-muted-foreground">
                Selecting an industry instructs the AI to look up relevant state/federal legislation for highly focused analysis.
              </p>

              {/* Industry Grid Selection */}
              <div className="grid gap-3 sm:grid-cols-2">
                {industries.map((ind) => (
                  <button
                    key={ind.id}
                    type="button"
                    disabled={isUploading}
                    onClick={() => setSelectedIndustry(ind.id)}
                    className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200 ease-out select-none ${
                      selectedIndustry === ind.id
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary"
                        : "border-border bg-card/60 hover:border-primary/40 hover:bg-muted/40"
                    } ${isUploading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      <span className={`${selectedIndustry === ind.id ? "text-primary animate-pulse" : "text-muted-foreground"}`}>
                        {ind.icon}
                      </span>
                      <span className="text-foreground">{ind.name}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground leading-snug line-clamp-2">
                      {ind.description}
                    </p>
                    <div className="mt-3 text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground/80">
                      {ind.legislation}
                    </div>
                  </button>
                ))}
              </div>

              {/* Additional Context Textarea */}
              <div className="mt-6 flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="additional-context">
                  Additional Focus Areas & Concerns (Optional)
                </label>
                <textarea
                  id="additional-context"
                  disabled={isUploading}
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="e.g. Check the IP clause boundaries carefully, check if the early termination penalty on page 3 is legal, or mention that you are a tenant in New York."
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-input bg-card/90 px-4 py-3 text-sm shadow-inner outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </Card>
          </div>

          {/* Right Uploader Pane (5 Cols) */}
          <div className="flex flex-col gap-6 md:col-span-5">
            <Card className="relative overflow-hidden rounded-3xl border bg-card/65 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between h-full min-h-[360px]">
              
              {/* Heading */}
              <div>
                <h2 className="mb-4 text-lg font-bold text-foreground flex items-center gap-2">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Document Upload
                </h2>
                <p className="mb-6 text-xs text-muted-foreground leading-normal">
                  Upload your contract document securely. We only accept PDF files (Max size: 20MB) to ensure absolute precision.
                </p>
              </div>

              {/* Uploader Drag Area */}
              <div className="flex-1 flex flex-col justify-center">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 select-none ${
                    isDragging
                      ? "border-primary bg-primary/10"
                      : selectedFile
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40 cursor-pointer"
                  } ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf"
                    disabled={isUploading}
                  />

                  {isUploading ? (
                    <div className="flex flex-col items-center py-6">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
                      <p className="font-semibold text-primary text-sm">
                        Analyzing Document...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                        Examining clauses and applying selected legislation guidelines. This may take 10-15 seconds.
                      </p>
                    </div>
                  ) : selectedFile ? (
                    <div className="flex flex-col items-center py-4 w-full">
                      <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500 mb-3">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      
                      <div className="max-w-[240px] truncate font-semibold text-sm text-foreground mb-1">
                        {selectedFile.name}
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">
                        {formatFileSize(selectedFile.size)}
                      </p>

                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="rounded-full px-3 py-1.5 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove Contract
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center">
                      <svg className="mb-3 h-10 w-10 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mb-1 text-sm font-semibold text-foreground">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        PDF (max 20MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                <button
                  type="button"
                  disabled={!selectedFile || isUploading}
                  onClick={handleTriggerAnalysis}
                  className={`w-full relative overflow-hidden rounded-2xl py-4 font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 select-none shadow-lg ${
                    !selectedFile || isUploading
                      ? "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                      : "bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.99] cursor-pointer shadow-primary/20 hover:shadow-primary/30"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Simplifying Legalese...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Analyze Contract
                    </>
                  )}
                </button>
              </div>
            </Card>
          </div>

        </div>

        {/* Footer Disclaimer */}
        <p className="mt-8 text-center text-[10px] font-medium text-muted-foreground leading-normal max-w-3xl mx-auto">
          Disclaimer: FinePrint utilizes advanced artificial intelligence models to assess agreements.
          AI can exhibit hallucinations or make errors. This application is intended solely as an educational 
          simplification tool and does not constitute formal, licensed, or professional legal advice.
        </p>
      </div>
    </div>
  )
}
