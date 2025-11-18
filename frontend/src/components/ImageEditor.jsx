import { useState, useEffect } from 'react'
import { 
  Wand2, 
  Eraser, 
  Sparkles,
  Download,
  RotateCcw,
  Loader2,
  Sliders,
  Palette,
  RotateCw,
  Type,
  Crop,
  FileImage,
  Undo,
  Minimize2
} from 'lucide-react'
import axios from 'axios'
import CanvasEditor from './CanvasEditor'
import { validateAdjustParams, validateCropParams, validateTextParams } from '../utils/validation'
import './ImageEditor.css'

const API_URL = 'http://localhost:8000'

function ImageEditor({ image, onReset }) {
  const [editedImage, setEditedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('adjust')
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState(null)
  const [editHistory, setEditHistory] = useState([])
  const [compressedSize, setCompressedSize] = useState(null)
  const [originalSize, setOriginalSize] = useState(null)
  const [compressionQuality, setCompressionQuality] = useState(85)

  // Load edited image from session on mount
  useEffect(() => {
    const savedEditedImage = localStorage.getItem('editedImage')
    if (savedEditedImage) {
      setEditedImage(savedEditedImage)
    }
  }, [])

  // Save edited image to session whenever it changes
  useEffect(() => {
    if (editedImage && !editedImage.startsWith('blob:')) {
      // Only save non-blob URLs (data URLs work, blob URLs don't persist)
      localStorage.setItem('editedImage', editedImage)
    }
  }, [editedImage])
  
  // Adjustment states
  const [brightness, setBrightness] = useState(1.0)
  const [contrast, setContrast] = useState(1.0)
  const [saturation, setSaturation] = useState(1.0)
  const [sharpness, setSharpness] = useState(1.0)
  
  // Text states
  const [text, setText] = useState('')
  const [textX, setTextX] = useState(50)
  const [textY, setTextY] = useState(50)
  const [textSize, setTextSize] = useState(40)
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [textFont, setTextFont] = useState('Arial')
  const [textBgColor, setTextBgColor] = useState('transparent')
  
  // Crop states
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const [cropWidth, setCropWidth] = useState(500)
  const [cropHeight, setCropHeight] = useState(500)
  const [cropMode, setCropMode] = useState(false)
  
  // Transform states for canvas preview
  const [currentFilter, setCurrentFilter] = useState(null)
  const [currentRotation, setCurrentRotation] = useState(0)
  const [currentFlip, setCurrentFlip] = useState(null)

  const handleAIEdit = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    saveToHistory()
    setLoading(true)
    setError(null)
    
    await sendToBackend('/api/ai-edit', {
      prompt
    })
    
    setLoading(false)
  }

  const handleRemoveBackground = async () => {
    saveToHistory()
    setLoading(true)
    setError(null)
    
    await sendToBackend('/api/remove-background', {})
    
    setLoading(false)
  }

  const handleGenerativeFill = async () => {
    if (!prompt.trim()) {
      setError('Please describe what you want to fill or modify')
      return
    }

    saveToHistory()
    setLoading(true)
    setError(null)
    
    await sendToBackend('/api/generative-fill', {
      prompt
    })
    
    setLoading(false)
  }

  // Unified handler for all API calls
  const sendToBackend = async (endpoint, data) => {
    try {
      console.log(`Sending to ${endpoint}:`, data)
      
      const currentFile = await getCurrentImageFile()
      console.log('File obtained:', currentFile.name, currentFile.size, currentFile.type)
      
      const formData = new FormData()
      formData.append('file', currentFile)
      
      // Add all data fields - let FormData handle type serialization
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value)
        }
      })

      console.log('Sending FormData to backend...')
      // Log FormData entries (note: File objects won't show full content)
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`)
        } else {
          console.log(`  ${key}:`, value)
        }
      }
      
      // Don't set Content-Type manually - let axios set it with the boundary
      const response = await axios.post(`${API_URL}${endpoint}`, formData, {
        responseType: 'blob'
      })

      console.log('Response received:', response.data.size, response.data.type)
      
      if (response.data.size === 0) {
        throw new Error('Backend returned empty image')
      }

      // Revoke old blob URL to prevent memory leaks
      if (editedImage && editedImage.startsWith('blob:')) {
        URL.revokeObjectURL(editedImage)
      }

      const imageUrl = URL.createObjectURL(response.data)
      setEditedImage(imageUrl)
      setError(null)
      return true
    } catch (err) {
      // Enhanced logging for 422 validation errors
      if (err.response?.status === 422) {
        console.error('=== 422 Validation Error ===')
        console.error('Endpoint:', endpoint)
        console.error('Sent data:', data)
        
        // If response data is a Blob, read it as text
        if (err.response?.data instanceof Blob) {
          err.response.data.text().then(text => {
            console.error('Validation error details:', text)
            try {
              const parsed = JSON.parse(text)
              console.error('Parsed validation errors:', parsed)
              setError(`Validation error: ${JSON.stringify(parsed.detail || parsed)}`)
            } catch {
              console.error('Raw validation error:', text)
              setError(`Validation error: ${text}`)
            }
          })
        } else {
          console.error('Validation errors:', err.response?.data)
          setError(err.response?.data?.detail || err.message || 'Validation failed')
        }
        console.error('===========================')
      } else {
        console.error(`Error at ${endpoint}:`, {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        })
        const errorMsg = err.response?.data?.detail || err.message || `Failed to process image`
        setError(errorMsg)
      }
      return false
    }
  }

  // Get canvas as file for adjustments
  const getCanvasAsFile = () => {
    return new Promise((resolve, reject) => {
      const canvas = document.querySelector('.editor-canvas')
      if (!canvas) {
        reject(new Error('Canvas not found'))
        return
      }
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'adjusted-image.png', { type: 'image/png' })
          resolve(file)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      }, 'image/png')
    })
  }

  const handleAdjust = async () => {
    // Validate adjustment parameters before processing
    const validation = validateAdjustParams({
      brightness,
      contrast,
      saturation,
      sharpness
    })

    if (!validation.valid) {
      setError(validation.error)
      return
    }

    saveToHistory()
    setLoading(true)
    setError(null)
    
    try {
      // Get the canvas-rendered image (with CSS filters applied)
      const canvasFile = await getCanvasAsFile()
      
      // Create a blob URL from the canvas
      const canvasBlob = await canvasFile.arrayBuffer()
      const blob = new Blob([canvasBlob], { type: 'image/png' })
      const imageUrl = URL.createObjectURL(blob)
      
      // Set as edited image (no need to send to backend for adjustments)
      setEditedImage(imageUrl)
      setError(null)
    } catch (err) {
      setError('Failed to apply adjustments: ' + err.message)
      console.error('Adjust error:', err)
    }
    
    setLoading(false)
  }

  const handleFilter = async (filterType) => {
    setCurrentFilter(filterType)
    saveToHistory()
    setLoading(true)
    setError(null)
    
    const success = await sendToBackend('/api/filter', {
      filter_type: filterType
    })
    
    setCurrentFilter(null)
    setLoading(false)
  }

  const handleRotate = async (angle) => {
    setCurrentRotation(angle)
    saveToHistory()
    setLoading(true)
    setError(null)
    
    const success = await sendToBackend('/api/rotate', {
      angle
    })
    
    setCurrentRotation(0)
    setLoading(false)
  }

  const handleFlip = async (direction) => {
    setCurrentFlip(direction)
    saveToHistory()
    setLoading(true)
    setError(null)
    
    const success = await sendToBackend('/api/flip', {
      direction
    })
    
    setCurrentFlip(null)
    setLoading(false)
  }

  const handleAddText = async () => {
    // Validate text parameters before sending
    const validation = validateTextParams({
      text,
      x: textX,
      y: textY,
      size: textSize,
      color: textColor
    })

    if (!validation.valid) {
      setError(validation.error)
      return
    }

    saveToHistory()
    setLoading(true)
    setError(null)
    
    await sendToBackend('/api/add-text', {
      text,
      x: textX,
      y: textY,
      size: textSize,
      color: textColor
    })
    
    setText('')
    setLoading(false)
  }

  const handleTextComplete = async (textData) => {
    setTextX(textData.x)
    setTextY(textData.y)
    
    // Use the dragged position directly instead of waiting for state update
    const validation = validateTextParams({
      text,
      x: textData.x,
      y: textData.y,
      size: textSize,
      color: textColor
    })

    if (!validation.valid) {
      setError(validation.error)
      return
    }

    saveToHistory()
    setLoading(true)
    setError(null)
    
    await sendToBackend('/api/add-text', {
      text,
      x: textData.x,
      y: textData.y,
      size: textSize,
      color: textColor
    })
    
    setText('')
    setLoading(false)
  }

  const handleCrop = async (cropData) => {
    // Use provided cropData or fall back to state
    const x = cropData?.x ?? cropX
    const y = cropData?.y ?? cropY
    const width = cropData?.width ?? cropWidth
    const height = cropData?.height ?? cropHeight
    
    // Validate crop parameters before sending
    const validation = validateCropParams({ x, y, width, height })

    if (!validation.valid) {
      setError(validation.error)
      setLoading(false)
      return
    }

    saveToHistory()
    setLoading(true)
    setError(null)
    
    console.log('Sending crop request:', { x, y, width, height })
    
    await sendToBackend('/api/crop', {
      x,
      y,
      width,
      height
    })
    
    setCropMode(false)
    setLoading(false)
  }

  const handleCropComplete = (cropData) => {
    console.log('=== ImageEditor received crop data ===')
    console.log('Crop data:', cropData)
    // Update state for display
    setCropX(cropData.x)
    setCropY(cropData.y)
    setCropWidth(cropData.width)
    setCropHeight(cropData.height)
    // Pass cropData directly to avoid async state issues
    handleCrop(cropData)
  }

  const handleConvert = async (format) => {
    saveToHistory()
    setLoading(true)
    setError(null)
    
    const success = await sendToBackend('/api/convert', {
      format
    })
    
    if (success) {
      setError(`✓ Successfully converted to ${format.toUpperCase()}`)
      setTimeout(() => setError(null), 3000)
    }
    
    setLoading(false)
  }

  const handleCompress = async () => {
    saveToHistory()
    setLoading(true)
    setError(null)
    
    try {
      const currentFile = await getCurrentImageFile()
      
      // Calculate original size in KB
      const originalSizeKB = (currentFile.size / 1024).toFixed(2)
      setOriginalSize(originalSizeKB)
      
      const formData = new FormData()
      formData.append('file', currentFile)
      formData.append('quality', compressionQuality)

      console.log(`Compressing image: Original size = ${originalSizeKB} KB, Quality = ${compressionQuality}%`)

      const response = await axios.post(`${API_URL}/api/compress`, formData, {
        responseType: 'blob'
      })

      if (response.data.size === 0) {
        throw new Error('Backend returned empty image')
      }

      // Calculate compressed size from blob
      const compressedSizeKB = (response.data.size / 1024).toFixed(2)
      setCompressedSize(compressedSizeKB)
      
      // Calculate compression ratio
      const compressionRatio = ((1 - response.data.size / currentFile.size) * 100).toFixed(1)

      // Revoke old blob URL
      if (editedImage && editedImage.startsWith('blob:')) {
        URL.revokeObjectURL(editedImage)
      }

      const imageUrl = URL.createObjectURL(response.data)
      setEditedImage(imageUrl)
      
      setError(`✓ Compressed from ${originalSizeKB} KB to ${compressedSizeKB} KB (${compressionRatio}% reduction)`)
      setTimeout(() => setError(null), 5000)
      
      console.log(`Compression successful: ${originalSizeKB} KB → ${compressedSizeKB} KB (${compressionRatio}% reduction)`)
    } catch (err) {
      console.error('Compress error:', err)
      setError(err.response?.data?.detail || err.message || 'Compression failed')
    }
    
    setLoading(false)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = editedImage || image.preview // Always use the latest version
    link.download = `edited-image-${Date.now()}.png`
    link.click()
  }

  const handleUndo = () => {
    if (editHistory.length > 0) {
      // Get the previous state
      const previousImage = editHistory[editHistory.length - 1]
      // Remove it from history
      const newHistory = editHistory.slice(0, -1)
      setEditHistory(newHistory)
      // Set as current image
      setEditedImage(previousImage)
      // Update localStorage
      if (previousImage) {
        localStorage.setItem('editedImage', previousImage)
      } else {
        localStorage.removeItem('editedImage')
      }
    } else {
      // No history, go back to original
      setEditedImage(null)
      localStorage.removeItem('editedImage')
      // Reset adjustments
      setBrightness(1.0)
      setContrast(1.0)
      setSaturation(1.0)
      setSharpness(1.0)
    }
  }

  const saveToHistory = () => {
    // Save current state before making changes
    const currentState = editedImage || null
    setEditHistory([...editHistory, currentState])
  }

  // Helper to get current image as file - ALWAYS use the latest edited version
  const getCurrentImageFile = async () => {
    const currentImageUrl = editedImage || image.preview
    
    try {
      // Check if we have a valid File object from the original upload
      if (image.file && image.file instanceof File && !editedImage) {
        console.log('Using original File object')
        return image.file
      }
      
      // Otherwise, fetch the image URL and convert to File
      console.log('Fetching image from URL:', currentImageUrl?.substring(0, 50) + '...')
      
      // If it's a blob URL, fetch it directly
      if (currentImageUrl?.startsWith('blob:')) {
        const response = await fetch(currentImageUrl)
        if (!response.ok) throw new Error('Failed to fetch blob')
        
        const blob = await response.blob()
        if (blob.size === 0) throw new Error('Empty blob')
        
        return new File([blob], 'image.png', { type: blob.type || 'image/png' })
      }
      
      // If it's a data URL or regular URL
      if (currentImageUrl) {
        const response = await fetch(currentImageUrl)
        if (!response.ok) throw new Error('Failed to fetch image')
        
        const blob = await response.blob()
        if (blob.size === 0) throw new Error('Empty blob')
        
        return new File([blob], 'image.png', { type: blob.type || 'image/png' })
      }
      
      throw new Error('No valid image URL available')
    } catch (error) {
      console.error('Error converting image to file:', error)
      throw new Error('Failed to get image file: ' + error.message)
    }
  }

  return (
    <div className="editor-container">
      <div className="editor-sidebar">
        <div className="top-buttons">
          <button className="reset-btn" onClick={onReset}>
            <RotateCcw size={18} />
            New Image
          </button>
          <button 
            className="undo-btn" 
            onClick={handleUndo}
            disabled={editHistory.length === 0 && !editedImage}
          >
            <Undo size={18} />
            Undo
          </button>
        </div>

        <div className="tabs-section">
          <div className="tabs-group">
            <h4 className="tabs-label">AI Features</h4>
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'ai-edit' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai-edit')}
              >
                <Wand2 size={16} />
                AI Edit
              </button>
              <button 
                className={`tab ${activeTab === 'bg-remove' ? 'active' : ''}`}
                onClick={() => setActiveTab('bg-remove')}
              >
                <Eraser size={16} />
                Remove BG
              </button>
              <button 
                className={`tab ${activeTab === 'gen-fill' ? 'active' : ''}`}
                onClick={() => setActiveTab('gen-fill')}
              >
                <Sparkles size={16} />
                Gen Fill
              </button>
            </div>
          </div>

          <div className="tabs-group">
            <h4 className="tabs-label">Basic Features</h4>
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'adjust' ? 'active' : ''}`}
                onClick={() => setActiveTab('adjust')}
              >
                <Sliders size={16} />
                Adjust
              </button>
              <button 
                className={`tab ${activeTab === 'filters' ? 'active' : ''}`}
                onClick={() => setActiveTab('filters')}
              >
                <Palette size={16} />
                Filters
              </button>
              <button 
                className={`tab ${activeTab === 'transform' ? 'active' : ''}`}
                onClick={() => setActiveTab('transform')}
              >
                <RotateCw size={16} />
                Transform
              </button>
              <button 
                className={`tab ${activeTab === 'text' ? 'active' : ''}`}
                onClick={() => setActiveTab('text')}
              >
                <Type size={16} />
                Text
              </button>
              <button 
                className={`tab ${activeTab === 'crop' ? 'active' : ''}`}
                onClick={() => setActiveTab('crop')}
              >
                <Crop size={16} />
                Crop
              </button>
              <button 
                className={`tab ${activeTab === 'convert' ? 'active' : ''}`}
                onClick={() => setActiveTab('convert')}
              >
                <FileImage size={16} />
                Convert
              </button>
              <button 
                className={`tab ${activeTab === 'compress' ? 'active' : ''}`}
                onClick={() => setActiveTab('compress')}
              >
                <Minimize2 size={16} />
                Compress
              </button>
            </div>
          </div>
        </div>

        <div className="controls">
          {activeTab === 'ai-edit' && (
            <div className="control-section">
              <h3>AI Editing</h3>
              <textarea
                placeholder="Describe your edit... (e.g., 'Make the sky more dramatic', 'Add a sunset')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
              />
              <button className="action-btn" onClick={handleAIEdit} disabled={loading}>
                {loading ? <Loader2 className="spin" size={16} /> : <Wand2 size={16} />}
                Apply
              </button>
            </div>
          )}

          {activeTab === 'bg-remove' && (
            <div className="control-section">
              <h3>Background Removal</h3>
              <p>Remove background using AI</p>
              <button className="action-btn" onClick={handleRemoveBackground} disabled={loading}>
                {loading ? <Loader2 className="spin" size={16} /> : <Eraser size={16} />}
                Remove Background
              </button>
            </div>
          )}

          {activeTab === 'gen-fill' && (
            <div className="control-section">
              <h3>Generative Fill</h3>
              <textarea
                placeholder="Describe what to fill... (e.g., 'Fill empty space with trees')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
              />
              <button className="action-btn" onClick={handleGenerativeFill} disabled={loading}>
                {loading ? <Loader2 className="spin" size={16} /> : <Sparkles size={16} />}
                Generate
              </button>
            </div>
          )}

          {activeTab === 'adjust' && (
            <div className="control-section">
              <h3>Adjustments</h3>
              <div className="slider-group">
                <label>Brightness: {brightness.toFixed(1)}</label>
                <input type="range" min="0" max="2" step="0.1" value={brightness} 
                  onChange={(e) => setBrightness(parseFloat(e.target.value))} />
              </div>
              <div className="slider-group">
                <label>Contrast: {contrast.toFixed(1)}</label>
                <input type="range" min="0" max="2" step="0.1" value={contrast} 
                  onChange={(e) => setContrast(parseFloat(e.target.value))} />
              </div>
              <div className="slider-group">
                <label>Saturation: {saturation.toFixed(1)}</label>
                <input type="range" min="0" max="2" step="0.1" value={saturation} 
                  onChange={(e) => setSaturation(parseFloat(e.target.value))} />
              </div>
              <div className="slider-group">
                <label>Sharpness: {sharpness.toFixed(1)}</label>
                <input type="range" min="0" max="2" step="0.1" value={sharpness} 
                  onChange={(e) => setSharpness(parseFloat(e.target.value))} />
              </div>
              <button className="action-btn" onClick={handleAdjust} disabled={loading}>
                {loading ? <Loader2 className="spin" size={16} /> : <Sliders size={16} />}
                Apply Adjustments
              </button>
            </div>
          )}

          {activeTab === 'filters' && (
            <div className="control-section">
              <h3>Filters</h3>
              <div className="basic-buttons">
                <button onClick={() => handleFilter('blur')} disabled={loading}>Blur</button>
                <button onClick={() => handleFilter('sharpen')} disabled={loading}>Sharpen</button>
                <button onClick={() => handleFilter('grayscale')} disabled={loading}>Grayscale</button>
                <button onClick={() => handleFilter('sepia')} disabled={loading}>Sepia</button>
                <button onClick={() => handleFilter('vintage')} disabled={loading}>Vintage</button>
                <button onClick={() => handleFilter('edge')} disabled={loading}>Edge Detect</button>
                <button onClick={() => handleFilter('emboss')} disabled={loading}>Emboss</button>
              </div>
            </div>
          )}

          {activeTab === 'transform' && (
            <div className="control-section">
              <h3>Transform</h3>
              <div className="basic-buttons">
                <button onClick={() => handleRotate(90)} disabled={loading}>Rotate 90°</button>
                <button onClick={() => handleRotate(180)} disabled={loading}>Rotate 180°</button>
                <button onClick={() => handleRotate(270)} disabled={loading}>Rotate 270°</button>
                <button onClick={() => handleFlip('horizontal')} disabled={loading}>Flip H</button>
                <button onClick={() => handleFlip('vertical')} disabled={loading}>Flip V</button>
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="control-section">
              <h3>Add Text</h3>
              <p>Type text and drag it on the image</p>
              <input 
                type="text" 
                placeholder="Enter text here..." 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
              />
              
              <div className="text-controls-grid">
                <div className="text-control-item">
                  <label className="input-label">Font</label>
                  <select 
                    value={textFont} 
                    onChange={(e) => setTextFont(e.target.value)}
                    className="text-select"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times</option>
                    <option value="Courier New">Courier</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Comic Sans MS">Comic Sans</option>
                    <option value="Impact">Impact</option>
                  </select>
                </div>

                <div className="text-control-item">
                  <label className="input-label">Size: {textSize}px</label>
                  <input 
                    type="range" 
                    min="12" 
                    max="120" 
                    value={textSize} 
                    onChange={(e) => setTextSize(parseInt(e.target.value))}
                    className="text-slider"
                  />
                </div>
              </div>

              <div className="text-color-grid">
                <div className="compact-color-input">
                  <label>Text</label>
                  <input 
                    type="color" 
                    value={textColor} 
                    onChange={(e) => setTextColor(e.target.value)} 
                  />
                </div>
                <div className="compact-color-input">
                  <label>BG</label>
                  <input 
                    type="color" 
                    value={textBgColor === 'transparent' ? '#000000' : textBgColor} 
                    onChange={(e) => setTextBgColor(e.target.value)}
                    disabled={textBgColor === 'transparent'}
                  />
                </div>
                <label className="checkbox-label compact">
                  <input 
                    type="checkbox" 
                    checked={textBgColor === 'transparent'}
                    onChange={(e) => setTextBgColor(e.target.checked ? 'transparent' : '#000000')}
                  />
                  <span>Transparent</span>
                </label>
              </div>

              <button className="action-btn" onClick={handleAddText} disabled={loading || !text}>
                {loading ? <Loader2 className="spin" size={16} /> : <Type size={16} />}
                Apply Text
              </button>
            </div>
          )}

          {activeTab === 'crop' && (
            <div className="control-section">
              <h3>Crop Image</h3>
              <p>Click and drag on the image to select crop area</p>
              <button 
                className={`action-btn ${cropMode ? 'active' : ''}`}
                onClick={() => setCropMode(!cropMode)} 
                disabled={loading}
              >
                <Crop size={16} />
                {cropMode ? 'Exit Crop Mode' : 'Enter Crop Mode'}
              </button>
            </div>
          )}

          {activeTab === 'convert' && (
            <div className="control-section">
              <h3>Convert Format</h3>
              <div className="basic-buttons">
                <button onClick={() => handleConvert('png')} disabled={loading}>PNG</button>
                <button onClick={() => handleConvert('jpg')} disabled={loading}>JPG</button>
                <button onClick={() => handleConvert('webp')} disabled={loading}>WebP</button>
                <button onClick={() => handleConvert('bmp')} disabled={loading}>BMP</button>
                <button onClick={() => handleConvert('tiff')} disabled={loading}>TIFF</button>
                <button onClick={() => handleConvert('gif')} disabled={loading}>GIF</button>
                <button onClick={() => handleConvert('ico')} disabled={loading}>ICO</button>
              </div>
            </div>
          )}

          {activeTab === 'compress' && (
            <div className="control-section">
              <h3>Compress Image</h3>
              <p>Reduce file size by adjusting quality (1-100)</p>
              <div className="slider-group">
                <label>Quality: {compressionQuality}%</label>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={compressionQuality} 
                  onChange={(e) => setCompressionQuality(parseInt(e.target.value))}
                />
              </div>
              {originalSize && compressedSize && (
                <div className="compress-info">
                  <p><strong>Original:</strong> {originalSize} KB</p>
                  <p><strong>Compressed:</strong> {compressedSize} KB</p>
                  <p><strong>Saved:</strong> {(originalSize - compressedSize).toFixed(2)} KB ({((1 - compressedSize / originalSize) * 100).toFixed(1)}%)</p>
                </div>
              )}
              <button className="action-btn" onClick={handleCompress} disabled={loading}>
                {loading ? <Loader2 className="spin" size={16} /> : <Minimize2 size={16} />}
                Compress Image
              </button>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>

      <div className="editor-preview">
        <div className="preview-container">
          <CanvasEditor
            image={editedImage || image.preview}
            brightness={brightness}
            contrast={contrast}
            saturation={saturation}
            cropMode={cropMode}
            textMode={activeTab === 'text'}
            textConfig={{
              text,
              size: textSize,
              color: textColor,
              font: textFont,
              bgColor: textBgColor
            }}
            filterType={activeTab === 'filters' ? currentFilter : null}
            rotationAngle={currentRotation}
            flipDirection={currentFlip}
            onCropComplete={handleCropComplete}
            onTextComplete={handleTextComplete}
          />
          {loading && (
            <div className="loading-overlay">
              <Loader2 className="spin" size={48} />
              <p>Processing...</p>
            </div>
          )}
        </div>
        

        <button className="download-btn" onClick={handleDownload}>
          <Download size={18} />
          Download {editedImage ? 'Edited' : 'Original'}
        </button>
      </div>
    </div>
  )
}

export default ImageEditor
