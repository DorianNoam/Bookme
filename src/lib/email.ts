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
          <span style="color:#ffffff;font-size:24px;font-weight:bold;">Bookme</span><span style="color:#B8922A;font-size:24px;font-weight:bold;">.dz</span>
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
          <p style="color:#888;font-size:14px;line-height:20px;text-align:center;margin:0;">L'equipe Bookme.dz<br/>La plateforme premium de beaute et bien-etre en Algerie.</p>
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
          <span style="color:#ffffff;font-size:24px;font-weight:bold;">Bookme</span><span style="color:#B8922A;font-size:24px;font-weight:bold;">.dz</span>
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
          <p style="color:#888;font-size:14px;line-height:20px;text-align:center;margin:0;">Bookme.dz Pro — Gestion de salon simplifiee.</p>
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
          <span style="color:#ffffff;font-size:24px;font-weight:bold;">Bookme</span><span style="color:#B8922A;font-size:24px;font-weight:bold;">.dz</span>
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
          <p style="color:#888;font-size:14px;line-height:20px;text-align:center;margin:0;">L'equipe Bookme.dz<br/>La plateforme premium de beaute et bien-etre en Algerie.</p>
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
