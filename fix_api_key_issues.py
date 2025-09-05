

import re

def fix_api_key_issues():
    file_path = "/Users/hrishikesh/Desktop/Video DeepResearch/TwelveLabs-Video-DeepResearch/www.videoresearch.app/app/page.tsx"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix 1: Update handleConnect to properly set isUsingEnvKey to false when UI key is connected
    handle_connect_pattern = r'(setIsConnected\(true\)\s*setIsApiModalOpen\(false\))'
    handle_connect_replacement = r'setIsConnected(true)\n        setIsUsingEnvKey(false)\n        setIsApiModalOpen(false)'
    content = re.sub(handle_connect_pattern, handle_connect_replacement, content)
    
    # Fix 2: Update handleUseDefault to properly connect to environment API key
    handle_use_default_pattern = r'function handleUseDefault\(\) \{\s*setIsConnected\(false\)\s*setIsUsingEnvKey\(false\)\s*setApiKey\(\'\'\)\s*setIndexes\(\[\]\)\s*setVideos\(\[\]\)\s*setSelectedIndex\(\'\'\)\s*setSelectedVideo\(\'\'\)\s*setSelectedVideoThumbnail\(null\)\s*setSelectedVideoUrl\(null\)\s*setIsApiModalOpen\(true\)\s*toast\(\{ title: \'Disconnected\', description: \'API key disconnected successfully\.\' \}\)\s*\}'
    
    new_handle_use_default = '''function handleUseDefault() {
    // Clear UI key from backend
    fetch(`${API_BASE_URL}/api/config/twelvelabs`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {}) // Ignore errors
    
    // Clear all state
    setApiKey('')
    setIndexes([])
    setVideos([])
    setSelectedIndex('')
    setSelectedVideo('')
    setSelectedVideoThumbnail(null)
    setSelectedVideoUrl(null)
    
    // Connect to environment API key
    const connectToEnvKey = async () => {
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
            setIsUsingEnvKey(true)
            if (data.indexes.length > 0) {
              const firstId = data.indexes[0].id
              setSelectedIndex(firstId)
              await handleIndexChange(firstId)
            }
            toast({ title: "Connected to Default", description: "Using environment API key." })
          }
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to connect to environment API key." })
      }
    }
    
    connectToEnvKey()
    setIsApiModalOpen(false)
  }'''
    
    content = re.sub(handle_use_default_pattern, new_handle_use_default, content, flags=re.DOTALL)
    
    #Update the disconnect button to properly clear the backend API key
    disconnect_button_pattern = r'onClick=\{\(\) => \{\s*setApiKey\(""\)\s*setIsConnected\(false\)\s*setSelectedIndex\(""\)\s*setSelectedVideo\(""\)\s*setSelectedVideoThumbnail\(null\)\s*setSelectedVideoUrl\(null\)\s*setIndexes\(\[\]\)\s*setVideos\(\[\]\)\s*toast\(\{ title: "Disconnected", description: "TwelveLabs API key has been disconnected\." \}\)\s*// Don\'t close modal - let it show the connection form\s*\}\}'
    
    new_disconnect_button = '''onClick={async () => {
                      // Clear API key from backend
                      try {
                        await fetch(`${API_BASE_URL}/api/config/twelvelabs`, {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                        })
                      } catch (error) {
                        console.log("Error clearing API key from backend:", error)
                      }
                      
                      // Clear all state
                      setApiKey("")
                      setIsConnected(false)
                      setIsUsingEnvKey(false)
                      setSelectedIndex("")
                      setSelectedVideo("")
                      setSelectedVideoThumbnail(null)
                      setSelectedVideoUrl(null)
                      setIndexes([])
                      setVideos([])
                      toast({ title: "Disconnected", description: "TwelveLabs API key has been disconnected." })
                      // Don't close modal - let it show the connection form
                    }}'''
    
    content = re.sub(disconnect_button_pattern, new_disconnect_button, content, flags=re.DOTALL)
    

    with open(file_path, 'w') as f:
        f.write(content)
    
    print("Fixed API key management issues")
    print("1. handleConnect now properly sets isUsingEnvKey to false when UI key is connected")
    print("2. handleUseDefault now properly connects to environment API key")
    print("3. Disconnect button now properly clears API key from backend")

if __name__ == "__main__":
    fix_api_key_issues()
