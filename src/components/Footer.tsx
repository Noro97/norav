const Footer = () => {
  return (
    <footer className="py-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src="/assets/img/logo.svg" alt="Life Compass" className="w-8 h-8" />
            <span className="text-xl font-semibold text-white tracking-tight">Life Compass</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2024 Life Compass. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
