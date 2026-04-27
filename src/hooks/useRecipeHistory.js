import { supabase } from '../supabase.js'

export function useRecipeHistory(userId) {
    async function saveRecipe(recipe, ingredientsUsed, filters) {
        if (!userId) return null
        const { data } = await supabase
            .from('recipes')
            .insert({
                user_id: userId,
                recipe,
                ingredients_used: ingredientsUsed,
                filters,
                favorited: false,
                public: false,
            })
            .select('id')
            .single()
        return data
    }

    async function toggleFavorite(id, favorited) {
        if (!userId) return
        await supabase.from('recipes').update({ favorited }).eq('id', id)
    }

    async function shareRecipe(id) {
        if (!userId) return null
        await supabase.from('recipes').update({ public: true }).eq('id', id)
        const url = `${window.location.origin}?recipe=${id}`
        await navigator.clipboard.writeText(url)
        return url
    }

    return { saveRecipe, toggleFavorite, shareRecipe }
}
