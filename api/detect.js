import { GoogleGenerativeAI } from '@google/generative-ai'

const PROMPT = 'List every food ingredient visible in this image. Return ONLY a valid JSON array of lowercase ingredient names, e.g. ["tomato","onion","garlic"]. Return [] if no food is visible.'

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { base64, mimeType } = req.body
    if (!base64 || !mimeType) return res.status(400).json({ error: 'Missing base64 or mimeType' })

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
        const result = await model.generateContent([
            PROMPT,
            { inlineData: { mimeType, data: base64 } },
        ])
        const text = result.response.text().replace(/```json\s*/i, '').replace(/```/g, '').trim()
        return res.json({ ingredients: JSON.parse(text) })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
