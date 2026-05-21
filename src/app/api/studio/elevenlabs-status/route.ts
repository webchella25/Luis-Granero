import { NextResponse } from 'next/server';

interface ElevenLabsUser {
  subscription?: {
    character_count?: number;
    character_limit?: number;
  };
}

export async function GET(): Promise<NextResponse> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ available: false, error: 'API key no configurada' });
  }

  try {
    const res = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': apiKey },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ available: false, error: `ElevenLabs error ${res.status}` });
    }

    const data = (await res.json()) as ElevenLabsUser;
    const characterCount = data.subscription?.character_count ?? 0;
    const characterLimit = data.subscription?.character_limit ?? 0;
    const remaining = Math.max(0, characterLimit - characterCount);

    return NextResponse.json({
      available: true,
      characterCount,
      characterLimit,
      remaining,
      hasCredits: remaining > 1000,
    });
  } catch {
    return NextResponse.json({ available: false, error: 'No se pudo conectar con ElevenLabs' });
  }
}
