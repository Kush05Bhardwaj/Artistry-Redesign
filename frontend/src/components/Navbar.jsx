"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: "AI Design", path: "/ai-design" },
    { name: "Smart Workflow", path: "/enhanced-workflow" },
    { name: "Full Workflow", path: "/workflow" },
    { name: "Detect", path: "/detect" },
    { name: "Segment", path: "/segment" },
    { name: "Advise", path: "/advise" },
    { name: "Generate", path: "/generate" },
    { name: "Final", path: "/final" },
    { name: "About", path: "/about" },
  ]

  return (
    <nav className="sticky top-0 z-200 bg-white border-b border-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-6 h-6 bg-amber-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✎</span>
            </div>
            <span className="text-gray-900">Artistry AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-amber-700 transition-colors text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-gray-700 hover:text-amber-700 transition-colors text-sm font-medium">
              Log In
            </Link>
            <Link
              to="/login"
              className="bg-amber-700 text-white px-6 py-2 rounded hover:bg-amber-800 transition-colors text-sm font-medium"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 text-gray-700 hover:text-amber-700 transition-colors text-sm font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
              <Link to="/login" className="text-gray-700 hover:text-amber-700 transition-colors text-sm font-medium flex-1 text-center">
                Log In
              </Link>
              <Link
                to="/login"
                className="bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-800 transition-colors text-sm font-medium flex-1 text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
