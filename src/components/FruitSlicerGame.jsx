import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ITEMS = [
    // Vegetables
    { emoji: '🌶️', name: 'chilli' },
    { emoji: '🧅', name: 'onion' },
    { emoji: '🍅', name: 'tomato' },
    { emoji: '🥬', name: 'spinach' },
    { emoji: '🥕', name: 'carrot' },
    { emoji: '🥦', name: 'broccoli' },
    { emoji: '🧄', name: 'garlic' },
    { emoji: '🍋', name: 'lemon' },
    { emoji: '🥑', name: 'avocado' },
    { emoji: '🌿', name: 'coriander' },
    { emoji: '🥒', name: 'cucumber' },
    { emoji: '🍄', name: 'mushroom' },
    { emoji: '🌽', name: 'corn' },
    { emoji: '🫑', name: 'capsicum' },
    { emoji: '🍆', name: 'brinjal' },
    // Meat & protein
    { emoji: '🍗', name: 'chicken' },
    { emoji: '🥩', name: 'beef' },
    { emoji: '🍖', name: 'pork' },
    { emoji: '🦐', name: 'prawns' },
    { emoji: '🐟', name: 'fish' },
    { emoji: '🥚', name: 'eggs' },
    { emoji: '🦑', name: 'squid' },
    { emoji: '🦞', name: 'lobster' },
]

let uid = 0

// ─── Blade Trail Canvas ──────────────────────────────────────────────────────
function BladeTrail() {
    const canvasRef = useRef(null)
    const pointsRef = useRef([])
    const rafRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        function resize() {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const now = performance.now()
            pointsRef.current = pointsRef.current.filter(p => now - p.t < 180)

            const pts = pointsRef.current
            if (pts.length >= 2) {
                ctx.beginPath()
                ctx.moveTo(pts[0].x, pts[0].y)
                for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)

                const grad = ctx.createLinearGradient(
                    pts[0].x, pts[0].y,
                    pts[pts.length - 1].x, pts[pts.length - 1].y
                )
                grad.addColorStop(0, 'rgba(255,255,255,0)')
                grad.addColorStop(0.5, 'rgba(255,220,80,0.55)')
                grad.addColorStop(1, 'rgba(255,255,255,0.9)')

                ctx.strokeStyle = grad
                ctx.lineWidth = 3
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'
                ctx.stroke()
            }

            rafRef.current = requestAnimationFrame(draw)
        }
        draw()

        function onPointerMove(e) {
            pointsRef.current.push({ x: e.clientX, y: e.clientY, t: performance.now() })
        }
        function onTouchMove(e) {
            const t = e.touches[0]
            pointsRef.current.push({ x: t.clientX, y: t.clientY, t: performance.now() })
        }

        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('touchmove', onTouchMove, { passive: true })

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('touchmove', onTouchMove)
            cancelAnimationFrame(rafRef.current)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{ position: 'fixed', inset: 0, zIndex: 16, pointerEvents: 'none' }}
        />
    )
}

// ─── Main Game Component ─────────────────────────────────────────────────────
export default function FruitSlicerGame({ onIngredientSliced }) {
    const [falling, setFalling] = useState([])
    const [sliceEffects, setSliceEffects] = useState([])
    const [missedEffects, setMissedEffects] = useState([])

    // Track pointer velocity globally so FallingEmoji can read it
    const velocityRef = useRef({ vx: 0, vy: 0, lastX: 0, lastY: 0, lastT: 0 })
    const getVelocity = useCallback(() => velocityRef.current, [])

    useEffect(() => {
        function onPointerMove(e) {
            const now = performance.now()
            const dt = Math.max(now - velocityRef.current.lastT, 1)
            velocityRef.current = {
                vx: (e.clientX - velocityRef.current.lastX) / dt,
                vy: (e.clientY - velocityRef.current.lastY) / dt,
                lastX: e.clientX,
                lastY: e.clientY,
                lastT: now,
            }
        }
        window.addEventListener('pointermove', onPointerMove)
        return () => window.removeEventListener('pointermove', onPointerMove)
    }, [])

    useEffect(() => {
        function spawn() {
            const item = ITEMS[Math.floor(Math.random() * ITEMS.length)]
            const id = ++uid
            const xPct = 3 + Math.random() * 88
            const size = 38 + Math.floor(Math.random() * 24)
            const spinDeg = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 180)
            const duration = 3.5 + Math.random() * 2.5

            setFalling(prev => [...prev, { id, xPct, duration, size, spinDeg, ...item }])
        }

        spawn()
        const timer = setInterval(spawn, 1800)
        return () => clearInterval(timer)
    }, [])

    const handleMissed = useCallback((item) => {
        setFalling(prev => prev.filter(i => i.id !== item.id))
        const effectId = ++uid
        setMissedEffects(prev => [...prev, { id: effectId, xPct: item.xPct, emoji: item.emoji }])
        setTimeout(() => {
            setMissedEffects(prev => prev.filter(e => e.id !== effectId))
        }, 1000)
    }, [])

    const handleSlice = useCallback((item, clientX, clientY) => {
        setFalling(prev => prev.filter(i => i.id !== item.id))
        const effectId = ++uid
        setSliceEffects(prev => [
            ...prev,
            { id: effectId, emoji: item.emoji, name: item.name, x: clientX, y: clientY },
        ])
        if (onIngredientSliced) onIngredientSliced(item.name)
        setTimeout(() => {
            setSliceEffects(prev => prev.filter(e => e.id !== effectId))
        }, 900)
    }, [onIngredientSliced])

    return (
        <div className="fruit-slicer-layer" aria-hidden="true">
            <BladeTrail />
            <div className="slicer-hint">🔪 Slice or swipe veggies to add ingredients!</div>

            <AnimatePresence>
                {falling.map(item => (
                    <FallingEmoji
                        key={item.id}
                        item={item}
                        onSlice={handleSlice}
                        onMissed={handleMissed}
                        getVelocity={getVelocity}
                    />
                ))}
            </AnimatePresence>

            <AnimatePresence>
                {sliceEffects.map(effect => (
                    <SliceEffect key={effect.id} effect={effect} />
                ))}
            </AnimatePresence>

            <AnimatePresence>
                {missedEffects.map(effect => (
                    <MissedEffect key={effect.id} effect={effect} />
                ))}
            </AnimatePresence>
        </div>
    )
}

// ─── Falling Emoji ────────────────────────────────────────────────────────────
function FallingEmoji({ item, onSlice, onMissed, getVelocity }) {
    const slicedRef = useRef(false)

    function trySlice(clientX, clientY) {
        if (slicedRef.current) return
        slicedRef.current = true
        onSlice(item, clientX, clientY)
    }

    // Triggered when pointer enters the emoji while moving fast — swipe to slice
    function handlePointerEnter(e) {
        const { vx, vy } = getVelocity()
        const speed = Math.sqrt(vx * vx + vy * vy)
        if (speed > 0.45) trySlice(e.clientX, e.clientY)
    }

    // Click/tap fallback for slow movements
    function handleClick(e) {
        e.stopPropagation()
        trySlice(e.clientX, e.clientY)
    }

    const animProps = {
        initial: { y: -80, rotate: 0 },
        animate: { y: '105vh', rotate: item.spinDeg },
        transition: { duration: item.duration, ease: 'linear' },
    }

    return (
        <motion.span
            className="falling-emoji"
            style={{ left: `${item.xPct}%`, fontSize: `${item.size}px` }}
            {...animProps}
            onAnimationComplete={() => onMissed(item)}
            onPointerEnter={handlePointerEnter}
            onClick={handleClick}
            title={`Slice to add ${item.name}!`}
        >
            {item.emoji}
        </motion.span>
    )
}

// ─── Missed Effect ────────────────────────────────────────────────────────────
function MissedEffect({ effect }) {
    return (
        <motion.div
            className="missed-label"
            style={{ left: `${effect.xPct}%` }}
            initial={{ opacity: 0, y: '92vh', scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], y: '80vh', scale: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
        >
            {effect.emoji} missed!
        </motion.div>
    )
}

// ─── Slice Effect ─────────────────────────────────────────────────────────────
function SliceEffect({ effect }) {
    const commonStyle = {
        position: 'fixed',
        left: effect.x,
        top: effect.y,
        fontSize: '44px',
        pointerEvents: 'none',
        zIndex: 9998,
        userSelect: 'none',
    }

    return (
        <>
            {/* Left half flies left */}
            <motion.span
                style={{ ...commonStyle, clipPath: 'inset(0 50% 0 0)', transformOrigin: 'right center' }}
                initial={{ opacity: 1, x: -22, y: -22, rotate: 0 }}
                animate={{ opacity: 0, x: -90, y: -70, rotate: -55 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
            >
                {effect.emoji}
            </motion.span>

            {/* Right half flies right */}
            <motion.span
                style={{ ...commonStyle, clipPath: 'inset(0 0 0 50%)', transformOrigin: 'left center' }}
                initial={{ opacity: 1, x: 22, y: -22, rotate: 0 }}
                animate={{ opacity: 0, x: 90, y: -70, rotate: 55 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
            >
                {effect.emoji}
            </motion.span>

            {/* +Name label floats up */}
            <motion.div
                className="slice-label"
                style={{ left: effect.x, top: effect.y - 20 }}
                initial={{ opacity: 0, y: 0, scale: 0.7 }}
                animate={{ opacity: 1, y: -55, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                ✓ {effect.name}
            </motion.div>

            {/* Juice drops */}
            {[...Array(5)].map((_, i) => {
                const angle = (i / 5) * Math.PI * 2
                return (
                    <motion.span
                        key={i}
                        style={{ ...commonStyle, fontSize: '12px' }}
                        initial={{ opacity: 1, x: 0, y: 0 }}
                        animate={{
                            opacity: 0,
                            x: Math.cos(angle) * (35 + Math.random() * 25),
                            y: Math.sin(angle) * (35 + Math.random() * 25),
                        }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                        💧
                    </motion.span>
                )
            })}
        </>
    )
}
