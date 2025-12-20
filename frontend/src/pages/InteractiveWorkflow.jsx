import { useState } from "react"
import { Upload, Eye, MessageSquare, Wand2, Loader2, CheckCircle2, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { detectObjects, getInitialProposal, refineProposal, generatePromptFromDesign, generateDesign } from "../services/api"

export default function InteractiveWorkflow() {
  // Workflow state
  const [currentStep, setCurrentStep] = useState(1) // 1-4
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  
  // Step 1: Detection
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionData, setDetectionData] = useState(null)
  
  // Step 2: Initial Proposal
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false)
  const [initialProposal, setInitialProposal] = useState(null)
  const [userFeedback, setUserFeedback] = useState("")
  
  // Step 3: Refined Design
  const [isRefining, setIsRefining] = useState(false)
  const [refinedDesign, setRefinedDesign] = useState(null)
  
  // Step 4: Final Generation
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  
  const [error, setError] = useState(null)

  // ===== STEP 1: Upload & Analyze =====
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleAnalyze = async () => {
    if (!imageFile) return
    
    setIsDetecting(true)
    setError(null)
    
    try {
      // Detect objects in image
      const detection = await detectObjects(imageFile)
      
      // Mock structured detection data (in production, detect service should return this)
      const structuredData = {
        room_type: "bedroom",
        objects_detected: detection.objects || ["bed", "chair", "window"],
        lighting: "natural",
        room_size: "medium"
      }
      
      setDetectionData(structuredData)
      
      // Auto-generate initial proposal
      setIsGeneratingProposal(true)
      const proposal = await getInitialProposal(structuredData)
      setInitialProposal(proposal)
      setIsGeneratingProposal(false)
      
      setCurrentStep(2)
    } catch (err) {
      setError(err.message)
      console.error("Analysis error:", err)
    } finally {
      setIsDetecting(false)
    }
  }

  // ===== STEP 2: Review & Provide Feedback =====
  const handleRefinement = async () => {
    if (!userFeedback.trim()) {
      setError("Please provide your preferences or feedback")
      return
    }
    
    setIsRefining(true)
    setError(null)
    
    try {
      const refined = await refineProposal(
        initialProposal.recommendations,
        userFeedback,
        detectionData
      )
      setRefinedDesign(refined)
      setCurrentStep(3)
    } catch (err) {
      setError(err.message)
      console.error("Refinement error:", err)
    } finally {
      setIsRefining(false)
    }
  }

  // ===== STEP 3: Review Refined Design =====
  const proceedToGeneration = () => {
    setCurrentStep(4)
  }

  // ===== STEP 4: Generate Final Image =====
  const handleGenerate = async () => {
    if (!refinedDesign) return
    
    setIsGenerating(true)
    setError(null)
    
    try {
      // STAGE 4: Convert refined design to structured prompt
      const promptData = await generatePromptFromDesign(refinedDesign)
      
      // STAGE 5: Generate image with template-based prompt
      const result = await generateDesign(imageFile, promptData.image_prompt, {
        mode: "balanced",
        twoPass: true,  // Use two-pass for best quality
        numInferenceSteps: 30,
        guidanceScale: 7.5
      })
      setGeneratedImage(result.generatedImage)
    } catch (err) {
      setError(err.message)
      console.error("Generation error:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  // Step icons
  const getStepIcon = (step) => {
    if (currentStep > step) return <CheckCircle2 className="w-6 h-6 text-green-600" />
    if (currentStep === step) return <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">{step}</div>
    return <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm">{step}</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Interactive Design Workflow</h1>
          <p className="text-lg text-gray-600">AI proposes, you refine, we create together</p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex flex-col items-center flex-1">
              {getStepIcon(1)}
              <span className="text-xs mt-2 text-center font-medium">Upload & Analyze</span>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400 mx-2" />
            <div className="flex flex-col items-center flex-1">
              {getStepIcon(2)}
              <span className="text-xs mt-2 text-center font-medium">Review Proposal</span>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400 mx-2" />
            <div className="flex flex-col items-center flex-1">
              {getStepIcon(3)}
              <span className="text-xs mt-2 text-center font-medium">Refined Design</span>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400 mx-2" />
            <div className="flex flex-col items-center flex-1">
              {getStepIcon(4)}
              <span className="text-xs mt-2 text-center font-medium">Generate</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-3xl mx-auto">
            {error}
          </div>
        )}

        {/* ===== STEP 1: Upload & Analyze ===== */}
        {currentStep === 1 && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="w-8 h-8 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Step 1: Upload Your Room</h2>
              </div>

              {!uploadedImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="upload-workflow"
                  />
                  <label htmlFor="upload-workflow" className="cursor-pointer">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="font-semibold text-gray-900 mb-2">Click to upload your room image</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                  </label>
                </div>
              ) : (
                <div>
                  <img src={uploadedImage} alt="Uploaded room" className="w-full rounded-lg mb-4 max-h-96 object-cover" />
                  <div className="flex gap-3">
                    <button
                      onClick={handleAnalyze}
                      disabled={isDetecting}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {isDetecting || isGeneratingProposal ? (
                        <>
                          <Loader2 className="inline-block mr-2 h-5 w-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Eye className="inline-block mr-2 h-5 w-5" />
                          Analyze & Get AI Proposal
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== STEP 2: Review Proposal & Give Feedback ===== */}
        {currentStep === 2 && initialProposal && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Step 2: AI Design Proposal</h2>
              </div>

              <p className="text-gray-600 mb-6">{initialProposal.message}</p>

              {/* Display Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {initialProposal.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
                        {rec.icon === "paint" && "🎨"}
                        {rec.icon === "fabric" && "🪟"}
                        {rec.icon === "bed" && "🛏️"}
                        {rec.icon === "lightbulb" && "💡"}
                        {rec.icon === "sparkles" && "✨"}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{rec.category}</h3>
                        <p className="text-sm text-gray-700 mb-1">{rec.suggestion}</p>
                        <p className="text-xs text-gray-500 italic">{rec.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* User Feedback Input */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-6 h-6 text-yellow-700" />
                  <h3 className="font-bold text-gray-900">Your Preferences & Feedback</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Tell us what you like or don't like. Be specific about colors, materials, styles you prefer.
                </p>
                <textarea
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                  placeholder="Example: I love the neutral palette but prefer warmer tones. I'd like brass accents instead of chrome. Keep the minimal style but add more texture..."
                  rows={5}
                  className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={handleRefinement}
                  disabled={isRefining || !userFeedback.trim()}
                  className="mt-3 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors font-medium disabled:opacity-50"
                >
                  {isRefining ? (
                    <>
                      <Loader2 className="inline-block mr-2 h-5 w-5 animate-spin" />
                      Refining Design...
                    </>
                  ) : (
                    <>
                      Refine Design with My Preferences
                      <ArrowRight className="inline-block ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 3: Refined Design Preview ===== */}
        {currentStep === 3 && refinedDesign && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Step 3: Refined Design</h2>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">✓ {refinedDesign.message}</p>
                <p className="text-sm text-green-700 mt-1">Your preferences: "{refinedDesign.user_preferences_incorporated}"</p>
              </div>

              {/* Display Refined Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {refinedDesign.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
                        {rec.icon === "paint" && "🎨"}
                        {rec.icon === "fabric" && "🪟"}
                        {rec.icon === "bed" && "🛏️"}
                        {rec.icon === "lightbulb" && "💡"}
                        {rec.icon === "sparkles" && "✨"}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{rec.category}</h3>
                        <p className="text-sm text-gray-700 mb-1">{rec.suggestion}</p>
                        <p className="text-xs text-green-600 italic">✓ {rec.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={proceedToGeneration}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors font-medium text-lg"
              >
                Proceed to Final Generation
                <ArrowRight className="inline-block ml-2 h-6 w-6" />
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 4: Generate Final Image ===== */}
        {currentStep === 4 && refinedDesign && (
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Image */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Original Room</h3>
                <img src={uploadedImage} alt="Original" className="w-full rounded-lg" />
              </div>

              {/* Generated Image */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <Wand2 className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Redesigned Room</h3>
                </div>
                
                {!generatedImage && !isGenerating && (
                  <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-dashed border-purple-300">
                    <Wand2 className="w-16 h-16 text-purple-400 mb-4" />
                    <button
                      onClick={handleGenerate}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium text-lg"
                    >
                      Generate Final Design
                    </button>
                    <p className="text-sm text-gray-500 mt-3">Takes 30-60 seconds</p>
                  </div>
                )}

                {isGenerating && (
                  <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                    <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
                    <p className="text-lg font-medium text-gray-900">Creating your design...</p>
                    <p className="text-sm text-gray-500 mt-2">Using two-pass generation for best quality</p>
                  </div>
                )}

                {generatedImage && (
                  <div>
                    <img src={generatedImage} alt="Generated" className="w-full rounded-lg" />
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={handleGenerate}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Regenerate
                      </button>
                      <a
                        href={generatedImage}
                        download="artistry-redesign.png"
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm text-center"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 flex justify-center">
          <Link
            to="/"
            className="border-2 border-gray-700 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
