"use client"

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
      <div className={`${className} bg-[#D3D1CF] rounded flex items-center justify-center flex-shrink-0`}>
        <Video className="w-4 h-4 text-[#D3D1CF]" />
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
            <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-[#D3D1CF] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🎬</div>
                <p className="text-[#1D1C1B]">GIF Demo Area</p>
                <p className="text-sm text-[#D3D1CF]">Video Deep Research in Action</p>
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
            <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-[#D3D1CF] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🔑</div>
                <p className="text-[#1D1C1B]">GIF Tutorial Area</p>
                <p className="text-sm text-[#D3D1CF]">How to Connect API Key</p>
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
            <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-[#D3D1CF] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-[#1D1C1B]">GIF Demo Area</p>
                <p className="text-sm text-[#D3D1CF]">Real-time Source Generation</p>
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
  const [sources, setSources] = useState<Array<{title: string, url: string, description: string, isReal: boolean}>>([])
  
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
  }>>([])
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [showActivitySidebar, setShowActivitySidebar] = useState(false)
  const [activeTab, setActiveTab] = useState<'activity' | 'sources'>('activity')
  const [activityLogs, setActivityLogs] = useState<Array<{
    message: string
    timestamp: Date
    type: 'info' | 'progress' | 'complete' | 'error'
  }>>([])

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
        const res = await fetch(`${API_BASE_URL}/api/config/twelvelabs`, {
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

  async function handleIndexChange(indexId: string) {
    setSelectedIndex(indexId)
    setSelectedVideo("")
    setSelectedVideoThumbnail(null)
    setSelectedVideoUrl(null)
    setVideos([])
    if (!indexId) return

    setIsLoadingVideos(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, index_id: indexId }),
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
  function extractRealSources(data: any): Array<{title: string, url: string, description: string, isReal: boolean}> {
    if (!data.workflow?.research) return []
    
    const research = data.workflow.research
    
    // First try to get sources from search_results (real sources from Sonar)
    if (research.search_results && Array.isArray(research.search_results)) {
      return research.search_results.map((result: any) => ({
        title: result.title || 'Untitled',
        url: result.url || '#',
        description: result.snippet || 'No description available',
        isReal: true
      }))
    }
    
    // Fallback to citations if available
    if (research.citations && Array.isArray(research.citations)) {
      return research.citations.map((citation: string, index: number) => ({
        title: `Source ${index + 1}`,
        url: citation,
        description: 'Citation from research',
        isReal: true
      }))
    }
    
    // If no real sources, return empty array
    return []
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
    addActivityLog(`Starting research on: ${prompt}. I will provide you with up-to-date and reputable sources.`, 'info')
    
    // Initialize steps
    const initialSteps = [
      { step: 'video_details', status: 'pending' as const, message: 'Fetching video details', timestamp: new Date() },
      { step: 'analysis', status: 'pending' as const, message: 'Analyzing video content', timestamp: new Date() },
      { step: 'research', status: 'pending' as const, message: 'Conducting deep research', timestamp: new Date() }
    ]
    setResearchSteps(initialSteps)
    
    try {
      // Create a generalized analysis prompt that covers comprehensive video understanding
      const generalizedAnalysisPrompt = `Please provide a comprehensive analysis of this video content. Include:

1. **Content Overview**: What is happening in the video? Describe the main events, actions, and scenes.
2. **Key Elements**: Identify important objects, people, locations, activities, and interactions.
3. **Context & Setting**: What is the environment, time period, or context of the video?
4. **Narrative Flow**: How does the story or sequence of events unfold?
5. **Notable Details**: Highlight any significant details, patterns, or unique aspects.
6. **Technical Aspects**: Note video quality, camera work, editing, or production elements if relevant.

User's Specific Query: ${prompt.trim()}

Please ensure your analysis addresses the user's specific question while providing comprehensive coverage of the video content.`
      
      const payload = {
        twelvelabs_api_key: apiKey,
        index_id: selectedIndex,
        video_id: selectedVideo,
        analysis_prompt: generalizedAnalysisPrompt,
        research_query: prompt.trim()
      }
      
      // Update first step to in-progress
      setResearchSteps(prev => prev.map((step, idx) => 
        idx === 0 ? { ...step, status: 'in-progress' } : step
      ))
      setCurrentStep('Fetching video details')
      setCurrentStepDetail('Getting video information...')
      addActivityLog('Fetching video details...', 'progress')
      
      const response = await fetch(`${API_BASE_URL}/api/workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorText = await response.text()
          
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error || errorData.message || errorMessage
          } catch {
            if (errorText && errorText.length < 200) {
              errorMessage = errorText
            }
          }
        } catch (e) {
          console.log("Could not read error response body:", e)
        }
        
        throw new Error(errorMessage)
      }
      
      // Handle JSON response
      const data = await response.json()

      
      if (data.success && data.workflow) {
        // Update video details step
        setResearchSteps(prev => prev.map((step, idx) => 
          idx === 0 ? { ...step, status: 'completed', message: 'Video details retrieved' } : 
          idx === 1 ? { ...step, status: 'in-progress' } : step
        ))
        setCurrentStep('Analyzing video content')
        setCurrentStepDetail('Processing video data...')
        addActivityLog('Video details retrieved successfully', 'progress')
        
        // Simulate analysis progress
        setTimeout(() => {
          setResearchSteps(prev => prev.map((step, idx) => 
            idx === 1 ? { ...step, status: 'completed', message: 'Video analysis completed' } : 
            idx === 2 ? { ...step, status: 'in-progress' } : step
          ))
          setCurrentStep('Conducting deep research')
          setCurrentStepDetail('Searching for information...')
          addActivityLog('Video analysis completed', 'progress')
          
          // Complete research step
          setTimeout(() => {
            setResearchSteps(prev => prev.map((step, idx) => 
              idx === 2 ? { ...step, status: 'completed', message: 'Research completed successfully' } : step
            ))
            setCurrentStep('')
            setCurrentStepDetail('')
            addActivityLog('Research completed successfully!', 'complete')
            
            // Set the research content
            let researchContent = ""
            if (data.workflow.research && data.workflow.research.choices && data.workflow.research.choices[0]) {
              researchContent = data.workflow.research.choices[0].message.content
            } else if (data.workflow.analysis) {
              researchContent = data.workflow.analysis
            }
            
            setStreamingContent(researchContent)
            
            // Store research context for follow-up questions
            setResearchContext({
              twelvelabsAnalysis: data.workflow.analysis || '',
              sonarResponse: researchContent,
              videoDetails: data.workflow.video_details || {},
              originalQuery: prompt.trim()
            })
            
            // Add assistant message to chat with unique ID
            setChatMessages(prev => [...prev, {
              id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'assistant',
              content: researchContent,
              timestamp: new Date()
            }])
            
            // Extract and set real sources from API response
            const realSources = extractRealSources(data)
            if (realSources.length > 0) {
              setSources(realSources)
            }
          }, 1000)
        }, 1000)
      } else {
        throw new Error(data.error || 'Research failed')
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
      
      // Send to Sonar API
      const response = await fetch(`${API_BASE_URL}/api/sonar/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: enhancedQuery
        })
      })
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorText = await response.text()
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error || errorData.message || errorMessage
          } catch {
            if (errorText && errorText.length < 200) {
              errorMessage = errorText
            }
          }
        } catch (e) {
          console.log("Could not read error response body:", e)
        }
        throw new Error(errorMessage)
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
        } else {
          responseContent = "I've analyzed your follow-up question based on the research context. Here's what I found..."
        }
        
        // Update research context with new response
        setResearchContext(prev => prev ? {
          ...prev,
          sonarResponse: prev.sonarResponse + "\n\n--- FOLLOW-UP RESPONSE ---\n" + responseContent
        } : null)
        
        // Add assistant response to chat
        setChatMessages(prev => [...prev, {
          id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'assistant',
          content: responseContent,
          timestamp: new Date()
        }])
        
        // Extract and update sources if available
        if (data.research.search_results && Array.isArray(data.research.search_results)) {
          const newSources = data.research.search_results.map((result: any) => ({
            title: result.title || 'Untitled',
            url: result.url || '#',
            description: result.snippet || 'No description available',
            isReal: true
          }))
          
          // Merge with existing sources, avoiding duplicates
          setSources(prev => {
            const existingUrls = new Set(prev.map(s => s.url))
            const uniqueNewSources = newSources.filter((s: any) => !existingUrls.has(s.url))
            return [...prev, ...uniqueNewSources]
          })
        }
        
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

  // If research has started, show only the chat interface
  if (researchStarted) {
    return (
      <div className="min-h-screen bg-[#F4F3F3] flex flex-col">
        <Toaster />

        {/* Header */}
        <header className="border-b border-[#D3D1CF] bg-[#F4F3F3] flex-shrink-0">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-row justify-start items-center gap-2">
                <Logo />
                <span className="text-xl font-semibold text-[#1D1C1B]">Video Deep Research</span>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => {
                    setResearchStarted(false)
                    setResearchContext(null) // Clear research context when going back
                  }}
                  variant="outline"
                  size="sm"
                  className="text-[#1D1C1B] border-[#D3D1CF] bg-[#F4F3F3] hover:bg-[#E9E8E7] hover:border-[#D3D1CF] hover:text-[#1D1C1B] shadow-sm transition-all duration-200 font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Search
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden flex-1">
          {/* Chat Content */}
          <div className="flex-1 flex flex-col overflow-hidden h-screen">
            {/* Chat Messages - Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 pb-32">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Chat Messages */}
                {chatMessages.map((message, index) => (
                  <div key={message.id}>
                    {/* User Message */}
                    {message.type === 'user' && (
                      <div className="flex justify-end mb-6">
                        <div className="max-w-5xl px-6 py-4 rounded-2xl bg-[#1D1C1B] text-white rounded-br-sm">
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

                    {/* Show sources right after user message and before assistant response */}
                    {message.type === 'user' && sources.length > 0 && sources.some(source => source.isReal) && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-[#1D1C1B] mb-4">Research Sources</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {sources.filter(source => source.isReal).map((source, sourceIndex) => (
                            <div key={sourceIndex} className="bg-[#F4F3F3] border border-[#D3D1CF] rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-start space-x-3">
                                <SourceIcon url={source.url} title={source.title} />
                                <div className="flex-1 min-w-0">
                                  <a 
                                    href={source.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-[#1D1C1B] hover:text-blue-600 transition-colors line-clamp-2"
                                  >
                                    {source.title}
                                  </a>
                                  <p className="text-xs text-[#1D1C1B] mt-1 line-clamp-2">{source.description}</p>
                                  <span className="inline-block bg-[#60E21B] text-[#1D1C1B] px-2 py-1 rounded-full text-xs mt-2">
                                    Real Source
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assistant Message */}
                    {message.type === 'assistant' && (
                      <div className="w-full mb-6">
                        <div className="w-full text-[#1D1C1B] px-6 py-6 border-t border-b border-[#D3D1CF]">
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
                    <div className="w-full text-[#1D1C1B] px-6 py-6 border-t border-b border-[#D3D1CF]">
                      <div className="flex items-center space-x-3">
                        <Loader2 className="w-6 h-6 text-[#1D1C1B] animate-spin" />
                        <span className="text-[#1D1C1B]">Searching for the references please...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Bar - Show only during research */}
                {isResearching && (
                  <div className="bg-[#F4F3F3] border border-[#D3D1CF] rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-medium text-[#1D1C1B]">
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
                    
                    <div className="w-full bg-[#D3D1CF] rounded-full h-2 relative overflow-hidden">
                      <div 
                        className="h-2 bg-[#1D1C1B] rounded-full transition-all duration-500 ease-out"
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
            <div className="border-t border-[#D3D1CF] bg-[#F4F3F3] p-4 flex-shrink-0 fixed bottom-0 left-0 right-80 z-10">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={isSendingMessage ? "Processing your question..." : "Ask a follow-up question about the research..."}
                      className="w-full px-4 py-3 border border-[#D3D1CF] rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent h-12 overflow-y-hidden"
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
                    className="bg-[#1D1C1B] hover:bg-[#1D1C1B] text-white px-4 py-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed h-12"
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
          <div className="w-80 border-l border-[#D3D1CF] bg-[#E9E8E7] shadow-lg flex-shrink-0">
            <div className="p-6 flex-1 pb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#1D1C1B]">Research Mode</h3>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6">
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'activity' 
                      ? 'bg-[#1D1C1B] text-white' 
                      : 'text-[#1D1C1B] hover:text-[#1D1C1B] hover:bg-[#E9E8E7]'
                  }`}
                >
                  Activity
                </button>
                <button
                  onClick={() => setActiveTab('sources')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'sources' 
                      ? 'bg-[#1D1C1B] text-white' 
                      : 'text-[#1D1C1B] hover:text-[#1D1C1B] hover:bg-[#E9E8E7]'
                  }`}
                >
                  Sources
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'activity' ? (
                <div className="space-y-4">
                  {activityLogs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#1D1C1B] rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1D1C1B]">{log.message}</p>
                        <p className="text-xs mt-1">
                          {log.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sources.length > 0 && sources.some(source => source.isReal) ? (
                    sources.filter(source => source.isReal).map((source, index) => (
                      <div key={index} className="bg-[#F4F3F3] border border-[#D3D1CF] rounded-lg p-3">
                        <div className="flex items-start space-x-3">
                          <SourceIcon url={source.url} title={source.title} />
                          <div className="flex-1 min-w-0">
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-[#1D1C1B] hover:text-blue-600 transition-colors line-clamp-2 block"
                            >
                              {source.title}
                            </a>
                            <p className="text-xs text-[#1D1C1B] mt-1 line-clamp-2">{source.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#D3D1CF] text-center py-4">No sources available yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Landing page interface (only shown when research hasn't started)
  return (
    <div className="min-h-screen bg-[#F4F3F3]">
      <Toaster />

      {/* Header */}
      <header className="border-b border-[#D3D1CF]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-row justify-start items-center gap-2">
              <Logo />
              <span className="text-xl font-semibold text-[#1D1C1B]">Video Deep Research</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsInfoModalOpen(true)}
                variant="outline"
                size="sm"
                className="text-[#1D1C1B] border-[#D3D1CF] bg-transparent hover:bg-[#E9E8E7]"
              >
                <Info className="w-4 h-4" />
              </Button>
              {/* Blog Logo */}
              <Button
                onClick={() => setIsBlogModalOpen(true)}
                variant="outline"
                size="sm"
                className="text-[#1D1C1B] border-[#D3D1CF] bg-transparent hover:bg-[#E9E8E7]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
                </svg>
              </Button>
              <Button variant="outline" size="sm" className="text-[#1D1C1B] border-[#D3D1CF] bg-transparent">
                <Github className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-12">
            <button 
              onClick={() => setIsInfoModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-[#E9E8E7] border border-[#D3D1CF] rounded-full text-sm text-[#1D1C1B] hover:bg-[#E9E8E7] hover:border-[#D3D1CF] transition-colors cursor-pointer"
            >
              <span className="bg-[#1D1C1B] text-white px-2 py-1 rounded-full text-xs font-medium mr-3">New</span>
              AI-powered research from video content
            </button>
          </div>

          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-[#1D1C1B] mb-4 leading-tight">
              What can I research for you?
            </h1>
          </div>

          {/* Main input card */}
          <div className="max-w-3xl mx-auto mb-16">
            <Card className="border border-[#D3D1CF] rounded-2xl p-0 shadow-sm hover:shadow-md transition-shadow">
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
                            <div className="flex flex-row justify-start items-center gap-2">
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
                                  <div className="text-xs">
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
                      className="text-[#1D1C1B] p-3 h-9 w-48 gap-2 rounded-[14.4px] isolate relative shadow-inner border border-black/10" style={{ background: "linear-gradient(270deg, #60E21B -2.61%, #D3D1CF 70.51%)" }}
                      onClick={() => setIsApiModalOpen(true)}
                    >
                      <div className="flex flex-row justify-start items-center gap-2">
                        <Check className="w-4 h-4 text-[#1D1C1B]" />
                        <span>Connected</span>
                      </div>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-[#1D1C1B] border-[#D3D1CF] bg-transparent hover:bg-[#E9E8E7]"
                      onClick={() => setIsApiModalOpen(true)}
                    >
                      Connect TwelveLabs API Key
                    </Button>
                  )}
                </div>

                {/* Text input */}
                <div className="relative">
                  {/* Video Thumbnail Display - Always show when video is selected */}
                  {selectedVideoThumbnail && (
                    <div className="mb-6 p-6 bg-[#E9E8E7] rounded-lg border border-[#D3D1CF]">
                      <div className="flex items-start space-x-4">
                        <VideoThumbnail 
                          src={selectedVideoThumbnail || undefined} 
                          alt="Video thumbnail" 
                          className="w-32 h-32"
                        />
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-[#1D1C1B] mb-2">
                            {videos.find(v => v.id === selectedVideo)?.name || 'Selected Video'}
                          </h4>
                          <div className="space-y-2 text-sm text-[#1D1C1B]">
                            <p>
                              <span className="font-medium">Duration:</span> {Math.round((videos.find(v => v.id === selectedVideo)?.duration || 0) / 60)}m {Math.round((videos.find(v => v.id === selectedVideo)?.duration || 0) % 60)}s
                            </p>
                            <p>
                              <span className="font-medium">FPS:</span> {
                                (() => {
                                  const video = videos.find(v => v.id === selectedVideo);
                                  return video?.fps && video.fps > 0 ? video.fps : 'N/A';
                                })()
                              }
                            </p>
                            <p>
                              <span className="font-medium">File Size:</span> {
                                (() => {
                                  const video = videos.find(v => v.id === selectedVideo);
                                  if (video?.size && video.size > 0) {
                                    return `${Math.round(video.size / (1024 * 1024))} MB`;
                                  }
                                  return 'N/A';
                                })()
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <textarea
                    placeholder={
                      !isConnected 
                        ? "Connect your API key to start researching from videos..." 
                        : "Describe what you want to research from your video..."
                    }
                    className="w-full min-h-[120px] p-4 text-lg border-0 resize-none focus:outline-none placeholder-[#D3D1CF] bg-transparent"
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={!isConnected}
                  />
                </div>

                {/* Bottom toolbar */}
                <div className="flex items-center justify-between pt-4 border-t border-[#D3D1CF]">
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[#D3D1CF] hover:text-[#1D1C1B] hover:bg-[#E9E8E7]"
                      onClick={() => setIsUploadVideoModalOpen(true)}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Upload Video
                    </Button>
                    <span className="text-xs">MP4, MOV, AVI up to 500MB</span>
                  </div>
                  <Button
                    onClick={handleStartResearch}
                    disabled={!canStartResearch || isResearching}
                    className="bg-[#1D1C1B] hover:bg-[#1D1C1B] text-white px-4 h-8 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <footer className="border-t border-[#D3D1CF] py-8 mt-16 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex flex-row justify-start items-center gap-2 mb-4 md:mb-0 md:absolute md:left-6">
              <span className="text-[#D3D1CF] text-sm">Powered by</span>
              <span className="font-semibold text-[#1D1C1B]">TwelveLabs</span>
            </div>
            <div className="flex flex-row justify-start items-center gap-2 md:absolute md:right-2">
              {/* Globe/Web Logo */}
              <div className="w-7 h-7 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#1D1C1B]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              {/* Discord Logo */}
              <div className="w-7 h-7 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#1D1C1B]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              {/* New Twitter/X Logo */}
              <div className="w-7 h-7 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#1D1C1B]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* API Key Modal */}
      <Dialog open={isApiModalOpen} onOpenChange={setIsApiModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#E9E8E7] opacity-100 backdrop-blur-none">
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
                <div className="p-4 bg-[#E9E8E7] border border-[#D3D1CF] rounded-lg">
                  <div className="flex flex-row justify-start items-center gap-2">
                    <Check className="w-6 h-6 text-[#1D1C1B]" />
                    <span className="text-[#1D1C1B] font-medium">API Key Connected</span>
                  </div>
                  <p className="text-sm text-[#1D1C1B] mt-2">
                    Your TwelveLabs API key is successfully configured and working.
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsApiModalOpen(false)}
                    className="border-[#D3D1CF] text-[#1D1C1B] hover:bg-[#E9E8E7] hover:border-[#D3D1CF]"
                  >
                    Close
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
                    className="bg-[#1D1C1B] text-white border-[#1D1C1B] hover:bg-[#1D1C1B] hover:border-[#1D1C1B]"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="api-key" className="text-sm font-medium text-[#1D1C1B]">
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
                    onClick={handleConnect}
                    disabled={isConnecting || !apiKey.trim()}
                    className="bg-[#1D1C1B] hover:bg-[#1D1C1B] text-white"
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
        <DialogContent className="sm:max-w-md bg-[#E9E8E7] opacity-100 backdrop-blur-none">
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
      <Dialog open={isUploadVideoModalOpen} onOpenChange={setIsUploadVideoModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#E9E8E7] opacity-100 backdrop-blur-none">
          <DialogHeader>
            <DialogTitle>Upload Video - Coming Soon!</DialogTitle>
            <DialogDescription>
              Video upload functionality is currently under development. You'll be able to upload your own videos for analysis soon!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsUploadVideoModalOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Modal */}
      <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
        <DialogContent className="sm:max-w-2xl w-[600px] h-[600px] flex flex-col p-[35px] overflow-hidden !rounded-[58px] border-2 border-black bg-transparent shadow-none" showCloseButton={false} style={{ 
          backgroundImage: 'url(/card.png)', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center'
        }}>
          <div className="flex-1 relative">
            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col">
              <DialogHeader className="px-2 pt-2 pb-1 relative">
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
              <div className="flex-1 flex flex-col px-2 pb-1">
                <div className="flex-1">
                  {infoSteps[currentInfoStep].content}
                </div>
              </div>
              
              {/* Navigation Footer */}
              <div className="px-2 pb-2">
                <div className="flex items-center justify-between">
                  <Button
                    onClick={prevStep}
                    disabled={currentInfoStep === 0}
                    variant="outline"
                    size="sm"
                    className="text-black border-[#D3D1CF] hover:bg-[#E9E8E7] disabled:opacity-50 rounded-full transition-colors"
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
                    className="bg-black text-white hover:bg-[#1D1C1B] rounded-full transition-colors"
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
        <DialogContent className="sm:max-w-md bg-[#E9E8E7] opacity-100 backdrop-blur-none">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-[#1D1C1B]">
              Coming Soon!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-[#D3D1CF]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
              </svg>
            </div>
            <p className="text-[#1D1C1B] mb-6">
              We're working on bringing you insightful technical content about building video deep research.
            </p>
            <Button 
              onClick={() => setIsBlogModalOpen(false)}
              className="w-full bg-[#1D1C1B] text-white hover:bg-[#1D1C1B]"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}