import { useState, useRef, useEffect } from "react"
import { CheckCircle2, Download, RefreshCw } from "lucide-react"
import { Link } from "react-router-dom"

function BeforeAfterSlider({ beforeImage, afterImage }) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  const handleMouseDown = () => setIsDragging(true)
  const handleMouseUp = () => setIsDragging(false)

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp)
      return () => document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full h-96 rounded-lg overflow-hidden cursor-ew-resize border-2 border-gray-300"
    >
      <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <img src={afterImage} alt="After" className="w-full h-full object-cover" />
      </div>
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
        style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
          <div className="w-1 h-6 bg-linear-to-b from-amber-500 to-amber-700"></div>
        </div>
      </div>
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
        Before
      </div>
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
        After
      </div>
    </div>
  )
}

export default function Final() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result)
        setGeneratedImage(event.target?.result) // In real app, this would be the AI-generated image
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <main className="min-h-screen bg-white pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-700" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Final Output</h1>
          <p className="text-lg text-gray-600">Compare your before and after transformation</p>
        </div>

        {/* Upload Section */}
        {!uploadedImage && (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 mb-8">
            <div className="text-center py-12">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="upload-final"
              />
              <label htmlFor="upload-final" className="cursor-pointer">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 mb-2">Click to upload your room image</p>
                <p className="text-sm text-gray-500">PNG, JPG or GIF up to 10MB</p>
              </label>
            </div>
          </div>
        )}

        {/* Before/After Slider */}
        {uploadedImage && generatedImage && (
          <>
            <div className="mb-8">
              <BeforeAfterSlider beforeImage={uploadedImage} afterImage={generatedImage} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button className="flex items-center gap-2 border-2 border-gray-700 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                <RefreshCw className="w-5 h-5" />
                Start New Design
              </button>
              <button className="flex items-center gap-2 bg-amber-700 text-white px-8 py-3 rounded-lg hover:bg-amber-800 transition-colors font-medium">
                <Download className="w-5 h-5" />
                Download Result
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

