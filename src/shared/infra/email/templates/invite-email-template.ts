interface InviteEmailProps {
  inviteUrl: string
  email: string
  expiresAt: Date
}

export function renderInviteEmail({
  inviteUrl,
  email,
  expiresAt
}: InviteEmailProps): string {
  const expiresFormatted = expiresAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Você foi convidado para a Capivara Solidária!</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <tr>
            <td style="padding-bottom:32px;">
              <div style="height:24px;width:24px;background:#fb7185;border-radius:4px;"></div>
            </td>
          </tr>

          <tr>
            <td style="background:#ffffff;border-radius:4px;border:1px solid #e5e5e5;padding:40px;">

              <p style="margin:0 0 24px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#a3a3a3;">
                Convite
              </p>

              <h1 style="margin:0 0 12px;font-size:22px;font-weight:900;color:#171717;letter-spacing:-0.02em;line-height:1.2;">
                Você foi aprovado para participar da plataforma
              </h1>

              <p style="margin:0 0 28px;font-size:14px;color:#737373;line-height:1.6;">
                Seu acesso foi aprovado para <strong style="color:#404040;">${email}</strong>.
                Clique no botão abaixo para definir sua senha e concluir o cadastro.
              </p>

              <a
                href="${inviteUrl}"
                style="display:inline-block;padding:12px 24px;background:#171717;color:#ffffff;text-decoration:none;border-radius:4px;font-size:14px;font-weight:600;"
              >
                Ativar minha conta →
              </a>

              <hr style="border:none;border-top:1px solid #f5f5f4;margin:32px 0;" />

              <p style="margin:0 0 8px;font-size:12px;color:#a3a3a3;">
                ⏱ Este link expira em <strong style="color:#737373;">${expiresFormatted}</strong>.
              </p>

              <p style="margin:0;font-size:12px;color:#a3a3a3;">
                Se você não solicitou este convite, ignore este email.
              </p>

              <div style="margin-top:24px;padding:12px 16px;background:#fafafa;border-radius:4px;border:1px solid #f0f0f0;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.05em;">
                  Link direto
                </p>
                <p style="margin:0;font-size:11px;color:#a3a3a3;word-break:break-all;">
                  ${inviteUrl}
                </p>
              </div>

            </td>
          </tr>

          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#a3a3a3;">
                Plataforma Social · Enviado automaticamente, não responda este email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
