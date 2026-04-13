import connectDB from '@/lib/mongodb';
import StudioConfig, { YoutubeTokens } from '@/models/StudioConfig';
import StudioCanal from '@/models/StudioCanal';

const TOKEN_KEY = 'youtube_oauth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

export function getOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ??
    'https://www.luisgranero.com/api/studio/youtube/callback';

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET no están configurados');
  }
  return { clientId, clientSecret, redirectUri };
}

export function buildAuthUrl(canalId: string): string {
  const { clientId, redirectUri } = getOAuthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: canalId,
  });
  return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<YoutubeTokens> {
  const { clientId, clientSecret, redirectUri } = getOAuthConfig();

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error intercambiando code: ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
    scope: string;
  };

  if (!data.refresh_token) {
    throw new Error('No se recibió refresh_token. Revoca el acceso en Google y vuelve a autorizar.');
  }

  const tokens: YoutubeTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    token_type: data.token_type,
    expiry_date: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };

  await saveTokens(tokens);
  return tokens;
}

export async function saveTokens(tokens: YoutubeTokens): Promise<void> {
  await connectDB();
  await StudioConfig.findOneAndUpdate(
    { key: TOKEN_KEY },
    { key: TOKEN_KEY, data: tokens, updated_at: new Date() },
    { upsert: true, new: true }
  );
}

export async function getTokens(): Promise<YoutubeTokens | null> {
  await connectDB();
  const config = await StudioConfig.findOne({ key: TOKEN_KEY });
  if (!config) return null;
  return config.data as YoutubeTokens;
}

export async function getValidAccessToken(): Promise<string> {
  const tokens = await getTokens();
  if (!tokens) throw new Error('YouTube no está conectado. Ve a /studio/configuracion para autenticar.');

  // Si el token expira en más de 5 minutos, usarlo directamente
  if (tokens.expiry_date > Date.now() + 5 * 60 * 1000) {
    return tokens.access_token;
  }

  // Refrescar el token
  const { clientId, clientSecret } = getOAuthConfig();
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: tokens.refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error refrescando token: ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
    token_type: string;
  };

  const newTokens: YoutubeTokens = {
    ...tokens,
    access_token: data.access_token,
    expiry_date: Date.now() + data.expires_in * 1000,
  };

  await saveTokens(newTokens);
  return newTokens.access_token;
}

export async function getChannelInfo(
  accessToken: string
): Promise<{ name: string; avatar: string } | null> {
  const res = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) return null;

  const data = (await res.json()) as {
    items?: Array<{
      snippet: { title: string; thumbnails: { default: { url: string } } };
    }>;
  };

  const channel = data.items?.[0];
  if (!channel) return null;

  return {
    name: channel.snippet.title,
    avatar: channel.snippet.thumbnails.default.url,
  };
}

// ---- Funciones por canal (multi-canal) ----

export async function saveTokensForCanal(canalId: string, tokens: YoutubeTokens): Promise<void> {
  await connectDB();
  await StudioCanal.findByIdAndUpdate(canalId, { $set: { youtube_tokens: tokens } });
}

export async function getTokensForCanal(canalId: string): Promise<YoutubeTokens | null> {
  await connectDB();
  const canal = await StudioCanal.findById(canalId).select('youtube_tokens').lean();
  if (!canal?.youtube_tokens) return null;
  return canal.youtube_tokens as YoutubeTokens;
}

export async function getValidAccessTokenForCanal(canalId: string): Promise<string> {
  const tokens = await getTokensForCanal(canalId);
  if (!tokens) throw new Error('YouTube no está conectado para este canal. Ve a configuración para autenticar.');

  if (tokens.expiry_date > Date.now() + 5 * 60 * 1000) {
    return tokens.access_token;
  }

  const { clientId, clientSecret } = getOAuthConfig();
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: tokens.refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error refrescando token: ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number; token_type: string };
  const newTokens: YoutubeTokens = { ...tokens, access_token: data.access_token, expiry_date: Date.now() + data.expires_in * 1000 };
  await saveTokensForCanal(canalId, newTokens);
  return newTokens.access_token;
}

export async function exchangeCodeForTokensForCanal(code: string, canalId: string): Promise<YoutubeTokens> {
  const { clientId, clientSecret, redirectUri } = getOAuthConfig();
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code, client_id: clientId, client_secret: clientSecret,
      redirect_uri: redirectUri, grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) throw new Error(`Error intercambiando code: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as {
    access_token: string; refresh_token?: string; token_type: string; expires_in: number; scope: string;
  };
  if (!data.refresh_token) throw new Error('No se recibió refresh_token. Revoca el acceso en Google y vuelve a autorizar.');
  const tokens: YoutubeTokens = {
    access_token: data.access_token, refresh_token: data.refresh_token,
    token_type: data.token_type, expiry_date: Date.now() + data.expires_in * 1000, scope: data.scope,
  };
  await saveTokensForCanal(canalId, tokens);
  return tokens;
}
