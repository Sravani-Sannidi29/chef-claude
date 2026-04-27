import { useState } from 'react'
import StepTimer from './StepTimer.jsx'

export default function ClaudeRecipe({ recipe, savedRecipeId, isFavorited, onToggleFavorite, onShare }) {
    const [doneSteps, setDoneSteps] = useState(new Set())
    const [shared, setShared] = useState(false)

    function toggleStep(i) {
        setDoneSteps(prev => {
            const next = new Set(prev)
            next.has(i) ? next.delete(i) : next.add(i)
            return next
        })
    }

    async function handleShare() {
        await onShare()
        setShared(true)
        setTimeout(() => setShared(false), 2500)
    }

    return (
        <section>
            <div className="recipe-section-header">
                <h2>Chef Claude Recommends:</h2>
                <div className="recipe-header-actions">
                    {savedRecipeId && onShare && (
                        <button
                            className={`share-btn${shared ? ' share-btn--copied' : ''}`}
                            onClick={handleShare}
                            title="Copy shareable link"
                        >
                            {shared ? '✓ Copied!' : '🔗 Share'}
                        </button>
                    )}
                    {savedRecipeId && onToggleFavorite && (
                        <button
                            className={`favorite-btn${isFavorited ? ' favorite-btn--active' : ''}`}
                            onClick={onToggleFavorite}
                            aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
                            title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
                        >
                            {isFavorited ? '★' : '☆'}
                        </button>
                    )}
                </div>
            </div>

            <article className="suggested-recipe-container" aria-live="polite">
                <h1 className="recipe-title">{recipe.title}</h1>
                <p className="recipe-description">{recipe.description}</p>

                <div className="recipe-badges">
                    <span className="badge">⏱ {recipe.time.total}</span>
                    <span className="badge badge--calories">🔥 {recipe.calories} cal/serving</span>
                    <span className="badge">👤 {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
                    <span className={`badge badge--difficulty badge--${recipe.difficulty.toLowerCase()}`}>
                        {recipe.difficulty}
                    </span>
                </div>

                <div className="recipe-time-row">
                    <span>Prep: <strong>{recipe.time.prep}</strong></span>
                    <span>Cook: <strong>{recipe.time.cook}</strong></span>
                </div>

                <h3>Ingredients</h3>
                <ul className="recipe-ingredients">
                    {recipe.ingredients.map((ing, i) => (
                        <li key={i}>
                            <span className="ing-amount">{ing.amount}</span>
                            {ing.item}
                        </li>
                    ))}
                </ul>

                <h3>Instructions</h3>
                <p className="steps-hint">Tap a step to mark it done · timers start automatically when detected</p>
                <ol className="recipe-steps">
                    {recipe.steps.map((step, i) => (
                        <li
                            key={i}
                            className={doneSteps.has(i) ? 'step--done' : ''}
                            onClick={() => toggleStep(i)}
                        >
                            <span className="step-text">{step}</span>
                            <StepTimer stepText={step} />
                        </li>
                    ))}
                </ol>

                {recipe.tips && (
                    <div className="recipe-tips">
                        <strong>💡 Chef's tip:</strong> {recipe.tips}
                    </div>
                )}
            </article>
        </section>
    )
}
