import { useState, useRef, type FC } from "react"
import { Card } from "@/components/ui/card"

interface UploadScreenProps {
  onUpload: (file: File) => void
  isUploading: boolean
}

export const UploadScreen: FC<UploadScreenProps> = ({
  onUpload,
  isUploading,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0])
    }
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-background p-4 md:p-6">
      <div className="flex-1 min-h-auto md:min-h-12"></div>
      <div className="relative mx-auto w-full max-w-2xl shrink-0">
        {/* Decorative background blur */}
        <div className="absolute -inset-1 rounded-3xl bg-primary opacity-20 blur-2xl filter"></div>

        <Card className="relative overflow-hidden rounded-3xl border bg-card/90 p-8 md:p-10 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 md:mb-6 rounded-full bg-primary/10 p-3 md:p-4">
              <svg
                className="h-8 w-8 md:h-10 md:w-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <h1 className="mb-2 text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Analyze your contract
            </h1>
            <p className="mb-6 max-w-md text-sm md:text-base text-muted-foreground">
              Upload your financial document safely. We'll identify predatory
              clauses and highlight the scary stuff using AI.
            </p>

            <div
              className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-200 ease-in-out ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf,image/png,image/jpeg"
                disabled={isUploading}
              />

              {isUploading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="font-medium text-primary">
                    Analyzing document...
                  </p>
                </div>
              ) : (
                <>
                  <svg
                    className="mb-4 h-8 w-8 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <p className="mb-2 font-medium text-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, PNG, JPG (max 20MB)
                  </p>
                </>
              )}
            </div>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs font-medium text-muted-foreground">
          Disclaimer: FinePrint uses AI to analyze documents. AI is not always
          right and might get some things wrong. Do not use this as a substitute
          for professional legal advice.
        </p>
      </div>
      <div className="flex-1 min-h-auto md:min-h-12"></div>
    </div>
  )
}
