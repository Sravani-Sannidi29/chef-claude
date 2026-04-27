export default function IngredientsList({ ingredients, onRemove, onClearAll }) {
    return (
        <section>
            <div className="ingredients-header">
                <h3>Ingredients on hand:</h3>
                <button className="clear-all-btn" onClick={onClearAll}>Clear all</button>
            </div>
            <ul className="ingredients-list" aria-live="polite">
                {ingredients.map((ingredient, i) => (
                    <li key={ingredient}>
                        <span>{ingredient}</span>
                        <button
                            className="remove-ingredient-btn"
                            onClick={() => onRemove(i)}
                            aria-label={`Remove ${ingredient}`}
                        >
                            ×
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    )
}
