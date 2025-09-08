
export const API_CONFIG = {

  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  
  // API endpoints
  ENDPOINTS: {
    // TwelveLabs API related endpoints
    TWELVELABS: {
      CONFIG: '/api/config/twelvelabs',
      INDEXES: '/api/indexes',
      VIDEOS: '/api/videos',
      UPLOAD: '/api/upload',
    },
    
    RESEARCH: {
      WORKFLOW: '/api/workflow',
      SONAR: '/api/sonar/research',
    },
  },
}

// Feature flags and settings
export const APP_CONFIG = {
  MAX_UPLOAD_SIZE: 500 * 1024 * 1024, 
  
  SUPPORTED_FORMATS: ['.mp4', '.mov', '.avi', '.webm'],
  

  VIDEO_DURATION: {
    MIN: 5,
    MAX: 300, 
  },
  
  // Default video player settings
  VIDEO_PLAYER: {
    ASPECT_RATIO: '21/9',
    CONTROLS_TIMEOUT: 3000,
  },
}

// Error messages
export const ERROR_MESSAGES = {
  INVALID_API_KEY: 'Please provide a valid TwelveLabs API key.',
  VIDEO_TOO_LARGE: 'Video file size exceeds the maximum limit of 500MB.',
  INVALID_FORMAT: 'Unsupported video format. Please use MP4, MOV, AVI, or WebM.',
  INVALID_DURATION: 'Video duration must be between 5 seconds and 5 minutes.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
}

// Validation functions
export const validateApiKey = (key: string): boolean => {
  return key.trim().startsWith('tlk_')
}

export const validateVideoFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > APP_CONFIG.MAX_UPLOAD_SIZE) {
    return { isValid: false, error: ERROR_MESSAGES.VIDEO_TOO_LARGE }
  }

  // Check file format
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  if (!APP_CONFIG.SUPPORTED_FORMATS.includes(extension)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_FORMAT }
  }

  return { isValid: true }
}

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`
} 