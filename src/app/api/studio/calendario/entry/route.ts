import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import StudioCalendario from '@/models/StudioCalendario';
import { getStudioSession } from '@/lib/studio/session';

// PATCH — actualizar una entrada (completado, fecha_publicacion, script_id)
// Body: { entryId: string, field: string, value: unknown }
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { entryId, field, value } = (await request.json()) as {
      entryId?: string;
      field?: string;
      value?: unknown;
    };

    if (!entryId || !field) {
      return NextResponse.json({ error: 'entryId y field requeridos' }, { status: 400 });
    }

    const allowedFields = ['completado', 'fecha_publicacion', 'script_id', 'titulo', 'semana'];
    if (!allowedFields.includes(field)) {
      return NextResponse.json({ error: 'Campo no permitido' }, { status: 400 });
    }

    let objectId: Types.ObjectId;
    try {
      objectId = new Types.ObjectId(entryId);
    } catch {
      return NextResponse.json({ error: 'entryId inválido' }, { status: 400 });
    }


    await connectDB();
    const result = await StudioCalendario.updateOne(
      { canal_id: session.canal_id, 'entries._id': objectId },
      { $set: { [`entries.$.${field}`]: value, actualizado_en: new Date() } }
    );


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error actualizando entrada:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT — reordenar entradas (array de {id, orden})
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { ordenes } = (await request.json()) as { ordenes?: { id: string; orden: number }[] };
    if (!ordenes?.length) {
      return NextResponse.json({ error: 'ordenes requerido' }, { status: 400 });
    }

    await connectDB();
    const cal = await StudioCalendario.findOne({ canal_id: session.canal_id }).sort({ generado_en: -1 });
    if (!cal) return NextResponse.json({ error: 'Calendario no encontrado' }, { status: 404 });

    for (const { id, orden } of ordenes) {
      const entry = cal.entries.find((e) => e._id?.toString() === id);
      if (entry) entry.orden = orden;
    }
    cal.actualizado_en = new Date();
    await cal.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordenando:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
