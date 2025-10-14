import React, { useState, FormEvent } from 'react'

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      
      setTimeout(() => {
        setIsSuccess(false)
        setFormData({ name: '', email: '', message: '' })
      }, 2000)
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Name</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors" 
            placeholder="Your name"
            required 
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors" 
            placeholder="your@email.com"
            required 
          />
        </div>
      </div>
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Message</label>
        <textarea 
          rows={4} 
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors resize-none" 
          placeholder="Tell us about your goals and dreams..."
          required
        ></textarea>
      </div>
      <button 
        type="submit" 
        disabled={isSubmitting || isSuccess}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all duration-300 glass-effect disabled:opacity-70"
        style={isSuccess ? { background: 'linear-gradient(to right, #10b981, #059669)' } : {}}
      >
        {isSubmitting ? 'Sending...' : isSuccess ? 'Message Sent!' : 'Send Message'}
      </button>
    </form>
  )
}

export default ContactForm
