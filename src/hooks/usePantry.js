import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'

export function usePantry(userId) {
    const [pantry, setPantry] = useState([])

    useEffect(() => {
        if (!userId) {
            setPantry([])
            return
        }
        supabase
            .from('pantry_items')
            .select('name')
            .eq('user_id', userId)
            .order('created_at')
            .then(({ data }) => {
                if (data) setPantry(data.map(r => r.name))
            })
    }, [userId])

    async function savePantry(ingredients) {
        if (!userId) return
        await supabase.from('pantry_items').delete().eq('user_id', userId)
        if (ingredients.length > 0) {
            await supabase.from('pantry_items').insert(
                ingredients.map(name => ({ user_id: userId, name }))
            )
        }
        setPantry(ingredients)
    }

    async function removeFromPantry(name) {
        if (!userId) return
        setPantry(prev => prev.filter(n => n !== name))
        await supabase.from('pantry_items').delete().eq('user_id', userId).eq('name', name)
    }

    return { pantry, savePantry, removeFromPantry }
}
