import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import type { Product } from '@/types'
import { CATEGORY_COLORS } from './EcommerceWidget'

type Step = 'detail' | 'checkout' | 'confirmation'

const STEP_LIST: Step[] = ['detail', 'checkout', 'confirmation']

const DESCRIPTIONS: Record<string, string[]> = {
  Electronics: [
    'Cutting-edge technology with premium build quality and seamless performance for everyday use.',
    'Next-generation hardware featuring advanced sensors, fast processing, and all-day battery life.',
    'Precision-engineered with sleek design, intuitive controls, and industry-leading specifications.',
  ],
  Clothing: [
    'Crafted from premium fabrics with a tailored fit for comfort and style in any setting.',
    'Breathable, durable materials with modern cuts designed for both casual and active lifestyles.',
    'Timeless design meets functional performance — versatile enough for work, travel, or weekends.',
  ],
  Home: [
    'Thoughtfully designed to elevate your living space with both form and function.',
    'Built with quality materials for lasting durability and effortless everyday use.',
    'A blend of modern aesthetics and practical engineering for the contemporary home.',
  ],
  Sports: [
    'Professional-grade gear engineered for peak performance and maximum durability.',
    'Lightweight, ergonomic design built to withstand intense training and competition.',
    'High-performance equipment that meets the demands of serious athletes and weekend warriors alike.',
  ],
}

function getMockDescription(product: Product): string {
  const templates = DESCRIPTIONS[product.category] ?? DESCRIPTIONS.Electronics!
  return templates[product.id % templates.length]!
}

function getMockRating(product: Product): number {
  return 3.5 + ((product.id * 7) % 15) / 10
}

function getMockStock(product: Product): number {
  return ((product.id * 13) % 50) + 1
}

function getMockOrderId(product: Product): string {
  return `ORD-${String((product.id * 1337) % 99999).padStart(5, '0')}`
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.min(1, Math.max(0, rating - i))
        return (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id={`star-fill-${i}`}>
                <stop offset={`${fill * 100}%`} stopColor="#B51A2B" />
                <stop offset={`${fill * 100}%`} stopColor="rgba(255,255,255,0.1)" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={`url(#star-fill-${i})`}
              stroke="#B51A2B"
              strokeWidth="1"
              strokeOpacity="0.4"
            />
          </svg>
        )
      })}
      <span className="ml-1.5 font-mono text-[10px] text-white/40">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

function StepIndicator({ current }: { current: Step }) {
  const { t } = useTranslation(['projects'])
  const stepIndex = STEP_LIST.indexOf(current)
  const labels = [
    t('projects:ecommerce.modal.stepDetails'),
    t('projects:ecommerce.modal.stepPayment'),
    t('projects:ecommerce.modal.stepDone'),
  ]

  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {STEP_LIST.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
                i <= stepIndex
                  ? 'bg-crimson-500 border-crimson-500'
                  : 'bg-white/5 border-white/10'
              }`}
            />
            <span className={`font-mono text-[8px] tracking-wider uppercase ${
              i <= stepIndex ? 'text-crimson-400/70' : 'text-white/20'
            }`}>
              {labels[i]}
            </span>
          </div>
          {i < STEP_LIST.length - 1 && (
            <div
              className={`w-12 h-px mb-3.5 transition-all duration-300 ${
                i < stepIndex ? 'bg-crimson-500/40' : 'bg-white/8'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

interface Props {
  product: Product
  onClose: () => void
}

function ProductDetailModalContent({ product, onClose }: Props) {
  const { t } = useTranslation(['projects', 'common'])
  const [step, setStep] = useState<Step>('detail')
  const [direction, setDirection] = useState(1)
  const [quantity, setQuantity] = useState(1)
  const [form, setForm] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const rating = getMockRating(product)
  const stock = getMockStock(product)
  const description = getMockDescription(product)
  const total = (product.price * quantity).toFixed(2)

  // ESC key handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const goTo = useCallback((target: Step) => {
    const currentIdx = STEP_LIST.indexOf(step)
    const targetIdx = STEP_LIST.indexOf(target)
    setDirection(targetIdx > currentIdx ? 1 : -1)
    setStep(target)
  }, [step])

  const handleAddToCart = useCallback(() => {
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#B51A2B', '#d63040', '#541A2E', '#f7a0a6'],
      ticks: 150,
      gravity: 1.2,
      decay: 0.94,
      startVelocity: 20,
      shapes: ['circle'],
    })
    setTimeout(onClose, 600)
  }, [onClose])

  const handlePay = useCallback(() => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      goTo('confirmation')
    }, 1500)
  }, [goTo])

  const isFormValid = form.cardNumber.replace(/\s/g, '').length === 16
    && form.cardName.trim().length > 0
    && form.expiry.length === 5
    && form.cvv.length === 3

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Content */}
        <motion.div
          className="relative max-w-lg w-full rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0d0d1f] to-[#0a0a14] backdrop-blur-xl overflow-hidden max-h-[90vh] flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top accent */}
          <div className="h-px bg-gradient-to-r from-transparent via-crimson-500/40 to-transparent shrink-0" />

          <div className="p-5 md:p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson-400 opacity-50" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-crimson-400" />
                </span>
                <span className="font-mono text-[9px] text-white/30 uppercase tracking-[0.15em]">
                  #{String(product.id).padStart(3, '0')}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-white/60 hover:border-white/15 transition-all duration-200"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Step indicator */}
            <StepIndicator current={step} />

            {/* Step content */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                {step === 'detail' && (
                  <motion.div
                    key="detail"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    {/* Product gradient area */}
                    <div className={`aspect-[5/2] rounded-xl mb-4 flex flex-col items-center justify-center gap-1 bg-gradient-to-br ${CATEGORY_COLORS[product.category] ?? 'from-white/5 to-transparent'} border border-white/[0.04]`}>
                      <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
                        {product.category}
                      </span>
                      <span className="font-mono text-sm text-white/50">
                        {product.subcategory}
                      </span>
                    </div>

                    {/* Product info */}
                    <h3 className="font-mono text-lg text-white/90 font-medium">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="font-mono text-2xl font-medium text-crimson-400">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                        stock > 10
                          ? 'text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20'
                          : stock > 0
                            ? 'text-amber-400/80 bg-amber-500/10 border border-amber-500/20'
                            : 'text-red-400/80 bg-red-500/10 border border-red-500/20'
                      }`}>
                        {stock > 10
                          ? t('projects:ecommerce.modal.inStock', { count: stock })
                          : stock > 0
                            ? t('projects:ecommerce.modal.lowStock', { count: stock })
                            : t('projects:ecommerce.modal.outOfStock')}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="mt-3">
                      <StarRating rating={rating} />
                    </div>

                    {/* Description */}
                    <p className="mt-3 font-mono text-xs text-white/40 leading-relaxed">
                      {description}
                    </p>

                    {/* Quantity */}
                    <div className="mt-5 flex items-center gap-3">
                      <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
                        {t('projects:ecommerce.modal.quantity')}
                      </span>
                      <div className="flex items-center gap-0">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="w-8 h-8 rounded-l-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-all font-mono text-sm"
                        >
                          -
                        </button>
                        <div className="w-10 h-8 border-y border-white/[0.08] bg-white/[0.02] flex items-center justify-center font-mono text-sm text-white/70">
                          {quantity}
                        </div>
                        <button
                          onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                          className="w-8 h-8 rounded-r-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-all font-mono text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 h-10 rounded-lg border border-white/[0.1] bg-white/[0.03] font-mono text-xs text-white/60 hover:text-white/80 hover:border-white/20 transition-all"
                      >
                        {t('projects:ecommerce.modal.addToCart')}
                      </button>
                      <button
                        onClick={() => goTo('checkout')}
                        className="flex-1 h-10 rounded-lg bg-crimson-500 font-mono text-xs text-white font-medium hover:bg-crimson-600 transition-all"
                      >
                        {t('projects:ecommerce.modal.buyNow')}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 'checkout' && (
                  <motion.div
                    key="checkout"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    {/* Order summary */}
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 mb-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-xs text-white/70">{product.name}</span>
                          <span className="font-mono text-[10px] text-white/30 ml-2">x{quantity}</span>
                        </div>
                        <span className="font-mono text-sm text-crimson-400 font-medium">${total}</span>
                      </div>
                    </div>

                    {/* Payment form */}
                    <div className="space-y-3">
                      <div>
                        <label className="block font-mono text-[10px] text-white/30 uppercase tracking-wider mb-1.5">
                          {t('projects:ecommerce.modal.cardNumber')}
                        </label>
                        <input
                          type="text"
                          value={form.cardNumber}
                          onChange={(e) => setForm((f) => ({ ...f, cardNumber: formatCardNumber(e.target.value) }))}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 font-mono text-sm text-white/80 placeholder:text-white/15 focus:border-crimson-500/40 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] text-white/30 uppercase tracking-wider mb-1.5">
                          {t('projects:ecommerce.modal.cardName')}
                        </label>
                        <input
                          type="text"
                          value={form.cardName}
                          onChange={(e) => setForm((f) => ({ ...f, cardName: e.target.value }))}
                          placeholder="John Doe"
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 font-mono text-sm text-white/80 placeholder:text-white/15 focus:border-crimson-500/40 focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-mono text-[10px] text-white/30 uppercase tracking-wider mb-1.5">
                            {t('projects:ecommerce.modal.expiry')}
                          </label>
                          <input
                            type="text"
                            value={form.expiry}
                            onChange={(e) => setForm((f) => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 font-mono text-sm text-white/80 placeholder:text-white/15 focus:border-crimson-500/40 focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-[10px] text-white/30 uppercase tracking-wider mb-1.5">
                            {t('projects:ecommerce.modal.cvv')}
                          </label>
                          <input
                            type="password"
                            value={form.cvv}
                            onChange={(e) => setForm((f) => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                            placeholder="***"
                            maxLength={3}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 font-mono text-sm text-white/80 placeholder:text-white/15 focus:border-crimson-500/40 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => goTo('detail')}
                        className="h-10 px-4 rounded-lg border border-white/[0.08] bg-white/[0.03] font-mono text-xs text-white/50 hover:text-white/70 hover:border-white/15 transition-all flex items-center gap-1.5"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m15 18-6-6 6-6" />
                        </svg>
                        {t('projects:ecommerce.modal.back')}
                      </button>
                      <button
                        onClick={handlePay}
                        disabled={!isFormValid || isProcessing}
                        className="flex-1 h-10 rounded-lg bg-crimson-500 font-mono text-xs text-white font-medium hover:bg-crimson-600 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            {t('projects:ecommerce.modal.processing')}
                          </>
                        ) : (
                          t('projects:ecommerce.modal.payNow', { total })
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 'confirmation' && (
                  <ConfirmationStep product={product} quantity={quantity} total={total} onClose={onClose} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function ConfirmationStep({
  product,
  quantity,
  total,
  onClose,
}: {
  product: Product
  quantity: number
  total: string
  onClose: () => void
}) {
  const { t } = useTranslation(['projects'])
  const orderId = getMockOrderId(product)

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#B51A2B', '#d63040', '#541A2E', '#f7a0a6'],
      ticks: 200,
      gravity: 1.2,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['circle'],
    })
  }, [])

  return (
    <motion.div
      key="confirmation"
      initial={{ x: 200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -200, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col items-center text-center"
    >
      {/* Animated checkmark */}
      <div className="w-16 h-16 rounded-full border-2 border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center mb-4">
        <motion.svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#34d399"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          />
        </motion.svg>
      </div>

      <h3 className="font-mono text-lg text-white/90 font-medium">
        {t('projects:ecommerce.modal.orderConfirmed')}
      </h3>
      <p className="font-mono text-[10px] text-white/30 mt-1 tracking-wider">
        {t('projects:ecommerce.modal.orderId', { id: orderId })}
      </p>

      {/* Order summary */}
      <div className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 mt-5">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <span className="font-mono text-xs text-white/70 block">{product.name}</span>
            <span className="font-mono text-[10px] text-white/30">
              {quantity} {t('projects:ecommerce.modal.items', { count: quantity })}
            </span>
          </div>
          <span className="font-mono text-sm text-crimson-400 font-medium">${total}</span>
        </div>
      </div>

      <p className="font-mono text-[11px] text-white/30 mt-4">
        {t('projects:ecommerce.modal.thankYou')}
      </p>

      <button
        onClick={onClose}
        className="mt-5 w-full h-10 rounded-lg bg-crimson-500 font-mono text-xs text-white font-medium hover:bg-crimson-600 transition-all"
      >
        {t('projects:ecommerce.modal.close')}
      </button>
    </motion.div>
  )
}

export function ProductDetailModal({ product, onClose }: Props) {
  return createPortal(
    <ProductDetailModalContent product={product} onClose={onClose} />,
    document.body
  )
}
