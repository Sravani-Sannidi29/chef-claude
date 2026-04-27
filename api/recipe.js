import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are a professional chef assistant. Given a list of ingredients, suggest a recipe the user can make.

Respond ONLY with a valid JSON object — no markdown, no code fences, no extra text:
{
  "title": "Recipe Name",
  "description": "One or two sentence description of the dish.",
  "difficulty": "Easy",
  "time": { "prep": "10 min", "cook": "20 min", "total": "30 min" },
  "servings": 2,
  "calories": 450,
  "ingredients": [{ "amount": "200g", "item": "pasta" }],
  "steps": ["Step one.", "Step two."],
  "tips": "Optional tip, or null."
}

Rules:
- difficulty must be exactly "Easy", "Medium", or "Hard"
- calories is a number (per serving)
- Use some or all provided ingredients; add a few pantry staples if needed
- steps must have at least 3 entries
- tips can be null`

function parseRecipeJSON(text) {
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(cleaned)
    const required = ['title', 'description', 'difficulty', 'time', 'servings', 'calories', 'ingredients', 'steps']
    for (const field of required) {
        if (!(field in parsed)) throw new Error(`Missing field: ${field}`)
    }
    return parsed
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { ingredients = [], filters = {} } = req.body
    const { dietary = [], maxTime = null, maxCalories = null } = filters

    const constraints = []
    if (dietary.length > 0) constraints.push(`Dietary: must be ${dietary.join(' and ')}`)
    if (maxTime) constraints.push(`Total cooking time must be under ${maxTime} minutes`)
    if (maxCalories) constraints.push(`Must be under ${maxCalories} calories per serving`)

    const constraintBlock = constraints.length > 0
        ? `\n\nStrict constraints — MUST satisfy ALL:\n${constraints.map(c => `- ${c}`).join('\n')}`
        : ''

    const prompt = `${SYSTEM_PROMPT}${constraintBlock}\n\nI have: ${ingredients.join(', ')}. Give me a recipe.`
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

    let lastError
    for (let i = 0; i < 3; i++) {
        try {
            const result = await model.generateContent(prompt)
            return res.json(parseRecipeJSON(result.response.text()))
        } catch (err) {
            lastError = err
        }
    }
    return res.status(500).json({ error: lastError.message })
}
