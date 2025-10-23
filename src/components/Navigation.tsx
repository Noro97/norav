import { useNavbarEffects } from '../hooks'

const Navigation = () => {
  useNavbarEffects()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-black/10 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/assets/img/logo.svg" alt="Life Compass" className="w-10 h-10" />
          <span className="text-xl font-semibold text-white tracking-tight">Life Compass</span>
        </div>
        <div className="hidden md:flex space-x-6">
          <a href="#home" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Home</a>
          <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Features</a>
          <a href="#process" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Process</a>
          <a href="#showcase" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Showcase</a>
          <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Testimonials</a>
          <a href="#about" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">About</a>
          <a href="#pricing" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Pricing</a>
          <a href="#contact" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Contact</a>
        </div>
        <button className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-2 rounded-full text-white text-sm font-medium hover:from-teal-500 hover:to-teal-600 transition-all">
          Start Journey
        </button>
      </div>
    </nav>
  )
}

export default Navigation
