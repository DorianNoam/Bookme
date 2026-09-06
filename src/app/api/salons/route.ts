import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// --- CATEGORIES DE REFERENCE ---
// Liste unique, identique a celle du formulaire d'inscription et des onglets
// de filtre. Toute categorie stockee en base doit correspondre a l'une d'elles.
const CATEGORIES = [
  'Coiffure & soin cheveux',
  'Onglerie Main & pieds',
  'Beauté du regard',
  'Soin visage & corps',
  'Make up',
  'Épilation',
  'Piercing et tatouage',
  'Barbier',
  'Esthétique',
  'Massage',
  'SPA',
  'Yoga & Pilates',
  'Fitness & Musculation',
  'Danse & Cardio',
]

// Retire les accents, la casse et la ponctuation pour comparer deux libelles
// sans se soucier de la facon dont ils ont ete ecrits.
// "Beaute du regard", "BEAUTÉ DU REGARD" et "Beauté du regard" donnent
// tous les trois "beautederegard" -> ils sont consideres identiques.
function normaliser(texte: string): string {
  return (texte || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // retire les accents
    .replace(/[^a-z0-9]/g, '')        // retire espaces, tirets, esperluettes
}

// Ramene une categorie recue (quelle que soit son orthographe) vers sa forme
// canonique. Renvoie null si elle ne correspond a aucune categorie connue :
// dans ce cas on retombe sur une recherche textuelle libre.
function categorieCanonique(saisie: string): string | null {
  const cible = normaliser(saisie)
  if (!cible) return null
  return CATEGORIES.find(c => normaliser(c) === cible) || null
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q   = searchParams.get('q')   || ''
    const loc = searchParams.get('loc') || ''

    const supabase = createAdminClient()

    let salonIdsFilter: number[] | null = null

    if (q) {
      // On recupere toutes les categories distinctes presentes en base, puis on
      // garde celles qui correspondent a la demande une fois normalisees.
      // Cela rend la recherche insensible aux accents, a la casse et aux tirets,
      // meme si un import IA a ecrit "Beaute du regard" sans accent.
      const { data: toutesCategories } = await supabase
        .from('services')
        .select('categorie_service')

      const canonique = categorieCanonique(q)
      const cible = normaliser(canonique || q)

      const categoriesCorrespondantes = Array.from(
        new Set((toutesCategories || []).map((s: any) => s.categorie_service).filter(Boolean))
      ).filter((cat: string) => {
        const catNorm = normaliser(cat)
        // Correspondance exacte si la demande est une categorie connue,
        // sinon recherche partielle (saisie libre de la visiteuse).
        return canonique ? catNorm === cible : catNorm.includes(cible)
      })

      if (categoriesCorrespondantes.length === 0) {
        return NextResponse.json({ salons: [] })
      }

      // Chercher uniquement les salons qui ont des services dans ces categories
      const { data: matchingServices } = await supabase
        .from('services')
        .select('salon_id')
        .in('categorie_service', categoriesCorrespondantes)

      salonIdsFilter = Array.from(new Set((matchingServices || []).map((s: any) => s.salon_id)))
    }

    let query = supabase
      .from('salons')
      .select('id, nom, adresse, image, type_salon, telephone, description, ville, ouverture, fermeture, jour_off, latitude, longitude, slug, avis(note)')
      .eq('visible', true)

    if (salonIdsFilter !== null) {
      if (salonIdsFilter.length > 0) {
        query = query.in('id', salonIdsFilter)
      } else {
        return NextResponse.json({ salons: [] })
      }
    }

    if (loc) query = query.ilike('ville', '%' + loc + '%')

    // Tri du plus recent au plus ancien
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error

    const salons = (data || []).map((s: any) => {
      const notes = s.avis?.map((a: any) => a.note) || []
      const moy = notes.length ? (notes.reduce((a: number, b: number) => a + b, 0) / notes.length).toFixed(1) : null
      const { avis, ...rest } = s
      return { ...rest, moy_note: moy, nb_avis: notes.length }
    })

    return NextResponse.json({ salons })
  } catch (err: any) {
    console.error('Erreur recherche salons:', err?.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
