import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps {
  value: number
  className?: string
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className="h-full w-full flex-1 bg-linear-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-in-out"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </div>
  )
}

interface StepProgressProps {
  currentStep: number
  totalSteps: number
  stepNames: string[]
  className?: string
}

export function StepProgress({ currentStep, totalSteps, stepNames, className }: StepProgressProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        {stepNames.map((name, index) => (
          <div key={index} className="flex-1 text-center">
            <div
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                index + 1 <= currentStep
                  ? "bg-linear-to-r from-purple-500 to-blue-500 text-white border-purple-500"
                  : "bg-secondary border-border text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            <p
              className={`text-xs mt-2 ${
                index + 1 <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {name}
            </p>
          </div>
        ))}
      </div>
      <Progress value={(currentStep / totalSteps) * 100} />
    </div>
  )
}

