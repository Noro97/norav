import React from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, className = "" }) => {
  return (
    <div
      className={`relative font-bold text-2xl md:text-3xl text-white uppercase tracking-widest animate-shift ${className}`}
    >
      {/* Main Text */}
      <span className="relative z-10">{text}</span>

      {/* Glitch Layers */}
      <span
        className="absolute top-0 left-0 opacity-80 text-purple-500 animate-glitch z-0"
        aria-hidden="true"
      >
        {text}
      </span>
      <span
        className="absolute top-0 left-0 opacity-80 text-green-500 animate-glitch z-[-1]"
        aria-hidden="true"
      >
        {text}
      </span>
    </div>
  );
};

export default GlitchText;
