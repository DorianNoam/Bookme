import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const id = parseInt(params.id)

    const [salonRes, servicesRes, employesRes, avisRes, imagesRes] = await Promise.all([
      supabase.from('salons').select('*').eq('id', id).single(),
      supabase.from('services').select('*').eq('salon_id', id).order('categorie_service'),
      supabase.from('employes').select('*').eq('salon_id', id),
      supabase.from('avis').select('*, users(prenom, nom)').eq('salon_id', id).order('date_avis', { ascending: false }),
      supabase.from('salon_images').select('*').eq('salon_id', id),
    ])

    if (salonRes.error || !salonRes.data) {
      return NextResponse.json({ error: 'Salon introuvable' }, { status: 404 })
    }

    const notes = (avisRes.data || []).map((a: any) => a.note)
    const moy_note = notes.length
      ? (notes.reduce((a: number, b: number) => a + b, 0) / notes.length).toFixed(1)
      : null

    return NextResponse.json({
      salon:    { ...salonRes.data, moy_note, nb_avis: notes.length },
      services: servicesRes.data  || [],
      employes: employesRes.data  || [],
      avis:     avisRes.data      || [],
      images:   imagesRes.data    || [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
