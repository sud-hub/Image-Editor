# AI Image Editor

A powerful, full-featured image editing application powered by AI and traditional image processing techniques. Built with React, FastAPI, and OpenCV.

## 🌟 Features

### AI Features
- **AI Edit** - Natural language image editing using Google Gemini AI
- **Remove Background** - Intelligent background removal with AI
- **Generative Fill** - AI-powered inpainting and content generation

### Basic Features
- **Adjust** - Brightness, contrast, saturation, and sharpness controls
- **Filters** - Blur, sharpen, grayscale, sepia, vintage, edge detection, emboss (powered by OpenCV)
- **Transform** - Rotate (90°, 180°, 270°) and flip (horizontal/vertical)
- **Text** - Add customizable text with font, size, color, and background options
- **Crop** - Interactive crop tool with visual selection
- **Convert** - Format conversion (PNG, JPG, WebP, BMP, TIFF, GIF, ICO)
- **Compress** - Image compression with quality control and size comparison

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Google API Key (for AI features)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ai-image-editor
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables
Create a `.env` file in the `backend` directory:
```env
GOOGLE_API_KEY=your_google_api_key_here
```

Get your Google API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)

#### Run the Backend Server
```bash
python main.py
```

The backend will start on `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Run the Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Access the Application
Open your browser and navigate to:
```
http://localhost:5173
```

## 📖 Usage Guide

### Getting Started
1. **Upload an Image** - Click the upload area or drag & drop an image
2. **Select a Feature** - Choose from AI Features or Basic Features tabs
3. **Apply Edits** - Configure settings and click Apply
4. **Download** - Download your edited image

### Feature Details

#### AI Features
- **AI Edit**: Describe what you want to change (e.g., "Make the sky more dramatic")
- **Remove Background**: Automatically removes the background, making it transparent
- **Generative Fill**: Describe areas to fill or modify (e.g., "Fill empty space with trees")

#### Basic Features
- **Adjust**: Use sliders to modify brightness, contrast, saturation, and sharpness
- **Filters**: Apply various filters with one click (all powered by OpenCV)
- **Transform**: Rotate or flip your image in any direction
- **Text**: Add text with custom fonts, sizes, colors, and backgrounds
- **Crop**: Click and drag on the image to select the crop area
- **Convert**: Convert between different image formats
- **Compress**: Reduce file size while maintaining quality

### Undo Feature
Use the **Undo** button to revert to the previous state. You can undo multiple times to go back through your edit history.

## 🏗️ Project Structure

```
ai-image-editor/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageEditor.jsx
│   │   │   ├── ImageUploader.jsx
│   │   │   ├── CanvasEditor.jsx
│   │   │   └── *.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── README.md
└── .gitignore
```

## 🔧 Technology Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **FastAPI** - Web framework
- **OpenCV (cv2)** - Image processing
- **Pillow (PIL)** - Image manipulation
- **Google Gemini AI** - AI features

## 📸 Screenshots

### Main Interface
![Main Interface](./screenshots/main-interface.png)

### AI Features
![AI Features](./screenshots/ai-features.png)

### Basic Features
![Basic Features](./screenshots/basic-features.png)

### Image Editing
![Image Editing](./screenshots/image-editing.png)

## 🐛 Troubleshooting

### Backend Connection Issues
- Ensure the backend is running on `http://localhost:8000`
- Check that the CORS middleware is properly configured
- Verify your firewall settings

### AI Features Not Working
- Verify your Google API Key is correct
- Check your internet connection
- Ensure you have sufficient API quota

### Image Upload Issues
- Check file size (recommended < 50MB)
- Verify file format is supported (PNG, JPG, WebP, etc.)
- Ensure sufficient disk space

### Performance Issues
- Reduce image size before editing
- Close other applications to free up memory
- Clear browser cache if needed

## 📝 API Endpoints

### Image Processing
- `POST /api/upload` - Upload image
- `POST /api/crop` - Crop image
- `POST /api/add-text` - Add text to image
- `POST /api/adjust` - Adjust brightness, contrast, saturation, sharpness
- `POST /api/filter` - Apply filters (OpenCV)
- `POST /api/rotate` - Rotate image
- `POST /api/flip` - Flip image
- `POST /api/compress` - Compress image
- `POST /api/convert` - Convert image format

### AI Features
- `POST /api/ai-edit` - AI-powered editing
- `POST /api/remove-background` - Remove background
- `POST /api/generative-fill` - Generative fill

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for AI features
- OpenCV for image processing
- React and FastAPI communities

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Happy Editing! 🎨**
