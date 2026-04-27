import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import './App.css'
import Header from './components/header.jsx'
import Main from './components/Main.jsx'
import FruitSlicerGame from './components/FruitSlicerGame.jsx'
import ClaudeRecipe from './components/claudeRecipe.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { supabase } from './supabase.js'
import foodIcon from './assets/food-serving.png'

// ─── Shared recipe view (public URL: /?recipe=<id>) ──────────────────────────
function SharedView({ recipeId }) {
    const [recipe, setRecipe] = useState(null)
    const [loading, setLoading] = useState(true)
    const [missing, setMissing] = useState(false)

    useEffect(() => {
        supabase
            .from('recipes')
            .select('recipe')
            .eq('id', recipeId)
            .eq('public', true)
            .single()
            .then(({ data }) => {
                if (data) setRecipe(data.recipe)
                else setMissing(true)
                setLoading(false)
            })
    }, [recipeId])

    return (
        <div className="root-wrapper">
            <div className="app-container">
                <header>
                    <div className="header-brand">
                        <img src={foodIcon} alt="Chef Icon" />
                        <h1>Chef Claude</h1>
                    </div>
                    <a href="/" className="auth-btn auth-btn--signin shared-cta">
                        Try it yourself →
                    </a>
                </header>
                <main>
                    {loading && <p className="loading-message">Loading recipe…</p>}
                    {missing && <p className="loading-message">Recipe not found or no longer public.</p>}
                    {recipe && <ClaudeRecipe recipe={recipe} />}
                </main>
            </div>
        </div>
    )
}

// ─── Main app ─────────────────────────────────────────────────────────────────
function App() {
    const [externalIngredient, setExternalIngredient] = useState(null)
    const [gameActive, setGameActive] = useState(true)

    const handleIngredientSliced = useCallback((name) => {
        setExternalIngredient({ name, ts: Date.now() })
    }, [])

    const handleCookStart = useCallback(() => {
        setGameActive(false)
    }, [])

    return (
        <AuthProvider>
            <div className="root-wrapper">
                {gameActive && (
                    <FruitSlicerGame onIngredientSliced={handleIngredientSliced} />
                )}
                <div className="app-container">
                    <Header />
                    <Main
                        externalIngredient={externalIngredient}
                        onCookStart={handleCookStart}
                    />
                </div>
            </div>
        </AuthProvider>
    )
}

// ─── Entry point: route between app and shared view ──────────────────────────
export default function Root() {
    const sharedId = new URLSearchParams(window.location.search).get('recipe')
    if (sharedId) return <SharedView recipeId={sharedId} />
    return <App />
}
