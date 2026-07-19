/**
 * Email Templates para Newsletter e Contact Forms
 */

export class EmailTemplates {
  /**
   * Email de boas-vindas para newsletter
   */
  static welcomeNewsletter(email: string) {
    return {
      subject: '🎵 Bem-vindo à Newsletter Espalhe Melodias!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <h1 style="color: #7c3aed; text-align: center;">🎵 Bem-vindo à Comunidade Espalhe Melodias!</h1>

            <p>Olá,</p>

            <p>Muito obrigado por se inscrever em nossa newsletter! Estamos emocionados em ter você conosco.</p>

            <p>Você receberá atualizações sobre:</p>
            <ul style="color: #666;">
              <li>✨ Novos eventos e workshops</li>
              <li>🎓 Materiais educativos exclusivos</li>
              <li>💬 Discussões interessantes da comunidade</li>
              <li>📰 Notícias e histórias inspiradoras</li>
            </ul>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              <strong>Email confirmado:</strong> ${email}
            </p>

            <p style="text-align: center; margin-top: 20px;">
              <a href="https://espalhe-melodias.com" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Acessar Comunidade
              </a>
            </p>

            <footer style="text-align: center; margin-top: 40px; color: #999; font-size: 12px;">
              <p>&copy; 2026 Espalhe Melodias. Todos os direitos reservados.</p>
            </footer>
          </div>
        </body>
        </html>
      `,
      text: `Bem-vindo à Newsletter Espalhe Melodias!\n\nVocê está agora inscrito e receberá atualizações sobre eventos, materiais e notícias da comunidade.\n\nEmail: ${email}`,
    };
  }

  /**
   * Confirmação de desinscrição
   */
  static unsubscribeConfirmation(email: string) {
    return {
      subject: '😢 Você foi removido da Newsletter Espalhe Melodias',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <h2 style="color: #7c3aed;">Você foi removido da nossa newsletter</h2>

            <p>Sua solicitação foi processada. O email <strong>${email}</strong> foi removido da nossa lista de distribuição.</p>

            <p>Sentiremos sua falta! Se mudar de ideia, você sempre pode se inscrever novamente.</p>

            <footer style="text-align: center; margin-top: 40px; color: #999; font-size: 12px;">
              <p>&copy; 2026 Espalhe Melodias.</p>
            </footer>
          </div>
        </body>
        </html>
      `,
      text: `Você foi removido da newsletter Espalhe Melodias.\n\nEmail: ${email}`,
    };
  }

  /**
   * Confirmação de envio de mensagem de contato para o remetente
   */
  static contactFormConfirmation(name: string, email: string, subject: string, messageId: string) {
    return {
      subject: '✅ Recebemos sua mensagem - Espalhe Melodias',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <h2 style="color: #7c3aed;">Obrigado por entrar em contato!</h2>

            <p>Olá ${name},</p>

            <p>Recebemos sua mensagem e estamos processando sua solicitação.</p>

            <div style="background-color: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Assunto:</strong> ${subject}</p>
              <p><strong>Seu email:</strong> ${email}</p>
              <p><strong>ID da Mensagem:</strong> <code style="background-color: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${messageId}</code></p>
            </div>

            <p>Um membro da nossa equipe responderá em breve.</p>

            <footer style="text-align: center; margin-top: 40px; color: #999; font-size: 12px;">
              <p>&copy; 2026 Espalhe Melodias. Todos os direitos reservados.</p>
            </footer>
          </div>
        </body>
        </html>
      `,
      text: `Obrigado por entrar em contato!\n\nAssunto: ${subject}\nEmail: ${email}\nID: ${messageId}\n\nEsperamos sua resposta em breve.`,
    };
  }

  /**
   * Notificação ao admin sobre nova mensagem de contato
   */
  static contactFormAdminNotification(
    senderName: string,
    senderEmail: string,
    senderPhone: string | null,
    subject: string,
    message: string,
    messageId: string,
  ) {
    return {
      subject: `📨 Nova mensagem de contato: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <h2 style="color: #7c3aed;">📨 Nova Mensagem de Contato</h2>

            <div style="background-color: #fff; border-left: 4px solid #7c3aed; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>De:</strong> ${senderName}</p>
              <p><strong>Email:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
              ${senderPhone ? `<p><strong>Telefone:</strong> ${senderPhone}</p>` : ''}
              <p><strong>Assunto:</strong> ${subject}</p>
              <p><strong>ID:</strong> ${messageId}</p>
            </div>

            <div style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0; white-space: pre-wrap; word-wrap: break-word;">
              ${this.escapeHtml(message)}
            </div>

            <p style="margin-top: 30px;">
              <a href="https://espalhe-melodias.com/admin/contact/${messageId}" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver na Dashboard
              </a>
            </p>

            <footer style="text-align: center; margin-top: 40px; color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px;">
              <p>Sistema Espalhe Melodias</p>
            </footer>
          </div>
        </body>
        </html>
      `,
      text: `Nova Mensagem de Contato\n\nDe: ${senderName}\nEmail: ${senderEmail}\n${senderPhone ? `Telefone: ${senderPhone}\n` : ''}Assunto: ${subject}\nID: ${messageId}\n\nMensagem:\n${message}`,
    };
  }

  /**
   * Resposta manual do admin para mensagem de contato
   */
  static contactFormAdminReply(name: string, adminReply: string) {
    return {
      subject: '💬 Resposta da Equipe Espalhe Melodias',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <h2 style="color: #7c3aed;">💬 Resposta da Nossa Equipe</h2>

            <p>Olá ${name},</p>

            <p>Recebemos sua mensagem e gostaríamos de responder:</p>

            <div style="background-color: #fff; border-left: 4px solid #10b981; padding: 15px; border-radius: 5px; margin: 20px 0; white-space: pre-wrap; word-wrap: break-word;">
              ${this.escapeHtml(adminReply)}
            </div>

            <p>Se tiver mais dúvidas, não hesite em entrar em contato novamente.</p>

            <footer style="text-align: center; margin-top: 40px; color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px;">
              <p>&copy; 2026 Espalhe Melodias. Todos os direitos reservados.</p>
            </footer>
          </div>
        </body>
        </html>
      `,
      text: `Resposta da Nossa Equipe\n\nOlá ${name},\n\n${adminReply}\n\nObrigado!`,
    };
  }

  /**
   * Newsletter Digest semanal (opcional)
   */
  static weeklyDigest(email: string, highlights: Array<{ title: string; description: string; link?: string }>) {
    const itemsHtml = highlights
      .map(
        (item) => `
          <li style="margin-bottom: 15px;">
            <strong>${item.title}</strong>
            <p style="color: #666; margin: 5px 0;">${item.description}</p>
            ${item.link ? `<a href="${item.link}" style="color: #7c3aed;">Leia mais →</a>` : ''}
          </li>
        `,
      )
      .join('');

    return {
      subject: '📰 Resumo Semanal - Espalhe Melodias',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <h1 style="color: #7c3aed; text-align: center;">📰 Resumo Semanal</h1>

            <p>Olá,</p>

            <p>Aqui estão os destaques da semana na comunidade Espalhe Melodias:</p>

            <ul style="list-style: none; padding: 0;">
              ${itemsHtml}
            </ul>

            <p style="text-align: center; margin-top: 30px;">
              <a href="https://espalhe-melodias.com" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Visitar Comunidade
              </a>
            </p>

            <footer style="text-align: center; margin-top: 40px; color: #999; font-size: 12px;">
              <p>&copy; 2026 Espalhe Melodias. Todos os direitos reservados.</p>
              <p><a href="https://espalhe-melodias.com/newsletter/unsubscribe?email=${email}" style="color: #999;">Desinscrever-se</a></p>
            </footer>
          </div>
        </body>
        </html>
      `,
      text: `Resumo Semanal - Espalhe Melodias\n\n${highlights.map((h) => `${h.title}\n${h.description}\n`).join('\n')}`,
    };
  }

  /**
   * Redefinição de senha
   */
  static resetPassword(name: string, resetLink: string) {
    return {
      subject: '🔐 Redefinir sua senha — Espalhe Melodias',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0; padding:0; background-color:#f5efe6; font-family: Georgia, 'Times New Roman', serif;">
          <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(107,66,38,0.08);">

              <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 32px 32px 28px; text-align: center;">
                <p style="color:#e8c9a8; font-family: 'Brush Script MT', cursive; font-size: 26px; margin:0 0 4px;">Espalhe Melodias</p>
                <p style="color:#94a3b8; font-family: Arial, sans-serif; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin:0;">Conexões em Saúde Mental</p>
              </div>

              <div style="padding: 36px 32px;">
                <h1 style="color:#3d2b1f; font-size: 22px; margin: 0 0 16px;">Vamos redefinir sua senha 🔐</h1>

                <p style="color:#5c4a3d; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.7; margin: 0 0 8px;">
                  Olá, ${this.escapeHtml(name)}!
                </p>
                <p style="color:#5c4a3d; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.7; margin: 0 0 28px;">
                  Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para escolher uma nova senha — este link é válido por <strong>1 hora</strong>.
                </p>

                <div style="text-align:center; margin-bottom: 28px;">
                  <a href="${resetLink}" style="background: linear-gradient(135deg, #b5571a, #8f451a); color: #ffffff; font-family: Arial, sans-serif; font-weight: bold; font-size: 14px; padding: 14px 32px; text-decoration: none; border-radius: 12px; display: inline-block;">
                    Redefinir minha senha
                  </a>
                </div>

                <p style="color:#9a8a7c; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.6; margin: 0 0 4px;">
                  Se você não solicitou essa alteração, pode ignorar este e-mail com tranquilidade — sua senha continuará a mesma.
                </p>
                <p style="color:#c2b8ad; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.6; margin: 16px 0 0; word-break: break-all;">
                  Ou copie e cole este link no navegador: ${resetLink}
                </p>
              </div>

              <div style="background-color:#f5efe6; padding: 20px 32px; text-align:center;">
                <p style="color:#b0a08f; font-family: Arial, sans-serif; font-size: 11px; margin:0;">
                  © 2026 Espalhe Melodias — Conexões em Saúde Mental
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Olá, ${name}!\n\nRecebemos uma solicitação para redefinir sua senha. Acesse o link abaixo (válido por 1 hora):\n${resetLink}\n\nSe você não solicitou essa alteração, ignore este e-mail.\n\nEspalhe Melodias`,
    };
  }

  /**
   * Convite nominal para se juntar à comunidade
   */
  static inviteEmail(invitedName: string, inviterName: string, roleLabel: string, inviteLink: string, validityDays: number) {
    const firstName = invitedName.trim().split(' ')[0];
    return {
      subject: `💌 ${firstName}, você foi convidado(a) para o Espalhe Melodias!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0; padding:0; background-color:#f5efe6; font-family: Georgia, 'Times New Roman', serif;">
          <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(107,66,38,0.10);">

              <div style="background: linear-gradient(135deg, #b5571a 0%, #8f451a 60%, #6b3512 100%); padding: 44px 32px 36px; text-align: center; position: relative;">
                <p style="color:#f5efe6; font-size: 34px; margin: 0 0 6px; letter-spacing: 2px;">♩ ♪ ♫</p>
                <p style="color:#ffffff; font-family: 'Brush Script MT', cursive; font-size: 32px; margin:0 0 6px;">Espalhe Melodias</p>
                <p style="color:#f0d9c4; font-family: Arial, sans-serif; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; margin:0;">Conexões em Saúde Mental</p>
              </div>

              <div style="padding: 40px 32px 8px; text-align: center;">
                <p style="color:#b5571a; font-family: 'Brush Script MT', cursive; font-size: 28px; margin: 0 0 12px;">Que alegria te convidar!</p>
                <h1 style="color:#3d2b1f; font-size: 21px; margin: 0 0 20px; line-height:1.4;">
                  Olá, ${this.escapeHtml(firstName)}! 🎶
                </h1>
                <p style="color:#5c4a3d; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.8; margin: 0 0 20px; text-align:left;">
                  <strong>${this.escapeHtml(inviterName)}</strong> preparou um convite especial para você fazer parte da nossa comunidade — um espaço acolhedor de profissionais que acreditam no poder das conexões para fortalecer o cuidado em saúde mental.
                </p>
                <p style="color:#5c4a3d; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.8; margin: 0 0 28px; text-align:left;">
                  Você foi convidado(a) como <strong style="color:#b5571a;">${this.escapeHtml(roleLabel)}</strong>. Estamos na torcida para te ter com a gente! 💛
                </p>

                <div style="text-align:center; margin-bottom: 8px;">
                  <a href="${inviteLink}" style="background: linear-gradient(135deg, #b5571a, #8f451a); color: #ffffff; font-family: Arial, sans-serif; font-weight: bold; font-size: 14px; padding: 15px 36px; text-decoration: none; border-radius: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(181,87,26,0.35);">
                    ✨ Aceitar convite e me cadastrar
                  </a>
                </div>
                <p style="color:#9a8a7c; font-family: Arial, sans-serif; font-size: 12px; margin: 16px 0 32px;">
                  Este convite é válido por ${validityDays} dia${validityDays > 1 ? 's' : ''}.
                </p>

                <div style="border-top: 1px dashed #e8dcc8; padding-top: 24px; margin-top: 8px;">
                  <p style="color:#b5571a; font-family: 'Brush Script MT', cursive; font-size: 20px; margin: 0 0 6px;">
                    Cada conexão é uma nota que,
                  </p>
                  <p style="color:#9a8a7c; font-family: Arial, sans-serif; font-size: 12px; font-style: italic; margin: 0;">
                    junta com outras, cria uma linda melodia. ♡
                  </p>
                </div>
              </div>

              <div style="background-color:#f5efe6; padding: 20px 32px; text-align:center;">
                <p style="color:#b0a08f; font-family: Arial, sans-serif; font-size: 11px; margin:0 0 4px;">
                  Se você não esperava este convite, pode ignorar este e-mail com tranquilidade.
                </p>
                <p style="color:#b0a08f; font-family: Arial, sans-serif; font-size: 11px; margin:0;">
                  © 2026 Espalhe Melodias — Conexões em Saúde Mental
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Olá, ${firstName}!\n\n${inviterName} convidou você para fazer parte da comunidade Espalhe Melodias como ${roleLabel}.\n\nAceite seu convite (válido por ${validityDays} dia(s)):\n${inviteLink}\n\nCada conexão é uma nota que, junta com outras, cria uma linda melodia. ♡\n\nEspalhe Melodias — Conexões em Saúde Mental`,
    };
  }

  private static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
