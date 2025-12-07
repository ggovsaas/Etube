import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import formData from 'form-data';
import Mailgun from 'mailgun.js';

// Initialize Mailgun client for email sending
let mailgun: any = null;
if (process.env.AUTH_MAILGUN_KEY && process.env.MAILGUN_DOMAIN) {
  const mailgunClient = new Mailgun(formData);
  mailgun = mailgunClient.client({
    username: 'api',
    key: process.env.AUTH_MAILGUN_KEY,
  });
}

// Custom email sending function using Mailgun
async function sendVerificationRequest(params: {
  identifier: string;
  url: string;
  provider: { server: string; from: string };
}) {
  const { identifier, url } = params;
  const fromEmail = process.env.EMAIL_FROM || `noreply@${process.env.MAILGUN_DOMAIN}`;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!mailgun || !domain) {
    console.error('Mailgun not configured. Email not sent.');
    console.log('Verification URL:', url);
    return;
  }

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
          <h2 style="color: #111827; margin-top: 0;">Bem-vindo!</h2>
          <p style="color: #4b5563; font-size: 16px;">
            Clique no botão abaixo para fazer login na sua conta:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" 
               style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
              Fazer Login
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Ou copie e cole este link no seu navegador:
          </p>
          <p style="color: #dc2626; font-size: 12px; word-break: break-all; background-color: #fee2e2; padding: 10px; border-radius: 4px;">
            ${url}
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Este link expira em 24 horas e só pode ser usado uma vez.
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
    Bem-vindo!
    
    Clique no link abaixo para fazer login na sua conta:
    
    ${url}
    
    Este link expira em 24 horas e só pode ser usado uma vez.
    
    © ${new Date().getFullYear()} Acompanhantes.life. Todos os direitos reservados.
  `;

  const messageData = {
    from: fromEmail,
    to: identifier,
    subject: 'Faça login na sua conta - Acompanhantes.life',
    text: textContent,
    html: htmlContent,
  };

  try {
    await mailgun.messages.create(domain, messageData);
    console.log(`Auth email sent to ${identifier}`);
  } catch (error) {
    console.error('Error sending auth email:', error);
    throw error;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
    // Email Provider with Mailgun
    EmailProvider({
      server: {
        host: process.env.MAILGUN_DOMAIN || "",
        port: 587,
        auth: {
          user: "api",
          pass: process.env.AUTH_MAILGUN_KEY || "",
        },
      },
      from: process.env.EMAIL_FROM || `noreply@${process.env.MAILGUN_DOMAIN}`,
      sendVerificationRequest,
    }),
    // Credentials Provider (for email/password login)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Check if email is in admin list
        const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
        const adminEmails = adminEmailsEnv
          .split(',')
          .map(email => email.trim().toLowerCase())
          .filter(email => email.length > 0);
        
        const isEmailAdmin = adminEmails.includes(credentials.email.toLowerCase());

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          // If user doesn't exist but is admin email, create the user
          if (!user && isEmailAdmin) {
            const hashedPassword = await bcrypt.hash(credentials.password || 'admin123', 12);
            const newUser = await prisma.user.create({
              data: {
                email: credentials.email.toLowerCase(),
                password: hashedPassword,
                role: 'ADMIN',
                name: credentials.email.split('@')[0]
              }
            });
            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              image: newUser.image,
            };
          }

          if (!user) {
            throw new Error("Invalid credentials");
          }

          // Regular users need correct password
          if (!user?.password) {
            throw new Error("Invalid credentials");
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isCorrectPassword) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error: any) {
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      }
    }
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/login", // Non-localized login page for admin
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow email/password login for all users
      if (account?.provider === "credentials") {
        return true;
      }

      // For OAuth providers (Google), enforce strict email whitelisting for admins
      if (account?.provider === "google") {
        const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
        const adminEmails = adminEmailsEnv
          .split(',')
          .map(email => email.trim().toLowerCase())
          .filter(email => email.length > 0);

        const userEmail = user.email?.toLowerCase() || '';

        // Only allow sign in if email is in the admin whitelist
        if (!adminEmails.includes(userEmail)) {
          console.warn(`Unauthorized Google login attempt: ${userEmail}`);
          return false;
        }

        console.log(`Authorized admin Google login: ${userEmail}`);
        return true;
      }

      // Allow email provider
      if (account?.provider === "email") {
        return true;
      }

      return false;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      // Get user role from database and check admin emails
      if (token.email) {
        // Check admin emails from env
        const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
        const adminEmails = adminEmailsEnv
          .split(',')
          .map(email => email.trim().toLowerCase())
          .filter(email => email.length > 0);

        const isEmailAdmin = adminEmails.includes((token.email as string).toLowerCase());

        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { role: true }
        });

        // Set role: prioritize ADMIN if email is in admin list or user role is ADMIN
        if (isEmailAdmin || dbUser?.role === 'ADMIN') {
          token.role = 'ADMIN';
        } else if (dbUser) {
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || 'USER';
      }
      return session;
    },
  },
};

