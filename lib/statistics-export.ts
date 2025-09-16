import {
  analysisSections,
  overallPerformance,
  perClassMap,
  errorAnalysis,
  robustnessDelta,
  deploymentEfficiency,
  statisticalRepeatability,
  priorWorkComparison,
  ablationA1,
  ablationA2,
  ablationA3,
  quickReference,
} from "@/data/research-insights"

type DataValue = string | number | undefined | null

type DataRow = Record<string, DataValue>

interface DataSetDefinition {
  id: string
  label: string
  rows: DataRow[]
}

const statisticsDataSets: DataSetDefinition[] = [
  {
    id: "analysis-sections",
    label: "Analysis Sections",
    rows: analysisSections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
    })),
  },
  {
    id: "overall-performance",
    label: "Overall Performance",
    rows: overallPerformance,
  },
  {
    id: "per-class-map",
    label: "Per-Class Accuracy",
    rows: perClassMap,
  },
  {
    id: "error-analysis",
    label: "Error Analysis",
    rows: errorAnalysis,
  },
  {
    id: "robustness-delta",
    label: "Robustness Delta",
    rows: robustnessDelta,
  },
  {
    id: "deployment-efficiency",
    label: "Deployment Efficiency",
    rows: deploymentEfficiency,
  },
  {
    id: "statistical-repeatability",
    label: "Statistical Repeatability",
    rows: statisticalRepeatability,
  },
  {
    id: "prior-work-comparison",
    label: "Prior Work Comparison",
    rows: priorWorkComparison,
  },
  {
    id: "ablation-a1",
    label: "Ablation Study A1",
    rows: ablationA1,
  },
  {
    id: "ablation-a2",
    label: "Ablation Study A2",
    rows: ablationA2,
  },
  {
    id: "ablation-a3",
    label: "Ablation Study A3",
    rows: ablationA3,
  },
  {
    id: "quick-reference",
    label: "Executive Summary",
    rows: quickReference,
  },
]

const formatNumber = (value: number) => {
  if (Number.isInteger(value)) {
    return value.toString()
  }

  const fixed = value.toFixed(4)
  return fixed.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1")
}

const formatValue = (value: DataValue): string => {
  if (value === undefined || value === null) {
    return ""
  }

  if (typeof value === "number") {
    return formatNumber(value)
  }

  return String(value)
}

const escapeCsvValue = (value: string) => {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}

const buildCsv = (rows: DataRow[]): string => {
  if (rows.length === 0) {
    return ""
  }

  const headers = Object.keys(rows[0])
  const headerLine = headers.join(",")

  const dataLines = rows.map((row) =>
    headers
      .map((header) => escapeCsvValue(formatValue(row[header])))
      .join(","),
  )

  return [headerLine, ...dataLines].join("\n")
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const buildPackFilename = (extension: string) => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")

  return `research-insights-${extension}-pack-${timestamp}.zip`
}

const getHeaders = (rows: DataRow[]): string[] => (rows.length > 0 ? Object.keys(rows[0]) : [])

const resolveRows = (rows: DataRow[]): DataRow[] => {
  if (rows.length === 0) {
    return rows
  }

  const headers = getHeaders(rows)
  return rows.map((row) => {
    const aligned: DataRow = {}
    headers.forEach((header) => {
      aligned[header] = row[header]
    })
    return aligned
  })
}

export const exportStatisticsCsvPack = async () => {
  const JSZip = (await import("jszip")).default
  const zip = new JSZip()

  statisticsDataSets.forEach((dataset) => {
    const normalisedRows = resolveRows(dataset.rows)
    const csv = buildCsv(normalisedRows)
    zip.file(`${dataset.id}.csv`, csv)
  })

  const blob = await zip.generateAsync({ type: "blob" })
  downloadBlob(blob, buildPackFilename("csv"))
}

export const exportStatisticsPdfPack = async () => {
  const JSZip = (await import("jszip")).default
  const { jsPDF } = await import("jspdf")
  const autoTableModule = await import("jspdf-autotable")
  const autoTable = autoTableModule.default ?? autoTableModule

  const zip = new JSZip()

  for (const dataset of statisticsDataSets) {
    const rows = resolveRows(dataset.rows)
    const headers = getHeaders(rows)

    const doc = new jsPDF({ orientation: "landscape" })
    doc.setFontSize(16)
    doc.text(dataset.label, 14, 20)

    if (headers.length > 0) {
      autoTable(doc, {
        head: [headers],
        body: rows.map((row) => headers.map((header) => formatValue(row[header]))),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [14, 165, 233] },
        startY: 28,
        margin: { left: 14, right: 14 },
      })
    } else {
      doc.setFontSize(12)
      doc.text("No data available", 14, 32)
    }

    const pdfArrayBuffer = doc.output("arraybuffer") as ArrayBuffer
    zip.file(`${dataset.id}.pdf`, pdfArrayBuffer)
  }

  const blob = await zip.generateAsync({ type: "blob" })
  downloadBlob(blob, buildPackFilename("pdf"))
}

