"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { StepProgress } from "@/components/ui/progress"
import { BeforeAfterSlider } from "@/components/before-after-slider"
import {
  Upload,
  Sparkles,
  Download,
  RefreshCw,
  Eye,
  Target,
  Layout,
  Lightbulb,
  Wand2,
  CheckCircle2,
  Loader2,
} from "lucide-react"

type ProcessStep = "upload" | "detect" | "segment" | "advise" | "generate" | "complete"

const STEPS = ["Detect", "Segment", "Advise", "Generate", "Complete"]

interface ProcessState {
  step: ProcessStep
  uploadedImage: string | null
  detectedObjects: string[]
  segmentedImage: string | null
  designAdvice: string[]
  generatedImage: string | null
}

export default function AIDesignPage() {
  const [processState, setProcessState] = useState<ProcessState>({
    step: "upload",
    uploadedImage: null,
    detectedObjects: [],
    segmentedImage: null,
    designAdvice: [],
    generatedImage: null,
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProcessState({
          ...processState,
          uploadedImage: event.target?.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const startAIProcess = async () => {
    setIsProcessing(true)

    // Step 1: Detect
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setProcessState({
      ...processState,
      step: "detect",
      detectedObjects: ["Sofa", "Coffee Table", "Rug", "Light Fixture", "Bookshelf"],
    })

    // Step 2: Segment
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setProcessState((prev) => ({
      ...prev,
      step: "segment",
      segmentedImage: prev.uploadedImage, // In real app, this would be the segmented version
    }))

    // Step 3: Advise
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setProcessState((prev) => ({
      ...prev,
      step: "advise",
      designAdvice: [
        "Switch to light neutral wall colors to brighten the space",
        "Add textured throw pillows for depth and warmth",
        "Replace harsh lighting with warm ambient lighting",
        "Introduce plants for natural elements",
        "Add a statement piece like a colorful rug",
      ],
    }))

    // Step 4: Generate
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setProcessState((prev) => ({
      ...prev,
      step: "generate",
      generatedImage: prev.uploadedImage, // In real app, this would be the AI-generated design
    }))

    // Step 5: Complete
    await new Promise((resolve) => setTimeout(resolve, 500))
    setProcessState((prev) => ({
      ...prev,
      step: "complete",
    }))

    setIsProcessing(false)
  }

  const resetProcess = () => {
    setProcessState({
      step: "upload",
      uploadedImage: null,
      detectedObjects: [],
      segmentedImage: null,
      designAdvice: [],
      generatedImage: null,
    })
  }

  const getCurrentStepIndex = () => {
    const stepOrder: ProcessStep[] = ["upload", "detect", "segment", "advise", "generate", "complete"]
    return stepOrder.indexOf(processState.step)
  }

  const renderStepContent = () => {
    switch (processState.step) {
      case "upload":
        return (
          <Card className="border-2 border-dashed border-border p-12">
            <div className="flex flex-col items-center justify-center gap-6">
              <Upload className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <p className="text-xl font-semibold text-foreground mb-2">Upload Your Space</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload a photo of your room to begin the AI transformation process
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button asChild size="lg">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-5 w-5" />
                  Choose Image
                </label>
              </Button>
            </div>
          </Card>
        )

      case "detect":
        return (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Detection Complete</h3>
                  <p className="text-sm text-muted-foreground">AI identified objects in your space</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {processState.detectedObjects.map((obj, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20"
                  >
                    <CheckCircle2 className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-foreground">{obj}</span>
                  </div>
                ))}
              </div>
              {processState.uploadedImage && (
                <img
                  src={processState.uploadedImage}
                  alt="Detected room"
                  className="w-full rounded-lg mt-6 max-h-96 object-cover"
                />
              )}
            </CardContent>
          </Card>
        )

      case "segment":
        return (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                  <Layout className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Segmentation Complete</h3>
                  <p className="text-sm text-muted-foreground">Room elements have been segmented</p>
                </div>
              </div>
              {processState.uploadedImage && (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={processState.uploadedImage}
                    alt="Segmented room"
                    className="w-full max-h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
                </div>
              )}
            </CardContent>
          </Card>
        )

      case "advise":
        return (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                  <Lightbulb className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Design Recommendations</h3>
                  <p className="text-sm text-muted-foreground">AI-generated suggestions for your space</p>
                </div>
              </div>
              <div className="space-y-3">
                {processState.designAdvice.map((advice, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-purple-500/5 border border-border">
                    <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">{advice}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "generate":
        return (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-blue-500">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Generating Your Design</h3>
                  <p className="text-sm text-muted-foreground">AI is creating your transformed space...</p>
                </div>
              </div>
              {processState.uploadedImage && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={processState.uploadedImage}
                    alt="Generating"
                    className="w-full max-h-96 object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )

      case "complete":
        return (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Design Complete!</h3>
                  <p className="text-sm text-muted-foreground">Compare your before and after</p>
                </div>
              </div>
              {processState.uploadedImage && processState.generatedImage && (
                <BeforeAfterSlider
                  beforeImage={processState.uploadedImage}
                  afterImage={processState.generatedImage}
                />
              )}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={resetProcess}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Start New Design
                </Button>
                <Button
                  className="flex-1 bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Result
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
              <span className="bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                AI Design Studio
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Transform your space with AI-powered design in 5 steps
            </p>
          </div>

          {processState.step !== "upload" && (
            <div className="mb-8">
              <StepProgress
                currentStep={getCurrentStepIndex()}
                totalSteps={STEPS.length}
                stepNames={STEPS}
              />
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {renderStepContent()}
                      </div>
                </div>

          {/* Action Buttons */}
          {processState.uploadedImage && processState.step === "upload" && !isProcessing && (
                <Button
              onClick={startAIProcess}
                  className="w-full mt-6 bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                  size="lg"
                >
                      <Sparkles className="mr-2 h-5 w-5" />
              Start AI Transformation
                </Button>
              )}
        </div>
      </section>
    </div>
  )
}
