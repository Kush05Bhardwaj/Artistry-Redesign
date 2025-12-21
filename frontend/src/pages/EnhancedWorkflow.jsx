import { useState } from "react"
import { 
  Wand2, Upload, Loader2, CheckCircle2, AlertCircle, 
  DollarSign, Palette, ShoppingCart, Info 
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Slider } from "../../components/ui/slider"

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000"

export default function EnhancedWorkflow() {
  // Image upload
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  
  // Workflow state
  const [currentPhase, setCurrentPhase] = useState("upload") // upload, preferences, processing, results
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  
  // User preferences
  const [sessionId, setSessionId] = useState(null)
  const [budget, setBudget] = useState("medium")
  const [designTips, setDesignTips] = useState("")
  const [detectedObjects, setDetectedObjects] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [conditionEstimates, setConditionEstimates] = useState({})
  
  // Results
  const [workflowResult, setWorkflowResult] = useState(null)
  const [shoppingMatches, setShoppingMatches] = useState({})

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const dataUrl = event.target.result
      setUploadedImage(dataUrl)
      
      // Extract base64 (remove data:image/...;base64, prefix)
      const base64 = dataUrl.split(',')[1]
      setImageBase64(base64)
      
      // Auto-detect objects to show in preferences
      await detectObjectsForPreferences(base64)
    }
    reader.readAsDataURL(file)
  }

  // Quick detect for item selection
  const detectObjectsForPreferences = async (base64) => {
    try {
      const response = await fetch(`${API_BASE}/detect/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_b64: base64 })
      })
      
      const data = await response.json()
      const objects = data.objects || []
      setDetectedObjects(objects)
      
      // Auto-select items marked as "old" (we'll get this after condition analysis)
      setCurrentPhase("preferences")
    } catch (err) {
      console.error("Detection failed:", err)
      setCurrentPhase("preferences") // Still allow manual selection
    }
  }

  // Collect preferences and start workflow
  const handleSubmitPreferences = async () => {
    if (selectedItems.length === 0) {
      setError("Please select at least one item to replace")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Step 1: Save preferences
      const prefsResponse = await fetch(`${API_BASE}/api/collect-preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget_range: budget,
          design_tips: designTips,
          item_replacement: selectedItems,
          session_id: sessionId
        })
      })

      const prefsData = await prefsResponse.json()
      setSessionId(prefsData.session_id)

      // Step 2: Run enhanced workflow
      setCurrentPhase("processing")
      
      const workflowResponse = await fetch(`${API_BASE}/workflow/enhanced`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_b64: imageBase64,
          session_id: prefsData.session_id,
          base_prompt: designTips || "Modern interior design"
        })
      })

      if (!workflowResponse.ok) {
        throw new Error("Workflow failed")
      }

      const workflowData = await workflowResponse.json()
      setWorkflowResult(workflowData)
      setConditionEstimates(workflowData.condition_analysis || {})

      // Step 3: Get shopping recommendations
      await fetchShoppingMatches(workflowData.shopping_metadata, budget)

      setCurrentPhase("results")
    } catch (err) {
      setError(err.message || "Something went wrong")
      setCurrentPhase("preferences")
    } finally {
      setIsProcessing(false)
    }
  }

  // Fetch product matches for shopping
  const fetchShoppingMatches = async (shoppingMetadata, budgetTier) => {
    if (!shoppingMetadata || shoppingMetadata.length === 0) return

    const matches = {}

    for (const item of shoppingMetadata) {
      try {
        const response = await fetch(`${API_BASE}/commerce/match-products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item_type: item.item_type,
            style: item.style,
            material: item.material,
            color: item.color,
            budget: budgetTier
          })
        })

        const data = await response.json()
        matches[item.item_type] = data.matches || []
      } catch (err) {
        console.error(`Failed to fetch matches for ${item.item_type}:`, err)
      }
    }

    setShoppingMatches(matches)
  }

  // Toggle item selection
  const toggleItemSelection = (item) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            AI Interior Design Studio
          </h1>
          <p className="text-lg text-slate-600">
            Smart, budget-aware room redesign with shopping recommendations
          </p>
        </div>

        {/* Phase Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {["upload", "preferences", "processing", "results"].map((phase, idx) => (
              <div key={phase} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  ${currentPhase === phase ? "bg-blue-600 text-white" : 
                    ["upload", "preferences", "processing"].indexOf(currentPhase) > idx 
                      ? "bg-green-500 text-white" 
                      : "bg-slate-200 text-slate-500"}
                `}>
                  {idx + 1}
                </div>
                {idx < 3 && <div className="w-12 h-1 bg-slate-200 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 p-4 bg-red-50 border-red-200">
            <div className="flex items-center text-red-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </Card>
        )}

        {/* Upload Phase */}
        {currentPhase === "upload" && (
          <Card className="p-8">
            <div className="text-center">
              <Upload className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold mb-4">Upload Your Room Photo</h2>
              <p className="text-slate-600 mb-6">
                Upload a photo of your room to get started with AI-powered redesign
              </p>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="inline-block cursor-pointer">
                <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
                  <Upload className="w-4 h-4" />
                  Choose Image
                </div>
              </label>

              {uploadedImage && (
                <div className="mt-6">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded room" 
                    className="max-w-md mx-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Preferences Phase */}
        {currentPhase === "preferences" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-green-600" />
                Budget Range
              </h2>
              
              <div className="grid grid-cols-3 gap-4">
                {["low", "medium", "high"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setBudget(level)}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${budget === level 
                        ? "border-blue-600 bg-blue-50" 
                        : "border-slate-200 hover:border-slate-300"}
                    `}
                  >
                    <div className="font-semibold capitalize">{level}</div>
                    <div className="text-sm text-slate-600">
                      {level === "low" && "$150-$500"}
                      {level === "medium" && "$500-$2,000"}
                      {level === "high" && "$2,000+"}
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Palette className="w-6 h-6 mr-2 text-purple-600" />
                Design Preferences
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label>What's your design style?</Label>
                  <Input
                    placeholder="e.g., Modern minimalist with warm wood tones"
                    value={designTips}
                    onChange={(e) => setDesignTips(e.target.value)}
                    className="mt-2"
                  />
                </div>
                
                <div className="text-sm text-slate-600">
                  <strong>Examples:</strong> "Cozy and dark", "Bright Scandinavian", 
                  "Luxury hotel vibe", "Bohemian with plants"
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <CheckCircle2 className="w-6 h-6 mr-2 text-blue-600" />
                Items to Replace
              </h2>
              
              {detectedObjects.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {detectedObjects.map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleItemSelection(item)}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${selectedItems.includes(item)
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{item}</span>
                        {selectedItems.includes(item) && (
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      {conditionEstimates[item] === "old" && (
                        <div className="text-xs text-orange-600 mt-1">
                          ⚠️ Needs update
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Detecting room items...</p>
                </div>
              )}
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitPreferences}
                disabled={selectedItems.length === 0 || isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Design ({selectedItems.length} items)
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Processing Phase */}
        {currentPhase === "processing" && (
          <Card className="p-12">
            <div className="text-center">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Creating Your Design</h2>
              <p className="text-slate-600">
                Our AI is analyzing your room and generating a {budget}-budget redesign...
              </p>
              
              <div className="mt-8 space-y-2 text-sm text-slate-500">
                <div>✓ Analyzing room conditions</div>
                <div>✓ Planning budget-aware materials</div>
                <div>✓ Generating realistic design</div>
                <div>✓ Finding shopping matches</div>
              </div>
            </div>
          </Card>
        )}

        {/* Results Phase */}
        {currentPhase === "results" && workflowResult && (
          <div className="space-y-6">
            {/* Generated Design */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Your New Design</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Original</p>
                  <img 
                    src={uploadedImage} 
                    alt="Original" 
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">AI Redesign</p>
                  <img 
                    src={`data:image/png;base64,${workflowResult.generated_image}`}
                    alt="Generated" 
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Budget:</strong> {workflowResult.budget_applied}
                  </div>
                  <div>
                    <strong>Style:</strong> {workflowResult.overall_style}
                  </div>
                  <div>
                    <strong>Items Replaced:</strong> {workflowResult.items_replaced?.join(", ")}
                  </div>
                </div>
              </div>
            </Card>

            {/* Shopping Recommendations */}
            {Object.keys(shoppingMatches).length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <ShoppingCart className="w-6 h-6 mr-2 text-green-600" />
                  Shop This Look
                </h2>

                {Object.entries(shoppingMatches).map(([itemType, matches]) => (
                  <div key={itemType} className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 capitalize">{itemType}</h3>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      {matches.map((product) => (
                        <Card key={product.product_id} className="p-4 hover:shadow-lg transition-shadow">
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                          <h4 className="font-semibold text-sm mb-1">{product.name}</h4>
                          <p className="text-xs text-slate-600 mb-2">{product.vendor}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-green-600">{product.price}</span>
                            <span className="text-xs text-slate-500">
                              {(product.match_score * 100).toFixed(0)}% match
                            </span>
                          </div>
                          <Button 
                            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-sm"
                            onClick={() => window.open(product.url, '_blank')}
                          >
                            Shop Now
                          </Button>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {/* Material Details */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Materials Used</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {workflowResult.shopping_metadata?.map((item) => (
                  <div key={item.item_type} className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold capitalize mb-2">{item.item_type}</h3>
                    <div className="text-sm space-y-1">
                      <div><strong>Material:</strong> {item.material}</div>
                      <div><strong>Style:</strong> {item.style}</div>
                      <div><strong>Color:</strong> {item.color}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  setCurrentPhase("upload")
                  setUploadedImage(null)
                  setWorkflowResult(null)
                  setSelectedItems([])
                }}
                className="bg-slate-600 hover:bg-slate-700"
              >
                Start New Design
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
