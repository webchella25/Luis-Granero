import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';

// POST — aplica un hook alternativo a guion_json[0].content o lo revierte al original
// Body: { scriptId, hookIdx } — hookIdx null = revertir al original
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }
    const { scriptId, hookIdx } = (await request.json()) as {
      scriptId?: string;
      hookIdx?: number | null;
    };

    if (!scriptId) {
      return NextResponse.json({ error: 'scriptId requerido' }, { status: 400 });
    }

    await connectDB();
    const script = await StudioScript.findById(scriptId);
    if (!script) {
      return NextResponse.json({ error: 'Script no encontrado' }, { status: 404 });
    }

    if (hookIdx === null || hookIdx === undefined) {
      // Revertir al hook original
      const original = script.hook_original;
      if (!original) {
        return NextResponse.json({ error: 'No hay hook original guardado' }, { status: 400 });
      }
      script.guion_json[0].content = original;
      script.hook_seleccionado = null;
    } else {
      const hook = script.hooks_seo?.[hookIdx];
      if (!hook) {
        return NextResponse.json({ error: 'Hook no encontrado' }, { status: 404 });
      }
      // Guardar el original la primera vez (si aún no está guardado)
      if (!script.hook_original) {
        script.hook_original = script.guion_json[0].content;
      }
      script.guion_json[0].content = hook.texto;
      script.hook_seleccionado = hookIdx;
    }

    script.markModified('guion_json');
    await script.save();

    return NextResponse.json({
      success: true,
      hook_seleccionado: script.hook_seleccionado ?? null,
      content: script.guion_json[0].content,
    });
  } catch (error) {
    console.error('Error aplicando hook:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
