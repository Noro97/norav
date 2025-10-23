import ContactForm from './ContactForm'
import FloatingShapes from './FloatingShapes'

const ContactSection = () => {
  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      <FloatingShapes />
      <div className="max-w-4xl mx-auto px-6 text-center relative z-20">
        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-teal-500 mb-6">
          Get in Touch
        </h2>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Ready to start your personal growth journey? Let's begin the conversation about your goals and dreams.
        </p>
        <div className="liquid-glass-card p-8 text-left max-w-2xl mx-auto">
          <ContactForm />
        </div>
      </div>
    </section>
  )
}

export default ContactSection
