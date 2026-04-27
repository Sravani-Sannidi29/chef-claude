import { GoogleGenerativeAI } from "@google/generative-ai"

const SYSTEM_PROMPT = `You are a professional chef assistant. Given a list of ingredients, suggest a recipe the user can make.

Respond ONLY with a valid JSON object — no markdown, no code fences, no extra text:
{
  "title": "Recipe Name",
  "description": "One or two sentence description of the dish.",
  "difficulty": "Easy",
  "time": {
    "prep": "10 min",
    "cook": "20 min",
    "total": "30 min"
  },
  "servings": 2,
  "calories": 450,
  "ingredients": [
    { "amount": "200g", "item": "pasta" }
  ],
  "steps": [
    "Step one.",
    "Step two."
  ],
  "tips": "Optional cooking tip, or null if none."
}

Rules:
- difficulty must be exactly "Easy", "Medium", or "Hard"
- calories is a number (per serving estimate)
- Use some or all provided ingredients; you may add a few common pantry staples
- steps must have at least 3 entries
- tips can be null`

// Only instantiated in dev (VITE_ vars are stripped in production builds)
const devClient = import.meta.env.DEV
    ? new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
    : null

function parseRecipeJSON(text) {
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(cleaned)
    const required = ['title', 'description', 'difficulty', 'time', 'servings', 'calories', 'ingredients', 'steps']
    for (const field of required) {
        if (!(field in parsed)) throw new Error(`Missing field: ${field}`)
    }
    if (!Array.isArray(parsed.ingredients) || parsed.ingredients.length === 0) {
        throw new Error('ingredients must be a non-empty array')
    }
    if (!Array.isArray(parsed.steps) || parsed.steps.length < 2) {
        throw new Error('steps must have at least 2 entries')
    }
    return parsed
}

export async function getRecipe(ingredientsArr, filters = {}) {
    // Production: call Vercel serverless function (API key stays server-side)
    if (import.meta.env.PROD) {
        const res = await fetch('/api/recipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ingredients: ingredientsArr, filters }),
        })
        if (!res.ok) throw new Error('Recipe generation failed')
        return res.json()
    }

    // Development: call Gemini directly
    const { dietary = [], maxTime = null, maxCalories = null } = filters
    const constraints = []
    if (dietary.length > 0) constraints.push(`Dietary: must be ${dietary.join(' and ')}`)
    if (maxTime) constraints.push(`Total cooking time must be under ${maxTime} minutes`)
    if (maxCalories) constraints.push(`Must be under ${maxCalories} calories per serving`)

    const constraintBlock = constraints.length > 0
        ? `\n\nStrict constraints — the recipe MUST satisfy ALL of these:\n${constraints.map(c => `- ${c}`).join('\n')}`
        : ''

    const model = devClient.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
    const prompt = `${SYSTEM_PROMPT}${constraintBlock}\n\nI have these ingredients: ${ingredientsArr.join(', ')}. Please give me a recipe recommendation.`

    let lastError
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const result = await model.generateContent(prompt)
            return parseRecipeJSON(result.response.text())
        } catch (err) {
            lastError = err
        }
    }
    throw lastError
}

const DETECT_PROMPT = 'List every food ingredient visible in this image. Return ONLY a valid JSON array of lowercase ingredient names, e.g. ["tomato","onion"]. Return [] if no food is visible.'

export async function detectIngredients(base64Data, mimeType) {
    // Production: call Vercel serverless function
    if (import.meta.env.PROD) {
        const res = await fetch('/api/detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64: base64Data, mimeType }),
        })
        if (!res.ok) throw new Error('Detection failed')
        const data = await res.json()
        return data.ingredients
    }

    // Development: call Gemini directly
    const model = devClient.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
    const result = await model.generateContent([
        DETECT_PROMPT,
        { inlineData: { mimeType, data: base64Data } },
    ])
    const text = result.response.text().replace(/```json\s*/i, '').replace(/```/g, '').trim()
    return JSON.parse(text)
}
