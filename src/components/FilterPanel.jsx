const DIETARY_OPTIONS = [
    { id: 'vegan', label: '🌱 Vegan' },
    { id: 'vegetarian', label: '🥦 Vegetarian' },
    { id: 'gluten-free', label: '🌾 Gluten-free' },
    { id: 'dairy-free', label: '🥛 Dairy-free' },
    { id: 'diabetic-friendly', label: '💊 Diabetic-friendly' },
]

const TIME_OPTIONS = [
    { value: null, label: 'Any' },
    { value: 15, label: '< 15 min' },
    { value: 30, label: '< 30 min' },
    { value: 60, label: '< 1 hr' },
]

const CALORIE_OPTIONS = [
    { value: null, label: 'Any' },
    { value: 400, label: '< 400' },
    { value: 600, label: '< 600' },
    { value: 800, label: '< 800' },
]

export default function FilterPanel({ filters, onChange }) {
    function toggleDietary(id) {
        const dietary = filters.dietary.includes(id)
            ? filters.dietary.filter(d => d !== id)
            : [...filters.dietary, id]
        onChange({ ...filters, dietary })
    }

    const hasActiveFilters =
        filters.dietary.length > 0 || filters.maxTime !== null || filters.maxCalories !== null

    return (
        <div className={`filter-panel${hasActiveFilters ? ' filter-panel--active' : ''}`}>
            <h4 className="filter-heading">
                Preferences
                <span className="filter-heading-sub"> (optional)</span>
                {hasActiveFilters && <span className="filter-active-dot" />}
            </h4>

            <div className="filter-row">
                <span className="filter-label">Diet</span>
                <div className="filter-pills">
                    {DIETARY_OPTIONS.map(opt => (
                        <button
                            key={opt.id}
                            type="button"
                            className={`filter-pill${filters.dietary.includes(opt.id) ? ' filter-pill--active' : ''}`}
                            onClick={() => toggleDietary(opt.id)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-row">
                <span className="filter-label">Time</span>
                <div className="filter-pills">
                    {TIME_OPTIONS.map(opt => (
                        <button
                            key={String(opt.value)}
                            type="button"
                            className={`filter-pill${filters.maxTime === opt.value ? ' filter-pill--active' : ''}`}
                            onClick={() => onChange({ ...filters, maxTime: opt.value })}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-row">
                <span className="filter-label">Calories</span>
                <div className="filter-pills">
                    {CALORIE_OPTIONS.map(opt => (
                        <button
                            key={String(opt.value)}
                            type="button"
                            className={`filter-pill${filters.maxCalories === opt.value ? ' filter-pill--active' : ''}`}
                            onClick={() => onChange({ ...filters, maxCalories: opt.value })}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
