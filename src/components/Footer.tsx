import { Github, Twitter, Linkedin, Facebook } from "lucide-react"
import { Footer as FooterUI } from "@/components/ui/footer"

const Footer = () => {
  return (
    <FooterUI
      logo={
        <img 
          src="/assets/img/logo.svg" 
          alt="Life Compass" 
          className="w-10 h-10" 
        />
      }
      brandName="Life Compass"
      socialLinks={[
        {
          icon: <Twitter className="h-5 w-5" />,
          href: "https://twitter.com",
          label: "Twitter",
        },
        {
          icon: <Github className="h-5 w-5" />,
          href: "https://github.com",
          label: "GitHub",
        },
        {
          icon: <Linkedin className="h-5 w-5" />,
          href: "https://linkedin.com",
          label: "LinkedIn",
        },
        {
          icon: <Facebook className="h-5 w-5" />,
          href: "https://facebook.com",
          label: "Facebook",
        },
      ]}
      mainLinks={[
        { href: "#features", label: "Features" },
        { href: "#about", label: "About" },
        { href: "#testimonials", label: "Testimonials" },
        { href: "#pricing", label: "Pricing" },
        { href: "#contact", label: "Contact" },
      ]}
      legalLinks={[
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
      ]}
      copyright={{
        text: "© 2024 Life Compass. All rights reserved.",
        license: "Built with passion and purpose",
      }}
    />
  )
}

export default Footer
