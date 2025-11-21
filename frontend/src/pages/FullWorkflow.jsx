import { useState } from "react"
import { Wand2, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { detectObjects, segmentImage, getDesignAdvice, generateDesign } from "../services/api"

export default function FullWorkflow() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  
  // Results from each service
  const [results, setResults] = useState({
    detect: null,
    segment: null,
    advise: null,
    generate: null
  })

  const steps = [
    { name: "Upload", icon: Upload, status: "pending" },
    { name: "Detect", icon: CheckCircle2, status: "pending" },
    { name: "Segment", icon: CheckCircle2, status: "pending" },
    { name: "Advise", icon: CheckCircle2, status: "pending" },
    { name: "Generate", icon: Wand2, status: "pending" }
  ]

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result)
      }
      reader.readAsDataURL(file)
      
      // Reset results
      setResults({
        detect: null,
        segment: null,
        advise: null,
        generate: null
      })
      setCurrentStep(0)
      setError(null)
    }
  }

  const runFullWorkflow = async () => {
    if (!imageFile) {
      setError("Please upload an image first")
      return
    }
    
    setIsProcessing(true)
    setError(null)
    setCurrentStep(1)
    
    try {
      // Step 1: Detect Objects
      console.log("Step 1: Detecting objects...")
      const detectResult = await detectObjects(imageFile)
      setResults(prev => ({ ...prev, detect: detectResult }))
      setCurrentStep(2)
      
      // Step 2: Segment Image
      console.log("Step 2: Segmenting image...")
      const segmentResult = await segmentImage(imageFile, 10)
      setResults(prev => ({ ...prev, segment: segmentResult }))
      setCurrentStep(3)
      
      // Step 3: Get Design Advice
      console.log("Step 3: Getting design advice...")
      const adviseResult = await getDesignAdvice(imageFile)
      setResults(prev => ({ ...prev, advise: adviseResult }))
      setCurrentStep(4)
      
      // Step 4: Generate New Design
      console.log("Step 4: Generating new design...")
      const generateResult = await generateDesign(imageFile, "Modern minimalist interior design", {
        numInferenceSteps: 20,
        guidanceScale: 7.5
      })
      setResults(prev => ({ ...prev, generate: generateResult }))
      setCurrentStep(5)
      
      console.log("Workflow complete!")
    } catch (err) {
      console.error("Workflow error:", err)
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-white pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4">
            <Wand2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Complete AI Workflow</h1>
          <p className="text-lg text-gray-600">Upload once, process through all AI services automatically</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  index < currentStep ? 'bg-green-500 text-white' :
                  index === currentStep && isProcessing ? 'bg-blue-500 text-white animate-pulse' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  index <= currentStep ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-full mt-6 -mx-2 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} style={{ position: 'absolute', top: '24px', left: '50%', right: '-50%', zIndex: -1 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 mb-8">
          {uploadedImage ? (
            <div>
              <img src={uploadedImage} alt="Uploaded room" className="w-full rounded-lg mb-4 max-h-96 object-cover" />
              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={runFullWorkflow}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                      Processing Step {currentStep} of 4...
                    </>
                  ) : (
                    <>
                      <Wand2 className="inline-block mr-2 h-4 w-4" />
                      Start Complete Workflow
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setUploadedImage(null)
                    setImageFile(null)
                    setResults({ detect: null, segment: null, advise: null, generate: null })
                    setCurrentStep(0)
                    setError(null)
                  }}
                  disabled={isProcessing}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Upload New
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload room image
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  PNG, JPG up to 10MB
                </span>
              </label>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Choose File
              </button>
            </div>
          )}
        </div>

        {/* Results Grid */}
        {(results.detect || results.segment || results.advise || results.generate) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Detection Results */}
            {results.detect && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  Object Detection
                </h3>
                {results.detect.annotatedImage && (
                  <img src={results.detect.annotatedImage} alt="Detected objects" className="w-full rounded-lg mb-4" />
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Detected Objects:</p>
                  <div className="flex flex-wrap gap-2">
                    {results.detect.objects?.map((obj, idx) => (
                      <span key={idx} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Segmentation Results */}
            {results.segment && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  Image Segmentation
                </h3>
                {results.segment.segmentedImage && (
                  <img src={results.segment.segmentedImage} alt="Segmented image" className="w-full rounded-lg mb-4" />
                )}
                <p className="text-sm text-gray-600">
                  Segments identified: {results.segment.numSegments || results.segment.masks?.length || 0}
                </p>
              </div>
            )}

            {/* Design Advice */}
            {results.advise && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  Design Recommendations
                </h3>
                <div className="space-y-3">
                  {results.advise.advice?.map((tip, idx) => (
                    <div key={idx} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {idx + 1}
                      </span>
                      <p className="text-gray-700 text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated Design */}
            {results.generate && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  AI Generated Design
                </h3>
                {results.generate.generatedImage && (
                  <img src={results.generate.generatedImage} alt="Generated design" className="w-full rounded-lg mb-4" />
                )}
                <p className="text-sm text-gray-600">Prompt: {results.generate.prompt}</p>
              </div>
            )}
          </div>
        )}

        {/* Individual Services Links */}
        <div className="mt-12 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Or try individual services:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/detect" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-amber-500 transition-colors text-center">
              <span className="font-medium text-gray-900">Detect</span>
            </Link>
            <Link to="/segment" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors text-center">
              <span className="font-medium text-gray-900">Segment</span>
            </Link>
            <Link to="/advise" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-500 transition-colors text-center">
              <span className="font-medium text-gray-900">Advise</span>
            </Link>
            <Link to="/generate" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-500 transition-colors text-center">
              <span className="font-medium text-gray-900">Generate</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
