import { useEffect, useRef, useState } from 'react'
import { Crop, Check, X } from 'lucide-react'
import './CanvasEditor.css'

function CanvasEditor({ 
  image, 
  brightness = 1, 
  contrast = 1, 
  saturation = 1,
  onCropComplete,
  cropMode = false,
  textMode = false,
  textConfig = {},
  onTextComplete,
  filterType = null,
  rotationAngle = 0,
  flipDirection = null
}) {
  const canvasRef = useRef(null)
  const [cropStart, setCropStart] = useState(null)
  const [cropEnd, setCropEnd] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const imageRef = useRef(null)
  const [textPosition, setTextPosition] = useState(null)
  const [isDraggingText, setIsDraggingText] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Load image
  useEffect(() => {
    if (!image) {
      console.error('No image provided to CanvasEditor')
      return
    }
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img
      // Initialize text position to center of image when entering text mode
      if (textMode && !textPosition) {
        setTextPosition({ x: img.width / 2, y: img.height / 2 })
      }
      drawImage()
    }
    img.onerror = (e) => {
      console.error('Failed to load image in canvas:', e)
    }
    img.src = image
  }, [image])

  // Reset text position to center when entering text mode
  useEffect(() => {
    if (textMode && imageRef.current && !textPosition) {
      const img = imageRef.current
      setTextPosition({ x: img.width / 2, y: img.height / 2 })
    }
  }, [textMode])

  // Redraw when adjustments change
  useEffect(() => {
    if (imageRef.current) {
      drawImage()
    }
  }, [brightness, contrast, saturation, cropStart, cropEnd, textPosition, textConfig, filterType, rotationAngle, flipDirection])

  const drawImage = () => {
    const canvas = canvasRef.current
    if (!canvas || !imageRef.current) return

    const ctx = canvas.getContext('2d')
    const img = imageRef.current

    // Set canvas size to match image
    canvas.width = img.width
    canvas.height = img.height

    // Save context state
    ctx.save()

    // Apply brightness, contrast, saturation
    ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`
    
    // Apply rotation if needed
    if (rotationAngle !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotationAngle * Math.PI) / 180)
      ctx.translate(-img.width / 2, -img.height / 2)
    }
    
    // Apply flip if needed
    if (flipDirection === 'horizontal') {
      ctx.scale(-1, 1)
      ctx.translate(-img.width, 0)
    } else if (flipDirection === 'vertical') {
      ctx.scale(1, -1)
      ctx.translate(0, -img.height)
    }
    
    // Draw image
    ctx.drawImage(img, 0, 0)
    
    // Apply filters (OpenCV-style filters via canvas)
    if (filterType) {
      applyCanvasFilter(ctx, canvas, filterType)
    }
    
    ctx.filter = 'none'
    ctx.restore()

    // Draw crop rectangle if in crop mode
    if (cropMode && cropStart && cropEnd) {
      ctx.strokeStyle = '#667eea'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      const x = Math.min(cropStart.x, cropEnd.x)
      const y = Math.min(cropStart.y, cropEnd.y)
      const width = Math.abs(cropEnd.x - cropStart.x)
      const height = Math.abs(cropEnd.y - cropStart.y)
      ctx.strokeRect(x, y, width, height)
      
      // Darken outside area
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(0, 0, canvas.width, y)
      ctx.fillRect(0, y, x, height)
      ctx.fillRect(x + width, y, canvas.width - x - width, height)
      ctx.fillRect(0, y + height, canvas.width, canvas.height - y - height)
    }

    // Draw text if in text mode
    if (textMode && textConfig.text && textPosition) {
      ctx.setLineDash([])
      ctx.font = `${textConfig.size}px ${textConfig.font || 'Arial'}`
      
      // Measure text for background
      const metrics = ctx.measureText(textConfig.text)
      const textWidth = metrics.width
      const textHeight = textConfig.size
      
      // Draw background if not transparent
      if (textConfig.bgColor && textConfig.bgColor !== 'transparent') {
        ctx.fillStyle = textConfig.bgColor
        ctx.fillRect(
          textPosition.x - 5, 
          textPosition.y - textHeight, 
          textWidth + 10, 
          textHeight + 10
        )
      }
      
      // Draw text
      ctx.fillStyle = textConfig.color || '#FFFFFF'
      ctx.fillText(textConfig.text, textPosition.x, textPosition.y)
      
      // Draw draggable border
      ctx.strokeStyle = '#667eea'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(
        textPosition.x - 5, 
        textPosition.y - textHeight, 
        textWidth + 10, 
        textHeight + 10
      )
    }
  }

  const applyCanvasFilter = (ctx, canvas, filterType) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    switch (filterType) {
      case 'grayscale':
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
          data[i] = gray
          data[i + 1] = gray
          data[i + 2] = gray
        }
        break
      case 'sepia':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
        }
        break
      case 'invert':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i]
          data[i + 1] = 255 - data[i + 1]
          data[i + 2] = 255 - data[i + 2]
        }
        break
      default:
        break
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    // Scale factors to convert from display coordinates to actual image coordinates
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    // Get mouse position relative to canvas display
    const displayX = e.clientX - rect.left
    const displayY = e.clientY - rect.top
    
    // Convert to image coordinates
    const imageX = displayX * scaleX
    const imageY = displayY * scaleY
    
    return {
      x: imageX,
      y: imageY
    }
  }

  const isOverText = (x, y) => {
    if (!textMode || !textConfig.text || !textPosition) return false
    const canvas = canvasRef.current
    if (!canvas) return false
    
    const ctx = canvas.getContext('2d')
    ctx.font = `${textConfig.size}px ${textConfig.font || 'Arial'}`
    const metrics = ctx.measureText(textConfig.text)
    const textWidth = metrics.width
    const textHeight = textConfig.size
    
    return (
      x >= textPosition.x - 5 &&
      x <= textPosition.x + textWidth + 5 &&
      y >= textPosition.y - textHeight &&
      y <= textPosition.y + 10
    )
  }

  const handleMouseDown = (e) => {
    const coords = getCanvasCoordinates(e)
    
    if (textMode && isOverText(coords.x, coords.y)) {
      setIsDraggingText(true)
      setDragOffset({
        x: coords.x - textPosition.x,
        y: coords.y - textPosition.y
      })
      return
    }
    
    if (cropMode) {
      setCropStart(coords)
      setCropEnd(coords)
      setIsDragging(true)
    }
  }

  const handleMouseMove = (e) => {
    const coords = getCanvasCoordinates(e)
    
    if (textMode && isDraggingText) {
      setTextPosition({
        x: coords.x - dragOffset.x,
        y: coords.y - dragOffset.y
      })
      return
    }
    
    if (cropMode && isDragging) {
      setCropEnd(coords)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsDraggingText(false)
  }

  const handleCropConfirm = () => {
    if (cropStart && cropEnd) {
      // These coordinates are already in image space (from getCanvasCoordinates)
      // Calculate crop box: top-left corner (x, y) and dimensions (width, height)
      const x = Math.round(Math.min(cropStart.x, cropEnd.x))
      const y = Math.round(Math.min(cropStart.y, cropEnd.y))
      const width = Math.round(Math.abs(cropEnd.x - cropStart.x))
      const height = Math.round(Math.abs(cropEnd.y - cropStart.y))
      
      // Validate crop area
      if (width < 10 || height < 10) {
        console.warn('Crop area too small, minimum 10x10 pixels')
        alert('Crop area too small. Please select a larger area (minimum 10x10 pixels).')
        return
      }
      
      const canvas = canvasRef.current
      const img = imageRef.current
      
      console.log('=== CROP DEBUG INFO ===')
      console.log('Canvas display size:', canvas?.getBoundingClientRect().width, 'x', canvas?.getBoundingClientRect().height)
      console.log('Canvas actual size:', canvas?.width, 'x', canvas?.height)
      console.log('Image actual size:', img?.width, 'x', img?.height)
      console.log('Crop start (image space):', cropStart)
      console.log('Crop end (image space):', cropEnd)
      console.log('Crop box to send:', { x, y, width, height })
      console.log('Crop box bottom-right:', { x2: x + width, y2: y + height })
      console.log('======================')
      
      onCropComplete({ x, y, width, height })
      setCropStart(null)
      setCropEnd(null)
    }
  }

  const handleCropCancel = () => {
    setCropStart(null)
    setCropEnd(null)
  }

  const handleTextConfirm = () => {
    if (onTextComplete && textPosition) {
      onTextComplete({
        x: Math.round(textPosition.x),
        y: Math.round(textPosition.y)
      })
    }
  }

  return (
    <div className="canvas-editor">
      <canvas
        ref={canvasRef}
        className={`editor-canvas ${cropMode ? 'crop-mode' : ''} ${textMode ? 'text-mode' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {cropMode && cropStart && cropEnd && (
        <div className="crop-controls">
          <button className="crop-btn confirm" onClick={handleCropConfirm}>
            <Check size={18} />
            Apply Crop
          </button>
          <button className="crop-btn cancel" onClick={handleCropCancel}>
            <X size={18} />
            Cancel
          </button>
        </div>
      )}
      {textMode && textConfig.text && (
        <div className="crop-controls">
          <button className="crop-btn confirm" onClick={handleTextConfirm}>
            <Check size={18} />
            Apply Text
          </button>
        </div>
      )}
    </div>
  )
}

export default CanvasEditor
