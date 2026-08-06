import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/pro/login', request.url))
  response.cookies.delete('bookme_pro_token')
  return response
}
