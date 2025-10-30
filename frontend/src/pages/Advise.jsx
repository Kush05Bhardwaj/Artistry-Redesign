import { useState } from "react"
import { Lightbulb, CheckCircle2, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"

export default function Advise() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [advice, setAdvice] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGetAdvice = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setAdvice([
      "Switch to light neutral wall colors to brighten the space",
      "Add textured throw pillows for depth and warmth",
      "Replace harsh lighting with warm ambient lighting",
      "Introduce plants for natural elements",
      "Add a statement piece like a colorful rug",
      "Consider adding wall art for visual interest",
    ])
    setIsProcessing(false)
  }

  return (
    <main className="min-h-screen bg-white pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Lightbulb className="w-8 h-8 text-purple-700" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Design Advice</h1>
          <p className="text-lg text-gray-600">AI-powered recommendations for your space</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Upload Section */}
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8">
            {uploadedImage ? (
              <div>
                <img src={uploadedImage} alt="Uploaded room" className="w-full rounded-lg mb-4 max-h-96 object-cover" />
                <div className="flex gap-3">
                  <button
                    onClick={handleGetAdvice}
                    disabled={isProcessing}
                    className="flex-1 bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition-colors font-medium disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Get Design Advice"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setUploadedImage(null)
                      setAdvice([])
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
                  id="upload-advice"
                />
                <label htmlFor="upload-advice" className="cursor-pointer">
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

          {/* Advice Results */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Design Recommendations</h2>
            {advice.length > 0 ? (
              <div className="space-y-3">
                {advice.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-purple-700 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-900">{item}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">Upload an image and click 'Get Design Advice' to see recommendations</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-center gap-4">
          <Link
            to="/segment"
            className="border-2 border-gray-700 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            ← Back to Segmentation
          </Link>
          <Link
            to="/generate"
            className="bg-amber-700 text-white px-8 py-3 rounded-lg hover:bg-amber-800 transition-colors font-medium"
          >
            Next: Generate Design →
          </Link>
        </div>
      </div>
    </main>
  )
}

