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
type VideoItem = { id: string; name: string; duration: number; thumbnail_url?: string; video_url?: string }

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
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [currentInfoStep, setCurrentInfoStep] = useState(0)
  
  const infoSteps = [
    {
      title: "Welcome to Video Deep Research",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Video className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Video Deep Research Platform</h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
            Transform your video content into comprehensive research insights using cutting-edge AI technology. 
            Combine video analysis with deep research to unlock new perspectives and discoveries.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Perfect for:</strong> Content creators, researchers, educators, marketers, and anyone who wants to extract deeper meaning from video content.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Getting Started",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">🚀 Quick Setup</h4>
            <p className="text-green-800 text-sm">Follow these simple steps to begin your research journey</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Connect Your API Key</h4>
                <p className="text-gray-600 text-sm">Click "Connect TwelveLabs API Key" and enter your API key to access the platform</p>
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  💡 <strong>Tip:</strong> You can get a free API key from TwelveLabs
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Select Your Index</h4>
                <p className="text-gray-600 text-sm">Choose from your available video indexes or create a new one</p>
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  📁 <strong>Index:</strong> A collection of videos organized by topic or project
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-lg">3</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Choose Your Video</h4>
                <p className="text-gray-600 text-sm">Select the video you want to research from your index</p>
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  🎥 <strong>Supported:</strong> MP4, MOV, AVI, and other common video formats
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "How the AI Works",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">🧠 AI-Powered Analysis Pipeline</h4>
            <p className="text-purple-800 text-sm">Our advanced AI systems work together to provide comprehensive insights</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <h4 className="font-semibold text-gray-900">TwelveLabs Video Analysis</h4>
              </div>
              <p className="text-gray-600 text-sm">Advanced AI analyzes your video frame-by-frame, understanding:</p>
              <ul className="mt-2 text-xs text-gray-500 space-y-1 ml-4">
                <li>• Visual content and scenes</li>
                <li>• Audio and speech recognition</li>
                <li>• Context and meaning</li>
                <li>• Key moments and highlights</li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">2</span>
                </div>
                <h4 className="font-semibold text-gray-900">Perplexity AI Research</h4>
              </div>
              <p className="text-gray-600 text-sm">AI conducts comprehensive research based on video analysis:</p>
              <ul className="mt-2 text-xs text-gray-500 space-y-1 ml-4">
                <li>• Current trends and developments</li>
                <li>• Related research and studies</li>
                <li>• Industry insights and analysis</li>
                <li>• Verified sources and citations</li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-sm">3</span>
                </div>
                <h4 className="font-semibold text-gray-900">Interactive Chat & Follow-ups</h4>
              </div>
              <p className="text-gray-600 text-sm">Continue the conversation with contextual AI responses:</p>
              <ul className="mt-2 text-xs text-gray-500 space-y-1 ml-4">
                <li>• Ask follow-up questions</li>
                <li>• Explore specific topics deeper</li>
                <li>• Get additional research insights</li>
                <li>• Maintain conversation context</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Example Use Cases",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-2">💡 Real-World Applications</h4>
            <p className="text-orange-800 text-sm">Discover how professionals use our platform across different industries</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Video className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Content Creation</h4>
              <p className="text-gray-600 text-xs mb-2">Research trends for your next video</p>
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <strong>Example:</strong> "Research market trends for this technology to create engaging content"
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Education</h4>
              <p className="text-gray-600 text-xs mb-2">Enhance learning materials</p>
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <strong>Example:</strong> "Research current developments in this field for my students"
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Market Research</h4>
              <p className="text-gray-600 text-xs mb-2">Analyze industry trends</p>
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <strong>Example:</strong> "Research competitive landscape for this product category"
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                <Lightbulb className="w-5 h-5 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Innovation</h4>
              <p className="text-gray-600 text-xs mb-2">Discover new opportunities</p>
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <strong>Example:</strong> "Research emerging technologies related to this concept"
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Pro Tips & Best Practices",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-900 mb-2">🎯 Maximize Your Research Results</h4>
            <p className="text-indigo-800 text-sm">Follow these tips to get the most out of the platform</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-blue-600 text-xs font-bold">💡</span>
                </span>
                Writing Effective Research Queries
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Be Specific:</strong> Instead of "Research this", try "Research current market trends and competitive landscape for this technology"</p>
                <p><strong>Include Context:</strong> Mention your industry, target audience, or specific goals</p>
                <p><strong>Ask for Actionable Insights:</strong> Request practical recommendations and next steps</p>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-green-600 text-xs font-bold">🔍</span>
                </span>
                Follow-up Questions Strategy
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Dive Deeper:</strong> Ask for specific examples, case studies, or detailed explanations</p>
                <p><strong>Explore Connections:</strong> Ask how different topics relate to each other</p>
                <p><strong>Get Practical:</strong> Request implementation steps or best practices</p>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-purple-600 text-xs font-bold">⚡</span>
                </span>
                Platform Features to Explore
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Source Citations:</strong> Click on research sources to verify information and explore further</p>
                <p><strong>Progress Tracking:</strong> Monitor your research progress in real-time</p>
                <p><strong>Context Preservation:</strong> Your conversation history is maintained for continuity</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Start",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">You're All Set!</h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
            You now have everything you need to start your video research journey. 
            Connect your API key and begin exploring the power of AI-driven video analysis.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-semibold text-green-900 mb-2">🎉 What's Next?</h4>
            <div className="text-left text-sm text-green-800 space-y-1">
              <p>• Connect your TwelveLabs API key</p>
              <p>• Select an index and video</p>
              <p>• Write your research query</p>
              <p>• Start exploring with AI!</p>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Need help? The platform is designed to be intuitive and user-friendly.</p>
            <p>Your research journey starts now!</p>
          </div>
        </div>
      )
    }
  ]

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
        setVideos(data.videos || [])
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
    addActivityLog(`I'm gathering information on ${prompt.toLowerCase()}, including emerging innovations, major developments, and shifts in consumer or industry behavior as of 2025. I'll provide you with a structured overview of key areas such as AI, hardware, software, cybersecurity, and more, using up-to-date, reputable sources.`, 'info')
    
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
            const uniqueNewSources = newSources.filter(s => !existingUrls.has(s.url))
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
                {selectedVideoThumbnail && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <VideoThumbnail 
                      src={selectedVideoThumbnail} 
                      alt="Video thumbnail" 
                      className="w-12 h-12"
                    />
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {videos.find(v => v.id === selectedVideo)?.name || 'Selected Video'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Duration: {Math.round((videos.find(v => v.id === selectedVideo)?.duration || 0) / 60)}m {Math.round((videos.find(v => v.id === selectedVideo)?.duration || 0) % 60)}s
                      </div>
                    </div>
                  </div>
                )}
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
                          <p className="text-base">{message.content}</p>
                        </div>
                      </div>
                    )}

                    {/* Show sources right after user message and before assistant response */}
                    {message.type === 'user' && sources.length > 0 && sources.some(source => source.isReal) && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Sources</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {sources.filter(source => source.isReal).map((source, sourceIndex) => (
                            <div key={sourceIndex} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
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
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{source.description}</p>
                                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs mt-2">
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
                        <div className="w-full bg-gray-50 text-gray-900 px-6 py-6 border-t border-b border-gray-200">
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
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-900 rounded-sm"></div>
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
                      placeholder="Ask a follow-up question about the research..."
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
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6">
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'activity' 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Activity
                </button>
                <button
                  onClick={() => setActiveTab('sources')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'sources' 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        log.type === 'info' ? 'bg-blue-500' :
                        log.type === 'progress' ? 'bg-yellow-500' :
                        log.type === 'complete' ? 'bg-green-500' :
                        'bg-red-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700">{log.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
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
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start space-x-3">
                          <SourceIcon url={source.url} title={source.title} />
                          <div className="flex-1 min-w-0">
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 block"
                            >
                              {source.title}
                            </a>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{source.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No sources available yet</p>
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
    <div className="min-h-screen bg-white">
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
              <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 bg-transparent">
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
            <div className="inline-flex items-center px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700">
              <span className="bg-gray-900 text-white px-2 py-1 rounded-full text-xs font-medium mr-3">New</span>
              AI-powered research from video content
              <span className="ml-2 text-gray-400">→</span>
            </div>
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
                                src={selectedVideoThumbnail} 
                                alt="Selected video thumbnail" 
                                className="w-5 h-5"
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
                  <Button
                    onClick={() => setIsApiModalOpen(true)}
                    variant="outline"
                    size="sm"
                    className="text-xs text-gray-600 border-gray-200 bg-transparent hover:bg-gray-50"
                  >
                    {isConnected ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Connected</span>
                      </div>
                    ) : (
                      "Connect TwelveLabs API Key"
                    )}
                  </Button>
                </div>

                {/* Text input */}
                <div className="relative">
                  {/* Video Thumbnail Display - Always show when video is selected */}
                  {selectedVideoThumbnail && (
                    <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start space-x-4">
                        <VideoThumbnail 
                          src={selectedVideoThumbnail} 
                          alt="Video thumbnail" 
                          className="w-32 h-32"
                        />
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {videos.find(v => v.id === selectedVideo)?.name || 'Selected Video'}
                          </h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">Duration:</span> {Math.round((videos.find(v => v.id === selectedVideo)?.duration || 0) / 60)}m {Math.round((videos.find(v => v.id === selectedVideo)?.duration || 0) % 60)}s
                            </p>
                            <p>
                              <span className="font-medium">Dimensions:</span> {videos.find(v => v.id === selectedVideo)?.system_metadata?.width || 'N/A'} × {videos.find(v => v.id === selectedVideo)?.system_metadata?.height || 'N/A'}
                            </p>
                            <p>
                              <span className="font-medium">FPS:</span> {videos.find(v => v.id === selectedVideo)?.system_metadata?.fps || 'N/A'}
                            </p>
                            <p>
                              <span className="font-medium">File Size:</span> {Math.round((videos.find(v => v.id === selectedVideo)?.system_metadata?.size || 0) / (1024 * 1024))} MB
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
                    <Button variant="outline" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-50">
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
      <footer className="border-t border-gray-100 py-8 mt-16 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0 md:absolute md:left-6">
              <span className="text-gray-500 text-sm">Powered by</span>
              <span className="font-semibold text-gray-900">TwelveLabs</span>
            </div>
            <div className="flex items-center space-x-8 md:absolute md:right-4">
              {/* Web Logo */}
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              {/* Integration Logo */}
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* API Key Modal */}
      <Dialog open={isApiModalOpen} onOpenChange={setIsApiModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect TwelveLabs API</DialogTitle>
            <DialogDescription>
              Enter your TwelveLabs API key to start analyzing videos and conducting research.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-sm font-medium text-gray-700">
                API Key
              </label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your TwelveLabs API key"
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Coming Soon Modal */}
      <Dialog open={isComingSoonOpen} onOpenChange={setIsComingSoonOpen}>
        <DialogContent className="sm:max-w-md">
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

      {/* Info Modal */}
      <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
        <DialogContent className="sm:max-w-2xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {infoSteps[currentInfoStep].title}
            </DialogTitle>
          </DialogHeader>
          
          {/* Progress Bar */}
          <div className="flex-shrink-0 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Step {currentInfoStep + 1} of {infoSteps.length}</span>
              <span className="text-sm font-medium text-gray-700">{Math.round(((currentInfoStep + 1) / infoSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${((currentInfoStep + 1) / infoSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Content Area - Non-scrollable */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full">
              {infoSteps[currentInfoStep].content}
            </div>
          </div>
          
          {/* Navigation Footer */}
          <div className="flex-shrink-0 flex items-center justify-between pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentInfoStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>
            
            <div className="flex space-x-2">
              {infoSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentInfoStep(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentInfoStep ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            
            {currentInfoStep === infoSteps.length - 1 ? (
              <Button onClick={closeModal} className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}