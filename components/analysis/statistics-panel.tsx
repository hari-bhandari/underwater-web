"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { Search, Download, FileText, Loader2 } from "lucide-react"

import {
  analysisSections,
  type AnalysisSectionId,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { exportStatisticsCsvPack, exportStatisticsPdfPack } from "@/lib/statistics-export"

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
})

type GenericRow = Record<string, string | number>

const toLower = (value: string | number) => value.toString().toLowerCase()

const filterRows = <T extends GenericRow>(rows: T[], query: string) => {
  if (!query) return rows
  const term = query.toLowerCase()
  return rows.filter((row) => Object.values(row).some((value) => toLower(value).includes(term)))
}

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

export function StatisticsPanel() {
  const [query, setQuery] = useState("")
  const [activeSection, setActiveSection] = useState<AnalysisSectionId>("quick-reference")
  const [isExportingCsv, setIsExportingCsv] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const filteredPerformance = useMemo(() => filterRows(overallPerformance as unknown as GenericRow[], query), [query])
  const filteredPerClass = useMemo(() => filterRows(perClassMap as unknown as GenericRow[], query), [query])
  const filteredErrors = useMemo(() => filterRows(errorAnalysis as unknown as GenericRow[], query), [query])
  const filteredRobustness = useMemo(() => filterRows(robustnessDelta as unknown as GenericRow[], query), [query])
  const filteredDeployment = useMemo(() => filterRows(deploymentEfficiency as unknown as GenericRow[], query), [query])
  const filteredRepeatability = useMemo(() => filterRows(statisticalRepeatability as unknown as GenericRow[], query), [query])
  const filteredPriorWork = useMemo(() => filterRows(priorWorkComparison as unknown as GenericRow[], query), [query])
  const filteredA1 = useMemo(() => filterRows(ablationA1 as unknown as GenericRow[], query), [query])
  const filteredA2 = useMemo(() => filterRows(ablationA2 as unknown as GenericRow[], query), [query])
  const filteredA3 = useMemo(() => filterRows(ablationA3 as unknown as GenericRow[], query), [query])
  const filteredQuickReference = useMemo(() => filterRows(quickReference as unknown as GenericRow[], query), [query])

  const sectionMatches = useMemo(() => {
    const counts: Partial<Record<AnalysisSectionId, number>> = {}
    counts["performance"] = filteredPerformance.length
    counts["per-class"] = filteredPerClass.length
    counts["errors"] = filteredErrors.length
    counts["robustness"] = filteredRobustness.length
    counts["deployment"] = filteredDeployment.length
    counts["repeatability"] = filteredRepeatability.length
    counts["prior-work"] = filteredPriorWork.length
    counts["ablations"] = filteredA1.length + filteredA2.length + filteredA3.length
    counts["quick-reference"] = filteredQuickReference.length
    return counts
  }, [
    filteredPerformance,
    filteredPerClass,
    filteredErrors,
    filteredRobustness,
    filteredDeployment,
    filteredRepeatability,
    filteredPriorWork,
    filteredA1,
    filteredA2,
    filteredA3,
    filteredQuickReference,
  ])

  const handleExportCsv = async () => {
    try {
      setIsExportingCsv(true)
      await exportStatisticsCsvPack()
      toast({
        title: "CSV pack exported",
        description: "Downloaded the research insights tables as CSV files.",
      })
    } catch (error) {
      console.error("Failed to export CSV pack", error)
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unable to generate the CSV pack.",
      })
    } finally {
      setIsExportingCsv(false)
    }
  }

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true)
      await exportStatisticsPdfPack()
      toast({
        title: "PDF pack exported",
        description: "Downloaded formatted PDF summaries for each research insight table.",
      })
    } catch (error) {
      console.error("Failed to export PDF pack", error)
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unable to generate the PDF pack.",
      })
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card className="border border-border">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold">Research Insights Explorer</CardTitle>
              <CardDescription>
                Search, slice, and visualise the evaluation corpus extracted from the thesis appendix and results
                chapters.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="gap-2 text-xs md:text-sm"
                size="sm"
                onClick={handleExportCsv}
                disabled={isExportingCsv}
              >
                {isExportingCsv ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isExportingCsv ? "Exporting..." : "Export CSV Pack"}
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-xs md:text-sm"
                size="sm"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
              >
                {isExportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {isExportingPdf ? "Exporting..." : "Export PDF Pack"}
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={'Search models, metrics, or classes (e.g. "turbidity", "jellyfish", "latency")'}
              className="pl-10"
            />
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as AnalysisSectionId)}>
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="inline-flex h-auto w-max space-x-2 bg-muted/60 p-2">
            {analysisSections.map((section) => (
              <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2 text-sm">
                {section.title}
                {query && (
                  <Badge variant={sectionMatches[section.id] ? "secondary" : "outline"}>
                    {sectionMatches[section.id] ?? 0}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value="quick-reference" className="space-y-6">
          <SectionHeader
            title="Executive Summary"
            description="Snapshot of headline KPIs for rapid comparative assessment."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {filteredQuickReference.map((item) => (
              <Card key={item.model} className="border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">{item.model}</CardTitle>
                  <CardDescription>GPU latency and memory budget paired with accuracy headline.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MetricRow label="mAP@0.5" value={typeof item.headlineMap50Percent === 'number' ? `${item.headlineMap50Percent.toFixed(1)}%` : `${item.headlineMap50Percent}%`} accent="text-primary" />
                  <MetricRow label="mAP@0.5:0.95" value={typeof item.map5095Percent === 'number' ? `${item.map5095Percent.toFixed(1)}%` : `${item.map5095Percent}%`} />
                  <MetricRow label="GPU latency" value={typeof item.gpuLatencyMs === 'number' ? `${item.gpuLatencyMs.toFixed(1)} ms` : `${item.gpuLatencyMs} ms`} />
                  <MetricRow label="VRAM" value={`${item.vramMb} MB`} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <SectionHeader
            title="Overall Performance"
            description="Latency breakdown and holistic classification quality metrics."
          />
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Latency Composition & Accuracy</CardTitle>
              <CardDescription>
                Inference accounts for the overwhelming majority of RT-DETR latency, while Hybrid maintains YOLO-level
                throughput with marginal precision trade-off.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ReactApexChart
                type="bar"
                height={320}
                series={[
                  {
                    name: "Pre-processing",
                    data: filteredPerformance.map((row) => typeof row.preprocessingMs === 'number' ? row.preprocessingMs : Number(row.preprocessingMs)),
                  },
                  {
                    name: "Inference",
                    data: filteredPerformance.map((row) => typeof row.inferenceMs === 'number' ? row.inferenceMs : Number(row.inferenceMs)),
                  },
                  {
                    name: "Post-processing",
                    data: filteredPerformance.map((row) => typeof row.postprocessingMs === 'number' ? row.postprocessingMs : Number(row.postprocessingMs)),
                  },
                ]}
                options={{
                  chart: { stacked: true, toolbar: { show: false } },
                  xaxis: { categories: filteredPerformance.map((row) => row.model) },
                  colors: ["#0ea5e9", "#6366f1", "#f59e0b"],
                  dataLabels: { enabled: false },
                  tooltip: {
                    y: {
                      formatter: (val) => `${val.toFixed(2)} ms`,
                    },
                  },
                  legend: { position: "top" },
                  plotOptions: { bar: { horizontal: false, columnWidth: "55%" } },
                }}
              />

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Pre (ms)</TableHead>
                    <TableHead>Inf (ms)</TableHead>
                    <TableHead>Post (ms)</TableHead>
                    <TableHead>Total (ms)</TableHead>
                    <TableHead>P<sub>all</sub></TableHead>
                    <TableHead>R<sub>all</sub></TableHead>
                    <TableHead>mAP@0.5</TableHead>
                    <TableHead>mAP@0.5:0.95</TableHead>
                    <TableHead>Mean P</TableHead>
                    <TableHead>Mean R</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPerformance.map((row) => (
                    <TableRow key={row.model}>
                      <TableCell className="font-medium">{row.model}</TableCell>
                      <TableCell>{typeof row.preprocessingMs === 'number' ? row.preprocessingMs.toFixed(1) : row.preprocessingMs}</TableCell>
                      <TableCell>{typeof row.inferenceMs === 'number' ? row.inferenceMs.toFixed(1) : row.inferenceMs}</TableCell>
                      <TableCell>{typeof row.postprocessingMs === 'number' ? row.postprocessingMs.toFixed(1) : row.postprocessingMs}</TableCell>
                      <TableCell>{typeof row.totalMs === 'number' ? row.totalMs.toFixed(1) : row.totalMs}</TableCell>
                      <TableCell>{typeof row.precisionAll === 'number' ? row.precisionAll.toFixed(3) : row.precisionAll}</TableCell>
                      <TableCell>{typeof row.recallAll === 'number' ? row.recallAll.toFixed(3) : row.recallAll}</TableCell>
                      <TableCell>{typeof row.map50 === 'number' ? row.map50.toFixed(3) : row.map50}</TableCell>
                      <TableCell>{typeof row.map5095 === 'number' ? row.map5095.toFixed(3) : row.map5095}</TableCell>
                      <TableCell>{typeof row.meanPrecision === 'number' ? row.meanPrecision.toFixed(4) : row.meanPrecision}</TableCell>
                      <TableCell>{typeof row.meanRecall === 'number' ? row.meanRecall.toFixed(4) : row.meanRecall}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="per-class" className="space-y-6">
          <SectionHeader
            title="Per-Class Accuracy"
            description="Class-level mAP reveals where transformer attention provides marginal gains."
          />
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Per-Class mAP@0.5</CardTitle>
              <CardDescription>YOLO and Hybrid models saturate accuracy for benthic species, RT-DETR trails on micro fauna.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ReactApexChart
                type="radar"
                height={350}
                series={[
                  {
                    name: "YOLO",
                    data: filteredPerClass.map((row) => typeof row.yoloMap50 === 'number' ? row.yoloMap50 * 100 : Number(row.yoloMap50) * 100),
                  },
                  {
                    name: "Hybrid",
                    data: filteredPerClass.map((row) => typeof row.hybridMap50 === 'number' ? row.hybridMap50 * 100 : Number(row.hybridMap50) * 100),
                  },
                  {
                    name: "RT-DETR",
                    data: filteredPerClass.map((row) => typeof row.rtDetrMap50 === 'number' ? row.rtDetrMap50 * 100 : Number(row.rtDetrMap50) * 100),
                  },
                ]}
                options={{
                  chart: { toolbar: { show: false } },
                  labels: filteredPerClass.map((row) => typeof row.class === 'string' ? row.class.replace("_", " ") : String(row.class)),
                  dataLabels: { enabled: false },
                  yaxis: { labels: { formatter: (val) => `${val.toFixed(0)}%` } },
                }}
              />

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>YOLO @0.5</TableHead>
                    <TableHead>YOLO @0.5:0.95</TableHead>
                    <TableHead>RT-DETR @0.5</TableHead>
                    <TableHead>RT-DETR @0.5:0.95</TableHead>
                    <TableHead>Hybrid @0.5</TableHead>
                    <TableHead>Hybrid @0.5:0.95</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPerClass.map((row) => (
                    <TableRow key={row.class}>
                      <TableCell className="font-medium capitalize">{typeof row.class === 'string' ? row.class.replace("_", " ") : String(row.class)}</TableCell>
                      <TableCell>{typeof row.yoloMap50 === 'number' ? formatPercent(row.yoloMap50) : formatPercent(Number(row.yoloMap50))}</TableCell>
                      <TableCell>{typeof row.yoloMap5095 === 'number' ? formatPercent(row.yoloMap5095) : formatPercent(Number(row.yoloMap5095))}</TableCell>
                      <TableCell>{typeof row.rtDetrMap50 === 'number' ? formatPercent(row.rtDetrMap50) : formatPercent(Number(row.rtDetrMap50))}</TableCell>
                      <TableCell>{typeof row.rtDetrMap5095 === 'number' ? formatPercent(row.rtDetrMap5095) : formatPercent(Number(row.rtDetrMap5095))}</TableCell>
                      <TableCell>{typeof row.hybridMap50 === 'number' ? formatPercent(row.hybridMap50) : formatPercent(Number(row.hybridMap50))}</TableCell>
                      <TableCell>{typeof row.hybridMap5095 === 'number' ? formatPercent(row.hybridMap5095) : formatPercent(Number(row.hybridMap5095))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <SectionHeader
            title="Error Analysis"
            description="False positives dominate the small_fish category; RT-DETR struggles with recall on dense shoals."
          />
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>False Positives / Negatives</CardTitle>
              <CardDescription>Counts are absolute over the evaluation split.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ReactApexChart
                type="bar"
                height={320}
                series={[
                  {
                    name: "YOLO FP",
                    data: filteredErrors.map((row) => typeof row.yoloFP === 'number' ? row.yoloFP : Number(row.yoloFP)),
                  },
                  {
                    name: "RT-DETR FP",
                    data: filteredErrors.map((row) => typeof row.rtDetrFP === 'number' ? row.rtDetrFP : Number(row.rtDetrFP)),
                  },
                  {
                    name: "Hybrid FP",
                    data: filteredErrors.map((row) => typeof row.hybridFP === 'number' ? row.hybridFP : Number(row.hybridFP)),
                  },
                  {
                    name: "YOLO FN",
                    data: filteredErrors.map((row) => typeof row.yoloFN === 'number' ? row.yoloFN : Number(row.yoloFN)),
                  },
                  {
                    name: "RT-DETR FN",
                    data: filteredErrors.map((row) => typeof row.rtDetrFN === 'number' ? row.rtDetrFN : Number(row.rtDetrFN)),
                  },
                  {
                    name: "Hybrid FN",
                    data: filteredErrors.map((row) => typeof row.hybridFN === 'number' ? row.hybridFN : Number(row.hybridFN)),
                  },
                ]}
                options={{
                  chart: { stacked: true, toolbar: { show: false } },
                  xaxis: { categories: filteredErrors.map((row) => typeof row.class === 'string' ? row.class.replace("_", " ") : String(row.class)) },
                  dataLabels: { enabled: false },
                  legend: { position: "top" },
                  tooltip: { y: { formatter: (val) => val.toFixed(0) } },
                  colors: ["#f97316", "#ec4899", "#14b8a6", "#facc15", "#6366f1", "#0ea5e9"],
                }}
              />

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>YOLO FP</TableHead>
                    <TableHead>YOLO FN</TableHead>
                    <TableHead>YOLO F1</TableHead>
                    <TableHead>RT-DETR FP</TableHead>
                    <TableHead>RT-DETR FN</TableHead>
                    <TableHead>RT-DETR F1</TableHead>
                    <TableHead>Hybrid FP</TableHead>
                    <TableHead>Hybrid FN</TableHead>
                    <TableHead>Hybrid F1</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredErrors.map((row) => (
                    <TableRow key={row.class}>
                      <TableCell className="font-medium capitalize">{typeof row.class === 'string' ? row.class.replace("_", " ") : String(row.class)}</TableCell>
                      <TableCell>{row.yoloFP}</TableCell>
                      <TableCell>{row.yoloFN}</TableCell>
                      <TableCell>{typeof row.yoloF1 === 'number' ? row.yoloF1.toFixed(4) : row.yoloF1}</TableCell>
                      <TableCell>{row.rtDetrFP}</TableCell>
                      <TableCell>{row.rtDetrFN}</TableCell>
                      <TableCell>{typeof row.rtDetrF1 === 'number' ? row.rtDetrF1.toFixed(4) : row.rtDetrF1}</TableCell>
                      <TableCell>{row.hybridFP}</TableCell>
                      <TableCell>{row.hybridFN}</TableCell>
                      <TableCell>{typeof row.hybridF1 === 'number' ? row.hybridF1.toFixed(4) : row.hybridF1}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="robustness" className="space-y-6">
          <SectionHeader
            title="Robustness"
            description="Delta mAP under turbidity, motion blur, and color-shift augmentations."
          />
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Δ mAP@0.5 under perturbations</CardTitle>
              <CardDescription>Hybrid and YOLO resist degradations equally, transformers lose recall under scatter.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ReactApexChart
                type="bar"
                height={260}
                series={[
                  {
                    name: "Δ mAP@0.5",
                    data: filteredRobustness.map((row) => typeof row.deltaMap50Percent === 'number' ? row.deltaMap50Percent : Number(row.deltaMap50Percent)),
                  },
                ]}
                options={{
                  chart: { toolbar: { show: false } },
                  xaxis: { categories: filteredRobustness.map((row) => row.model) },
                  colors: filteredRobustness.map((row) => {
                    const val = typeof row.deltaMap50Percent === 'number' ? row.deltaMap50Percent : Number(row.deltaMap50Percent);
                    return val < 0 ? "#ef4444" : "#22c55e";
                  }),
                  dataLabels: { enabled: true, formatter: (val) => typeof val === 'number' ? `${val.toFixed(1)}%` : `${Number(val).toFixed(1)}%` },
                  plotOptions: { bar: { columnWidth: "40%" } },
                  yaxis: { labels: { formatter: (val) => `${val.toFixed(1)}%` } },
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <SectionHeader
            title="Deployment Efficiency"
            description="Hybrid slashes VRAM versus RT-DETR yet delivers the fastest GPU inference."
          />
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Model Footprint</CardTitle>
              <CardDescription>Parameters, FLOPs, and runtime for embedded deployment scenarios.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ReactApexChart
                type="scatter"
                height={320}
                series={filteredDeployment.map((row) => ({
                  name: typeof row.model === 'string' ? row.model : String(row.model),
                  data: [[
                    typeof row.gpuSpeedMs === 'number' ? row.gpuSpeedMs : Number(row.gpuSpeedMs),
                    typeof row.vramMb === 'number' ? row.vramMb : Number(row.vramMb),
                    typeof row.paramsM === 'number' ? row.paramsM : Number(row.paramsM)
                  ]],
                }))}
                options={{
                  chart: { toolbar: { show: false } },
                  xaxis: {
                    title: { text: "GPU latency (ms)" },
                  },
                  yaxis: {
                    title: { text: "VRAM (MB)" },
                  },
                  markers: { size: 12 },
                  dataLabels: {
                    enabled: true,
                    formatter: (_, opts) => filteredDeployment[opts.seriesIndex]?.model ?? "",
                    offsetY: -10,
                  },
                  tooltip: {
                    custom: ({ seriesIndex }) => {
                      const row = filteredDeployment[seriesIndex]
                      if (!row) return ""
                      return `<div class=\"px-3 py-2 text-xs\">${row.model}<br/>Params: ${typeof row.paramsM === 'number' ? row.paramsM.toFixed(2) : row.paramsM}M<br/>GFLOPs: ${typeof row.gflops === 'number' ? row.gflops.toFixed(2) : row.gflops}<br/>CPU latency: ${typeof row.cpuSpeedMs === 'number' ? row.cpuSpeedMs.toFixed(0) : row.cpuSpeedMs} ms</div>`
                    },
                  },
                }}
              />

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Layers</TableHead>
                    <TableHead>Params (M)</TableHead>
                    <TableHead>GFLOPs</TableHead>
                    <TableHead>File (MB)</TableHead>
                    <TableHead>VRAM (MB)</TableHead>
                    <TableHead>GPU (ms)</TableHead>
                    <TableHead>CPU (ms)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeployment.map((row) => (
                    <TableRow key={row.model}>
                      <TableCell className="font-medium">{row.model}</TableCell>
                      <TableCell>{row.layers}</TableCell>
                      <TableCell>{typeof row.paramsM === 'number' ? row.paramsM.toFixed(2) : Number(row.paramsM).toFixed(2)}</TableCell>
                      <TableCell>{typeof row.gflops === 'number' ? row.gflops.toFixed(2) : Number(row.gflops).toFixed(2)}</TableCell>
                      <TableCell>{row.fileMb}</TableCell>
                      <TableCell>{row.vramMb}</TableCell>
                      <TableCell>{typeof row.gpuSpeedMs === 'number' ? row.gpuSpeedMs.toFixed(1) : Number(row.gpuSpeedMs).toFixed(1)}</TableCell>
                      <TableCell>{typeof row.cpuSpeedMs === 'number' ? row.cpuSpeedMs.toFixed(0) : Number(row.cpuSpeedMs).toFixed(0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repeatability" className="space-y-6">
          <SectionHeader
            title="Statistical Repeatability"
            description="Variation over three seeds confirms sub-±0.3% swings for convolutional backbones."
          />
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Seed Variability</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Mean mAP@0.5 (%)</TableHead>
                    <TableHead>SD (%)</TableHead>
                    <TableHead>95% CI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRepeatability.map((row) => (
                    <TableRow key={row.model}>
                      <TableCell className="font-medium">{row.model}</TableCell>
                      <TableCell>{typeof row.meanMap50Percent === 'number' ? row.meanMap50Percent.toFixed(2) : Number(row.meanMap50Percent).toFixed(2)}</TableCell>
                      <TableCell>{typeof row.sdPercent === 'number' ? row.sdPercent.toFixed(2) : Number(row.sdPercent).toFixed(2)}</TableCell>
                      <TableCell>{row.ci95}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prior-work" className="space-y-6">
          <SectionHeader
            title="Prior Work Comparison"
            description="Modern pipeline extends previous marine detectors with transformers and focal loss."
          />
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Architectural Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Zhang 2021</TableHead>
                    <TableHead>Pedersen 2019</TableHead>
                    <TableHead>This Work</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPriorWork.map((row) => (
                    <TableRow key={row.feature}>
                      <TableCell className="font-medium">{row.feature}</TableCell>
                      <TableCell>{row.zhang2021}</TableCell>
                      <TableCell>{row.pedersen2019}</TableCell>
                      <TableCell>{row.thisWork}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ablations" className="space-y-6">
          <SectionHeader
            title="Ablation Studies"
            description="Interventions such as removing augmentation incur >7% mAP loss across the board."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <AblationCard
              title="A.1 No Augmentation"
              description="Removing augmentation and weighted focal loss hurts mAP most for small objects."
              rows={filteredA1}
            />
            <AblationCard
              title="A.2 Higher Learning Rate"
              description="Aggressive LR improves RT-DETR convergence, marginal gains for YOLO/Hybrid."
              rows={filteredA2}
            />
          </div>
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>A.3 Per-Class mAP without Weighted Focal Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>YOLO @0.5</TableHead>
                    <TableHead>YOLO @0.5:0.95</TableHead>
                    <TableHead>RT-DETR @0.5</TableHead>
                    <TableHead>RT-DETR @0.5:0.95</TableHead>
                    <TableHead>Hybrid @0.5</TableHead>
                    <TableHead>Hybrid @0.5:0.95</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredA3.map((row) => (
                    <TableRow key={row.class}>
                      <TableCell className="font-medium capitalize">{typeof row.class === 'string' ? row.class.replace("_", " ") : String(row.class)}</TableCell>
                      <TableCell>{formatPercent(typeof row.yoloMap50 === 'number' ? row.yoloMap50 : Number(row.yoloMap50))}</TableCell>
                      <TableCell>{formatPercent(typeof row.yoloMap5095 === 'number' ? row.yoloMap5095 : Number(row.yoloMap5095))}</TableCell>
                      <TableCell>{formatPercent(typeof row.rtDetrMap50 === 'number' ? row.rtDetrMap50 : Number(row.rtDetrMap50))}</TableCell>
                      <TableCell>{formatPercent(typeof row.rtDetrMap5095 === 'number' ? row.rtDetrMap5095 : Number(row.rtDetrMap5095))}</TableCell>
                      <TableCell>{formatPercent(typeof row.hybridMap50 === 'number' ? row.hybridMap50 : Number(row.hybridMap50))}</TableCell>
                      <TableCell>{formatPercent(typeof row.hybridMap5095 === 'number' ? row.hybridMap5095 : Number(row.hybridMap5095))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <Separator orientation="vertical" className="h-5" />
        <Badge variant="outline" className="uppercase tracking-wide text-[11px]">
          research
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function MetricRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-lg font-semibold ${accent ?? ""}`}>{value}</span>
    </div>
  )
}

function AblationCard({
  title,
  description,
  rows,
}: {
  title: string
  description: string
  rows: GenericRow[]
}) {
  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>Params (M)</TableHead>
              <TableHead>GFLOPs</TableHead>
              <TableHead>Total (ms)</TableHead>
              <TableHead>mAP@0.5</TableHead>
              <TableHead>mAP@0.5:0.95</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row: any) => (
              <TableRow key={row.model}>
                <TableCell className="font-medium">{row.model}</TableCell>
                <TableCell>{row.paramsM.toFixed(2)}</TableCell>
                <TableCell>{row.gflops.toFixed(1)}</TableCell>
                <TableCell>{row.totalMs.toFixed(1)}</TableCell>
                <TableCell>{row.map50.toFixed(3)}</TableCell>
                <TableCell>{row.map5095.toFixed(3)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
