import React from 'react'

const Navigation: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-black/20 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/assets/img/logo.svg" alt="Life Compass" className="w-10 h-10" />
          <span className="text-xl font-semibold text-white tracking-tight">Life Compass</span>
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="#home" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Home</a>
          <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Features</a>
          <a href="#about" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">About</a>
          <a href="#contact" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Contact</a>
        </div>
        <button className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 rounded-full text-white text-sm font-medium hover:from-purple-500 hover:to-blue-500 transition-all duration-300 glass-effect">
          Start Journey
        </button>
      </div>
    </nav>
  )
}

export default Navigation
