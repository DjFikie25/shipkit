/**
 * Better Auth — server-side instance.
 *
 * Features:
 *   - Email/password auth with password reset (Resend if configured, console.log fallback)
 *   - Google OAuth (optional — only active when GOOGLE_CLIENT_ID is set)
 *   - Expo plugin for React Native mobile client support
 *   - Auto-creates a profile row for new users via databaseHooks
 *
 * Resend is OPTIONAL. If RESEND_API_KEY is not set, the reset link is printed
 * to the server console instead. Swap sendResetPassword for any email provider.
 */
import { betterAuth } from 'better-auth';
import { expo } from '@better-auth/expo';
import { Pool } from 'pg';
import { headers } from 'next/headers';

const RESEND_KEY = process.env['RESEND_API_KEY'];
const FROM = process.env['RESEND_FROM_EMAIL'] ?? 'noreply@example.com';

async function sendPasswordResetEmail(to: string, name: string | null | undefined, url: string) {
  if (RESEND_KEY) {
    // Resend is configured — send a real email
    const { Resend } = await import('resend');
    const resend = new Resend(RESEND_KEY);
    await resend.emails.send({
      from: FROM,
      to,
      subject: 'Reset your password',
      html: `
        <p>Hi ${name ?? 'there'},</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <p><a href="${url}" style="background:#0070f3;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Reset Password</a></p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });
  } else {
    // No email provider configured — log the link for local development
    console.log(
      `[password-reset] No RESEND_API_KEY set. Reset link for ${to}:\n${url}`,
    );
  }
}

function neonPoolConfig(connectionString: string) {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete('sslmode');
    url.searchParams.delete('channel_binding');
    return { connectionString: url.toString(), ssl: { rejectUnauthorized: false } };
  } catch {
    return { connectionString, ssl: { rejectUnauthorized: false } };
  }
}

const pool = new Pool(neonPoolConfig(process.env['DATABASE_URL'] ?? ''));

export const auth = betterAuth({
  database: { provider: 'pg', db: pool },

  plugins: [expo()],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, user.name, url);
    },
  },

  // Google OAuth is optional — only enabled when both env vars are present
  ...(process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET']
    ? {
        socialProviders: {
          google: {
            clientId: process.env['GOOGLE_CLIENT_ID'],
            clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
          },
        },
      }
    : {}),

  trustedOrigins: [
    process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000',
    // Expo dev client scheme
    'myapp://',
  ],

  // Auto-create a profile for new users
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await pool.query(
              `INSERT INTO profiles (id) VALUES ($1) ON CONFLICT (id) DO NOTHING`,
              [user.id],
            );
          } catch { /* non-fatal — profile created lazily on first API call */ }
        },
      },
    },
  },
});

/**
 * Returns the authenticated user for the current request, or null.
 * Use in Server Components and API Route Handlers.
 */
export async function getServerUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}
