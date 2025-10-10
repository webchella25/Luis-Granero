// src/lib/utils/magicLinks.ts
import crypto from 'crypto';

export function generateMagicToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getMagicLinkExpiration(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 días
  return expiresAt;
}

export function createMagicLink(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.luisgranero.com';
  return `${baseUrl}/agendar/${token}`;
}