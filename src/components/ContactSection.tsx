import ContactForm from './ContactForm'
import FloatingShapes from './FloatingShapes'

const ContactSection = () => {
  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      <FloatingShapes />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#B51A2B]/4 blur-[120px] pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 text-center relative z-20">
        <span className="label-editorial tracking-[0.3em] text-xs mb-4 block">Reach Out</span>
        <h2 className="font-display text-5xl md:text-6xl font-semibold text-white mb-4 tracking-[-0.02em] leading-[1.05]">
          Get in
          <span className="italic text-[#B51A2B]"> Touch</span>
        </h2>
        <div className="section-divider mt-4 mb-6" />
        <p className="text-base text-[#DAD4D4]/70 mb-12 max-w-xl mx-auto leading-relaxed">
          Ready to start your personal growth journey? Let's begin the conversation about your goals and dreams.
        </p>
        <div className="liquid-glass-card p-10 text-left max-w-2xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-linear-to-r from-transparent via-[#B51A2B] to-transparent" />
          <ContactForm />
        </div>
      </div>
    </section>
  )
}

export default ContactSection
