import { useState } from "react"
import { Wand2, Loader2, Settings, Palette, Zap, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { generateDesign } from "../services/api"

export default function Generate() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [cannyImage, setCannyImage] = useState(null)
  const [passAImage, setPassAImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [prompt, setPrompt] = useState("Modern minimalist bedroom redesign. Neutral warm palette with beige and soft grey tones. Replace patterned curtains with sheer linen curtains. Upholstered bed with soft fabric headboard. Warm indirect lighting. Matte wall finishes. Photorealistic interior design photography.")
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Mode-based generation (replaces strength slider)
  const [mode, setMode] = useState("balanced")  // "subtle", "balanced", "bold"
  const [twoPass, setTwoPass] = useState(false)
  const [guidanceScale, setGuidanceScale] = useState(7.5)
  const [steps, setSteps] = useState(30)
  const [controlnetScale, setControlnetScale] = useState(1.0)

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file) // Store File object for API
      
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result)
      }
      reader.readAsDataURL(file)
      
      // Reset previous results
      setGeneratedImage(null)
      setError(null)
    }
  }

  const handleGenerate = async () => {
    if (!imageFile) {
      setError("Please upload an image first")
      return
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      const result = await generateDesign(imageFile, prompt, {
        numInferenceSteps: steps,
        guidanceScale: guidanceScale,
        mode: mode,  // Use mode instead of strength
        twoPass: twoPass,
        controlnetConditioningScale: controlnetScale
      })
      setGeneratedImage(result.generatedImage)
      setCannyImage(result.cannyImage)
      setPassAImage(result.passAImage)
    } catch (err) {
      setError(err.message)
      console.error("Generation error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-white pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-purple-600 to-blue-600 rounded-full mb-4">
            <Wand2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Generate Design</h1>
          <p className="text-lg text-gray-600">AI creates your transformed space</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8">
            {uploadedImage ? (
              <div>
                <img src={uploadedImage} alt="Uploaded room" className="w-full rounded-lg mb-4 max-h-96 object-cover" />
                {error && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Design Prompt (Designer Language)
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe materials and finishes, not abstract ideas..."
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use design terminology: palette, texture, finish, materials
                  </p>
                </div>
                
                {/* Mode Selection - Replaces Strength Slider */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transformation Intensity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setMode("subtle")}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        mode === "subtle"
                          ? "border-purple-600 bg-purple-50 text-purple-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Palette className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">Subtle</div>
                      <div className="text-xs text-gray-500">Minor refresh</div>
                    </button>
                    <button
                      onClick={() => setMode("balanced")}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        mode === "balanced"
                          ? "border-purple-600 bg-purple-50 text-purple-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Zap className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">Balanced</div>
                      <div className="text-xs text-gray-500">Recommended</div>
                    </button>
                    <button
                      onClick={() => setMode("bold")}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        mode === "bold"
                          ? "border-purple-600 bg-purple-50 text-purple-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Sparkles className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">Bold</div>
                      <div className="text-xs text-gray-500">Full redesign</div>
                    </button>
                  </div>
                </div>
                
                {/* Two-Pass Generation Toggle */}
                <div className="mb-3 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-blue-900">Two-Pass Generation</div>
                    <div className="text-xs text-blue-700">Better quality, 2x slower</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={twoPass}
                      onChange={(e) => setTwoPass(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                {/* Advanced Options Toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 mb-3"
                >
                  <Settings className="w-4 h-4" />
                  {showAdvanced ? "Hide" : "Show"} Advanced Options
                </button>
                
                {/* Advanced Parameters */}
                {showAdvanced && (
                  <div className="mb-3 p-4 bg-gray-50 rounded-lg space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Guidance Scale: {guidanceScale.toFixed(1)} <span className="text-gray-500">(prompt adherence)</span>
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="15"
                        step="0.5"
                        value={guidanceScale}
                        onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Steps: {steps} <span className="text-gray-500">(quality vs speed)</span>
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="50"
                        step="5"
                        value={steps}
                        onChange={(e) => setSteps(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        ControlNet Scale: {controlnetScale.toFixed(2)} <span className="text-gray-500">(structure preservation)</span>
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        value={controlnetScale}
                        onChange={(e) => setControlnetScale(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleGenerate}
                    disabled={isProcessing}
                    className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                        Generating (30-60s)...
                      </>
                    ) : (
                      "Generate Design"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setUploadedImage(null)
                      setImageFile(null)
                      setGeneratedImage(null)
                      setError(null)
                    }}
                    className="px-6 py-3 border-2 border-purple-700 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                  >
                    Upload New
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="upload-generate"
                />
                <label htmlFor="upload-generate" className="cursor-pointer">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900 mb-2">Click to upload your room image</p>
                  <p className="text-sm text-gray-500">PNG, JPG or GIF up to 10MB</p>
                </label>
              </div>
            )}
          </div>

          {/* Generated Image */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Generated Design</h2>
            {generatedImage ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img src={generatedImage} alt="Generated design" className="w-full max-h-96 object-cover" />
                </div>
                {cannyImage && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-purple-600 hover:text-purple-700 font-medium">
                      View ControlNet Edge Map
                    </summary>
                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                      <img src={cannyImage} alt="Canny edge detection" className="w-full max-h-64 object-cover" />
                    </div>
                  </details>
                )}
              </div>
            ) : isProcessing ? (
              <div className="bg-linear-to-br from-purple-50 to-blue-50 rounded-lg p-12 text-center border border-gray-200">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-700 font-medium">AI is creating your design...</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center h-96 flex items-center justify-center border border-gray-200">
                <p className="text-gray-500">Generated design will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-center gap-4">
          <Link
            to="/advise"
            className="border-2 border-gray-700 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            ← Back to Advice
          </Link>
          <Link
            to="/final"
            className="bg-amber-700 text-white px-8 py-3 rounded-lg hover:bg-amber-800 transition-colors font-medium"
          >
            Next: Final Output →
          </Link>
        </div>
      </div>
    </main>
  )
}

