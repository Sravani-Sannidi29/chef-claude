import { useState, useEffect, useRef } from 'react'

// Matches "10 minutes", "3-4 mins", "1 hour", "30 seconds", "3 to 5 minutes"
const TIME_RE = /(\d+)(?:\s*[-–]\s*(\d+))?\s*(?:to\s+(\d+)\s*)?(minutes?|mins?|hours?|hrs?|seconds?|secs?)/i

function parseMinutes(text) {
    const m = text.match(TIME_RE)
    if (!m) return null
    // Use the upper bound for ranges (e.g. "3-4 min" → 4)
    const value = parseInt(m[3] ?? m[2] ?? m[1])
    const unit = m[4].toLowerCase()
    if (unit.startsWith('hour') || unit.startsWith('hr')) return value * 60
    if (unit.startsWith('sec')) return Math.max(1, Math.ceil(value / 60))
    return value
}

function fmt(secs) {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
}

export default function StepTimer({ stepText }) {
    const minutes = parseMinutes(stepText)
    const [secsLeft, setSecsLeft] = useState(null)
    const [running, setRunning] = useState(false)
    const intervalRef = useRef(null)

    useEffect(() => {
        if (!running) return
        intervalRef.current = setInterval(() => {
            setSecsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current)
                    setRunning(false)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(intervalRef.current)
    }, [running])

    if (!minutes) return null

    const done = secsLeft === 0

    function start() {
        if (secsLeft === null) setSecsLeft(minutes * 60)
        setRunning(true)
    }

    return (
        <span className={`step-timer${done ? ' step-timer--done' : ''}`}>
            {secsLeft === null ? (
                <button className="timer-start-btn" onClick={start} title={`Start ${minutes}-minute timer`}>
                    ⏱ {minutes}m
                </button>
            ) : (
                <>
                    <span className="timer-display">{fmt(secsLeft)}</span>
                    {running
                        ? <button className="timer-ctrl" onClick={() => setRunning(false)}>⏸</button>
                        : <button className="timer-ctrl" onClick={start}>▶</button>
                    }
                    <button className="timer-ctrl" onClick={() => { setRunning(false); setSecsLeft(null) }}>↺</button>
                </>
            )}
            {done && <span className="timer-done">Done!</span>}
        </span>
    )
}
