import { useState, FormEvent } from 'react'

const ContactForm = () => {
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

  const inputClasses = "w-full p-3.5 rounded-lg bg-[#384358]/20 border border-[#DAD4D4]/8 text-white placeholder-[#DAD4D4]/30 focus:border-[#B51A2B]/40 focus:outline-none focus:shadow-[0_0_0_2px_rgba(181,26,43,0.1)] transition-all duration-300 text-sm"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[#DAD4D4]/60 text-xs uppercase tracking-[0.1em] font-medium mb-2.5">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="block text-[#DAD4D4]/60 text-xs uppercase tracking-[0.1em] font-medium mb-2.5">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClasses}
            placeholder="your@email.com"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-[#DAD4D4]/60 text-xs uppercase tracking-[0.1em] font-medium mb-2.5">Message</label>
        <textarea
          rows={4}
          name="message"
          value={formData.message}
          onChange={handleChange}
          className={`${inputClasses} resize-none`}
          placeholder="Tell us about your goals and dreams..."
          required
        ></textarea>
      </div>
      <button
        type="submit"
        disabled={isSubmitting || isSuccess}
        className={`w-full py-3.5 rounded text-white text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-400 disabled:opacity-70 ${
          isSuccess
            ? 'bg-emerald-600'
            : 'bg-[#B51A2B] hover:bg-[#d63040] shadow-[0_8px_24px_rgba(181,26,43,0.25)]'
        }`}
      >
        {isSubmitting ? 'Sending...' : isSuccess ? 'Message Sent!' : 'Send Message'}
      </button>
    </form>
  )
}

export default ContactForm
