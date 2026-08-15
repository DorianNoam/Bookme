import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ═══════════════════════════════════════════════════════════════
// EMAIL CLIENT : Confirmation de reservation
// ═══════════════════════════════════════════════════════════════

export async function sendBookingConfirmation({
  clientEmail,
  clientName,
  salonName,
  serviceName,
  date,
  time,
  price,
}: {
  clientEmail: string
  clientName: string
  salonName: string
  serviceName: string
  date: string
  time: string
  price: number
}) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F5F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;border:1px solid #E0D8CE;overflow:hidden;">
        <tr><td style="background:#0A0A0A;padding:20px;text-align:center;">
          <span style="color:#ffffff;font-size:24px;font-weight:bold;">Bookmedz</span><span style="color:#B8922A;font-size:24px;font-weight:bold;">.com</span>
        </td></tr>
        <tr><td style="padding:40px;">
          <h1 style="color:#0A0A0A;font-size:24px;font-weight:bold;margin:0 0 20px;">Rendez-vous confirme !</h1>
          <p style="color:#333;font-size:16px;line-height:24px;margin:0 0 16px;">Bonjour ${clientName},</p>
          <p style="color:#333;font-size:16px;line-height:24px;margin:0 0 24px;">Votre reservation au salon <strong>${salonName}</strong> a bien ete enregistree.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;border:1px solid #E0D8CE;border-radius:6px;margin:0 0 24px;">
            <tr><td style="padding:20px;">
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Prestation :</strong> ${serviceName}</p>
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Date :</strong> ${date}</p>
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Heure :</strong> ${time}</p>
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Prix a regler sur place :</strong> <span style="color:#B8922A;font-weight:bold;">${price} DA</span></p>
            </td></tr>
          </table>
          <p style="color:#333;font-size:16px;line-height:24px;margin:0 0 16px;">Merci de vous presenter 5 minutes avant l'heure prevue. En cas d'empechement, vous pouvez annuler directement depuis votre espace client.</p>
          <hr style="border:none;border-top:1px solid #E0D8CE;margin:30px 0;" />
          <p style="color:#888;font-size:14px;line-height:20px;text-align:center;margin:0;">L'equipe Bookmedz.com<br/>La plateforme premium de beaute et bien-etre en Algerie.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    await resend.emails.send({
      from: 'Bookmedz <noreply@bookmedz.com>',
      to: [clientEmail],
      subject: `Confirmation de votre rendez-vous au ${salonName}`,
      html,
    })
    return { success: true }
  } catch (err: any) {
    console.error('Erreur envoi email client:', err.message)
    return { success: false, error: err.message }
  }
}

// ═══════════════════════════════════════════════════════════════
// EMAIL PRO : Notification de nouvelle reservation
// ═══════════════════════════════════════════════════════════════

export async function sendProNotification({
  proEmail,
  salonName,
  clientName,
  clientPhone,
  serviceName,
  date,
  time,
  price,
}: {
  proEmail: string
  salonName: string
  clientName: string
  clientPhone: string
  serviceName: string
  date: string
  time: string
  price: number
}) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F5F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;border:1px solid #E0D8CE;overflow:hidden;">
        <tr><td style="background:#0A0A0A;padding:20px;text-align:center;">
          <span style="color:#ffffff;font-size:24px;font-weight:bold;">Bookmedz</span><span style="color:#B8922A;font-size:24px;font-weight:bold;">.com</span>
          <span style="color:#888;font-size:14px;margin-left:8px;">Pro</span>
        </td></tr>
        <tr><td style="padding:40px;">
          <h1 style="color:#0A0A0A;font-size:24px;font-weight:bold;margin:0 0 20px;">Nouvelle reservation !</h1>
          <p style="color:#333;font-size:16px;line-height:24px;margin:0 0 24px;">Un client vient de reserver un creneau dans votre salon <strong>${salonName}</strong>.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;border:1px solid #E0D8CE;border-radius:6px;margin:0 0 24px;">
            <tr><td style="padding:20px;">
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Client :</strong> ${clientName}</p>
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Telephone :</strong> ${clientPhone || 'Non renseigne'}</p>
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Prestation :</strong> ${serviceName}</p>
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Date :</strong> ${date}</p>
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Heure :</strong> ${time}</p>
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Montant :</strong> <span style="color:#B8922A;font-weight:bold;">${price} DA</span></p>
            </td></tr>
          </table>
          <p style="color:#333;font-size:16px;line-height:24px;margin:0 0 16px;">Connectez-vous a votre espace pro pour consulter votre agenda.</p>
          <hr style="border:none;border-top:1px solid #E0D8CE;margin:30px 0;" />
          <p style="color:#888;font-size:14px;line-height:20px;text-align:center;margin:0;">Bookmedz.com Pro — Gestion de salon simplifiee.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    await resend.emails.send({
      from: 'Bookmedz <noreply@bookmedz.com>',
      to: [proEmail],
      subject: `Nouveau RDV : ${clientName} - ${serviceName}`,
      html,
    })
    return { success: true }
  } catch (err: any) {
    console.error('Erreur envoi email pro:', err.message)
    return { success: false, error: err.message }
  }
}

// ═══════════════════════════════════════════════════════════════
// EMAIL CLIENT : Rappel de RDV (envoye la veille)
// ═══════════════════════════════════════════════════════════════

export async function sendBookingReminder({
  clientEmail,
  clientName,
  salonName,
  serviceName,
  time,
  price,
}: {
  clientEmail: string
  clientName: string
  salonName: string
  serviceName: string
  time: string
  price: number
}) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F5F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;border:1px solid #E0D8CE;overflow:hidden;">
        <tr><td style="background:#0A0A0A;padding:20px;text-align:center;">
          <span style="color:#ffffff;font-size:24px;font-weight:bold;">Bookmedz</span><span style="color:#B8922A;font-size:24px;font-weight:bold;">.com</span>
        </td></tr>
        <tr><td style="padding:40px;">
          <h1 style="color:#0A0A0A;font-size:24px;font-weight:bold;margin:0 0 20px;">Rappel : votre RDV est demain !</h1>
          <p style="color:#333;font-size:16px;line-height:24px;margin:0 0 16px;">Bonjour ${clientName},</p>
          <p style="color:#333;font-size:16px;line-height:24px;margin:0 0 24px;">Nous vous rappelons que vous avez un rendez-vous <strong>demain</strong> au salon <strong>${salonName}</strong>.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;border:1px solid #E0D8CE;border-radius:6px;margin:0 0 24px;">
            <tr><td style="padding:20px;">
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Prestation :</strong> ${serviceName}</p>
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Heure :</strong> ${time}</p>
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Prix a regler sur place :</strong> <span style="color:#B8922A;font-weight:bold;">${price} DA</span></p>
            </td></tr>
          </table>
          <p style="color:#333;font-size:16px;line-height:24px;margin:0 0 16px;">Merci de vous presenter 5 minutes avant l'heure prevue. En cas d'empechement, pensez a annuler depuis votre espace client pour liberer le creneau.</p>
          <hr style="border:none;border-top:1px solid #E0D8CE;margin:30px 0;" />
          <p style="color:#888;font-size:14px;line-height:20px;text-align:center;margin:0;">L'equipe Bookmedz.com<br/>La plateforme premium de beaute et bien-etre en Algerie.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    await resend.emails.send({
      from: 'Bookmedz <noreply@bookmedz.com>',
      to: [clientEmail],
      subject: `Rappel : votre RDV demain au ${salonName} a ${time}`,
      html,
    })
    return { success: true }
  } catch (err: any) {
    console.error('Erreur envoi rappel:', err.message)
    return { success: false, error: err.message }
  }
}

// ═══════════════════════════════════════════════════════════════
// EMAIL : Reinitialisation de mot de passe
// ═══════════════════════════════════════════════════════════════

export async function sendPasswordReset({
  email,
  name,
  resetUrl,
}: {
  email: string
  name: string
  resetUrl: string
}) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F5F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;border:1px solid #E0D8CE;overflow:hidden;">
        <tr><td style="background:#0A0A0A;padding:20px;text-align:center;">
          <span style="color:#ffffff;font-size:24px;font-weight:bold;">Bookmedz</span><span style="color:#B8922A;font-size:24px;font-weight:bold;">.com</span>
        </td></tr>
        <tr><td style="padding:40px;">
          <h1 style="color:#0A0A0A;font-size:24px;font-weight:bold;margin:0 0 20px;">Reinitialisation de mot de passe</h1>
          <p style="color:#333;font-size:16px;line-height:24px;margin:0 0 16px;">Bonjour ${name},</p>
          <p style="color:#333;font-size:16px;line-height:24px;margin:0 0 24px;">Vous avez demande a reinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau :</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td align="center">
              <a href="${resetUrl}" style="display:inline-block;background:#B8922A;color:#ffffff;padding:14px 36px;border-radius:6px;font-size:16px;font-weight:bold;text-decoration:none;">Choisir un nouveau mot de passe</a>
            </td></tr>
          </table>
          <p style="color:#888;font-size:14px;line-height:20px;margin:0 0 16px;">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
          <hr style="border:none;border-top:1px solid #E0D8CE;margin:30px 0;" />
          <p style="color:#888;font-size:14px;line-height:20px;text-align:center;margin:0;">Bookmedz.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    await resend.emails.send({
      from: 'Bookmedz <noreply@bookmedz.com>',
      to: [email],
      subject: 'Reinitialisation de votre mot de passe Bookmedz',
      html,
    })
    return { success: true }
  } catch (err: any) {
    console.error('Erreur envoi reset password:', err.message)
    return { success: false, error: err.message }
  }
}

// ═══════════════════════════════════════════════════════════════
// EMAIL PRO : Rappel expiration abonnement
// ═══════════════════════════════════════════════════════════════

export async function sendAbonnementReminder({
  proEmail,
  proName,
  salonName,
  abonnementFin,
  joursRestants,
}: {
  proEmail: string
  proName: string
  salonName: string
  abonnementFin: string
  joursRestants: number
}) {
  const finFormatted = new Date(abonnementFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const urgence = joursRestants <= 7

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F5F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;border:1px solid #E0D8CE;overflow:hidden;">
        <tr><td style="background:#0A0A0A;padding:20px;text-align:center;">
          <span style="color:#ffffff;font-size:24px;font-weight:bold;">Bookmedz</span><span style="color:#B8922A;font-size:24px;font-weight:bold;">.com</span>
          <span style="color:#888;font-size:14px;margin-left:8px;">Pro</span>
        </td></tr>
        <tr><td style="padding:40px;">
          <h1 style="color:${urgence ? '#d32f2f' : '#0A0A0A'};font-size:24px;font-weight:bold;margin:0 0 20px;">
            ${urgence ? 'Attention : votre acces expire dans ' + joursRestants + ' jour' + (joursRestants > 1 ? 's' : '') + ' !' : 'Votre abonnement expire bientot'}
          </h1>
          <p style="color:#333;font-size:16px;line-height:24px;margin:0 0 16px;">Bonjour ${proName},</p>
          <p style="color:#333;font-size:16px;line-height:24px;margin:0 0 24px;">
            ${joursRestants === 0
              ? 'Votre acces Bookmedz Pro pour <strong>' + salonName + '</strong> expire <strong>aujourd\'hui</strong>. Renouvelez maintenant pour ne pas perdre vos reservations.'
              : 'Votre acces Bookmedz Pro pour <strong>' + salonName + '</strong> expire le <strong>' + finFormatted + '</strong>. Renouvelez pour continuer a recevoir des reservations en ligne.'
            }
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;border:1px solid #E0D8CE;border-radius:6px;margin:0 0 24px;">
            <tr><td style="padding:20px;">
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Tarif :</strong> 36 000 DA / an (3 000 DA/mois)</p>
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Comment renouveler :</strong></p>
              <p style="color:#555;font-size:14px;line-height:24px;margin:8px 0 0;">
                1. Effectuez un virement de 36 000 DA<br/>
                2. Motif : Abonnement Pro - ${salonName}<br/>
                3. Envoyez le recu a contact@bookmedz.com<br/>
                4. Activation sous 24h
              </p>
            </td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #E0D8CE;margin:30px 0;" />
          <p style="color:#888;font-size:14px;line-height:20px;text-align:center;margin:0;">Bookmedz.com Pro — Gestion de salon simplifiee.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    await resend.emails.send({
      from: 'Bookmedz <noreply@bookmedz.com>',
      to: [proEmail],
      subject: urgence
        ? 'URGENT : votre acces Bookmedz Pro expire dans ' + joursRestants + ' jour' + (joursRestants > 1 ? 's' : '')
        : 'Rappel : votre abonnement Bookmedz Pro expire le ' + finFormatted,
      html,
    })
    return { success: true }
  } catch (err: any) {
    console.error('Erreur envoi rappel abonnement:', err.message)
    return { success: false, error: err.message }
  }
}

// ═══════════════════════════════════════════════════════════════
// EMAIL PRO : Bienvenue (inscription)
// ═══════════════════════════════════════════════════════════════

export async function sendProWelcome({
  proEmail,
  proName,
  salonName,
  abonnementFin,
}: {
  proEmail: string
  proName: string
  salonName: string
  abonnementFin: string
}) {
  const finFormatted = new Date(abonnementFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F5F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;border:1px solid #E0D8CE;overflow:hidden;">
        <tr><td style="background:#0A0A0A;padding:20px;text-align:center;">
          <span style="color:#ffffff;font-size:24px;font-weight:bold;">Bookmedz</span><span style="color:#B8922A;font-size:24px;font-weight:bold;">.com</span>
          <span style="color:#888;font-size:14px;margin-left:8px;">Pro</span>
        </td></tr>
        <tr><td style="padding:40px;">
          <h1 style="color:#0A0A0A;font-size:24px;font-weight:bold;margin:0 0 20px;">Bienvenue sur Bookmedz Pro !</h1>
          <p style="color:#333;font-size:16px;line-height:24px;margin:0 0 16px;">Bonjour ${proName},</p>
          <p style="color:#333;font-size:16px;line-height:24px;margin:0 0 24px;">Votre salon <strong>${salonName}</strong> est maintenant en ligne sur Bookmedz.com. Vos clients peuvent deja reserver en quelques clics !</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;border:1px solid #E0D8CE;border-radius:6px;margin:0 0 24px;">
            <tr><td style="padding:20px;">
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Votre offre :</strong> 1 an gratuit et sans engagement</p>
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Valable jusqu'au :</strong> <span style="color:#B8922A;font-weight:bold;">${finFormatted}</span></p>
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Apres :</strong> 3 000 DA/mois (36 000 DA/an)</p>
            </td></tr>
          </table>
          <p style="color:#333;font-size:16px;line-height:24px;margin:0 0 16px;">Pendant cette periode, vous avez acces a toutes les fonctionnalites :</p>
          <p style="color:#555;font-size:15px;line-height:28px;margin:0 0 24px;">
            - Agenda en ligne et gestion des rendez-vous<br/>
            - Notifications email automatiques<br/>
            - Promotions et offres speciales<br/>
            - Galerie photos de votre salon<br/>
            - Gestion des collaborateurs
          </p>
          <hr style="border:none;border-top:1px solid #E0D8CE;margin:30px 0;" />
          <p style="color:#888;font-size:14px;line-height:20px;text-align:center;margin:0;">Bookmedz.com Pro — Gestion de salon simplifiee.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    await resend.emails.send({
      from: 'Bookmedz <noreply@bookmedz.com>',
      to: [proEmail],
      subject: `Bienvenue sur Bookmedz Pro - 1 an gratuit pour ${salonName}`,
      html,
    })
    return { success: true }
  } catch (err: any) {
    console.error('Erreur envoi welcome pro:', err.message)
    return { success: false, error: err.message }
  }
}

// ═══════════════════════════════════════════════════════════════
// EMAIL ADMIN : Notification de nouvelle inscription pro
// ═══════════════════════════════════════════════════════════════

export async function sendAdminNewProNotification({
  proName,
  proEmail,
  proPhone,
  salonName,
}: {
  proName: string
  proEmail: string
  proPhone: string
  salonName: string
}) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F5F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;border:1px solid #E0D8CE;overflow:hidden;">
        <tr><td style="background:#0A0A0A;padding:20px;text-align:center;">
          <span style="color:#ffffff;font-size:24px;font-weight:bold;">Bookmedz</span><span style="color:#B8922A;font-size:24px;font-weight:bold;">.com</span>
          <span style="color:#888;font-size:14px;margin-left:8px;">Admin</span>
        </td></tr>
        <tr><td style="padding:40px;">
          <h1 style="color:#0A0A0A;font-size:24px;font-weight:bold;margin:0 0 20px;">Nouvelle Inscription Pro 🎉</h1>
          <p style="color:#333;font-size:16px;line-height:24px;margin:0 0 24px;">Un nouveau professionnel vient de créer son compte sur la plateforme.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;border:1px solid #E0D8CE;border-radius:6px;margin:0 0 24px;">
            <tr><td style="padding:20px;">
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Nom :</strong> ${proName}</p>
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Email :</strong> ${proEmail}</p>
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Téléphone :</strong> ${proPhone}</p>
              <p style="color:#0A0A0A;font-size:15px;line-height:28px;margin:0;"><strong>Salon :</strong> ${salonName}</p>
            </td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #E0D8CE;margin:30px 0;" />
          <p style="color:#888;font-size:14px;line-height:20px;text-align:center;margin:0;">Notification automatique administrateur.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    await resend.emails.send({
      from: 'Bookmedz <noreply@bookmedz.com>',
      to: ['contact@bookmedz.com'],
      subject: `🎉 Nouveau pro inscrit : ${salonName}`,
      html,
    })
    return { success: true }
  } catch (err: any) {
    console.error('Erreur envoi email admin:', err.message)
    return { success: false, error: err.message }
  }
}
