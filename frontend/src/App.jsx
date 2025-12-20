import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import AIDesign from "./pages/AIDesign"
import About from "./pages/About"
import Login from "./pages/Login"
import Detect from "./pages/Detect"
import Segment from "./pages/Segment"
import Advise from "./pages/Advise"
import Generate from "./pages/Generate"
import Final from "./pages/Final"
import FullWorkflow from "./pages/FullWorkflow"
import InteractiveWorkflow from "./pages/InteractiveWorkflow"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Home />
                <Footer />
              </>
            }
          />
          <Route
            path="/ai-design"
            element={
              <>
                <Navbar />
                <AIDesign />
                <Footer />
              </>
            }
          />
          <Route
            path="/detect"
            element={
              <>
                <Navbar />
                <Detect />
                <Footer />
              </>
            }
          />
          <Route
            path="/segment"
            element={
              <>
                <Navbar />
                <Segment />
                <Footer />
              </>
            }
          />
          <Route
            path="/advise"
            element={
              <>
                <Navbar />
                <Advise />
                <Footer />
              </>
            }
          />
          <Route
            path="/generate"
            element={
              <>
                <Navbar />
                <Generate />
                <Footer />
              </>
            }
          />
          <Route
            path="/workflow"
            element={
              <>
                <Navbar />
                <FullWorkflow />
                <Footer />
              </>
            }
          />
          <Route
            path="/interactive"
            element={
              <>
                <Navbar />
                <InteractiveWorkflow />
                <Footer />
              </>
            }
          />
          <Route
            path="/final"
            element={
              <>
                <Navbar />
                <Final />
                <Footer />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <Navbar />
                <About />
                <Footer />
              </>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
