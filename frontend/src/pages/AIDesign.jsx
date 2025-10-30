import { useState } from "react"
import { Upload, Loader, CheckCircle2, AlertCircle } from "lucide-react"
import { runFullWorkflow } from "../services/api"

export default function AIDesign() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState("")
  const [prompt, setPrompt] = useState("Modern minimalist interior design")

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file) // Store File object for API
      
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result)
      }
      reader.readAsDataURL(file)
      
      // Reset previous results
      setResults(null)
      setError(null)
      setProgress(0)
      setProgressMessage("")
    }
  }

  const handleGenerate = async () => {
    if (!imageFile) {
      setError("Please upload an image first")
      return
    }
    
    setIsLoading(true)
    setError(null)
    setResults(null)
    
    try {
      const workflowResults = await runFullWorkflow(
        imageFile,
        prompt,
        (message, percent) => {
          setProgressMessage(message)
          setProgress(percent)
        }
      )
      setResults(workflowResults)
    } catch (err) {
      setError(err.message)
      console.error("Workflow error:", err)
    } finally {
      setIsLoading(false)
      setProgress(0)
      setProgressMessage("")
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-amber-50 to-white pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">AI Room Design</h1>
          <p className="text-xl text-gray-600">Upload a photo of your room and let our AI redesign it for you</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-12">
          {!selectedImage ? (
            <div className="border-2 border-dashed border-amber-300 rounded-xl p-12 text-center hover:border-amber-500 transition-colors cursor-pointer">
              <label className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <Upload className="w-16 h-16 text-amber-700" />
                  <div>
                    <p className="text-xl font-semibold text-gray-900 mb-2">Drop your room photo here</p>
                    <p className="text-gray-600">or click to browse from your device</p>
                  </div>
                </div>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Design Prompt
                </label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your desired design style..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {isLoading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{progressMessage}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Original Image */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Original Room</h3>
                <img src={selectedImage} alt="Original" className="w-full rounded-lg" />
              </div>

              {/* Results */}
              {results && (
                <div className="space-y-6">
                  {/* Detected Objects */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Detected Objects</h3>
                    <div className="flex flex-wrap gap-2">
                      {results.detection?.objects?.map((obj, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Segmented Image */}
                  {results.segmentation?.segmentedImage && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Segmented Image</h3>
                      <img src={results.segmentation.segmentedImage} alt="Segmented" className="w-full rounded-lg" />
                    </div>
                  )}

                  {/* Design Advice */}
                  {results.advice?.advice && results.advice.advice.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Design Recommendations</h3>
                      <ul className="space-y-2">
                        {results.advice.advice.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Generated Design */}
                  {results.generation?.generatedImage && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Generated Design</h3>
                      <img src={results.generation.generatedImage} alt="Generated" className="w-full rounded-lg shadow-lg" />
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="flex-1 border-2 border-amber-700 text-amber-700 px-6 py-3 rounded-lg hover:bg-amber-50 transition-colors font-semibold"
                  disabled={isLoading}
                >
                  Upload Different Photo
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="flex-1 bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Generating..." : results ? "Regenerate Design" : "Generate Design"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Complete Workflow",
              description: "Runs detection, segmentation, advice, and generation in sequence",
            },
            {
              title: "AI-Powered",
              description: "Uses YOLOv8, MobileSAM, LLaVA, and Stable Diffusion models",
            },
            {
              title: "Professional Results",
              description: "Get comprehensive design transformation with AI recommendations",
            },
          ].map((feature, index) => (
            <div key={index} className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
