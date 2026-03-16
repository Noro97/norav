import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";


interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
}: PricingProps) {
  void title; // used via hardcoded heading
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "#B51A2B",
          "#d63040",
          "#541A2E",
          "#f7a0a6",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="w-full py-24 px-4">
      <div className="text-center space-y-4 mb-14">
        <span className="label-editorial tracking-[0.3em] text-xs mb-4 block">Plans</span>
        <h2 className="font-display text-5xl md:text-6xl font-semibold text-white mb-4 tracking-[-0.02em] leading-[1.05]">
          Simple, Transparent
          <span className="italic text-[#B51A2B]"> Pricing</span>
        </h2>
        <div className="section-divider" />
        <p className="text-[#DAD4D4]/70 text-base whitespace-pre-line max-w-xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex justify-center items-center mb-12 gap-3">
        <span className="font-medium text-[#DAD4D4]/70 text-sm uppercase tracking-wider">Monthly</span>
        <Switch
          ref={switchRef as any}
          checked={!isMonthly}
          onCheckedChange={handleToggle}
          className="relative data-[state=checked]:bg-[#B51A2B] data-[state=unchecked]:bg-[#384358]/50"
        />
        <span className="font-medium text-[#DAD4D4]/70 text-sm uppercase tracking-wider">
          Annual <span className="text-[#B51A2B]">(Save 20%)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 0 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -20 : 0,
                    opacity: 1,
                    x: index === 2 ? -30 : index === 0 ? 30 : 0,
                    scale: index === 0 || index === 2 ? 0.94 : 1.0,
                  }
                : { y: 0, opacity: 1 }
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.4,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              "liquid-glass-card p-8 text-center flex flex-col relative h-full",
              plan.isPopular ? "border-[#B51A2B]/30 border-2 shadow-[0_0_40px_rgba(181,26,43,0.08)]" : "",
              !plan.isPopular && "mt-5"
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-[#B51A2B] py-1.5 px-4 rounded-bl-xl rounded-tr-[18px] flex items-center gap-1.5">
                <Star className="text-white h-3.5 w-3.5 fill-current" />
                <span className="text-white text-[10px] font-semibold uppercase tracking-wider">
                  Popular
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-semibold text-[#B51A2B] uppercase tracking-[0.25em] mb-6">
                  {plan.name}
                </p>
                <div className="mt-2 flex items-baseline justify-center gap-x-2">
                  <span className="font-display text-6xl md:text-7xl font-semibold tracking-tight text-white">
                    ${isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)}
                  </span>
                  {plan.period !== "Next 3 months" && (
                    <span className="text-xs font-medium text-[#DAD4D4]/40 uppercase tracking-wider">
                      / {plan.period}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[#DAD4D4]/40 mt-2 mb-8 uppercase tracking-wider">
                  {isMonthly ? "billed monthly" : "billed annually"}
                </p>

                <ul className="mt-5 gap-3.5 flex flex-col mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-left">
                      <Check className="h-4 w-4 text-[#B51A2B] mt-0.5 shrink-0" />
                      <span className="text-[#DAD4D4]/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                <hr className="w-full mb-6 border-[#DAD4D4]/6" />

                <a
                  href={plan.href}
                  className={cn(
                    "w-full px-8 py-4 rounded font-semibold transition-all duration-300 text-center block text-xs uppercase tracking-[0.15em]",
                    plan.isPopular
                      ? "bg-[#B51A2B] text-white hover:bg-teal-400 shadow-[0_8px_30px_rgba(181,26,43,0.3)]"
                      : "border border-[#DAD4D4]/12 text-[#DAD4D4] hover:border-[#B51A2B]/30 hover:text-white"
                  )}
                >
                  {plan.buttonText}
                </a>
                <p className="mt-4 text-xs text-[#DAD4D4]/40">
                  {plan.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
