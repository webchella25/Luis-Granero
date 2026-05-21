// src/app/api/leads/[id]/social-media/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { requireAdmin } from '@/lib/adminAuth';

const ALLOWED_PLATFORMS = ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'];

/**
 * DELETE /api/leads/[id]/social-media?platform=facebook
 * Elimina la URL de una red social y la marca como bloqueada para futuros enrichments.
 */
export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await dbConnect();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    if (!platform || !ALLOWED_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { success: false, error: `Plataforma inválida. Usa una de: ${ALLOWED_PLATFORMS.join(', ')}` },
        { status: 400 }
      );
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead no encontrado' }, { status: 404 });
    }

    // Limpiar la URL guardada
    if (!lead.socialMedia) lead.socialMedia = {};
    lead.socialMedia[platform] = null;
    lead.markModified('socialMedia');

    // Añadir a bloqueados si no estaba ya
    if (!lead.socialMediaBlocked) lead.socialMediaBlocked = [];
    if (!lead.socialMediaBlocked.includes(platform)) {
      lead.socialMediaBlocked.push(platform);
    }

    lead.updatedAt = new Date();
    await lead.save();

    console.log(`🚫 Red social eliminada y bloqueada: ${platform} del lead "${lead.name}"`);

    return NextResponse.json({
      success: true,
      message: `${platform} eliminado y marcado como no encontrado`,
      lead
    });

  } catch (error) {
    console.error('Error eliminando red social:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
