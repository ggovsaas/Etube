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

// Get email configuration
function getEmailConfig() {
  const fromEmail = process.env.MAILGUN_FROM_EMAIL || `noreply@${process.env.MAILGUN_DOMAIN}`;
  const domain = process.env.MAILGUN_DOMAIN;
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const siteName = process.env.SITE_NAME || 'EscortTube';
  
  return { fromEmail, domain, baseUrl, siteName };
}

// Base email template wrapper
function getEmailTemplate(content: string, siteName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">${siteName}</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          ${content}
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} ${siteName}. Todos os direitos reservados.
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string,
  username?: string
): Promise<void> {
  const { fromEmail, domain, baseUrl, siteName } = getEmailConfig();
  
  if (!process.env.MAILGUN_API_KEY || !domain) {
    console.error('MAILGUN_API_KEY or MAILGUN_DOMAIN is not set. Email not sent.');
    console.log('Verification link:', `${baseUrl}/api/auth/verify?token=${verificationToken}`);
    return;
  }

  const verificationLink = `${baseUrl}/api/auth/verify?token=${verificationToken}`;

  const htmlContent = getEmailTemplate(`
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
  `, siteName);

  const textContent = `
    Olá${username ? `, ${username}` : ''}!
    
    Obrigado por se registrar na nossa plataforma. Para completar seu cadastro, por favor verifique seu endereço de email acessando o link abaixo:
    
    ${verificationLink}
    
    Este link expira em 24 horas. Se você não criou esta conta, pode ignorar este email com segurança.
    
    © ${new Date().getFullYear()} ${siteName}. Todos os direitos reservados.
  `;

  await sendEmail({
    from: fromEmail,
    to: email,
    subject: `Verifique sua conta - ${siteName}`,
    text: textContent,
    html: htmlContent,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  username?: string
): Promise<void> {
  const { fromEmail, domain, baseUrl, siteName } = getEmailConfig();
  
  if (!process.env.MAILGUN_API_KEY || !domain) {
    console.error('MAILGUN_API_KEY or MAILGUN_DOMAIN is not set. Email not sent.');
    console.log('Reset link:', `${baseUrl}/reset-password?token=${resetToken}`);
    return;
  }

  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

  const htmlContent = getEmailTemplate(`
    <h2 style="color: #111827; margin-top: 0;">Olá${username ? `, ${username}` : ''}!</h2>
    <p style="color: #4b5563; font-size: 16px;">
      Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" 
         style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
        Redefinir Senha
      </a>
    </div>
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Ou copie e cole este link no seu navegador:
    </p>
    <p style="color: #dc2626; font-size: 12px; word-break: break-all; background-color: #fee2e2; padding: 10px; border-radius: 4px;">
      ${resetLink}
    </p>
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      <strong>Importante:</strong> Este link expira em 1 hora. Se você não solicitou a redefinição de senha, ignore este email e sua senha permanecerá inalterada.
    </p>
    <p style="color: #dc2626; font-size: 13px; margin-top: 20px; padding: 12px; background-color: #fee2e2; border-radius: 4px; border-left: 4px solid #dc2626;">
      <strong>⚠️ Segurança:</strong> Nunca compartilhe este link com ninguém. Nossa equipe nunca solicitará sua senha por email.
    </p>
  `, siteName);

  const textContent = `
    Olá${username ? `, ${username}` : ''}!
    
    Recebemos uma solicitação para redefinir a senha da sua conta. Acesse o link abaixo para criar uma nova senha:
    
    ${resetLink}
    
    Este link expira em 1 hora. Se você não solicitou a redefinição de senha, ignore este email e sua senha permanecerá inalterada.
    
    © ${new Date().getFullYear()} ${siteName}. Todos os direitos reservados.
  `;

  await sendEmail({
    from: fromEmail,
    to: email,
    subject: `Redefinir Senha - ${siteName}`,
    text: textContent,
    html: htmlContent,
  });
}

/**
 * Send password changed confirmation email
 */
export async function sendPasswordChangedEmail(
  email: string,
  username?: string
): Promise<void> {
  const { fromEmail, domain, baseUrl, siteName } = getEmailConfig();
  
  if (!process.env.MAILGUN_API_KEY || !domain) {
    console.error('MAILGUN_API_KEY or MAILGUN_DOMAIN is not set. Email not sent.');
    return;
  }

  const loginLink = `${baseUrl}/login`;

  const htmlContent = getEmailTemplate(`
    <h2 style="color: #111827; margin-top: 0;">Olá${username ? `, ${username}` : ''}!</h2>
    <p style="color: #4b5563; font-size: 16px;">
      Sua senha foi alterada com sucesso. Se você não fez esta alteração, entre em contato conosco imediatamente.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginLink}" 
         style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
        Fazer Login
      </a>
    </div>
    <p style="color: #dc2626; font-size: 13px; margin-top: 20px; padding: 12px; background-color: #fee2e2; border-radius: 4px; border-left: 4px solid #dc2626;">
      <strong>⚠️ Segurança:</strong> Se você não alterou sua senha, entre em contato conosco imediatamente através do nosso suporte.
    </p>
  `, siteName);

  const textContent = `
    Olá${username ? `, ${username}` : ''}!
    
    Sua senha foi alterada com sucesso. Se você não fez esta alteração, entre em contato conosco imediatamente.
    
    Acesse: ${loginLink}
    
    © ${new Date().getFullYear()} ${siteName}. Todos os direitos reservados.
  `;

  await sendEmail({
    from: fromEmail,
    to: email,
    subject: `Senha Alterada - ${siteName}`,
    text: textContent,
    html: htmlContent,
  });
}

/**
 * Send welcome email (after successful verification)
 */
export async function sendWelcomeEmail(
  email: string,
  username?: string
): Promise<void> {
  const { fromEmail, domain, baseUrl, siteName } = getEmailConfig();
  
  if (!process.env.MAILGUN_API_KEY || !domain) {
    console.error('MAILGUN_API_KEY or MAILGUN_DOMAIN is not set. Email not sent.');
    return;
  }

  const dashboardLink = `${baseUrl}/dashboard`;

  const htmlContent = getEmailTemplate(`
    <h2 style="color: #111827; margin-top: 0;">Bem-vindo${username ? `, ${username}` : ''}!</h2>
    <p style="color: #4b5563; font-size: 16px;">
      Sua conta foi verificada com sucesso! Estamos felizes em tê-lo(a) conosco.
    </p>
    <p style="color: #4b5563; font-size: 16px;">
      Agora você pode acessar todas as funcionalidades da plataforma e começar a explorar.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${dashboardLink}" 
         style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
        Acessar Dashboard
      </a>
    </div>
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Se tiver alguma dúvida, nossa equipe de suporte está sempre disponível para ajudar.
    </p>
  `, siteName);

  const textContent = `
    Bem-vindo${username ? `, ${username}` : ''}!
    
    Sua conta foi verificada com sucesso! Estamos felizes em tê-lo(a) conosco.
    
    Acesse seu dashboard: ${dashboardLink}
    
    © ${new Date().getFullYear()} ${siteName}. Todos os direitos reservados.
  `;

  await sendEmail({
    from: fromEmail,
    to: email,
    subject: `Bem-vindo(a) ao ${siteName}!`,
    text: textContent,
    html: htmlContent,
  });
}

/**
 * Generic email sending function
 */
async function sendEmail(messageData: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const { domain } = getEmailConfig();

  if (!mailgun) {
    console.error('Mailgun client not initialized');
    return;
  }

  if (!domain) {
    console.error('MAILGUN_DOMAIN is not set');
    return;
  }

  try {
    await mailgun.messages.create(domain, messageData);
    console.log(`Email sent to ${messageData.to}: ${messageData.subject}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
