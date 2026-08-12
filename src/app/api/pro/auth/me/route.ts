import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('bookme_pro_token')?.value
    if (!token) return NextResponse.json({ authenticated: false })

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)

    return NextResponse.json({
      authenticated: true,
      role: payload.role || 'pro',
      id: payload.id,
      salon_id: payload.salon_id || null,
      nom: payload.nom || null
    })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}
