import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('bookme_token')
  response.cookies.delete('bookme_pro_token')
  return response
}
