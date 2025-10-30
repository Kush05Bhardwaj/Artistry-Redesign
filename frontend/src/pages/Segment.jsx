import { useState } from "react"
import { Layout, CheckCircle2, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"

export default function Segment() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [segmentedImage, setSegmentedImage] = useState(null)
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

  const handleSegment = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setSegmentedImage(uploadedImage)
    setIsProcessing(false)
  }

  return (
    <main className="min-h-screen bg-white pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Layout className="w-8 h-8 text-blue-700" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Image Segmentation</h1>
          <p className="text-lg text-gray-600">Segment room elements for precise design analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8">
            {uploadedImage ? (
              <div>
                <img src={uploadedImage} alt="Uploaded room" className="w-full rounded-lg mb-4 max-h-96 object-cover" />
                <div className="flex gap-3">
                  <button
                    onClick={handleSegment}
                    disabled={isProcessing}
                    className="flex-1 bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors font-medium disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                        Segmenting...
                      </>
                    ) : (
                      "Segment Image"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setUploadedImage(null)
                      setSegmentedImage(null)
                    }}
                    className="px-6 py-3 border-2 border-blue-700 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
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
                  id="upload-segment"
                />
                <label htmlFor="upload-segment" className="cursor-pointer">
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

          {/* Segmented Results */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Segmented Image</h2>
            {segmentedImage ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img src={segmentedImage} alt="Segmented room" className="w-full max-h-96 object-cover" />
                <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center h-96 flex items-center justify-center">
                <p className="text-gray-500">Segmented image will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-center gap-4">
          <Link
            to="/detect"
            className="border-2 border-gray-700 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            ← Back to Detection
          </Link>
          <Link
            to="/advise"
            className="bg-amber-700 text-white px-8 py-3 rounded-lg hover:bg-amber-800 transition-colors font-medium"
          >
            Next: Design Advice →
          </Link>
        </div>
      </div>
    </main>
  )
}

