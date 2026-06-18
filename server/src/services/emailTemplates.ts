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
