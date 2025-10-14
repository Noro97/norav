import { Hono } from 'hono'
import { renderer } from './renderer'

const app = new Hono()

app.use(renderer)

app.get('/', (c) => {
  return c.render(
    <div id="root">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg glass-effect"></div>
            <span className="text-xl font-semibold text-white tracking-tight">Monolite</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Home</a>
            <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Features</a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">About</a>
            <a href="#contact" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Contact</a>
          </div>
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 rounded-full text-white text-sm font-medium hover:from-purple-500 hover:to-blue-500 transition-all duration-300 glass-effect">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
            <div className="shape shape-5"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="hero-content">
            <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-6 tracking-tight leading-tight animate-fade-in">
              Monolite
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay-1">
              Experience the future of creative design with our revolutionary platform that combines innovation, elegance, and performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-full text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all duration-300 glass-effect transform hover:scale-105">
                Start Your Journey
              </button>
              <button className="border border-white/30 px-8 py-4 rounded-full text-white font-semibold hover:bg-white/10 transition-all duration-300 glass-effect transform hover:scale-105">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Liquid Glass Card */}
          <div className="mt-16 relative animate-fade-in-delay-3">
            <div className="liquid-glass-card max-w-4xl mx-auto p-8 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="feature-card">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg mb-4 glass-effect flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
                  <p className="text-gray-300 text-sm">Experience blazing-fast performance with our optimized architecture.</p>
                </div>
                <div className="feature-card">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg mb-4 glass-effect flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Secure</h3>
                  <p className="text-gray-300 text-sm">Built with enterprise-grade security features for peace of mind.</p>
                </div>
                <div className="feature-card">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg mb-4 glass-effect flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Intuitive</h3>
                  <p className="text-gray-300 text-sm">Designed with user experience in mind for effortless interaction.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-6">
              Revolutionary Features
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover what makes Monolite the ultimate choice for modern applications
            </p>
          </div>

          {/* Feature Cards Slider */}
          <div className="slider-container overflow-hidden relative">
            <div className="slider-track flex space-x-8 animate-slide">
              <div className="slide min-w-80 glass-card p-8 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl mb-6 glass-effect flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Smart Analytics</h3>
                <p className="text-gray-300 leading-relaxed">
                  Get deep insights into your data with our AI-powered analytics engine that learns from your patterns.
                </p>
              </div>

              <div className="slide min-w-80 glass-card p-8 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mb-6 glass-effect flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Mobile First</h3>
                <p className="text-gray-300 leading-relaxed">
                  Responsive design that works perfectly on all devices, from smartphones to desktop computers.
                </p>
              </div>

              <div className="slide min-w-80 glass-card p-8 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mb-6 glass-effect flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Real-time Sync</h3>
                <p className="text-gray-300 leading-relaxed">
                  Collaborate seamlessly with real-time synchronization across all your devices and team members.
                </p>
              </div>

              <div className="slide min-w-80 glass-card p-8 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mb-6 glass-effect flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Enterprise Security</h3>
                <p className="text-gray-300 leading-relaxed">
                  Advanced encryption and security protocols to keep your data safe and compliant with regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
                About Monolite
              </h2>
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                We're building the future of digital experiences, one pixel at a time. Our mission is to create tools that empower creators and businesses to achieve their vision.
              </p>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Founded by a team of passionate designers and developers, Monolite combines cutting-edge technology with intuitive design to deliver exceptional results. We believe that great design should be accessible to everyone.
              </p>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 rounded-full text-white font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-300 glass-effect">
                Learn More
              </button>
            </div>
            <div className="liquid-glass-card p-8 relative overflow-hidden">
              <div className="grid grid-cols-2 gap-6">
                <div className="stat-card text-center">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">10k+</div>
                  <div className="text-gray-300 text-sm">Active Users</div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">99.9%</div>
                  <div className="text-gray-300 text-sm">Uptime</div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">50ms</div>
                  <div className="text-gray-300 text-sm">Response Time</div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-blue-400 mb-2">24/7</div>
                  <div className="text-gray-300 text-sm">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-6">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Ready to transform your ideas into reality? Let's start a conversation.
          </p>
          <div className="liquid-glass-card p-8 text-left max-w-2xl mx-auto">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Name</label>
                  <input type="text" className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                  <input type="email" className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors" placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Message</label>
                <textarea rows="4" className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors resize-none" placeholder="Tell us about your project..."></textarea>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all duration-300 glass-effect">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg glass-effect"></div>
              <span className="text-xl font-semibold text-white tracking-tight">Monolite</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 Monolite. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* JavaScript for interactions */}
      <script src="/static/app.js"></script>
    </div>
  )
})

export default app
