import fs from 'fs/promises';
import path from 'path';

const FLUX_PROVIDERS = [
  {
    url: 'https://router.huggingface.co/fal-ai/models/black-forest-labs/FLUX.1-dev',
    body: (prompt: string) => ({
      inputs: prompt,
      parameters: { width: 1080, height: 1920, num_inference_steps: 28, guidance_scale: 3.5 },
    }),
  },
  {
    url: 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
    body: (prompt: string) => ({
      inputs: prompt,
      parameters: { width: 1080, height: 1920, num_inference_steps: 4 },
    }),
  },
];

/** Construye el prompt FLUX realista — sin fantasía, estilo fotografía candidata */
export function buildFluxPrompt(
  colorPrincipal: string,
  usarFotoDj: boolean,
  promptUsuario: string
): string {
  const base =
    'Realistic party atmosphere inside a stylish Spanish pub, warm ambient lighting, people casually dancing and drinking, natural candid photography style, warm tones orange amber soft pink, no exaggerated neon, no fantasy effects, no particles, cinematic but realistic, slightly grainy, professional photography, depth of field, natural shadows, no text, no watermark';

  const cp = colorPrincipal.toLowerCase();
  let colorTheme: string;
  if (cp.includes('tardeo')) {
    colorTheme = 'warm sunset light entering through windows, afternoon party vibe, golden hour tones';
  } else if (cp.includes('retro') || cp.includes('80') || cp.includes('90')) {
    colorTheme = 'retro party atmosphere, warm nostalgic tones, vintage photography feel';
  } else if (cp.includes('dorado') || cp.includes('negro')) {
    colorTheme = 'dark intimate club atmosphere, warm golden ambient lighting, subtle elegant glow';
  } else if (cp.includes('morado') || cp.includes('rosa')) {
    colorTheme = 'dark intimate club atmosphere, subtle pink and warm purple lighting, not exaggerated';
  } else {
    colorTheme = 'dark intimate club atmosphere, subtle colored ambient lighting, not exaggerated';
  }

  const peopleHint = usarFotoDj
    ? 'crowd in background, space on left side clear for photo overlay, dark area on left'
    : 'DJ at turntables on stage, crowd with hands up in background, candid concert photography';

  return [base, colorTheme, peopleHint, promptUsuario].filter(Boolean).join(', ');
}

export async function generateFondoFlux(prompt: string, outputPath: string): Promise<void> {
  const token = process.env.HUGGINGFACE_TOKEN;
  if (!token) throw new Error('HUGGINGFACE_TOKEN no configurado');

  let lastError = '';

  for (const provider of FLUX_PROVIDERS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(provider.url, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(provider.body(prompt)),
          signal: AbortSignal.timeout(240000),
        });

        if (res.status === 503) {
          await new Promise((r) => setTimeout(r, 20000));
          continue;
        }
        if (res.status === 410 || res.status === 404) {
          lastError = `Provider ${provider.url} error ${res.status}`;
          break;
        }
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`HuggingFace error ${res.status}: ${err}`);
        }

        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 1000) throw new Error('Imagen demasiado pequeña');
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, buf);
        return;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        if (attempt < 1) await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  throw new Error(lastError || 'No se pudo generar la imagen con ningún proveedor');
}
