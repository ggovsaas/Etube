import formData from 'form-data';
import Mailgun from 'mailgun.js';

// Initialize Mailgun
let mailgun: any = null;
if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
  const mailgunClient = new Mailgun(formData);
  mailgun = mailgunClient.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
  });
}

export async function sendVerificationEmail(
  email: string,
  verificationToken: string,
  username?: string
): Promise<void> {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    console.error('MAILGUN_API_KEY or MAILGUN_DOMAIN is not set. Email not sent.');
    console.log('Verification link:', `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify?token=${verificationToken}`);
    return;
  }

  const verificationLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify?token=${verificationToken}`;
  const fromEmail = process.env.MAILGUN_FROM_EMAIL || `noreply@${process.env.MAILGUN_DOMAIN}`;
  const domain = process.env.MAILGUN_DOMAIN;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Acompanhantes.life</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; margin-top: 0;">Olá${username ? `, ${username}` : ''}!</h2>
          <p style="color: #4b5563; font-size: 16px;">
            Obrigado por se registrar na nossa plataforma. Para completar seu cadastro, por favor verifique seu endereço de email clicando no botão abaixo:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
              Verificar Email
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Ou copie e cole este link no seu navegador:
          </p>
          <p style="color: #dc2626; font-size: 12px; word-break: break-all; background-color: #fee2e2; padding: 10px; border-radius: 4px;">
            ${verificationLink}
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Este link expira em 24 horas. Se você não criou esta conta, pode ignorar este email com segurança.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} Acompanhantes.life. Todos os direitos reservados.
          </p>
        </div>
      </body>
    </html>
  `;

  const textContent = `
    Olá${username ? `, ${username}` : ''}!
    
    Obrigado por se registrar na nossa plataforma. Para completar seu cadastro, por favor verifique seu endereço de email acessando o link abaixo:
    
    ${verificationLink}
    
    Este link expira em 24 horas. Se você não criou esta conta, pode ignorar este email com segurança.
    
    © ${new Date().getFullYear()} Acompanhantes.life. Todos os direitos reservados.
  `;

  const messageData = {
    from: fromEmail,
    to: email,
    subject: 'Verifique sua conta - Acompanhantes.life',
    text: textContent,
    html: htmlContent,
  };

  if (!mailgun) {
    console.error('Mailgun client not initialized');
    return;
  }

  try {
    await mailgun.messages.create(domain, messageData);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

