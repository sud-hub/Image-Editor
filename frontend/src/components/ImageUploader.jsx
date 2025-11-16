import { useState } from 'react'
import { Upload } from 'lucide-react'
import './ImageUploader.css'

function ImageUploader({ onImageUpload }) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onImageUpload({
          file: file,
          preview: e.target.result
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="uploader-container">
      <div 
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload size={64} />
        <h2>Upload Your Image</h2>
        <p>Drag and drop or click to select</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="file-input"
        />
      </div>
    </div>
  )
}

export default ImageUploader
