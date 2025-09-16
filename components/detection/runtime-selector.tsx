"use client"

import { useMemo } from "react"
import { Zap, Cpu } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useModel } from "@/contexts/model-context"
import type { ExecutionProvider } from "@/contexts/model-context"

const providerLabels: Record<ExecutionProvider, string> = {
  webgl: "GPU • WebGL",
  wasm: "CPU • WebAssembly",
}

const providerDescriptions: Record<ExecutionProvider, string> = {
  webgl: "Leverages the browser GPU for faster inference when supported.",
  wasm: "Runs entirely on the CPU for maximum compatibility.",
}

export function RuntimeSelector() {
  const {
    executionProvider,
    availableExecutionProviders,
    setExecutionProvider,
    providerError,
    modelStates,
  } = useModel()

  const isBusy = useMemo(
    () =>
      Object.values(modelStates).some((state) => state.status === "loading" || state.status === "running"),
    [modelStates],
  )

  const selectDisabled = isBusy || availableExecutionProviders.length <= 1
  const onlyCpuAvailable =
    availableExecutionProviders.length === 1 && availableExecutionProviders[0] === "wasm"

  const availabilityMessage = onlyCpuAvailable
    ? "WebGL acceleration is unavailable; detections will run on the CPU."
    : "Switch between GPU and CPU runtimes. Changing the backend clears loaded models so they reload automatically."

  const badgeIcon = executionProvider === "webgl" ? <Zap className="h-4 w-4" /> : <Cpu className="h-4 w-4" />

  return (
    <Card className="border border-border">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2 md:max-w-xl">
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold">Execution Backend</Label>
              <Badge variant="secondary" className="flex items-center gap-1">
                {badgeIcon}
                <span>{executionProvider === "webgl" ? "GPU" : "CPU"}</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{availabilityMessage}</p>
            {isBusy && (
              <p className="text-xs text-muted-foreground">
                Finish loading or running models before switching backends.
              </p>
            )}
          </div>

          <div className="w-full md:w-64">
            <Select
              value={executionProvider}
              onValueChange={(value) => setExecutionProvider(value as ExecutionProvider)}
              disabled={selectDisabled}
            >
              <SelectTrigger className="bg-background focus:ring-marine-indigo">
                <SelectValue placeholder="Select backend" />
              </SelectTrigger>
              <SelectContent>
                {availableExecutionProviders.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {providerLabels[provider]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-2 text-xs text-muted-foreground">
              {providerDescriptions[executionProvider]}
            </p>
          </div>
        </div>

        {providerError && (
          <Alert variant="destructive">
            <AlertDescription>{providerError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
