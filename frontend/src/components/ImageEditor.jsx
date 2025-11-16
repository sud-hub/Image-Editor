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
  FlipHorizontal,
  Type,
  Crop,
  FileImage,
  Undo
} from 'lucide-react'
import axios from 'axios'
import './ImageEditor.css'

const API_URL = 'http://localhost:8000'

function ImageEditor({ image, onReset }) {
  const [editedImage, setEditedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('adjust')
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState(null)
  const [editHistory, setEditHistory] = useState([])

  // Load edited image from session on mount
  useEffect(() => {
    const savedEditedImage = localStorage.getItem('editedImage')
    if (savedEditedImage) {
      setEditedImage(savedEditedImage)
    }
  }, [])

  // Save edited image to session whenever it changes
  useEffect(() => {
    if (editedImage) {
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
  
  // Crop states
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const [cropWidth, setCropWidth] = useState(500)
  const [cropHeight, setCropHeight] = useState(500)

  const handleAIEdit = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    saveToHistory()
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', image.file)
      formData.append('prompt', prompt)

      const response = await axios.post(`${API_URL}/api/ai-edit`, formData, {
        responseType: 'blob'
      })

      const imageUrl = URL.createObjectURL(response.data)
      setEditedImage(imageUrl)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to edit image')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBackground = async () => {
    saveToHistory()
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', image.file)

      const response = await axios.post(`${API_URL}/api/remove-background`, formData, {
        responseType: 'blob'
      })

      const imageUrl = URL.createObjectURL(response.data)
      setEditedImage(imageUrl)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove background')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerativeFill = async () => {
    if (!prompt.trim()) {
      setError('Please describe what you want to fill or modify')
      return
    }

    saveToHistory()
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', image.file)
      formData.append('prompt', prompt)

      const response = await axios.post(`${API_URL}/api/generative-fill`, formData, {
        responseType: 'blob'
      })

      const imageUrl = URL.createObjectURL(response.data)
      setEditedImage(imageUrl)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate fill')
    } finally {
      setLoading(false)
    }
  }

  const handleAdjust = async () => {
    saveToHistory()
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', image.file)
      formData.append('brightness', brightness)
      formData.append('contrast', contrast)
      formData.append('saturation', saturation)
      formData.append('sharpness', sharpness)

      const response = await axios.post(`${API_URL}/api/adjust`, formData, {
        responseType: 'blob'
      })

      const imageUrl = URL.createObjectURL(response.data)
      setEditedImage(imageUrl)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to adjust image')
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = async (filterType) => {
    saveToHistory()
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', image.file)
      formData.append('filter_type', filterType)

      const response = await axios.post(`${API_URL}/api/filter`, formData, {
        responseType: 'blob'
      })

      const imageUrl = URL.createObjectURL(response.data)
      setEditedImage(imageUrl)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to apply filter')
    } finally {
      setLoading(false)
    }
  }

  const handleRotate = async (angle) => {
    saveToHistory()
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', image.file)
      formData.append('angle', angle)

      const response = await axios.post(`${API_URL}/api/rotate`, formData, {
        responseType: 'blob'
      })

      const imageUrl = URL.createObjectURL(response.data)
      setEditedImage(imageUrl)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to rotate image')
    } finally {
      setLoading(false)
    }
  }

  const handleFlip = async (direction) => {
    saveToHistory()
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', image.file)
      formData.append('direction', direction)

      const response = await axios.post(`${API_URL}/api/flip`, formData, {
        responseType: 'blob'
      })

      const imageUrl = URL.createObjectURL(response.data)
      setEditedImage(imageUrl)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to flip image')
    } finally {
      setLoading(false)
    }
  }

  const handleAddText = async () => {
    if (!text.trim()) {
      setError('Please enter text')
      return
    }

    saveToHistory()
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', image.file)
      formData.append('text', text)
      formData.append('x', textX)
      formData.append('y', textY)
      formData.append('size', textSize)
      formData.append('color', textColor)

      const response = await axios.post(`${API_URL}/api/add-text`, formData, {
        responseType: 'blob'
      })

      const imageUrl = URL.createObjectURL(response.data)
      setEditedImage(imageUrl)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add text')
    } finally {
      setLoading(false)
    }
  }

  const handleCrop = async () => {
    saveToHistory()
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', image.file)
      formData.append('x', cropX)
      formData.append('y', cropY)
      formData.append('width', cropWidth)
      formData.append('height', cropHeight)

      const response = await axios.post(`${API_URL}/api/crop`, formData, {
        responseType: 'blob'
      })

      const imageUrl = URL.createObjectURL(response.data)
      setEditedImage(imageUrl)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to crop image')
    } finally {
      setLoading(false)
    }
  }

  const handleConvert = async (format) => {
    saveToHistory()
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', image.file)
      formData.append('format', format)

      const response = await axios.post(`${API_URL}/api/convert`, formData, {
        responseType: 'blob'
      })

      const imageUrl = URL.createObjectURL(response.data)
      setEditedImage(imageUrl)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to convert image')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = editedImage || image.preview
    link.download = `edited-image-${Date.now()}.png`
    link.click()
  }

  const handleUndo = () => {
    if (editHistory.length > 0) {
      const previousImage = editHistory[editHistory.length - 1]
      setEditHistory(editHistory.slice(0, -1))
      setEditedImage(previousImage)
    } else {
      setEditedImage(null)
      localStorage.removeItem('editedImage')
    }
  }

  const saveToHistory = () => {
    if (editedImage) {
      setEditHistory([...editHistory, editedImage])
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
              <input type="text" placeholder="Enter text" value={text} 
                onChange={(e) => setText(e.target.value)} />
              <div className="input-row">
                <input type="number" placeholder="X" value={textX} 
                  onChange={(e) => setTextX(parseInt(e.target.value))} />
                <input type="number" placeholder="Y" value={textY} 
                  onChange={(e) => setTextY(parseInt(e.target.value))} />
              </div>
              <div className="input-row">
                <input type="number" placeholder="Size" value={textSize} 
                  onChange={(e) => setTextSize(parseInt(e.target.value))} />
                <input type="color" value={textColor} 
                  onChange={(e) => setTextColor(e.target.value)} />
              </div>
              <button className="action-btn" onClick={handleAddText} disabled={loading}>
                {loading ? <Loader2 className="spin" size={16} /> : <Type size={16} />}
                Add Text
              </button>
            </div>
          )}

          {activeTab === 'crop' && (
            <div className="control-section">
              <h3>Crop Image</h3>
              <div className="input-row">
                <input type="number" placeholder="X" value={cropX} 
                  onChange={(e) => setCropX(parseInt(e.target.value))} />
                <input type="number" placeholder="Y" value={cropY} 
                  onChange={(e) => setCropY(parseInt(e.target.value))} />
              </div>
              <div className="input-row">
                <input type="number" placeholder="Width" value={cropWidth} 
                  onChange={(e) => setCropWidth(parseInt(e.target.value))} />
                <input type="number" placeholder="Height" value={cropHeight} 
                  onChange={(e) => setCropHeight(parseInt(e.target.value))} />
              </div>
              <button className="action-btn" onClick={handleCrop} disabled={loading}>
                {loading ? <Loader2 className="spin" size={16} /> : <Crop size={16} />}
                Crop
              </button>
            </div>
          )}

          {activeTab === 'convert' && (
            <div className="control-section">
              <h3>Convert Format</h3>
              <div className="basic-buttons">
                <button onClick={() => handleConvert('png')} disabled={loading}>To PNG</button>
                <button onClick={() => handleConvert('jpg')} disabled={loading}>To JPG</button>
                <button onClick={() => handleConvert('webp')} disabled={loading}>To WebP</button>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>

      <div className="editor-preview">
        <div className="preview-container">
          <img 
            src={editedImage || image.preview} 
            alt="Preview" 
            className="preview-image"
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
          Download
        </button>
      </div>
    </div>
  )
}

export default ImageEditor
