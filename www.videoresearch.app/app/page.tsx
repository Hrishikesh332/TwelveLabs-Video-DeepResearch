"use client"
import InlineVideoPlayer from "@/components/InlineVideoPlayer"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Video, Github, Check, Loader2, Plus, X, Send, ArrowLeft, Info, BookOpen, TrendingUp, Lightbulb } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Label } from "@/components/ui/label"
import { API_CONFIG, APP_CONFIG, ERROR_MESSAGES, validateApiKey, validateVideoFile, formatDuration, formatFileSize } from "@/lib/config"

type IndexItem = { id: string; name: string }
type VideoItem = { 
  id: string; 
  name: string; 
  duration: number; 
  thumbnail_url?: string; 
  video_url?: string;
  width?: number;
  height?: number;
  fps?: number;
  size?: number;
}

type Source = {
  title: string
  url: string
  description: string
  isReal: boolean
  timestamp: Date
  queryContext?: string
  messageId?: string
}

const API_BASE_URL = "http://localhost:5000"

// Component to display website favicon/OG image
function SourceIcon({ url, title }: { url: string; title: string }) {
  const [iconUrl, setIconUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchIcon = async () => {
      try {
        // Extract domain from URL
        const domain = new URL(url).hostname
        
        // Try multiple favicon sources
        const faviconUrls = [
          `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
          `https://favicons.githubusercontent.com/${domain}`,
          `https://${domain}/favicon.ico`,
          `https://${domain}/apple-touch-icon.png`,
          `https://${domain}/favicon-32x32.png`,
          `https://${domain}/favicon-16x16.png`
        ]

        // Try each favicon URL
        for (const faviconUrl of faviconUrls) {
          try {
            const img = new Image()
            img.onload = () => {
              setIconUrl(faviconUrl)
              setIsLoading(false)
            }




            img.onerror = () => {
              // Continue to next URL
            }
            img.src = faviconUrl
            
            // Give it a moment to load
            await new Promise(resolve => setTimeout(resolve, 100))
            if (iconUrl) break
            
          } catch (error) {
            // Continue to next URL
          }
        }
        
        // If no favicon found, set loading to false
        setTimeout(() => setIsLoading(false), 1000)
        
      } catch (error) {
        setIsLoading(false)
      }
    }

    if (url) {
      fetchIcon()
    }
  }, [url])

  if (isLoading) {
    return (
      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
        <div className="w-4 h-4 bg-gray-300 rounded"></div>
      </div>
    )
  }

  if (iconUrl) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img 
          src={iconUrl} 
          alt={`${title} favicon`}
          className="w-6 h-6 rounded-sm object-cover"
          onError={() => {
            // Fallback to default icon if image fails to load
            setIconUrl(null)
          }}
        />
      </div>
    )
  }

  // Fallback to default link icon
  return (
    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    </div>
  )
}

// Component to display video thumbnail with fallback
function VideoThumbnail({ src, alt, className = "w-8 h-8" }: { src?: string; alt: string; className?: string }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  if (!src || imageError) {
    return (
      <div className={`${className} bg-gray-200 rounded flex items-center justify-center flex-shrink-0`}>
        <Video className="w-4 h-4 text-gray-500" />
      </div>
    )
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${className} object-cover rounded transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
      onLoad={() => setImageLoaded(true)}
      onError={() => setImageError(true)}
    />
  )
}

// Logo component using static image
function Logo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <img 
      src="/logo-tl.png" 
      alt="Video Deep Research Logo" 
      className={`${className} object-contain`}
    />
  )
}

export default function DeepResearchLanding() {
  const { toast } = useToast()

  const [isApiModalOpen, setIsApiModalOpen] = useState(false)
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)
  const [isUploadVideoModalOpen, setIsUploadVideoModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false)
  const [currentInfoStep, setCurrentInfoStep] = useState(0)
  
  const infoSteps = [
    {
      title: "Demo of Video Deep Research",
      content: (
        <div className="text-center">
          <div className="mb-6">
            <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🎬</div>
                <p className="text-gray-600">GIF Demo Area</p>
                <p className="text-sm text-gray-500">Video Deep Research in Action</p>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-black mb-3">Welcome to Video Deep Research</h3>
          <p className="text-black text-lg">
            Experience the power of AI-powered research from video content. 
            Get up-to-date insights and reliable sources in seconds.
          </p>
        </div>
      )
    },
    {
      title: "Connect Your API Key",
      content: (
        <div className="text-center">
          <div className="mb-6">
            <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🔑</div>
                <p className="text-gray-600">GIF Tutorial Area</p>
                <p className="text-sm text-gray-500">How to Connect API Key</p>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-black mb-3">Step 1: Connect TwelveLabs API Key</h3>
          <p className="text-black text-lg">
            Start by connecting your TwelveLabs API key to access video analysis capabilities. 
            This enables the platform to analyze your video content and provide deep insights.
          </p>
        </div>
      )
    },
    {
      title: "Get Up-to-Date Sources",
      content: (
        <div className="text-center">
          <div className="mb-6">
            <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-gray-600">GIF Demo Area</p>
                <p className="text-sm text-gray-500">Real-time Source Generation</p>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-black mb-3">Step 2: Access Reliable Sources</h3>
          <p className="text-black text-lg">
            Receive comprehensive research with up-to-date and reputable sources. 
            Our AI analyzes your video content and provides current, relevant information 
            backed by credible sources.
          </p>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentInfoStep < infoSteps.length - 1) {
      setCurrentInfoStep(currentInfoStep + 1)
    }
  }

  const prevStep = () => {
    if (currentInfoStep > 0) {
      setCurrentInfoStep(currentInfoStep - 1)
    }
  }

  const closeModal = () => {
    setIsInfoModalOpen(false)
    setCurrentInfoStep(0)
  }

  const [apiKey, setApiKey] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isUsingEnvKey, setIsUsingEnvKey] = useState(false)
  const [justConnected, setJustConnected] = useState(false)

  const [indexes, setIndexes] = useState<IndexItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState("")
  const [selectedVideo, setSelectedVideo] = useState("")
  const [selectedVideoThumbnail, setSelectedVideoThumbnail] = useState<string | null>(null)
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null)
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)

  const [prompt, setPrompt] = useState("")

  const [isResearching, setIsResearching] = useState(false)
  const [researchStarted, setResearchStarted] = useState(false)
  const [researchSteps, setResearchSteps] = useState<Array<{
    step: string
    status: 'pending' | 'in-progress' | 'completed' | 'error'
    message: string
    timestamp: Date
  }>>([])
  const [streamingContent, setStreamingContent] = useState("")
  const [currentStep, setCurrentStep] = useState("")
  const [currentStepDetail, setCurrentStepDetail] = useState("")
  const [sources, setSources] = useState<Source[]>([])
  
  // Research context for follow-up questions
  const [researchContext, setResearchContext] = useState<{
    twelvelabsAnalysis: string
    sonarResponse: string
    videoDetails: any
    originalQuery: string
  } | null>(null)
  
  // Chat state
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string
    type: 'user' | 'assistant'
    content: string
    timestamp: Date
    sources?: Source[]
  }>>([])
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [showActivitySidebar, setShowActivitySidebar] = useState(false)
  const [activeTab, setActiveTab] = useState<'activity' | 'sources'>('activity')
  const [activityLogs, setActivityLogs] = useState<Array<{
    message: string
    timestamp: Date
    type: 'info' | 'progress' | 'complete' | 'error'
  }>>([])
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStep, setUploadStep] = useState<0 | 1>(0)
  const [isSettingUpDefault, setIsSettingUpDefault] = useState(false)

  // Auto-load data from environment API key on component mount
  useEffect(() => {
    const loadDataFromEnv = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/indexes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
        if (res.ok) {
          const data = await res.json()
          if (data?.success && Array.isArray(data.indexes)) {
            setIndexes(data.indexes)
            setIsConnected(true)
            setIsUsingEnvKey(true)  // Mark as using environment key
            if (data.indexes.length > 0) {
              const firstId = data.indexes[0].id
              setSelectedIndex(firstId)
              await handleIndexChange(firstId)
            }
          }
        }
      } catch (error) {
        console.log("No environment API key available")
      }
    }
    loadDataFromEnv()
  }, [])
  function handleConnect(e?: React.FormEvent) {
    e?.preventDefault?.()
    
    if (!apiKey.trim()) {
      toast({ title: "API key required", description: "Please enter your TwelveLabs API key." })
      return
    }
    
    // Validate API key format
    if (!apiKey.trim().startsWith('tlk_')) {
      toast({ 
        title: "Invalid API key format", 
        description: "Please provide a correct TwelveLabs API key." 
      })
      return
    }
    
    setIsConnecting(true)
    
    ;(async () => {
      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TWELVELABS.CONFIG}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ api_key: apiKey }),
        })
        
        const data = await res.json().catch(() => ({} as any))

        if (!res.ok || !data?.success) {
          const msg = data?.error || `Request failed with status ${res.status}`
          throw new Error(msg)
        }

        // On success: store indexes, mark connected, pulse the tick, and auto-load first index's videos.
        const returnedIndexes = Array.isArray(data.indexes) ? data.indexes : []
        
        setIndexes(returnedIndexes)
        setIsConnected(true)
        setIsUsingEnvKey(false)  // Mark as using UI key, not environment key
        setIsApiModalOpen(false)
        setJustConnected(true)
        setTimeout(() => setJustConnected(false), 1200)

        if (returnedIndexes.length > 0) {
          const firstId = returnedIndexes[0].id
          setSelectedIndex(firstId)
          await handleIndexChange(firstId)
        }

        toast({ title: "Connected", description: data?.message || "TwelveLabs API key configured successfully." })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Invalid API key: Failed to fetch indexes"
        toast({ title: "Connection failed", description: message })
      } finally {
        setIsConnecting(false)
      }
    })()
  }

  async function handleUseDefault() {
    try {
      // Clear the backend API key first
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TWELVELABS.CONFIG}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      // Clear frontend state regardless of backend response
      setIsConnected(false)
      setIsUsingEnvKey(false)
      setApiKey('')
      setIndexes([])
      setVideos([])
      setSelectedIndex('')
      setSelectedVideo('')
      setSelectedVideoThumbnail(null)
      setSelectedVideoUrl(null)
      
      // Always open the modal to let user connect a new key
      setIsApiModalOpen(true)
      toast({ title: 'Disconnected', description: 'API key disconnected. Please connect a new key.' })
      
    } catch (error) {
      console.error('Error disconnecting:', error)
      // Fallback: just clear frontend state and open modal
      setIsConnected(false)
      setIsUsingEnvKey(false)
      setApiKey('')
      setIndexes([])
      setVideos([])
      setSelectedIndex('')
      setSelectedVideo('')
      setSelectedVideoThumbnail(null)
      setSelectedVideoUrl(null)
      setIsApiModalOpen(true)
      toast({ title: 'Disconnected', description: 'API key disconnected successfully.' })
    }
  }

  async function switchToEnvironmentKey() {
    try {
      // Clear the backend API key first
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TWELVELABS.CONFIG}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      // Reload from environment API key
      const envRes = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TWELVELABS.INDEXES}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      if (envRes.ok) {
        const data = await envRes.json()
        if (data?.success && Array.isArray(data.indexes)) {
          setIndexes(data.indexes)
          setIsConnected(true)
          setIsUsingEnvKey(true)  // Mark as using environment key
          setApiKey('')
          if (data.indexes.length > 0) {
            const firstId = data.indexes[0].id
            setSelectedIndex(firstId)
            await handleIndexChange(firstId)
          }
          setIsApiModalOpen(false)
          toast({ title: 'Switched to Default', description: 'Now using environment API key.' })
          return
        }
      }
      
      // If environment key doesn't work, show error
      toast({ title: 'Error', description: 'Environment API key not available.' })
      
    } catch (error) {
      console.error('Error switching to environment key:', error)
      toast({ title: 'Error', description: 'Failed to switch to environment key.' })
    }
  }

  async function handleIndexChange(indexId: string) {
    setSelectedIndex(indexId)
    setSelectedVideo("")
    setSelectedVideoThumbnail(null)
    setSelectedVideoUrl(null)
    setVideos([])
    if (!indexId) return

    setIsLoadingVideos(true)
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TWELVELABS.VIDEOS}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: isConnected ? undefined : apiKey, index_id: indexId }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Request failed with status ${res.status}`)
      }

      const data = await res.json()
      if (data?.success) {
        const videosList = data.videos || []
        setVideos(videosList)
        
        // Automatically select the first video if available
        if (videosList.length > 0) {
          const firstVideo = videosList[0]
          setSelectedVideo(firstVideo.id)
          setSelectedVideoThumbnail(firstVideo.thumbnail_url || null)
          setSelectedVideoUrl(firstVideo.video_url || null)
        }
      } else {
        throw new Error(data?.error || "Could not load videos for this index.")
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load videos."
      toast({ title: "Error", description: message })
    } finally {
      setIsLoadingVideos(false)
    }
  }

  function addActivityLog(message: string, type: 'info' | 'progress' | 'complete' | 'error' = 'info') {
    setActivityLogs(prev => [...prev, {
      message,
      timestamp: new Date(),
      type
    }])
  }

  // Function to extract real sources from API response
  function extractRealSources(data: any): Source[] {
    if (!data?.sources) return []
    
    // Map the search results to our source format
    return data.sources.map((result: any) => ({
      title: result.title || 'Untitled',
      url: result.url || '#',
      description: result.snippet || result.description || 'No description available',
      isReal: true,
      timestamp: new Date()
    }))
  }

  async function handleStartResearch() {
    if (!canStartResearch) return
    
    setIsResearching(true)
    setResearchStarted(true)
    setResearchSteps([])
    setStreamingContent("")
    setCurrentStep("")
    setCurrentStepDetail("")
    setActivityLogs([])
    setChatMessages([])
    
    // Add initial user message
    setChatMessages([{
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: prompt,
      timestamp: new Date()
    }])
    
    // Add initial activity log
    addActivityLog(`Starting research on: ${prompt}`, 'info')
    
    try {
      const payload = {
        twelvelabs_api_key: isConnected ? undefined : apiKey,
        index_id: selectedIndex,
        video_id: selectedVideo,
        analysis_prompt: prompt.trim(),
        research_query: prompt.trim()
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESEARCH.WORKFLOW}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response reader available')
      }

      let finalData: any = null
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            
            switch (data.type) {
              case 'progress':
                setResearchSteps(prev => {
                  const newSteps = [...prev]
                  const stepIndex = newSteps.findIndex(s => s.step === data.step)
                  if (stepIndex >= 0) {
                    newSteps[stepIndex] = {
                      ...newSteps[stepIndex],
                      status: 'in-progress',
                      message: data.message
                    }
                  } else {
                    newSteps.push({
                      step: data.step,
                      status: 'in-progress',
                      message: data.message,
                      timestamp: new Date()
                    })
                  }
                  return newSteps
                })
                setCurrentStep(data.message)
                addActivityLog(data.step === 'video_details' ? 'Loading video information' :
                              data.step === 'analysis' ? 'Processing video content' :
                              'Researching insights', 'progress')
                break

              case 'data':
                setResearchSteps(prev => {
                  const newSteps = [...prev]
                  const stepIndex = newSteps.findIndex(s => s.step === data.step)
                  if (stepIndex >= 0) {
                    newSteps[stepIndex] = {
                      ...newSteps[stepIndex],
                      status: 'completed',
                      message: `${data.step} completed`
                    }
                  }
                  return newSteps
                })
                addActivityLog(data.step === 'video_details' ? 'Video information ready' :
                              data.step === 'analysis' ? 'Video analysis complete' :
                              'Research phase complete', 'complete')
                break

              case 'complete':
                const responseData = data.data
                finalData = responseData
                setResearchSteps(prev => prev.map(step => ({
                  ...step,
                  status: 'completed'
                })))
                addActivityLog('Research completed', 'complete')

                // Set the research content
                if (responseData.research) {
                  const researchContent = responseData.research.choices?.[0]?.message?.content || responseData.research
                  setStreamingContent(researchContent)
                  
                  // Generate message ID
                  const messageId = `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                  
                  // Get sources from research results
                  let initialSources: Source[] = []
                  if (responseData.research.search_results && Array.isArray(responseData.research.search_results)) {
                    initialSources = responseData.research.search_results.map((result: any) => ({
                      title: result.title || 'Untitled',
                      url: result.url || '#',
                      description: result.snippet || result.description || 'No description available',
                      isReal: true,
                      timestamp: new Date(),
                      queryContext: 'Initial Research',
                      messageId
                    }))
                  }
                  
                  // Add message with its sources
                  setChatMessages(prev => [...prev, {
                    id: messageId,
                    type: 'assistant',
                    content: researchContent,
                    timestamp: new Date(),
                    sources: initialSources
                  }])

                  // Log source discovery
                  if (initialSources.length > 0) {
                    addActivityLog(`Found ${initialSources.length} initial sources`, 'complete')
                  }

                  // Store research context
                  setResearchContext({
                    twelvelabsAnalysis: responseData.analysis || '',
                    sonarResponse: researchContent,
                    videoDetails: responseData.video_details || {},
                    originalQuery: prompt.trim()
                  })
                }
                break

              case 'error':
                throw new Error(data.message)
            }
          } catch (e) {
            console.error('Error parsing stream chunk:', e)
          }
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Research failed'
      
      setResearchSteps(prev => prev.map(step => 
        step.status === 'in-progress' ? { ...step, status: 'error', message: errorMessage } : step
      ))
      setCurrentStep('')
      setCurrentStepDetail('')
      addActivityLog(`Error: ${errorMessage}`, 'error')
      
      toast({
        title: "Research failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsResearching(false)
    }
  }

  async function handleSendMessage() {
    if (!chatInput.trim() || isSendingMessage) return
    
    const userMessage = chatInput.trim()
    setChatInput("")
    setIsSendingMessage(true)
    
    // Add user message to chat
    setChatMessages(prev => [...prev, {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }])
    
    try {
      // Check if we have research context
      if (!researchContext) {
        throw new Error("No research context available. Please start a new research session first.")
      }
      
      // Create enhanced query with full context
      const enhancedQuery = `
Based on the following research context, please answer this follow-up question:

ORIGINAL VIDEO ANALYSIS (TwelveLabs):
${researchContext.twelvelabsAnalysis}

ORIGINAL RESEARCH RESPONSE:
${researchContext.sonarResponse}

ORIGINAL RESEARCH QUERY:
${researchContext.originalQuery}

FOLLOW-UP QUESTION:
${userMessage}

Please provide a comprehensive answer that builds upon the previous research and video analysis, incorporating any new insights or connections that might be relevant to this follow-up question.
`
      
      // Send to Sonar API with API key
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESEARCH.SONAR}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: enhancedQuery,
          api_key: isConnected ? undefined : apiKey // Include API key if using custom key
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.research) {
        let responseContent = ""
        
        // Extract content from different possible response formats
        if (data.research.choices && data.research.choices[0]) {
          responseContent = data.research.choices[0].message.content
        } else if (data.research.content) {
          responseContent = data.research.content
        } else if (typeof data.research === 'string') {
          responseContent = data.research
        }
        
        // Update research context with new response
        setResearchContext(prev => prev ? {
          ...prev,
          sonarResponse: prev.sonarResponse + "\n\n--- FOLLOW-UP RESPONSE ---\n" + responseContent
        } : null)
        
        // Add assistant response to chat
        const messageId = `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        // Handle new sources from follow-up query
        let querySpecificSources: Source[] = []
        if (data.research.search_results && Array.isArray(data.research.search_results)) {
          querySpecificSources = data.research.search_results.map((result: any) => ({
            title: result.title || 'Untitled',
            url: result.url || '#',
            description: result.snippet || result.description || 'No description available',
            isReal: true,
            timestamp: new Date(),
            queryContext: userMessage,
            messageId // Link sources to specific message
          }))
        }
        
        // Add message with its specific sources
        setChatMessages(prev => [...prev, {
          id: messageId,
          type: 'assistant',
          content: responseContent,
          timestamp: new Date(),
          sources: querySpecificSources
        }])
        
        // Log source discovery
        if (querySpecificSources.length > 0) {
          addActivityLog(`Found ${querySpecificSources.length} sources for "${userMessage}"`, 'complete')
        }
        
        addActivityLog('Follow-up research completed', 'complete')
        
      } else {
        throw new Error(data.error || 'Failed to get response from research API')
      }
      
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to send message"
      
      // Add error message to chat
      setChatMessages(prev => [...prev, {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'assistant',
        content: `I apologize, but I encountered an error while processing your question: "${errorMessage}". Please try again or rephrase your question.`,
        timestamp: new Date()
      }])
      
      addActivityLog(`Error: ${errorMessage}`, 'error')
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSendingMessage(false)
    }
  }

  const canStartResearch = Boolean(isConnected && selectedIndex && selectedVideo && prompt.trim())

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideo(videoId)
    const selectedVideoData = videos.find(v => v.id === videoId)
    setSelectedVideoThumbnail(selectedVideoData?.thumbnail_url || null)
    setSelectedVideoUrl(selectedVideoData?.video_url || null)
  }

  function getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const url = URL.createObjectURL(file)
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(url)
          resolve(Number(video.duration || 0))
        }
        video.onerror = () => {
          URL.revokeObjectURL(url)
          reject(new Error('Could not read video metadata'))
        }
        video.src = url
      } catch (e) {
        reject(e)
      }
    })
  }

  async function handleUploadVideo() {
    if (!uploadFile) {
      toast({ title: 'No file selected', description: 'Please choose a video file to upload.' })
      return
    }
    // Validate duration 5s–5m before uploading
    try {
      const durationSec = await getVideoDuration(uploadFile)
      if (durationSec < APP_CONFIG.VIDEO_DURATION.MIN || durationSec > APP_CONFIG.VIDEO_DURATION.MAX) {
        toast({ title: 'Invalid duration', description: ERROR_MESSAGES.INVALID_DURATION })
        return
      }
    } catch {
      toast({ title: 'Error', description: 'Could not read video duration.' })
      return
    }
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TWELVELABS.UPLOAD}`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json().catch(() => ({} as any))
      if (!res.ok || !data?.success) {
        const msg = data?.error || `Upload failed with status ${res.status}`
        throw new Error(msg)
      }
      toast({ title: 'Upload complete', description: `Video uploaded. ID: ${data.video_id}` })
      // Reset UI to environment key usage
      await switchToEnvironmentKey()
      setIsUploadVideoModalOpen(false)
      setUploadFile(null)
      setUploadStep(0)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upload video'
      toast({ title: 'Upload failed', description: message })
    } finally {
      setIsUploading(false)
    }
  }

  // If research has started, show only the chat interface
  if (researchStarted) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Toaster />

        {/* Header */}
        <header className="border-b border-gray-100 bg-white flex-shrink-0">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Logo />
                <span className="text-xl font-semibold text-gray-900">Video Deep Research</span>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => {
                    setResearchStarted(false)
                    setResearchContext(null) // Clear research context when going back
                  }}
                  variant="outline"
                  size="sm"
                  className="text-gray-700 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 shadow-sm transition-all duration-200 font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Search
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Messages - Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Chat Messages */}
                {chatMessages.map((message, index) => (
                  <div key={message.id}>
                    {/* User Message */}
                    {message.type === 'user' && (
                      <div className="flex justify-end mb-6">
                        <div className="max-w-5xl px-6 py-4 rounded-2xl bg-gray-900 text-white rounded-br-sm">
                          {/* Video Thumbnail - Show when available */}
                          {selectedVideoThumbnail && (
                            <div className="mb-3 flex items-center space-x-3">
                              <VideoThumbnail 
                                src={selectedVideoThumbnail || undefined} 
                                alt="Video thumbnail" 
                                className="w-8 h-8"
                              />
                              <span className="text-sm text-gray-300">
                                {videos.find(v => v.id === selectedVideo)?.name || 'Selected Video'}
                              </span>
                            </div>
                          )}
                          <p className="text-base">{message.content}</p>
                        </div>
                      </div>
                    )}

                    {/* Assistant Message with Sources */}
                    {message.type === 'assistant' && (
                      <div className="w-full mb-6">
                        {/* Show sources above the response */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mb-4">
                            <div className="px-6">
                              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                <BookOpen className="w-4 h-4 mr-2" />
                                {message.sources.length} Sources Found
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {message.sources.map((source, sourceIndex) => (
                                  <div 
                                    key={`${source.url}-${sourceIndex}`}
                                    className="bg-white rounded-lg border border-black p-3 hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-start space-x-3">
                                      <SourceIcon url={source.url} title={source.title} />
                                      <div className="flex-1 min-w-0">
                                        <a 
                                          href={source.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                                        >
                                          {source.title}
                                        </a>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                          {source.description}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Response content */}
                        <div className="w-full text-gray-900 px-6 py-6 border-t border-b border-gray-200">
                          <div className="prose prose-lg max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading Message for Follow-up Questions */}
                {isSendingMessage && (
                  <div className="w-full mb-6">
                    <div className="w-full text-gray-900 px-6 py-6 border-t border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Loader2 className="w-6 h-6 text-gray-900 animate-spin" />
                        <span className="text-gray-600">Searching for the references please...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Bar - Show only during research */}
                {isResearching && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-medium text-gray-900">
                        {(() => {
                          const currentStep = researchSteps.find(step => step.status === 'in-progress');
                          const completedSteps = researchSteps.filter(step => step.status === 'completed').length;
                          const totalSteps = researchSteps.length;
                          
                          if (completedSteps === totalSteps) {
                            return 'Research completed! 🎉';
                          } else if (currentStep) {
                            return currentStep.message;
                          } else if (completedSteps > 0) {
                            return `Step ${completedSteps + 1} of ${totalSteps}`;
                          } else {
                            return 'Starting research...';
                          }
                        })()}
                      </span>
                      <div className="w-8 h-8 flex items-center justify-center">
                        <img 
                          src="/Twelve Labs.gif" 
                          alt="TwelveLabs" 
                          className="w-8 h-8 object-contain"
                          key={`twelvelabs-gif-${Date.now()}`}
                          style={{ animation: 'none' }}
                        />
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 relative overflow-hidden">
                      <div 
                        className="h-2 bg-gray-600 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${(() => {
                            const completedSteps = researchSteps.filter(step => step.status === 'completed').length;
                            const inProgressSteps = researchSteps.filter(step => step.status === 'in-progress').length;
                            const totalSteps = researchSteps.length;
                            
                            if (completedSteps === totalSteps) {
                              return 100;
                            } else if (inProgressSteps > 0) {
                              return ((completedSteps + 0.5) / totalSteps) * 100;
                            } else {
                              return (completedSteps / totalSteps) * 100;
                            }
                          })()}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Input Area - Always Visible at Bottom */}
            <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={isSendingMessage ? "Processing your question..." : "Ask a follow-up question about the research..."}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isSendingMessage}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Sidebar - Always Visible During Research */}
          <div className="w-80 border-l border-gray-200 bg-gray-50 shadow-lg flex-shrink-0">
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Research Mode</h3>
              </div>

              {/* Tabs */}
              <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === 'activity' 
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Activity
                </button>
                <button
                  onClick={() => setActiveTab('sources')}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === 'sources' 
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Sources
                </button>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {activeTab === 'activity' ? (
                  <div className="p-4 space-y-4">
                    {activityLogs.map((log, index) => (
                      <div key={index} className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <div className="mt-1 flex-shrink-0">
                          <Check className="w-4 h-4 text-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700">{log.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {log.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {activityLogs.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm">No activity yet</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {chatMessages.some(msg => msg.type === 'assistant' && msg.sources && msg.sources.length > 0) ? (
                      <>
                        <div className="mb-4">
                          <h3 className="text-sm font-medium text-gray-900">
                            Research Sources
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            All sources found during research
                          </p>
                        </div>
                        
                        {/* Group sources by query */}
                        {chatMessages
                          .filter(msg => msg.type === 'assistant' && msg.sources && msg.sources.length > 0)
                          .map((message, msgIndex) => (
                            <div key={message.id} className="mb-6">
                              <div className="mb-2">
                                <h4 className="text-sm font-medium text-gray-700">
                                  {msgIndex === 0 ? 'Initial Research' : 'Follow-up'}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {message.sources!.length} sources
                                </p>
                              </div>
                              
                              <div className="space-y-3">
                                {message.sources!.map((source, sourceIndex) => (
                                  <div 
                                    key={`${source.url}-${sourceIndex}`} 
                                    className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all duration-200 group"
                                  >
                                    <div className="flex items-start space-x-4">
                                      <SourceIcon url={source.url} title={source.title} />
                                      <div className="flex-1 min-w-0">
                                        <a 
                                          href={source.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 block group-hover:text-blue-600"
                                        >
                                          {source.title}
                                        </a>
                                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                          {source.description}
                                        </p>
                                        <div className="flex items-center mt-2 space-x-2">
                                          <span className="text-xs text-gray-500">
                                            {source.timestamp.toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="text-sm">No sources available yet</p>
      </div>
    )}
  </div>
)}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Landing page interface (only shown when research hasn't started)
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Toaster />

      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Logo />
              <span className="text-xl font-semibold text-gray-900">Video Deep Research</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsInfoModalOpen(true)}
                variant="outline"
                size="sm"
                className="text-gray-600 border-gray-200 bg-transparent hover:bg-gray-50"
              >
                <Info className="w-4 h-4" />
              </Button>
              {/* Blog Logo */}
              <Button
                onClick={() => setIsBlogModalOpen(true)}
                variant="outline"
                size="sm"
                className="text-gray-600 border-gray-200 bg-transparent hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
                </svg>
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 bg-transparent">
                <Github className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-16 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-12">
            <button 
              onClick={() => setIsInfoModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
            >
              <span className="bg-gray-900 text-white px-2 py-1 rounded-full text-xs font-medium mr-3">New</span>
              AI-powered research from video content
            </button>
          </div>

          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              What can I research for you?
            </h1>
          </div>

          {/* Main input card */}
          <div className="max-w-3xl mx-auto mb-16">
            <Card className="border border-gray-200 rounded-2xl p-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4 p-6">
                {/* Toolbar: dropdowns + connect button */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {/* Index Selection - Always visible */}
                    <Select value={selectedIndex} onValueChange={handleIndexChange} disabled={!isConnected}>
                      <SelectTrigger className="w-56 h-8 text-xs">
                        <SelectValue placeholder={isConnected ? "Select Index" : "Connect API key to see indexes"} />
                      </SelectTrigger>
                      <SelectContent>
                        {isConnected ? (
                          indexes.map((idx) => (
                            <SelectItem key={idx.id} value={idx.id}>
                              {idx.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="placeholder" disabled>
                            Connect your API key to see available indexes
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>

                    {/* Video Selection - Always visible */}
                    <Select
                      value={selectedVideo}
                      onValueChange={handleVideoSelect}
                      disabled={!isConnected || !selectedIndex || isLoadingVideos}
                    >
                      <SelectTrigger className="w-56 h-8 text-xs">
                        <SelectValue placeholder={
                          !isConnected 
                            ? "Connect API key to see videos" 
                            : !selectedIndex 
                              ? "Select an index first" 
                              : isLoadingVideos 
                                ? "Loading videos..." 
                                : "Select Video"
                        }>
                          {selectedVideo && videos.find(v => v.id === selectedVideo) && (
                            <div className="flex items-center space-x-2">
                              <VideoThumbnail 
                                src={selectedVideoThumbnail || undefined} 
                                alt="Selected video thumbnail" 
                                className="w-6 h-6"
                              />
                              <span className="truncate">
                                {videos.find(v => v.id === selectedVideo)?.name}
                              </span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {!isConnected ? (
                          <SelectItem value="placeholder" disabled>
                            Connect your API key to see available videos
                          </SelectItem>
                        ) : !selectedIndex ? (
                          <SelectItem value="placeholder" disabled>
                            Select an index first
                          </SelectItem>
                        ) : (
                          videos.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              <div className="flex items-center space-x-3">
                                <VideoThumbnail 
                                  src={v.thumbnail_url} 
                                  alt={`${v.name} thumbnail`}
                                  className="w-8 h-8"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">{v.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {Math.round(v.duration / 60)}m {Math.round(v.duration % 60)}s
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Connect TwelveLabs API Key button */}
                  {isConnected ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-black p-3 h-9 w-48" style={{
                        background: "linear-gradient(270deg, #60E21B -2.61%, #D3D1CF 70.51%)",
                        boxShadow: "inset 0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
                        borderRadius: "14.4px"
                      }}
                      onClick={() => isUsingEnvKey ? handleUseDefault() : setIsApiModalOpen(true)}
                    >
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-black" />
                        <span className="text-black font-medium">{isUsingEnvKey ? "Disconnect Default" : "Connected"}</span>
                      </div>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-gray-600 border-gray-200 bg-transparent hover:bg-gray-50"
                      onClick={() => isUsingEnvKey ? handleUseDefault() : setIsApiModalOpen(true)}
                    >
                      Connect TwelveLabs API Key
                    </Button>
                  )}
                </div>

                {/* Text input */}
                <div className="relative">
                  {/* Video Player Display - Always show when video is selected */}
                  {selectedVideoUrl && (
                    <div className="mb-6">
                      
                      <InlineVideoPlayer
                        duration={videos.find(v => v.id === selectedVideo)?.duration}
                        videoUrl={selectedVideoUrl}
                        thumbnailUrl={selectedVideoThumbnail || undefined}
                        title={videos.find(v => v.id === selectedVideo)?.name}
                        className="max-w-3xl"
                      />
                    </div>
                  )}                  
                  <textarea
                    placeholder={
                      !isConnected 
                        ? "Connect your API key to start researching from videos..." 
                        : "Describe what you want to research from your video..."
                    }
                    className="w-full min-h-[120px] p-4 text-lg border-0 resize-none focus:outline-none placeholder-gray-400 bg-transparent"
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={!isConnected}
                  />
                </div>

                {/* Bottom toolbar */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUploadVideoModalOpen(true)}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Upload Video
                    </Button>
                    <span className="text-xs text-gray-400">MP4, MOV, AVI up to 500MB</span>
                  </div>
                  <Button
                    onClick={handleStartResearch}
                    disabled={!canStartResearch || isResearching}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-4 h-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!isConnected ? (
                      "Connect API Key to Start"
                    ) : isResearching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Researching...
                      </>
                    ) : (
                      "Start Research"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-auto w-full">
        <div className="container mx-auto h-[72px] flex items-center">
          <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center space-x-2 -ml-6">
              <span className="text-gray-500 text-sm">Powered by</span>
              <span className="font-semibold text-gray-900">TwelveLabs</span>
            </div>
            <div className="flex items-center space-x-2 -mr-6">
              {/* Globe/Web Logo */}
              <div className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              {/* Discord Logo */}
              <div className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              {/* New Twitter/X Logo */}
              <div className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* API Key Modal */}
      <Dialog open={isApiModalOpen} onOpenChange={setIsApiModalOpen}>
        <DialogContent className="sm:max-w-md !rounded-[58px]">
          <DialogHeader>
            <DialogTitle>
              {isConnected ? 'TwelveLabs API Configuration' : 'Connect TwelveLabs API'}
            </DialogTitle>
            <DialogDescription>
              {isConnected 
                ? 'Manage your TwelveLabs API connection or disconnect.'
                : 'Enter your TwelveLabs API key to start analyzing videos and conducting research.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isConnected ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Check className="w-6 h-6 text-gray-900" />
                    <span className="text-gray-900 font-medium">API Key Connected</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    Your TwelveLabs API key is successfully configured and working.
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsApiModalOpen(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    onClick={switchToEnvironmentKey}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    style={{
                      background: "linear-gradient(270deg, #60E21B -2.61%, #D3D1CF 70.51%)",
                      boxShadow: "inset 0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
                      borderRadius: "14.4px"
                    }}
                  >
                    Default
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setApiKey("")
                      setIsConnected(false)
                      setSelectedIndex("")
                      setSelectedVideo("")
                      setSelectedVideoThumbnail(null)
                      setSelectedVideoUrl(null)
                      setIndexes([])
                      setVideos([])
                      toast({ title: "Disconnected", description: "TwelveLabs API key has been disconnected." })
                      // Don't close modal - let it show the connection form
                    }}
                    className="bg-gray-900 text-white border-gray-900 hover:bg-gray-800 hover:border-gray-800"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="api-key" className="text-sm font-medium text-gray-700">
                    API Key
                  </label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your TwelveLabs API key (starts with 'tlk_')"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsApiModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={switchToEnvironmentKey}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    style={{
                      background: "linear-gradient(270deg, #60E21B -2.61%, #D3D1CF 70.51%)",
                      boxShadow: "inset 0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
                      borderRadius: "14.4px"
                    }}
                  >
                    Default
                  </Button>
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting || !apiKey.trim()}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Coming Soon Modal */}
      <Dialog open={isComingSoonOpen} onOpenChange={setIsComingSoonOpen}>
        <DialogContent className="sm:max-w-md !rounded-[58px]">
          <DialogHeader>
            <DialogTitle>Coming Soon!</DialogTitle>
            <DialogDescription>
              This feature is currently under development and will be available soon.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsComingSoonOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Video Modal */}
      <Dialog open={isUploadVideoModalOpen} onOpenChange={(open) => { 
        setIsUploadVideoModalOpen(open); 
        if (!open) {
          setUploadFile(null);
          setUploadStep(0);
          setIsSettingUpDefault(false);
        }
      }}>
        <DialogContent className="w-[800px] h-[350px] !rounded-[58px] border-2 border-black bg-transparent shadow-none p-0 overflow-hidden [&>button]:hidden" style={{ 
          backgroundImage: 'url(/card.png)', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center'
        }}>
          <div className="relative z-10 h-full flex flex-col px-8 py-6">
            <DialogHeader className="text-center relative">
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsUploadVideoModalOpen(false);
                  setUploadFile(null);
                  setUploadStep(0);
                  setIsSettingUpDefault(false);
                }}
                className="absolute top-0 right-0 w-9 h-9 flex items-center justify-center text-black rounded-full hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <DialogTitle className="text-black text-xl font-semibold">Upload Video</DialogTitle>
              <DialogDescription className="text-black text-sm mt-1">
                {uploadStep === 0 
                  ? "Choose your API configuration method for video upload and analysis."
                  : ""
                }
              </DialogDescription>
            </DialogHeader>
          
          <div className="flex-1 flex flex-col justify-center">
          {uploadStep === 0 ? (
            // Step 1: API Configuration Selection
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="border rounded-lg p-4 bg-white/80 border-gray-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-base">Default (Environment API Key)</h4>
                      <p className="text-sm text-gray-700 mt-2">
                        Use the pre-configured TwelveLabs API key from environment settings. 
                        Recommended for seamless experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center pt-2">
                <Button
                  onClick={async () => {
                    setIsSettingUpDefault(true);
                    try {
                      await switchToEnvironmentKey();
                      setUploadStep(1);
                    } finally {
                      setIsSettingUpDefault(false);
                    }
                  }}
                  disabled={isSettingUpDefault}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-12 py-3 text-base"
                  style={{
                    background: isSettingUpDefault 
                      ? "linear-gradient(270deg, #9CA3AF -2.61%, #D1D5DB 70.51%)" 
                      : "linear-gradient(270deg, #60E21B -2.61%, #D3D1CF 70.51%)",
                    boxShadow: "inset 0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
                    borderRadius: "14.4px",
                    color: "#000",
                    opacity: isSettingUpDefault ? 0.7 : 1
                  }}
                >
                  {isSettingUpDefault ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Default'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // Step 2: File Upload with Drag & Drop
            <div className="space-y-3">
              <div className="space-y-2">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('upload-video')?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50/30');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50/30');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50/30');
                    const files = e.dataTransfer.files;
                    if (files && files[0]) {
                      setUploadFile(files[0]);
                    }
                  }}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center">
                      <Plus className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-black mb-1">
                        {uploadFile ? uploadFile.name : 'Drop videos or browse files'}
                      </p>
                      {uploadFile && (
                        <p className="text-xs text-gray-600">
                          Size: {(uploadFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      )}
                    </div>
                  </div>
                  <input
                    id="upload-video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setUploadFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                    className="hidden"
                  />
                </div>
                
                  <div className="text-center">
                    <p className="text-[10px] text-black mb-1">
                      Supported videos according to Pegasus model
                    </p>
                    <div className="flex justify-center gap-1.5">
                      <span className="px-2 py-0.5 bg-white/60 rounded-full text-[9px] font-medium text-black border">
                        4SEC-5MIN [Upload on Playground for more]
                      </span>
                      <span className="px-2 py-0.5 bg-white/60 rounded-full text-[9px] font-medium text-black border">
                        AUDIO REQUIRED
                      </span>
                      <span className="px-2 py-0.5 bg-white/60 rounded-full text-[9px] font-medium text-black border">
                        RESOLUTION 360P-4K
                      </span>
                    </div>
                  </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setUploadStep(0)}
                  className="border-gray-400 text-black hover:bg-white/50 hover:border-gray-500 px-6 py-2"
                  disabled={isUploading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleUploadVideo}
                  disabled={!uploadFile || isUploading}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </Button>
              </div>
            </div>
          )}
          </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Modal */}
      <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
        <DialogContent className="sm:max-w-2xl w-[600px] h-[600px] flex flex-col p-0 overflow-hidden !rounded-[58px] border-2 border-black bg-transparent shadow-none" style={{ 
          backgroundImage: 'url(/card.png)', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center'
        }}>
          <div className="flex-1 overflow-hidden relative">
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col">
              <DialogHeader className="px-6 pt-6 pb-4 relative">
                {/* Close Button */}
                <button
                  onClick={() => setIsInfoModalOpen(false)}
                  className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-black rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <DialogTitle className="text-2xl font-bold text-black text-center">
                  {infoSteps[currentInfoStep].title}
                </DialogTitle>
                {/* Step Indicator */}
                <div className="text-center mt-2">
                  <span className="text-sm text-black font-medium">
                    Step {currentInfoStep + 1} of {infoSteps.length}
                  </span>
                </div>
              </DialogHeader>
              
              {/* Content Area with Bigger GIF */}
              <div className="flex-1 overflow-hidden px-6 pb-4">
                <div className="h-full overflow-y-auto">
                  {infoSteps[currentInfoStep].content}
                </div>
              </div>
              
              {/* Navigation Footer */}
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between">
                  <Button
                    onClick={prevStep}
                    disabled={currentInfoStep === 0}
                    variant="outline"
                    size="sm"
                    className="text-black border-gray-300 hover:bg-gray-50 disabled:opacity-50 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  {/* Step Indicators */}
                  <div className="flex space-x-2">
                    {infoSteps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentInfoStep(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentInfoStep 
                            ? 'bg-black' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button
                    onClick={currentInfoStep === infoSteps.length - 1 ? closeModal : nextStep}
                    size="sm"
                    className="bg-black text-white hover:bg-gray-800 rounded-full transition-colors"
                  >
                    {currentInfoStep === infoSteps.length - 1 ? (
                      'Get Started'
                    ) : (
                      <>
                        Next
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blog Modal */}
      <Dialog open={isBlogModalOpen} onOpenChange={setIsBlogModalOpen}>
        <DialogContent className="sm:max-w-md !rounded-[58px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-gray-900">
              Coming Soon!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
              </svg>
            </div>
            <p className="text-gray-600 mb-6">
              We're working on bringing you insightful technical content about building video deep research.
            </p>
            <Button 
              onClick={() => setIsBlogModalOpen(false)}
              className="w-full bg-gray-900 text-white hover:bg-gray-800"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}