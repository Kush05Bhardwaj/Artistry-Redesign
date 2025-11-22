# Artistry Frontend

A modern React + Vite application for AI-powered interior design transformations. This frontend provides an intuitive interface for users to upload room photos and receive AI-generated design recommendations and visualizations.

## 🚀 Features

- **Real-time Object Detection** - Identify furniture and room elements using YOLOv8
- **Advanced Image Segmentation** - Isolate design elements with MobileSAM
- **AI Design Advice** - Get professional recommendations from LLaVA vision model
- **Image Generation** - Create stunning redesigns with Stable Diffusion
- **Full Workflow Orchestration** - Complete end-to-end design transformation with progress tracking

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Pages Overview](#pages-overview)
- [API Integration](#api-integration)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

- **Node.js** 16.x or higher
- **npm** 8.x or higher
- **Backend Services** running (see `../artistry-backend/README.md`)

## 📦 Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## 🔑 Environment Setup

Create a `.env` file in the frontend root directory:

```env
# Backend API URLs
VITE_GATEWAY_URL=http://localhost:8000
VITE_DETECT_URL=http://localhost:8001
VITE_SEGMENT_URL=http://localhost:8002
VITE_ADVISE_URL=http://localhost:8003
VITE_GENERATE_URL=http://localhost:8004
```

**Note:** These URLs must match your running backend services. All services must be accessible from the browser.

## 🎯 Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Preview Production Build

Build and preview the production version:

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Footer.jsx       # Application footer
│   │   ├── Navbar.jsx       # Navigation bar
│   │   └── animations.tsx   # Animation components
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Landing page
│   │   ├── About.jsx        # About page
│   │   ├── Detect.jsx       # Object detection page
│   │   ├── Segment.jsx      # Image segmentation page
│   │   ├── Advise.jsx       # Design advice page
│   │   ├── Generate.jsx     # Image generation page
│   │   ├── AIDesign.jsx     # Full workflow page
│   │   ├── Final.jsx        # Results display page
│   │   └── Login.jsx        # Authentication page
│   ├── services/            # API service layer
│   │   └── api.js           # Backend API integration
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
│   ├── image.bedroom.png    # Sample images
│   └── ...
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## 📄 Pages Overview

### 1. **Home** (`/`)
Landing page with hero section and feature showcase. Introduces users to the AI design platform.

### 2. **Detect** (`/detect`)
- Upload room images
- Real-time object detection using YOLOv8
- Displays annotated image with bounding boxes
- Shows detected objects (furniture, decor, etc.)

**Key Features:**
- Drag-and-drop or click to upload
- Real-time processing
- Visual bounding boxes on detected objects
- Object list with confidence scores

### 3. **Segment** (`/segment`)
- Advanced image segmentation with MobileSAM
- Isolates different design elements
- Configurable number of samples (default: 10)

**Key Features:**
- High-quality segmentation masks
- Interactive visualization
- Adjustable segmentation parameters

### 4. **Advise** (`/advise`)
- AI-powered design recommendations
- Uses LLaVA vision model for analysis
- Provides actionable improvement suggestions

**Key Features:**
- Detailed design analysis
- Professional recommendations
- Style and color advice
- Layout optimization tips

### 5. **Generate** (`/generate`)
- Create AI-generated room redesigns
- Powered by Stable Diffusion
- Customizable with text prompts

**Key Features:**
- Custom prompt input
- Adjustable generation parameters
- High-quality 512x512 output
- 20 inference steps (30-60 seconds)
- Guidance scale: 7.5

### 6. **AI Design** (`/ai-design`)
- **Complete workflow orchestration**
- Runs all services in sequence
- Real-time progress tracking
- Comprehensive results display

**Workflow Steps:**
1. **Detection** - Identify objects (25% progress)
2. **Segmentation** - Isolate elements (50% progress)
3. **Analysis** - Generate advice (75% progress)
4. **Generation** - Create redesign (100% progress)

**Key Features:**
- Progress bar with step indicators
- All results in one view
- Detected objects list
- Segmented image preview
- Design recommendations
- Final AI-generated design
- Error handling at each step

### 7. **About** (`/about`)
Information about the platform, team, and technology.

### 8. **Login** (`/login`)
User authentication (placeholder for future implementation).

## 🔌 API Integration

### Service Layer (`src/services/api.js`)

All backend communication is handled through a centralized API service:

```javascript
import {
  detectObjects,
  segmentImage,
  getDesignAdvice,
  generateDesign,
  runFullWorkflow,
  saveDesign,
  checkServicesHealth
} from './services/api';
```

### Available Functions

#### `detectObjects(imageFile)`
Detects objects in the uploaded image.
- **Input:** `File` object
- **Returns:** `{ objects: [], annotatedImage: "base64..." }`

#### `segmentImage(imageFile, numSamples = 10)`
Segments the image into distinct regions.
- **Input:** `File` object, number of samples
- **Returns:** `{ segmentedImage: "base64...", masks: [] }`

#### `getDesignAdvice(imageFile)`
Generates design recommendations.
- **Input:** `File` object
- **Returns:** `{ advice: ["tip 1", "tip 2", ...] }`

#### `generateDesign(imageFile, prompt, options)`
Creates AI-generated redesign.
- **Input:** `File`, prompt string, options object
- **Options:**
  - `numInferenceSteps` (default: 20)
  - `guidanceScale` (default: 7.5)
- **Returns:** `{ generatedImage: "base64..." }`

#### `runFullWorkflow(imageFile, prompt, options, callbacks)`
Executes complete design workflow.
- **Input:** `File`, prompt, options, callback functions
- **Callbacks:**
  - `onProgress(percentage)` - Progress updates
  - `onStepComplete(stepName, stepData)` - Step completion
  - `onProgressMessage(message)` - Status messages
- **Returns:** Complete workflow results object

#### `checkServicesHealth()`
Checks if all backend services are running.
- **Returns:** `{ gateway: bool, detect: bool, ... }`

### Error Handling

All API functions include comprehensive error handling:

```javascript
try {
  const result = await detectObjects(imageFile);
  // Handle success
} catch (error) {
  // error.message contains user-friendly description
  console.error(error);
}
```

## 🛠️ Development

### Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite 5
- **Routing:** React Router DOM 6
- **Styling:** Tailwind CSS 3
- **Icons:** Lucide React
- **HTTP Client:** Fetch API

### Code Style

- **Components:** Functional components with hooks
- **Naming:** PascalCase for components, camelCase for functions
- **State Management:** React useState and useEffect
- **File Organization:** Feature-based structure

### Adding New Pages

1. Create component in `src/pages/`:
```javascript
export default function NewPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Your content */}
    </main>
  );
}
```

2. Add route in `src/App.jsx`:
```javascript
import NewPage from "./pages/NewPage";

// In Routes:
<Route path="/new-page" element={<NewPage />} />
```

3. Add navigation link in `src/components/Navbar.jsx`

### Customizing Styles

Global styles are in `src/index.css` using Tailwind CSS:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Configure Tailwind in `tailwind.config.js`.

## 🏗️ Building for Production

### Create Production Build

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Build Output

```
dist/
├── assets/
│   ├── index-[hash].js      # Bundled JavaScript
│   ├── index-[hash].css     # Bundled CSS
│   └── ...
├── images/
│   └── ...
└── index.html
```

### Deploy

The `dist/` folder can be deployed to any static hosting service:
- **Netlify:** Drag and drop `dist/` folder
- **Vercel:** `vercel --prod`
- **GitHub Pages:** Push `dist/` to gh-pages branch
- **AWS S3:** Upload to S3 bucket with static website hosting

### Environment Variables in Production

Ensure all `VITE_*` environment variables are set in your hosting platform:
- Netlify: Site settings → Environment variables
- Vercel: Project settings → Environment Variables
- Custom server: Create `.env.production` file

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Error: Port 5173 is already in use
# Solution: Kill the process or change port
npm run dev -- --port 3000
```

#### CORS Errors
- Ensure backend services have CORS enabled
- Check that `VITE_*_URL` variables match backend addresses
- Verify backend is running and accessible

#### API Connection Failed
```javascript
// Check service health
import { checkServicesHealth } from './services/api';
const health = await checkServicesHealth();
console.log(health); // See which services are down
```

#### Build Fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Images Not Displaying
- Check image paths (use `/` prefix for public folder)
- Verify images exist in `public/` directory
- Check browser console for 404 errors

#### Slow Performance
- Enable production mode: `npm run build && npm run preview`
- Check Network tab for large requests
- Optimize images (compress, resize)
- Reduce inference steps in Generate page

### Debug Mode

Enable detailed logging:

```javascript
// In api.js, uncomment console.log statements
console.log('API Request:', url, options);
console.log('API Response:', data);
```

### Browser Compatibility

Tested on:
- ✅ Chrome 100+
- ✅ Firefox 100+
- ✅ Safari 15+
- ✅ Edge 100+

### Performance Tips

1. **Image Upload:** Compress images before upload (max 5MB recommended)
2. **Generation Time:** Stable Diffusion takes 30-60 seconds
3. **Network:** Ensure stable connection for large image transfers
4. **Backend:** Keep all 5 backend services running

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Backend README](../artistry-backend/README.md)
- [Integration Guide](./INTEGRATION_GUIDE.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly (all pages + API integration)
4. Submit a pull request

## 📝 License

This project is part of the Artistry interior design platform.

---

**Need Help?** Check the backend README or open an issue on GitHub.
