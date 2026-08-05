import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // 1. Préparer la redirection vers la page de connexion
  const response = NextResponse.redirect(new URL('/pro/login', request.url))

  // 2. Supprimer le cookie JWT sécurisé de l'espace pro
  response.cookies.delete('bookme_pro_token')

  // 3. Renvoyer la réponse à l'utilisateur
  return response
}
