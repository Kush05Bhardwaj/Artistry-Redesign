import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import AIDesign from "./pages/AIDesign"
import About from "./pages/About"
import Login from "./pages/Login"
import EnhancedWorkflow from "./pages/EnhancedWorkflow"

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
            path="/enhanced-workflow"
            element={
              <>
                <Navbar />
                <EnhancedWorkflow />
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
