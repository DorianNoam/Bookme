import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q   = searchParams.get('q')   || ''
    const loc = searchParams.get('loc') || ''

    const supabase = createAdminClient()

    let query = supabase
      .from('salons')
      .select(`
        id, nom, adresse, image, type_salon, telephone, description, ville,
        ouverture, fermeture, jour_off,
        avis(note)
      `)

    if (q)   query = query.ilike('type_salon', `%${q}%`)
    if (loc) query = query.ilike('adresse', `%${loc}%`)

    const { data, error } = await query.order('id', { ascending: true })
    if (error) throw error

    // Calculer la note moyenne
    const salons = (data || []).map((s: any) => {
      const notes = s.avis?.map((a: any) => a.note) || []
      const moy = notes.length ? (notes.reduce((a: number, b: number) => a + b, 0) / notes.length).toFixed(1) : null
      const { avis, ...rest } = s
      return { ...rest, moy_note: moy, nb_avis: notes.length }
    })

    return NextResponse.json({ salons })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
