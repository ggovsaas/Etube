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
 * Send pending listing notification to admin
 */
export async function sendPendingListingNotification(
  listingId: string,
  listingTitle: string,
  userName: string,
  userEmail: string
): Promise<void> {
  const { fromEmail, domain, baseUrl, siteName } = getEmailConfig();

  if (!process.env.MAILGUN_API_KEY || !domain) {
    console.error('MAILGUN_API_KEY or MAILGUN_DOMAIN is not set. Email not sent.');
    return;
  }

  // Get admin emails from environment
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
  const adminEmails = adminEmailsEnv
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);

  if (adminEmails.length === 0) {
    console.error('No admin emails configured');
    return;
  }

  const reviewLink = `${baseUrl}/admin/listings`;

  const htmlContent = getEmailTemplate(`
    <h2 style="color: #111827; margin-top: 0;">Novo Anúncio Pendente</h2>
    <p style="color: #4b5563; font-size: 16px;">
      Um novo anúncio foi criado e está aguardando aprovação.
    </p>
    <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 5px 0; color: #92400e;"><strong>Título:</strong> ${listingTitle}</p>
      <p style="margin: 5px 0; color: #92400e;"><strong>Criado por:</strong> ${userName}</p>
      <p style="margin: 5px 0; color: #92400e;"><strong>Email:</strong> ${userEmail}</p>
      <p style="margin: 5px 0; color: #92400e;"><strong>ID:</strong> ${listingId}</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${reviewLink}"
         style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
        Revisar Anúncios Pendentes
      </a>
    </div>
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Por favor, revise e aprove ou rejeite este anúncio o mais rápido possível.
    </p>
  `, siteName);

  const textContent = `
    Novo Anúncio Pendente

    Um novo anúncio foi criado e está aguardando aprovação.

    Título: ${listingTitle}
    Criado por: ${userName}
    Email: ${userEmail}
    ID: ${listingId}

    Revisar anúncios: ${reviewLink}

    © ${new Date().getFullYear()} ${siteName}. Todos os direitos reservados.
  `;

  // Send to all admin emails
  for (const adminEmail of adminEmails) {
    try {
      await sendEmail({
        from: fromEmail,
        to: adminEmail,
        subject: `Novo Anúncio Pendente - ${siteName}`,
        text: textContent,
        html: htmlContent,
      });
    } catch (error) {
      console.error(`Failed to send pending listing email to ${adminEmail}:`, error);
    }
  }
}

/**
 * Send listing approval notification email
 */
export async function sendListingApprovedEmail(
  email: string,
  listingTitle: string,
  username?: string
): Promise<void> {
  const { fromEmail, domain, baseUrl, siteName } = getEmailConfig();

  if (!process.env.MAILGUN_API_KEY || !domain) {
    console.error('MAILGUN_API_KEY or MAILGUN_DOMAIN is not set. Email not sent.');
    return;
  }

  const listingsLink = `${baseUrl}/dashboard/meus-anuncios`;

  const htmlContent = getEmailTemplate(`
    <h2 style="color: #111827; margin-top: 0;">Parabéns${username ? `, ${username}` : ''}!</h2>
    <p style="color: #4b5563; font-size: 16px;">
      Seu anúncio <strong>"${listingTitle}"</strong> foi aprovado e agora está ativo na plataforma!
    </p>
    <p style="color: #4b5563; font-size: 16px;">
      Seu anúncio já está visível para todos os usuários e você pode começar a receber contatos.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${listingsLink}"
         style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
        Ver Meus Anúncios
      </a>
    </div>
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Continue atualizando seu perfil e anúncio para obter mais visualizações e contatos.
    </p>
    <p style="color: #10b981; font-size: 13px; margin-top: 20px; padding: 12px; background-color: #d1fae5; border-radius: 4px; border-left: 4px solid #10b981;">
      <strong>✅ Dica:</strong> Mantenha suas fotos atualizadas e responda rapidamente aos contatos para aumentar suas chances de sucesso!
    </p>
  `, siteName);

  const textContent = `
    Parabéns${username ? `, ${username}` : ''}!

    Seu anúncio "${listingTitle}" foi aprovado e agora está ativo na plataforma!

    Seu anúncio já está visível para todos os usuários e você pode começar a receber contatos.

    Ver seus anúncios: ${listingsLink}

    Continue atualizando seu perfil e anúncio para obter mais visualizações e contatos.

    © ${new Date().getFullYear()} ${siteName}. Todos os direitos reservados.
  `;

  await sendEmail({
    from: fromEmail,
    to: email,
    subject: `Anúncio Aprovado - ${siteName}`,
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
