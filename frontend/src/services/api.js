/**
 * API Service Layer for Artistry Backend Integration
 * Handles all communication with backend microservices
 */

// API Base URLs from environment variables
const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || 'http://localhost:8000'
const DETECT_API = import.meta.env.VITE_DETECT_API || 'http://localhost:8001'
const SEGMENT_API = import.meta.env.VITE_SEGMENT_API || 'http://localhost:8002'
const ADVISE_API = import.meta.env.VITE_ADVISE_API || 'http://localhost:8003'
const GENERATE_API = import.meta.env.VITE_GENERATE_API || 'http://localhost:8004'

/**
 * Generic error handler for API calls
 */
const handleApiError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.message || `HTTP Error ${response.status}`)
  }
  return response
}

/**
 * DETECT SERVICE (Port 8001)
 * YOLOv8 Object Detection
 */
export const detectObjects = async (imageFile) => {
  try {
    const formData = new FormData()
    formData.append('file', imageFile)

    const response = await fetch(`${DETECT_API}/detect/`, {
      method: 'POST',
      body: formData,
    })

    await handleApiError(response)
    const data = await response.json()
    
    return {
      objects: data.objects || [],
      annotatedImage: data.annotated_image || null,  // Backend uses snake_case
      confidence: data.confidence || [],
      boundingBoxes: data.bounding_boxes || []  // Backend uses snake_case
    }
  } catch (error) {
    console.error('Detect API Error:', error)
    throw new Error(`Object detection failed: ${error.message}`)
  }
}

/**
 * SEGMENT SERVICE (Port 8002)
 * MobileSAM Image Segmentation
 */
export const segmentImage = async (imageFile, numSamples = 10) => {
  try {
    const formData = new FormData()
    formData.append('file', imageFile)
    formData.append('num_samples', numSamples.toString())

    const response = await fetch(`${SEGMENT_API}/segment/`, {
      method: 'POST',
      body: formData,
    })

    await handleApiError(response)
    const data = await response.json()
    
    return {
      segmentedImage: data.segmented_image || null,  // Backend uses snake_case
      masks: data.masks || [],
      numSegments: data.num_segments || 0  // Backend uses snake_case
    }
  } catch (error) {
    console.error('Segment API Error:', error)
    throw new Error(`Image segmentation failed: ${error.message}`)
  }
}

/**
 * ADVISE SERVICE (Port 8003)
 * LLaVA-7B Design Advice
 */
export const getDesignAdvice = async (imageFile, prompt = 'Analyze this room and provide interior design recommendations') => {
  try {
    const formData = new FormData()
    formData.append('file', imageFile)
    formData.append('prompt', prompt)

    const response = await fetch(`${ADVISE_API}/advise/`, {
      method: 'POST',
      body: formData,
    })

    await handleApiError(response)
    const data = await response.json()
    
    // Parse the advice text into array of recommendations
    const adviceText = data.advice || data.response || ''
    const adviceList = adviceText
      .split(/\n+/)
      .filter(line => line.trim())
      .map(line => line.replace(/^[\d\.\-\*]\s*/, '').trim())
      .filter(line => line.length > 0)
    
    return {
      advice: adviceList,
      fullText: adviceText,
      prompt: data.prompt || prompt
    }
  } catch (error) {
    console.error('Advise API Error:', error)
    throw new Error(`Design advice generation failed: ${error.message}`)
  }
}

/**
 * Get structured design advice with detection data
 */
export const getStructuredAdvice = async (detectionData, styleIntent = 'modern minimalist') => {
  try {
    const response = await fetch(`${ADVISE_API}/advise/structured`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_type: detectionData.roomType || 'bedroom',
        objects_detected: detectionData.objects || [],
        lighting: detectionData.lighting || 'natural',
        room_size: detectionData.roomSize || 'medium',
        style_intent: styleIntent,
        user_prompt: detectionData.userPrompt || null
      }),
    })

    await handleApiError(response)
    const data = await response.json()
    
    return {
      recommendations: data.recommendations || '',
      structuredPrompt: data.structured_prompt_for_generation || '',
      inputData: data.input_data || {}
    }
  } catch (error) {
    console.error('Structured Advise API Error:', error)
    throw new Error(`Structured advice generation failed: ${error.message}`)
  }
}

/**
 * INTERACTIVE WORKFLOW: Step 1 - Get initial AI proposal
 */
export const getInitialProposal = async (detectionData) => {
  try {
    const response = await fetch(`${ADVISE_API}/proposal/initial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        detection_data: detectionData
      }),
    })

    await handleApiError(response)
    return await response.json()
  } catch (error) {
    console.error('Initial Proposal API Error:', error)
    throw new Error(`Initial proposal generation failed: ${error.message}`)
  }
}

/**
 * INTERACTIVE WORKFLOW: Step 2 - Refine proposal with user feedback
 */
export const refineProposal = async (initialProposal, userPreferences, detectionData) => {
  try {
    const response = await fetch(`${ADVISE_API}/proposal/refine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        initial_proposal: initialProposal,
        user_preferences: userPreferences,
        detection_data: detectionData
      }),
    })

    await handleApiError(response)
    return await response.json()
  } catch (error) {
    console.error('Refine Proposal API Error:', error)
    throw new Error(`Proposal refinement failed: ${error.message}`)
  }
}

/**
 * STAGE 4: Convert refined design to structured prompt
 */
export const generatePromptFromDesign = async (refinedDesign) => {
  try {
    const response = await fetch(`${ADVISE_API}/prompt/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refined_design: refinedDesign }),
    })

    await handleApiError(response)
    return await response.json()
  } catch (error) {
    console.error('Prompt Generation API Error:', error)
    throw new Error(`Prompt generation failed: ${error.message}`)
  }
}

/**
 * GENERATE SERVICE (Port 8004)
 * Stable Diffusion + ControlNet img2img Generation with Two-Pass Support
 */
export const generateDesign = async (
  imageFile, 
  prompt = 'Modern minimalist bedroom redesign. Neutral warm palette with beige and soft grey tones.', 
  options = {}
) => {
  try {
    const {
      numInferenceSteps = 30,
      guidanceScale = 7.5,
      mode = 'balanced',  // 'subtle', 'balanced', 'bold'
      twoPass = false,  // Enable two-pass generation
      controlnetConditioningScale = 1.0
    } = options

    const formData = new FormData()
    formData.append('file', imageFile)
    formData.append('prompt', prompt)
    formData.append('num_inference_steps', numInferenceSteps.toString())
    formData.append('guidance_scale', guidanceScale.toString())
    formData.append('mode', mode)
    formData.append('two_pass', twoPass.toString())
    formData.append('controlnet_conditioning_scale', controlnetConditioningScale.toString())

    const response = await fetch(`${GENERATE_API}/generate/`, {
      method: 'POST',
      body: formData,
    })

    await handleApiError(response)
    const data = await response.json()
    
    return {
      generatedImage: data.generated_image || null,
      originalImage: data.original_image || null,
      prompt: data.prompt || prompt,
      cannyImage: data.canny_image || null,
      passAImage: data.pass_a_image || null,  // Two-pass intermediate result
      parameters: data.parameters || {}
    }
  } catch (error) {
    console.error('Generate API Error:', error)
    throw new Error(`Design generation failed: ${error.message}`)
  }
}

/**
 * ===========================================
 * NEW MVP FEATURES - PHASE 1
 * ===========================================
 */

/**
 * COST ESTIMATION (NEW)
 * Get India-specific pricing for detected objects
 */
export const estimateTotalCost = async (detectedObjects, budget = 'medium', roomSizeSqft = 150) => {
  try {
    const response = await fetch(`${ADVISE_API}/estimate/total-cost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        detected_objects: detectedObjects,
        budget: budget,
        room_size_sqft: roomSizeSqft
      }),
    })

    await handleApiError(response)
    const data = await response.json()
    
    return {
      budgetTier: data.budget_tier,
      totalCostInr: data.total_cost_inr,
      breakdown: data.breakdown,
      perItemCosts: data.per_item_costs,
      diyVsProfessional: data.diy_vs_professional,
      roomSizeSqft: data.room_size_sqft,
      itemsCount: data.items_count,
      currency: data.currency
    }
  } catch (error) {
    console.error('Cost Estimation API Error:', error)
    throw new Error(`Cost estimation failed: ${error.message}`)
  }
}

/**
 * DIY INSTRUCTIONS (NEW)
 * Get step-by-step DIY guidance
 */
export const getDIYInstructions = async (item, budget = 'medium') => {
  try {
    const response = await fetch(`${ADVISE_API}/diy/instructions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item: item,
        budget: budget
      }),
    })

    await handleApiError(response)
    const data = await response.json()
    
    return {
      item: data.item,
      difficulty: data.difficulty,
      estimatedTimeHours: data.estimated_time_hours,
      skillLevel: data.skill_level,
      totalCostDiyInr: data.total_cost_diy_inr,
      totalCostProfessionalInr: data.total_cost_professional_inr,
      savingsInr: data.savings_inr,
      steps: data.steps,
      toolsNeeded: data.tools_needed,
      materialsChecklist: data.materials_checklist,
      safetyTips: data.safety_tips,
      commonMistakes: data.common_mistakes,
      proTips: data.pro_tips,
      professionalOption: data.professional_option
    }
  } catch (error) {
    console.error('DIY Instructions API Error:', error)
    throw new Error(`DIY instructions failed: ${error.message}`)
  }
}

/**
 * USER AUTHENTICATION (NEW)
 * Sign up new user
 */
export const signupUser = async (email, password, name) => {
  try {
    const response = await fetch(`${API_GATEWAY}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        name: name
      }),
    })

    await handleApiError(response)
    const data = await response.json()
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('artistry_token', data.token)
      localStorage.setItem('artistry_user', JSON.stringify({
        id: data.user_id,
        email: data.email,
        name: data.name
      }))
    }
    
    return {
      userId: data.user_id,
      email: data.email,
      name: data.name,
      token: data.token,
      createdAt: data.created_at
    }
  } catch (error) {
    console.error('Signup API Error:', error)
    throw new Error(`Signup failed: ${error.message}`)
  }
}

/**
 * USER AUTHENTICATION (NEW)
 * Login existing user
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_GATEWAY}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      }),
    })

    await handleApiError(response)
    const data = await response.json()
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('artistry_token', data.token)
      localStorage.setItem('artistry_user', JSON.stringify({
        id: data.user_id,
        email: data.email,
        name: data.name
      }))
    }
    
    return {
      userId: data.user_id,
      email: data.email,
      name: data.name,
      token: data.token
    }
  } catch (error) {
    console.error('Login API Error:', error)
    throw new Error(`Login failed: ${error.message}`)
  }
}

/**
 * USER AUTHENTICATION (NEW)
 * Verify token
 */
export const verifyToken = async (token) => {
  try {
    const response = await fetch(`${API_GATEWAY}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token
      }),
    })

    await handleApiError(response)
    const data = await response.json()
    
    return {
      valid: data.valid,
      userId: data.user_id,
      email: data.email
    }
  } catch (error) {
    console.error('Token Verification API Error:', error)
    // Clear invalid token
    localStorage.removeItem('artistry_token')
    localStorage.removeItem('artistry_user')
    return { valid: false }
  }
}

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('artistry_user')
  return userStr ? JSON.parse(userStr) : null
}

/**
 * Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem('artistry_token')
  localStorage.removeItem('artistry_user')
}

/**
 * SAVE & SHARE DESIGNS (NEW)
 * Save design to MongoDB
 */
export const saveDesignToCloud = async (designData) => {
  try {
    const token = localStorage.getItem('artistry_token')
    const user = getCurrentUser()
    
    const response = await fetch(`${API_GATEWAY}/designs/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        user_id: user?.id || 'guest',
        design_name: designData.designName || 'Untitled Design',
        room_type: designData.roomType || 'bedroom',
        original_image: designData.originalImage,
        generated_image: designData.generatedImage,
        detected_objects: designData.detectedObjects || [],
        suggestions: designData.suggestions || [],
        cost_estimate: designData.costEstimate || null
      }),
    })

    await handleApiError(response)
    const data = await response.json()
    
    return {
      designId: data.design_id,
      message: data.message,
      savedAt: data.saved_at
    }
  } catch (error) {
    console.error('Save Design API Error:', error)
    throw new Error(`Failed to save design: ${error.message}`)
  }
}

/**
 * SAVE & SHARE DESIGNS (NEW)
 * Generate shareable link
 */
export const shareDesign = async (designId, platform = 'whatsapp') => {
  try {
    const response = await fetch(`${API_GATEWAY}/designs/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        design_id: designId,
        platform: platform
      }),
    })

    await handleApiError(response)
    const data = await response.json()
    
    return {
      shareUrl: data.share_url,
      platform: data.platform,
      message: data.message
    }
  } catch (error) {
    console.error('Share Design API Error:', error)
    throw new Error(`Failed to share design: ${error.message}`)
  }
}

/**
 * List user's saved designs
 */
export const listUserDesigns = async (limit = 10) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('User not logged in')
    }
    
    const response = await fetch(`${API_GATEWAY}/designs/list?user_id=${user.id}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    await handleApiError(response)
    const data = await response.json()
    
    return {
      designs: data.designs,
      count: data.count
    }
  } catch (error) {
    console.error('List Designs API Error:', error)
    throw new Error(`Failed to list designs: ${error.message}`)
  }
}

/**
 * GATEWAY SERVICE (Port 8000)
 * Save design to MongoDB (Legacy - kept for compatibility)
 */
export const saveDesign = async (designData) => {
  // Use new saveDesignToCloud function
  return saveDesignToCloud(designData)
}

/**
 * FULL WORKFLOW
 * Run all services in sequence
 */
export const runFullWorkflow = async (
  imageFile, 
  prompt = 'Modern minimalist interior design',
  onProgress = null
) => {
  try {
    const results = {}

    // Step 1: Detect Objects
    if (onProgress) onProgress('Detecting objects...', 25)
    results.detection = await detectObjects(imageFile)

    // Step 2: Segment Image
    if (onProgress) onProgress('Segmenting image...', 40)
    results.segmentation = await segmentImage(imageFile)

    // Step 3: Get Design Advice
    if (onProgress) onProgress('Analyzing design...', 60)
    results.advice = await getDesignAdvice(imageFile)

    // Step 4: Generate New Design
    if (onProgress) onProgress('Generating new design...', 80)
    results.generation = await generateDesign(imageFile, prompt)

    // Step 5: Save to Database (optional)
    if (onProgress) onProgress('Saving results...', 95)
    try {
      await saveDesign({
        originalImage: null, // Base64 can be large, handle separately
        detectedObjects: results.detection.objects,
        segmentedImage: results.segmentation.segmentedImage,
        advice: results.advice.advice,
        generatedImage: results.generation.generatedImage,
        prompt: prompt,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.warn('Failed to save design (MongoDB may not be configured):', error.message)
      // Continue anyway - saving is optional
    }

    if (onProgress) onProgress('Complete!', 100)
    return results
  } catch (error) {
    console.error('Full Workflow Error:', error)
    throw error
  }
}

/**
 * Health check for all services
 */
export const checkServicesHealth = async () => {
  const services = [
    { name: 'Gateway', url: `${API_GATEWAY}/` },
    { name: 'Detect', url: `${DETECT_API}/` },
    { name: 'Segment', url: `${SEGMENT_API}/` },
    { name: 'Advise', url: `${ADVISE_API}/` },
    { name: 'Generate', url: `${GENERATE_API}/` },
  ]

  const results = await Promise.allSettled(
    services.map(async (service) => {
      try {
        const response = await fetch(service.url, { method: 'GET' })
        return {
          name: service.name,
          status: response.ok ? 'online' : 'offline',
          url: service.url
        }
      } catch (error) {
        return {
          name: service.name,
          status: 'offline',
          url: service.url,
          error: error.message
        }
      }
    })
  )

  return results.map(result => result.status === 'fulfilled' ? result.value : result.reason)
}

// Export API URLs for reference
export const API_URLS = {
  GATEWAY: API_GATEWAY,
  DETECT: DETECT_API,
  SEGMENT: SEGMENT_API,
  ADVISE: ADVISE_API,
  GENERATE: GENERATE_API
}
