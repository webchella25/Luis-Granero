import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession } from '@/lib/studio/session';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const canal = await StudioCanal.findOne({ _id: id, workspace_id: session.workspace_id }).lean();
  if (!canal) return NextResponse.json({ error: 'Canal no encontrado' }, { status: 404 });

  return NextResponse.json({ canal: { ...canal, _id: canal._id.toString() } });
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;

  const update: Record<string, unknown> = {};
  if (body.nombre !== undefined) update['nombre'] = body.nombre;
  if (body.nicho !== undefined) update['nicho'] = body.nicho;
  if (body.descripcion !== undefined) update['descripcion'] = body.descripcion;
  if (body.system_prompt_guion !== undefined) update['config.system_prompt_guion'] = body.system_prompt_guion;
  if (body.tono !== undefined) update['config.tono'] = body.tono;
  if (body.voz_motor !== undefined) update['config.voz_motor'] = body.voz_motor;
  if (body.imagen_motor !== undefined) update['config.imagen_motor'] = body.imagen_motor;
  if (body.llm_motor !== undefined) update['config.llm_motor'] = body.llm_motor;
  if (body.openai_api_key !== undefined) update['config.openai_api_key'] = body.openai_api_key;
  if (body.openrouter_api_key !== undefined) update['config.openrouter_api_key'] = body.openrouter_api_key;
  if (body.gemini_api_key !== undefined) update['config.gemini_api_key'] = body.gemini_api_key;
  if (body.idioma !== undefined) update['config.idioma'] = body.idioma;
  if (body.comfyui_api_key !== undefined) update['config.comfyui_api_key'] = body.comfyui_api_key;
  if (body.comfyui_workflow_overrides !== undefined) update['config.comfyui_workflow_overrides'] = body.comfyui_workflow_overrides;

  await connectDB();
  const canal = await StudioCanal.findOneAndUpdate(
    { _id: id, workspace_id: session.workspace_id },
    { $set: update },
    { new: true }
  ).lean();

  if (!canal) return NextResponse.json({ error: 'Canal no encontrado' }, { status: 404 });
  return NextResponse.json({ success: true, canal: { ...canal, _id: canal._id.toString() } });
}
