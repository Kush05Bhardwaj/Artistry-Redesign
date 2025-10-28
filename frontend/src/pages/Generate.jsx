import { useState } from "react"
import { Wand2, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"

export default function Generate() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)
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

  const handleGenerate = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setGeneratedImage(uploadedImage) // In real app, this would be the AI-generated image
    setIsProcessing(false)
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
                <div className="flex gap-3">
                  <button
                    onClick={handleGenerate}
                    disabled={isProcessing}
                    className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Design"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setUploadedImage(null)
                      setGeneratedImage(null)
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
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img src={generatedImage} alt="Generated design" className="w-full max-h-96 object-cover" />
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

