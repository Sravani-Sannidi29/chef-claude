import { useRef, useState } from 'react'
import { detectIngredients } from '../ai.js'

function resizeToJpeg(file, maxPx = 1024) {
    return new Promise(resolve => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
            const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
            const w = Math.round(img.width * scale)
            const h = Math.round(img.height * scale)
            const canvas = document.createElement('canvas')
            canvas.width = w
            canvas.height = h
            canvas.getContext('2d').drawImage(img, 0, 0, w, h)
            URL.revokeObjectURL(url)
            canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.85)
        }
        img.src = url
    })
}

function blobToBase64(blob) {
    return new Promise(resolve => {
        const r = new FileReader()
        r.onload = e => resolve(e.target.result.split(',')[1])
        r.readAsDataURL(blob)
    })
}

export default function PhotoDetector({ onDetected }) {
    const inputRef = useRef(null)
    const [detecting, setDetecting] = useState(false)
    const [preview, setPreview] = useState(null)
    const [detected, setDetected] = useState([])
    const [error, setError] = useState(null)

    function dismiss() {
        setPreview(null)
        setDetected([])
        setError(null)
    }

    async function handleFile(e) {
        const file = e.target.files[0]
        if (!file) return
        e.target.value = ''

        setPreview(URL.createObjectURL(file))
        setDetecting(true)
        setError(null)
        setDetected([])

        try {
            const blob = await resizeToJpeg(file)
            const base64 = await blobToBase64(blob)
            const ingredients = await detectIngredients(base64, 'image/jpeg')
            setDetected(ingredients)
        } catch {
            setError('Could not detect ingredients. Try a clearer photo.')
        } finally {
            setDetecting(false)
        }
    }

    function handleAddAll() {
        onDetected(detected)
        dismiss()
    }

    return (
        <div className="photo-detector">
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFile}
                style={{ display: 'none' }}
            />
            <button
                type="button"
                className="photo-btn"
                onClick={() => inputRef.current.click()}
                disabled={detecting}
                title="Detect ingredients from a photo"
            >
                {detecting ? '🔍 Detecting…' : '📷 Scan photo'}
            </button>

            {preview && !detecting && (
                <div className="photo-result">
                    <img src={preview} alt="Scanned" className="photo-preview" />
                    {detected.length > 0 ? (
                        <>
                            <p className="photo-result-label">
                                Found {detected.length} ingredient{detected.length !== 1 ? 's' : ''}
                            </p>
                            <div className="photo-chips">
                                {detected.map(name => (
                                    <span key={name} className="photo-chip">{name}</span>
                                ))}
                            </div>
                            <div className="photo-actions">
                                <button className="photo-add-btn" onClick={handleAddAll}>+ Add all</button>
                                <button className="photo-dismiss-btn" onClick={dismiss}>Dismiss</button>
                            </div>
                        </>
                    ) : (
                        <div className="photo-actions">
                            <p className="photo-empty">No food detected. Try a different photo.</p>
                            <button className="photo-dismiss-btn" onClick={dismiss}>Dismiss</button>
                        </div>
                    )}
                </div>
            )}

            {error && <p className="photo-error">{error}</p>}
        </div>
    )
}
