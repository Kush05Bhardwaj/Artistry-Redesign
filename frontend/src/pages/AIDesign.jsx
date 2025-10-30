"use client"

import { useState } from "react"
import { Upload, Loader } from "lucide-react"

export default function AIDesign() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Original Room</h3>
                  <img src={selectedImage || "/placeholder.svg"} alt="Original" className="w-full rounded-lg" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">AI Redesigned</h3>
                  {isLoading ? (
                    <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <Loader className="w-8 h-8 text-amber-700 animate-spin" />
                    </div>
                  ) : (
                    <img src="/modern-redesigned-bedroom.jpg" alt="Redesigned" className="w-full rounded-lg" />
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="flex-1 border-2 border-amber-700 text-amber-700 px-6 py-3 rounded-lg hover:bg-amber-50 transition-colors font-semibold"
                >
                  Upload Different Photo
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="flex-1 bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition-colors font-semibold disabled:opacity-50"
                >
                  {isLoading ? "Generating..." : "Generate Design"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Fast",
              description: "Get AI-powered design suggestions in seconds",
            },
            {
              title: "Accurate",
              description: "Our AI understands your space and style preferences",
            },
            {
              title: "Affordable",
              description: "Professional designs without the professional price tag",
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
