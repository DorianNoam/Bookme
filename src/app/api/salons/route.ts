import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q   = searchParams.get('q')   || ''
    const loc = searchParams.get('loc') || ''

    const supabase = createAdminClient()

    let salonIdsFilter: number[] | null = null

    if (q) {
      // 1. Salons qui ont des services dans cette categorie
      const { data: matchingServices } = await supabase
        .from('services')
        .select('salon_id')
        .ilike('categorie_service', '%' + q + '%')

      const fromServices = (matchingServices || []).map((s: any) => s.salon_id)

      // 2. Salons dont le type_salon correspond (nouveaux inscrits sans prestations)
      const { data: matchingType } = await supabase
        .from('salons')
        .select('id')
        .eq('visible', true)
        .ilike('type_salon', '%' + q + '%')

      const fromType = (matchingType || []).map((s: any) => s.id)

      // 3. Combiner les deux sans doublons
      salonIdsFilter = Array.from(new Set([...fromServices, ...fromType]))
    }

    let query = supabase
      .from('salons')
      .select('id, nom, adresse, image, type_salon, telephone, description, ville, ouverture, fermeture, jour_off, latitude, longitude, avis(note)')
      .eq('visible', true)

    if (salonIdsFilter !== null) {
      if (salonIdsFilter.length > 0) {
        query = query.in('id', salonIdsFilter)
      } else {
        return NextResponse.json({ salons: [] })
      }
    }

    if (loc) query = query.ilike('ville', '%' + loc + '%')

    const { data, error } = await query.order('id', { ascending: true })
    if (error) throw error

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
