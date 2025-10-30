import { useState } from "react"
import { Target, CheckCircle2, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { detectObjects } from "../services/api"

export default function Detect() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [detectedObjects, setDetectedObjects] = useState([])
  const [annotatedImage, setAnnotatedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file) // Store File object for API call
      
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result)
      }
      reader.readAsDataURL(file)
      
      // Reset previous results
      setDetectedObjects([])
      setAnnotatedImage(null)
      setError(null)
    }
  }

  const handleDetect = async () => {
    if (!imageFile) {
      setError("Please upload an image first")
      return
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      const result = await detectObjects(imageFile)
      setDetectedObjects(result.objects || [])
      setAnnotatedImage(result.annotatedImage)
    } catch (err) {
      setError(err.message)
      console.error("Detection error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-white pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <Target className="w-8 h-8 text-amber-700" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Object Detection</h1>
          <p className="text-lg text-gray-600">AI-powered object detection for your room</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Upload Section */}
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8">
            {uploadedImage ? (
              <div>
                <img 
                  src={annotatedImage || uploadedImage} 
                  alt="Room with detections" 
                  className="w-full rounded-lg mb-4 max-h-96 object-cover" 
                />
                {error && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleDetect}
                    disabled={isProcessing}
                    className="flex-1 bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition-colors font-medium disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      "Detect Objects"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setUploadedImage(null)
                      setImageFile(null)
                      setDetectedObjects([])
                      setAnnotatedImage(null)
                      setError(null)
                    }}
                    className="px-6 py-3 border-2 border-amber-700 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors font-medium"
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
                  id="upload-image"
                />
                <label htmlFor="upload-image" className="cursor-pointer">
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

          {/* Detection Results */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detected Objects</h2>
            {detectedObjects.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {detectedObjects.map((obj, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 text-amber-700" />
                    <span className="font-medium text-gray-900">{obj}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">Upload an image and click 'Detect Objects' to see results</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-center gap-4">
          <Link
            to="/segment"
            className="bg-amber-700 text-white px-8 py-3 rounded-lg hover:bg-amber-800 transition-colors font-medium"
          >
            Next: Segmentation →
          </Link>
        </div>
      </div>
    </main>
  )
}
