import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ canal: null });

  await connectDB();
  const canal = await StudioCanal.findById(session.canal_id)
    .select('_id nombre nicho pipeline_tipo config.tipos_guion')
    .lean();

  if (!canal) return NextResponse.json({ canal: null });
  const canalTyped = canal as { pipeline_tipo?: string; config?: { tipos_guion?: string } };
  return NextResponse.json({
    canal: {
      _id: canal._id.toString(),
      nombre: canal.nombre,
      nicho: canal.nicho,
      pipeline_tipo: canalTyped.pipeline_tipo ?? 'narrativo',
      tipos_guion: canalTyped.config?.tipos_guion ?? '',
    },
  });
}
