import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ canal: null });

  await connectDB();
  const canal = await StudioCanal.findOne({ _id: session.canal_id, workspace_id: session.workspace_id })
    .select('_id nombre nicho pipeline_tipo config.tipos_guion config.tono config.form_campo1_label config.form_campo1_placeholder config.form_campo2_label config.form_campo2_placeholder')
    .lean();

  if (!canal) return NextResponse.json({ canal: null });
  const canalTyped = canal as { pipeline_tipo?: string; config?: { tipos_guion?: string; tono?: string; form_campo1_label?: string; form_campo1_placeholder?: string; form_campo2_label?: string; form_campo2_placeholder?: string } };
  return NextResponse.json({
    canal: {
      _id: canal._id.toString(),
      nombre: canal.nombre,
      nicho: canal.nicho,
      pipeline_tipo: canalTyped.pipeline_tipo ?? 'narrativo',
      tipos_guion: canalTyped.config?.tipos_guion ?? '',
      tono_default: canalTyped.config?.tono ?? '',
      form_campo1_label: canalTyped.config?.form_campo1_label ?? '',
      form_campo1_placeholder: canalTyped.config?.form_campo1_placeholder ?? '',
      form_campo2_label: canalTyped.config?.form_campo2_label ?? '',
      form_campo2_placeholder: canalTyped.config?.form_campo2_placeholder ?? '',
    },
  });
}
