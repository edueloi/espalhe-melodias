import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.secure,
    auth: {
      user: config.email.smtp.user,
      pass: config.email.smtp.password,
    },
  });

  return transporter;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/** Envia um e-mail via SMTP. Em ambiente sem credenciais configuradas, apenas loga (não falha o fluxo chamador). */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (!config.email.smtp.user || !config.email.smtp.password) {
    console.warn(`[email] SMTP não configurado — e-mail para ${input.to} NÃO foi enviado ("${input.subject}").`);
    return;
  }

  await getTransporter().sendMail({
    from: `"${config.email.fromName}" <${config.email.from}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}
