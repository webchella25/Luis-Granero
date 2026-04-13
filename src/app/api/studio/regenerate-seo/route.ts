import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import Anthropic from '@anthropic-ai/sdk';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';

function buildSeoPrompt(personaje: string, epoca: string): string {
  return `Para un vídeo sobre ${personaje} en el contexto ${epoca}, genera:
- 3 títulos alternativos optimizados para SEO (incluir keywords evergreen como 'historia real', 'quién fue', 'cómo capturaron', 'biografía', 'crimen explicado')
- 1 descripción completa de YouTube (150-200 palabras con keywords naturales, párrafo de gancho, resumen del contenido, CTA a suscribirse, hashtags)
- 20 tags relevantes (mix de específicos del personaje + genéricos del nicho)
- 3 títulos de Shorts (máximo 100 caracteres, con hashtags #HistoriaOscura #CrimenReal #AlmasCorruptas #TrueCrime, formato gancho: pregunta o dato impactante): uno para el Hook, uno para el Ascenso al poder, uno para El lado oscuro

JSON exacto:
{
  "titulos": ["string", "string", "string"],
  "descripcion": "string",
  "tags": ["string"],
  "titulos_shorts": ["string", "string", "string"]
}`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }
    const { scriptId } = (await request.json()) as { scriptId?: string };
    if (!scriptId) {
      return NextResponse.json({ error: 'scriptId requerido' }, { status: 400 });
    }

    await connectDB();
    const script = await StudioScript.findById(scriptId).lean();
    if (!script) {
      return NextResponse.json({ error: 'Script no encontrado' }, { status: 404 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });
    const seoMessage = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: 'Eres un experto en SEO para YouTube especializado en canales de historia oscura y true crime en español. Generas títulos, descripciones y tags optimizados para posicionamiento evergreen. Respondes SOLO con JSON válido.',
      messages: [{
        role: 'user',
        content: buildSeoPrompt(script.personaje, script.epoca),
      }],
    });

    const seoRaw = seoMessage.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const seoData = JSON.parse(seoRaw) as {
      titulos: string[];
      descripcion: string;
      tags: string[];
      titulos_shorts: string[];
    };

    await StudioScript.findByIdAndUpdate(scriptId, {
      titulos_seo: seoData.titulos,
      descripcion_seo: seoData.descripcion,
      tags_seo: seoData.tags,
      titulos_seo_shorts: seoData.titulos_shorts,
      seo_titulo_seleccionado: 0,
    });

    return NextResponse.json({ success: true, seo: seoData });
  } catch (error) {
    console.error('Error regenerando SEO:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
