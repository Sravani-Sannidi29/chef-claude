import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ClaudeRecipe from './claudeRecipe.jsx'
import IngredientsList from './ingredientsList.jsx'
import FilterPanel from './FilterPanel.jsx'
import PhotoDetector from './PhotoDetector.jsx'
import { getRecipe } from '../ai.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { usePantry } from '../hooks/usePantry.js'
import { useRecipeHistory } from '../hooks/useRecipeHistory.js'

const LOADING_MESSAGES = [
    "Gathering your ingredients…",
    "Crafting your recipe…",
    "Adding the finishing touches…",
]

const DEFAULT_FILTERS = { dietary: [], maxTime: null, maxCalories: null }

export default function Main({ externalIngredient, onCookStart }) {
    const { user } = useAuth()
    const { pantry, savePantry, removeFromPantry } = usePantry(user?.id)
    const { saveRecipe, toggleFavorite, shareRecipe } = useRecipeHistory(user?.id)

    const [ingredients, setIngredients] = useState([])
    const [filters, setFilters] = useState(DEFAULT_FILTERS)
    const [recipe, setRecipe] = useState(null)
    const [savedRecipeId, setSavedRecipeId] = useState(null)
    const [isFavorited, setIsFavorited] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [loadingStep, setLoadingStep] = useState(0)
    const [pantrySaved, setPantrySaved] = useState(false)
    const pantryLoadedRef = useRef(false)
    const recipeSection = useRef(null)

    // Auto-load pantry once on login if ingredient list is empty
    useEffect(() => {
        if (!user || pantryLoadedRef.current || pantry.length === 0) return
        setIngredients(prev => {
            if (prev.length === 0) {
                pantryLoadedRef.current = true
                return pantry
            }
            return prev
        })
    }, [user, pantry])

    // Reset pantry-loaded flag on sign-out so next login auto-loads again
    useEffect(() => {
        if (!user) pantryLoadedRef.current = false
    }, [user])

    useEffect(() => {
        if (recipe && recipeSection.current) {
            recipeSection.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [recipe])

    useEffect(() => {
        if (!externalIngredient) return
        const { name } = externalIngredient
        setIngredients(prev => prev.includes(name) ? prev : [...prev, name])
    }, [externalIngredient])

    useEffect(() => {
        if (!loading) {
            setLoadingStep(0)
            return
        }
        const interval = setInterval(() => {
            setLoadingStep(prev => (prev + 1) % LOADING_MESSAGES.length)
        }, 1800)
        return () => clearInterval(interval)
    }, [loading])

    function handleSubmit(e) {
        e.preventDefault()
        const formData = new FormData(e.target)
        const newIngredient = formData.get('ingredient').trim()
        if (!newIngredient) return
        setIngredients(prev => prev.includes(newIngredient) ? prev : [...prev, newIngredient])
        e.target.reset()
    }

    function removeIngredient(index) {
        setIngredients(prev => prev.filter((_, i) => i !== index))
    }

    async function handleGetRecipe() {
        if (onCookStart) onCookStart()
        setLoading(true)
        setError(null)
        setRecipe(null)
        setSavedRecipeId(null)
        setIsFavorited(false)
        try {
            const result = await getRecipe(ingredients, filters)
            setRecipe(result)
            if (user) {
                const saved = await saveRecipe(result, ingredients, filters)
                if (saved?.id) setSavedRecipeId(saved.id)
            }
        } catch {
            setError("Couldn't generate a recipe right now. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    async function handleToggleFavorite() {
        if (!savedRecipeId) return
        const newFav = !isFavorited
        setIsFavorited(newFav)
        await toggleFavorite(savedRecipeId, newFav)
    }

    async function handleShare() {
        if (!savedRecipeId) return
        await shareRecipe(savedRecipeId)
    }

    function handlePhotoDetected(detectedIngredients) {
        setIngredients(prev => {
            const next = [...prev]
            detectedIngredients.forEach(name => {
                if (!next.includes(name)) next.push(name)
            })
            return next
        })
    }

    async function handleSavePantry() {
        await savePantry(ingredients)
        setPantrySaved(true)
        setTimeout(() => setPantrySaved(false), 2000)
    }

    const showSavePantry = !!user && ingredients.length > 0

    function addFromPantry(name) {
        setIngredients(prev => prev.includes(name) ? prev : [...prev, name])
    }

    function loadAllPantry() {
        setIngredients(prev => {
            const combined = [...prev]
            pantry.forEach(name => { if (!combined.includes(name)) combined.push(name) })
            return combined
        })
        pantryLoadedRef.current = true
    }

    return (
        <main>
            {user && pantry.length > 0 && (
                <div className="pantry-manager">
                    <div className="pantry-manager-header">
                        <span className="pantry-manager-label">📦 My pantry</span>
                        <button className="pantry-load-all-btn" onClick={loadAllPantry}>
                            Load all
                        </button>
                    </div>
                    <div className="pantry-chips">
                        {pantry.map(name => (
                            <span key={name} className="pantry-chip">
                                <button
                                    className="pantry-chip-name"
                                    onClick={() => addFromPantry(name)}
                                    title={`Add ${name} to ingredients`}
                                >
                                    {name}
                                </button>
                                <button
                                    className="pantry-chip-remove"
                                    onClick={() => removeFromPantry(name)}
                                    aria-label={`Remove ${name} from pantry`}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <PhotoDetector onDetected={handlePhotoDetected} />

            <form onSubmit={handleSubmit} className="add-ingredient-form">
                <input
                    type="text"
                    aria-label="Add ingredient"
                    placeholder="or type one… e.g chilli"
                    name="ingredient"
                />
                <button type="submit">+ Add</button>
            </form>

            {ingredients.length > 0 && (
                <IngredientsList
                    ingredients={ingredients}
                    onRemove={removeIngredient}
                    onClearAll={() => setIngredients([])}
                />
            )}

            {showSavePantry && (
                <button className="save-pantry-btn" onClick={handleSavePantry}>
                    {pantrySaved ? '✓ Pantry saved' : '💾 Save as pantry'}
                </button>
            )}

            {ingredients.length > 1 && (
                <>
                    <FilterPanel filters={filters} onChange={setFilters} />
                    <div ref={recipeSection} className="get-recipe-container">
                        <div>
                            <h3>Ready for a recipe?</h3>
                            <p>Generate a recipe from your list of ingredients.</p>
                        </div>
                        <button onClick={handleGetRecipe} disabled={loading}>
                            {loading ? 'Cooking…' : "Let's cook!"}
                        </button>
                    </div>
                </>
            )}

            <AnimatePresence mode="wait">
                {loading && (
                    <motion.div
                        key="loading"
                        className="loading-container"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="loading-spinner" />
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={loadingStep}
                                className="loading-message"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {LOADING_MESSAGES[loadingStep]}
                            </motion.p>
                        </AnimatePresence>
                    </motion.div>
                )}

                {error && !loading && (
                    <motion.div
                        key="error"
                        className="error-container"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <p>{error}</p>
                        <button onClick={handleGetRecipe}>Try again</button>
                    </motion.div>
                )}

                {recipe && !loading && (
                    <motion.div
                        key="recipe"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <ClaudeRecipe
                            recipe={recipe}
                            savedRecipeId={savedRecipeId}
                            isFavorited={isFavorited}
                            onToggleFavorite={handleToggleFavorite}
                            onShare={handleShare}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}
