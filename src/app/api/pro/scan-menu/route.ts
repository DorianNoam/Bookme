import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { jwtVerify } from 'jose'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

async function getProId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get('bookme_pro_token')?.value
  if (!token) return null
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    return payload.id as number
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const proId = await getProId(req)
    if (!proId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    // Utilisation de Gemini 2.0 Flash (gratuit et ultra rapide)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `
      Analyse ce document ou cette image qui contient la liste des prestations d'un salon de beauté/bien-être.
      Extrait toutes les prestations, leur prix (en chiffres uniquement) et leur durée estimée (en minutes, par défaut 30 si non précisé).
      Classe chaque prestation OBLIGATOIREMENT dans l'une de ces 11 catégories exactes de Bookme.dz :
      - Coiffure & soin cheveux
      - Onglerie Main & pieds
      - Beaute du regard
      - Soin visage & corps
      - Make up
      - Epilation
      - Piercing et tatouage
      - Barbier
      - Esthetique
      - Massage
      - SPA

      Réponds UNIQUEMENT sous la forme d'un tableau JSON valide, sans texte autour, avec cette structure exacte :
      [
        {
          "nom": "Nom de la prestation",
          "prix": 1500,
          "duree": 30,
          "categorie_service": "Nom exact de la catégorie parmi la liste"
        }
      ]
    `

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type || 'image/jpeg',
        },
      },
    ])

    const responseText = result.response.text()
    // Nettoyage du texte pour s'assurer d'obtenir un JSON pur
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    const prestations = JSON.parse(jsonString)

    return NextResponse.json({ success: true, prestations })
  } catch (err: any) {
    console.error('Erreur scan IA :', err)
    return NextResponse.json({ success: false, error: "Erreur lors de l'analyse du document par l'IA." }, { status: 500 })
  }
}
