import { useState, useEffect, useRef, type FC } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { type RiskFinding } from "@/lib/api"

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

interface PdfViewerProps {
  file: File | null
  activeFindingEvent?: { finding: RiskFinding; timestamp: number } | null
}

export const PdfViewer: FC<PdfViewerProps> = ({
  file,
  activeFindingEvent,
}) => {
  const [numPages, setNumPages] = useState<number>()
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [viewMode, setViewMode] = useState<"PDF" | "TEXT">("TEXT")
  const [extractedText, setExtractedText] = useState<string>("")
  const [isExtracting, setIsExtracting] = useState<boolean>(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>(800)

  // Update width when resize happens
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0] && entries[0].contentRect) {
        setContainerWidth(entries[0].contentRect.width - 64) // Minus padding
      }
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Extract pure text for presentation mode
  useEffect(() => {
    if (!file) return
    let isMounted = true

    const extractText = async () => {
      setIsExtracting(true)
      try {
        const url = URL.createObjectURL(file)
        const loadingTask = pdfjs.getDocument(url)
        const pdf = await loadingTask.promise

        let fullText = ""
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ")

          fullText += `——— PAGE ${i} ———\n\n${pageText}\n\n`
        }

        if (isMounted) setExtractedText(fullText)
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error("Text extraction failed", err)
      } finally {
        if (isMounted) setIsExtracting(false)
      }
    }

    extractText()
    return () => {
      isMounted = false
    }
  }, [file])

  // Sync state when activeFindingEvent changes for PDF Mode
  useEffect(() => {
    if (viewMode === "PDF" && activeFindingEvent) {
      const { page_number } = activeFindingEvent.finding
      if (page_number >= 1 && page_number <= (numPages || 1)) {
        setPageNumber(page_number)
      }
    }
  }, [activeFindingEvent, numPages, viewMode])

  // Scroll to active highlight in TEXT mode
  useEffect(() => {
    if (viewMode === "TEXT" && activeFindingEvent) {
      setTimeout(() => {
        const highlightEl = document.getElementById("active-highlight")
        if (highlightEl && containerRef.current) {
          highlightEl.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 150) // Small delay to let React render the DOM
    }
  }, [activeFindingEvent, viewMode])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageNumber(1)
  }

  const renderSmartText = () => {
    if (isExtracting) {
      return (
        <div className="flex animate-pulse flex-col items-center justify-center p-20">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="font-medium text-muted-foreground">
            Extracting clean presentation text...
          </p>
        </div>
      )
    }

    if (!activeFindingEvent || !activeFindingEvent.finding.original_text) {
      return (
        <div className="mx-auto max-w-4xl p-12 font-serif text-lg leading-loose whitespace-pre-wrap text-foreground/90">
          {extractedText}
        </div>
      )
    }

    // Flawless Alphanumeric Index-Mapped Fuzzy Matching
    const searchText = activeFindingEvent.finding.original_text

    const alphaNumMap: number[] = []
    let cleanFullText = ""

    for (let i = 0; i < extractedText.length; i++) {
      const char = extractedText[i]
      // Only keep alphanumeric characters
      if (/[a-zA-Z0-9]/.test(char)) {
        cleanFullText += char.toLowerCase()
        alphaNumMap.push(i)
      }
    }

    // Clean the search query
    const cleanSearch = searchText.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
    const startIndexInClean = cleanFullText.indexOf(cleanSearch)

    if (startIndexInClean !== -1 && cleanSearch.length > 0) {
      const originalStartIndex = alphaNumMap[startIndexInClean]
      // The end character is at the offset of the cleanSearch length (-1 to get the actual index)
      const originalEndIndex =
        alphaNumMap[startIndexInClean + cleanSearch.length - 1]

      const before = extractedText.substring(0, originalStartIndex)
      const match = extractedText.substring(
        originalStartIndex,
        originalEndIndex + 1
      )
      const after = extractedText.substring(originalEndIndex + 1)

      return (
        <div className="mx-auto max-w-4xl p-12 font-serif text-lg leading-loose tracking-wide whitespace-pre-wrap text-foreground/90">
          <span>{before}</span>
          <mark
            id="active-highlight"
            className="rounded-sm border-b-2 border-destructive bg-destructive/20 px-1 py-0.5 font-bold text-destructive shadow-sm"
          >
            {match}
          </mark>
          <span>{after}</span>
        </div>
      )
    }

    // Fallback if matching failed
    return (
      <div className="relative mx-auto max-w-4xl p-12 font-serif text-lg leading-loose whitespace-pre-wrap text-foreground/90">
        <div className="absolute top-4 right-4 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-600">
          Fuzzy match failed for original contract wording
        </div>
        {extractedText}
      </div>
    )
  }

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">No document selected</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Viewer Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b bg-background px-4 py-3 shadow-sm">
        <h2 className="max-w-[200px] truncate text-sm font-medium text-foreground">
          {file.name}
        </h2>

        <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
          <button
            onClick={() => setViewMode("TEXT")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${viewMode === "TEXT" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}
          >
            Smart Text
          </button>
          <button
            onClick={() => setViewMode("PDF")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${viewMode === "PDF" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}
          >
            Original PDF
          </button>
        </div>

        <div className="flex w-[120px] justify-end">
          {viewMode === "PDF" && (
            <div className="flex items-center gap-3 text-xs font-medium">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
                className="cursor-pointer rounded-md p-1 hover:bg-muted disabled:opacity-50"
              >
                &larr;
              </button>
              <span className="font-mono text-muted-foreground">
                {pageNumber}/{numPages || "?"}
              </span>
              <button
                onClick={() =>
                  setPageNumber((p) => Math.min(numPages || p, p + 1))
                }
                disabled={pageNumber >= (numPages || 1)}
                className="cursor-pointer rounded-md p-1 hover:bg-muted disabled:opacity-50"
              >
                &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-auto" ref={containerRef}>
        {viewMode === "TEXT" ? (
          <div className="min-h-full bg-background">{renderSmartText()}</div>
        ) : (
          <div className="min-h-full bg-muted/30 p-8">
            <div className="mx-auto flex justify-center shadow-2xl transition-all">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex animate-pulse flex-col items-center justify-center p-20">
                    <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground">Loading PDF...</p>
                  </div>
                }
                error={
                  <div className="p-10 text-destructive">
                    Failed to load PDF file.
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  width={containerWidth}
                  className="bg-white"
                  renderAnnotationLayer={false}
                  renderTextLayer={true}
                />
              </Document>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
