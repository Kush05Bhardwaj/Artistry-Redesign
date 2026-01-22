import { useState, useRef } from "react"
import { 
  Upload, Wand2, Loader2, CheckCircle2, DollarSign, 
  Hammer, Share2, Download, AlertCircle, IndianRupee,
  Clock, TrendingDown, Info, ExternalLink, ChevronDown,
  ChevronUp, ShoppingCart
} from "lucide-react"
import { 
  detectObjects, 
  segmentImage, 
  getDesignAdvice,
  generateDesign,
  estimateTotalCost,
  getDIYInstructions,
  saveDesignToCloud,
  shareDesign
} from "../services/api"

export default function MVPWorkflow() {
  // Upload state
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const fileInputRef = useRef(null)

  // Workflow state
  const [currentStep, setCurrentStep] = useState(1) // 1-6
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  // Budget selection
  const [selectedBudget, setSelectedBudget] = useState('medium')
  const [roomSize, setRoomSize] = useState(150)

  // Results
  const [detectionResult, setDetectionResult] = useState(null)
  const [segmentationResult, setSegmentationResult] = useState(null)
  const [adviceResult, setAdviceResult] = useState(null)
  const [generationResult, setGenerationResult] = useState(null)
  const [costEstimate, setCostEstimate] = useState(null)
  const [diyInstructions, setDiyInstructions] = useState({})
  const [savedDesignId, setSavedDesignId] = useState(null)

  // UI state
  const [selectedDIYItem, setSelectedDIYItem] = useState(null)
  const [expandedSteps, setExpandedSteps] = useState({})

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target.result)
      setCurrentStep(2)
    }
    reader.readAsDataURL(file)
  }

  // Step 1: Detect objects
  const runDetection = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const result = await detectObjects(uploadedFile)
      setDetectionResult(result)
      setCurrentStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Step 2: Get AI advice
  const runAdvice = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const result = await getDesignAdvice(uploadedFile)
      setAdviceResult(result)
      
      // Auto-run cost estimation
      if (detectionResult?.objects && detectionResult.objects.length > 0) {
        const cost = await estimateTotalCost(
          detectionResult.objects,
          selectedBudget,
          roomSize
        )
        setCostEstimate(cost)
      }
      
      setCurrentStep(4)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Step 3: Generate before-after visual
  const runGeneration = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const prompt = adviceResult?.fullText || 'Modern interior design transformation'
      const result = await generateDesign(uploadedFile, prompt, {
        mode: selectedBudget === 'low' ? 'subtle' : selectedBudget === 'high' ? 'bold' : 'balanced'
      })
      setGenerationResult(result)
      setCurrentStep(5)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Step 4: Get DIY instructions for an item
  const loadDIYInstructions = async (item) => {
    if (diyInstructions[item]) {
      setSelectedDIYItem(item)
      return
    }

    setIsProcessing(true)
    setError(null)
    
    try {
      const result = await getDIYInstructions(item, selectedBudget)
      setDiyInstructions(prev => ({ ...prev, [item]: result }))
      setSelectedDIYItem(item)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Step 5: Save design
  const saveDesign = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const result = await saveDesignToCloud({
        designName: `Room Redesign ${new Date().toLocaleDateString()}`,
        roomType: 'bedroom', // Could be detected
        originalImage: uploadedImage,
        generatedImage: generationResult?.generatedImage,
        detectedObjects: detectionResult?.objects || [],
        suggestions: adviceResult?.advice || [],
        costEstimate: costEstimate
      })
      
      setSavedDesignId(result.designId)
      setCurrentStep(6)
    } catch (err) {
      // MongoDB might not be configured - that's OK for MVP
      console.warn('Save failed (MongoDB not configured):', err.message)
      setCurrentStep(6) // Continue to share anyway
    } finally {
      setIsProcessing(false)
    }
  }

  // Step 6: Share design
  const handleShare = async (platform) => {
    if (!savedDesignId) {
      // Try to save first
      await saveDesign()
      return
    }

    try {
      const result = await shareDesign(savedDesignId, platform)
      window.open(result.shareUrl, '_blank')
    } catch (err) {
      setError(err.message)
    }
  }

  // Download generated image
  const downloadImage = () => {
    if (!generationResult?.generatedImage) return
    
    const link = document.createElement('a')
    link.href = `data:image/png;base64,${generationResult.generatedImage}`
    link.download = `artistry-design-${Date.now()}.png`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-800 mb-4">
            AI Interior Design - MVP Phase 1
          </h1>
          <p className="text-lg text-gray-600">
            6 Core Features: Analysis • Suggestions • Visuals • Cost • DIY • Share
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            {[
              { num: 1, label: 'Upload', icon: Upload },
              { num: 2, label: 'Analyze', icon: Wand2 },
              { num: 3, label: 'Suggest', icon: CheckCircle2 },
              { num: 4, label: 'Visualize', icon: Wand2 },
              { num: 5, label: 'DIY Guide', icon: Hammer },
              { num: 6, label: 'Save & Share', icon: Share2 }
            ].map(({ num, label, icon: Icon }) => (
              <div key={num} className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-2
                  ${currentStep >= num ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-400'}
                  transition-all duration-300
                `}>
                  {currentStep > num ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <span className={`text-sm ${currentStep >= num ? 'text-amber-800 font-semibold' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Upload Image */}
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-amber-300 rounded-lg p-12 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all"
            >
              <Upload className="w-16 h-16 text-amber-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Upload Your Room Photo
              </h3>
              <p className="text-gray-600 mb-4">
                Click to select an image or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                Supports JPG, PNG • Max 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Step 2: AI Room Analysis */}
        {currentStep === 2 && uploadedImage && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-amber-800 mb-4">
                ✅ Feature 1: AI Room Analysis
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded room"
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-4">Budget & Preferences</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Tier
                    </label>
                    <select
                      value={selectedBudget}
                      onChange={(e) => setSelectedBudget(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="low">Budget (₹ Low Cost)</option>
                      <option value="medium">Medium (₹₹ Moderate)</option>
                      <option value="high">Premium (₹₹₹ Luxury)</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Size (sq ft): {roomSize}
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="500"
                      value={roomSize}
                      onChange={(e) => setRoomSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={runDetection}
                    disabled={isProcessing}
                    className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Start AI Analysis
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: AI Suggestions + Cost Estimate */}
        {currentStep === 3 && detectionResult && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Detection Results */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-amber-800 mb-4">
                ✅ Feature 1 Complete: Objects Detected
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {detectionResult.objects.map((obj, idx) => (
                  <div key={idx} className="bg-amber-50 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">🛋️</div>
                    <div className="font-semibold text-gray-800 capitalize">{obj}</div>
                  </div>
                ))}
              </div>

              {detectionResult.annotatedImage && (
                <img 
                  src={`data:image/jpeg;base64,${detectionResult.annotatedImage}`}
                  alt="Detected objects"
                  className="w-full rounded-lg shadow-md"
                />
              )}
            </div>

            {/* Get AI Advice */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-amber-800 mb-4">
                ✅ Feature 2: AI Decor Suggestions
              </h2>
              
              <button
                onClick={runAdvice}
                disabled={isProcessing}
                className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Getting AI Suggestions...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Get Design Suggestions & Cost Estimate
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Suggestions, Cost & Generate */}
        {currentStep === 4 && adviceResult && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* AI Suggestions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-amber-800 mb-4">
                ✅ Feature 2: AI Design Suggestions
              </h2>
              
              <div className="space-y-3">
                {adviceResult.advice.map((suggestion, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Estimate */}
            {costEstimate && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                  <IndianRupee className="w-6 h-6" />
                  ✅ Feature 4: Cost Estimation (India Pricing)
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg">
                    <div className="text-sm text-amber-700 mb-1">Total Cost</div>
                    <div className="text-3xl font-bold text-amber-900">
                      ₹{costEstimate.totalCostInr.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                    <div className="text-sm text-green-700 mb-1">DIY Savings</div>
                    <div className="text-3xl font-bold text-green-900">
                      ₹{costEstimate.diyVsProfessional.savings_diy_inr.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Save {costEstimate.diyVsProfessional.savings_percentage}%
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <div className="text-sm text-blue-700 mb-1">Timeline</div>
                    <div className="text-3xl font-bold text-blue-900">
                      {costEstimate.breakdown.timeline_days} days
                    </div>
                  </div>
                </div>

                {/* Per Item Costs */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg mb-3">Cost Breakdown:</h3>
                  {costEstimate.perItemCosts.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-lg capitalize">{item.item}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-amber-900">
                            ₹{item.total_cost_inr.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                        <div>
                          <span className="text-gray-600">Materials:</span>
                          <span className="font-semibold ml-2">₹{item.material_cost_inr.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Labor:</span>
                          <span className="font-semibold ml-2">₹{item.labor_cost_inr.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Where to buy:</span>
                        <span className="ml-2 text-amber-700">{item.where_to_buy}</span>
                      </div>
                      
                      {item.diy_savings_inr > 0 && (
                        <div className="mt-2 bg-green-50 p-2 rounded text-sm text-green-700">
                          💰 DIY saves ₹{item.diy_savings_inr.toLocaleString()} ({item.diy_savings_percentage}%)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-amber-800 mb-4">
                ✅ Feature 3: Before-After Visuals
              </h2>
              
              <button
                onClick={runGeneration}
                disabled={isProcessing}
                className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Design (30-60 seconds)...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate Before-After Visualization
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Before-After + DIY Instructions */}
        {currentStep === 5 && generationResult && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Before-After Comparison */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-amber-800 mb-4">
                ✅ Feature 3: Before-After Transformation
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h3 className="font-semibold mb-2 text-center">Before</h3>
                  <img 
                    src={uploadedImage}
                    alt="Before"
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 text-center">After (AI Generated)</h3>
                  <img 
                    src={`data:image/png;base64,${generationResult.generatedImage}`}
                    alt="After"
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
              </div>

              <button
                onClick={downloadImage}
                className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Generated Design
              </button>
            </div>

            {/* DIY Instructions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                <Hammer className="w-6 h-6" />
                ✅ Feature 5: DIY Guidance
              </h2>
              
              <p className="text-gray-600 mb-4">
                Select an item to see step-by-step DIY instructions:
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {detectionResult.objects.map((obj, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadDIYInstructions(obj)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedDIYItem === obj 
                        ? 'border-amber-600 bg-amber-50' 
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🔨</div>
                    <div className="font-semibold capitalize text-sm">{obj}</div>
                  </button>
                ))}
              </div>

              {/* DIY Instructions Display */}
              {selectedDIYItem && diyInstructions[selectedDIYItem] && (
                <div className="border-t-2 border-amber-200 pt-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-3 capitalize">
                      DIY Guide: {selectedDIYItem}
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-blue-700">Difficulty</div>
                        <div className="font-semibold capitalize">{diyInstructions[selectedDIYItem].difficulty}</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-sm text-purple-700">Time</div>
                        <div className="font-semibold">{diyInstructions[selectedDIYItem].estimatedTimeHours}h</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm text-green-700">DIY Cost</div>
                        <div className="font-semibold">₹{diyInstructions[selectedDIYItem].totalCostDiyInr.toLocaleString()}</div>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <div className="text-sm text-amber-700">You Save</div>
                        <div className="font-semibold">₹{diyInstructions[selectedDIYItem].savingsInr.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold">Steps:</h4>
                      {diyInstructions[selectedDIYItem].steps.map((step, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => setExpandedSteps(prev => ({ ...prev, [idx]: !prev[idx] }))}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                                {step.step}
                              </div>
                              <span className="font-semibold text-left">{step.title}</span>
                            </div>
                            {expandedSteps[idx] ? <ChevronUp /> : <ChevronDown />}
                          </button>
                          
                          {expandedSteps[idx] && (
                            <div className="p-4 bg-gray-50 border-t">
                              <p className="text-gray-700 mb-3">{step.description}</p>
                              
                              {step.tips && (
                                <div className="bg-blue-50 p-3 rounded mb-3">
                                  <div className="font-semibold text-blue-900 mb-1">💡 Tips:</div>
                                  <p className="text-sm text-blue-700">{step.tips}</p>
                                </div>
                              )}
                              
                              {step.safety_warning && (
                                <div className="bg-red-50 p-3 rounded mb-3">
                                  <div className="font-semibold text-red-900 mb-1">⚠️ Safety:</div>
                                  <p className="text-sm text-red-700">{step.safety_warning}</p>
                                </div>
                              )}
                              
                              {step.video_url && (
                                <a 
                                  href={step.video_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-600 hover:text-amber-700 flex items-center gap-2 text-sm"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Watch video tutorial
                                </a>
                              )}
                              
                              <div className="text-sm text-gray-600 mt-3">
                                ⏱️ Duration: {step.duration_minutes} minutes
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Tools & Materials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">🔧 Tools Needed:</h4>
                        <div className="space-y-2">
                          {diyInstructions[selectedDIYItem].toolsNeeded.map((tool, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded flex justify-between">
                              <span>{tool.name}</span>
                              <span className="text-amber-700 font-semibold">₹{tool.cost_inr}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">📦 Materials:</h4>
                        <div className="space-y-2">
                          {diyInstructions[selectedDIYItem].materialsChecklist.map((material, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">{material.item}</span>
                                <span className="text-amber-700 font-semibold">{material.budget_range}</span>
                              </div>
                              <div className="text-sm text-gray-600">{material.where}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={saveDesign}
                disabled={isProcessing}
                className="w-full mt-6 bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Continue to Save & Share
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Save & Share */}
        {currentStep === 6 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-amber-800 mb-4">
                🎉 Design Complete!
              </h2>
              
              <p className="text-gray-600 mb-8">
                Your design has been generated. Share it with friends or download for later!
              </p>

              {/* Share Buttons */}
              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-lg mb-4">✅ Feature 6: Save & Share Designs</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex flex-col items-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('facebook')}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex flex-col items-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">Facebook</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('twitter')}
                    className="bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-lg flex flex-col items-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">Twitter</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('pinterest')}
                    className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex flex-col items-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">Pinterest</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="bg-blue-700 hover:bg-blue-800 text-white py-3 px-4 rounded-lg flex flex-col items-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">LinkedIn</span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-amber-50 p-6 rounded-lg text-left mb-6">
                <h4 className="font-bold text-lg mb-4">📊 Project Summary:</h4>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Objects Detected:</div>
                    <div className="font-semibold">{detectionResult?.objects.length || 0} items</div>
                  </div>
                  
                  {costEstimate && (
                    <>
                      <div>
                        <div className="text-gray-600">Total Cost:</div>
                        <div className="font-semibold">₹{costEstimate.totalCostInr.toLocaleString()}</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-600">DIY Savings:</div>
                        <div className="font-semibold text-green-600">
                          ₹{costEstimate.diyVsProfessional.savings_diy_inr.toLocaleString()}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-gray-600">Timeline:</div>
                        <div className="font-semibold">{costEstimate.breakdown.timeline_days} days</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setCurrentStep(1)
                    setUploadedFile(null)
                    setUploadedImage(null)
                    setDetectionResult(null)
                    setAdviceResult(null)
                    setGenerationResult(null)
                    setCostEstimate(null)
                    setDiyInstructions({})
                    setSavedDesignId(null)
                  }}
                  className="bg-gray-700 text-white py-3 px-8 rounded-lg hover:bg-gray-800"
                >
                  Start New Design
                </button>
                
                <button
                  onClick={downloadImage}
                  className="bg-amber-600 text-white py-3 px-8 rounded-lg hover:bg-amber-700 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feature Summary Footer */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            ✅ MVP Phase 1 Features • Made in India 🇮🇳 • Powered by AI
          </p>
        </div>
      </div>
    </div>
  )
}
