import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const CATEGORY_TO_TYPES: Record<string, string[]> = {
  'Coiffure & soin cheveux': ['Coiffure'],
  'Onglerie Main & pieds': ['Beaute des ongles', 'Institut'],
  'Beaute du regard': ['Institut', 'Beaute des ongles'],
  'Soin visage & corps': ['Institut', 'Massage et bien-etre', 'Hammam & Spa'],
  'Make up': ['Institut'],
  'Epilation': ['Institut'],
  'Piercing et tatouage': ['Institut'],
  'Barbier': ['Barbier'],
  'Esthetique': ['Institut', 'Chirurgie esthetique'],
  'Massage': ['Massage et bien-etre', 'Hammam & Spa'],
  'SPA': ['Hammam & Spa'],
  'Yoga & Pilates': ['Sport et forme'],
  'Fitness & Musculation': ['Sport et forme'],
  'Danse & Cardio': ['Sport et forme'],
}

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

      // 2. Salons dont le type_salon correspond via le mapping
      const matchingTypes = CATEGORY_TO_TYPES[q] || [q]
      let fromType: number[] = []

      for (const typeName of matchingTypes) {
        const { data: matchingSalons } = await supabase
          .from('salons')
          .select('id')
          .eq('visible', true)
          .ilike('type_salon', '%' + typeName + '%')

        fromType = [...fromType, ...(matchingSalons || []).map((s: any) => s.id)]
      }

      // 3. Combiner sans doublons
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
