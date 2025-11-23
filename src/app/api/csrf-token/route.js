// src/app/api/csrf-token/route.js
import { handleCSRFTokenRequest } from '@/lib/csrf';

export async function GET() {
  return handleCSRFTokenRequest();
}
