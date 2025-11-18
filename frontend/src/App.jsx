import { useState, useEffect } from 'react'
import ImageUploader from './components/ImageUploader'
import ImageEditor from './components/ImageEditor'
import './App.css'

function App() {
  const [uploadedImage, setUploadedImage] = useState(null)

  // Load session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('imageEditorSession')
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        setUploadedImage(session)
      } catch (e) {
        console.error('Failed to load session:', e)
        localStorage.removeItem('imageEditorSession')
      }
    }
  }, [])

  const handleImageUpload = (image) => {
    setUploadedImage(image)
    // Save to session (only save the preview, not the File object)
    localStorage.setItem('imageEditorSession', JSON.stringify({
      preview: image.preview
      // Don't save file object - it can't be serialized
    }))
  }

  const handleReset = () => {
    setUploadedImage(null)
    localStorage.removeItem('imageEditorSession')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎨 AI Image Editor</h1>
        <p>Powered by Google Gemini</p>
      </header>
      
      <main className="app-main">
        {!uploadedImage ? (
          <ImageUploader onImageUpload={handleImageUpload} />
        ) : (
          <ImageEditor 
            image={uploadedImage} 
            onReset={handleReset} 
          />
        )}
      </main>
    </div>
  )
}

export default App
