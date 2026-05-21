import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import connectDB from '@/lib/mongodb';
import { getStudioSession } from '@/lib/studio/session';
import { DJ_SESSION_ROOT } from '@/lib/studio/dj-session-files';
import StudioCanal from '@/models/StudioCanal';
import StudioDjSession from '@/models/StudioDjSession';
import { buildDjVisualPrompt, generateDjSessionVisualAsset } from '@/lib/studio/dj-session-visual-generation';

interface Params { params: Promise<{ id: string }> }

async function generateInBackground(id: string): Promise<void> {
  try {
    await connectDB();
    const djSession = await StudioDjSession.findById(id);
    if (!djSession) throw new Error('Sesión no encontrada');

    const canal = await StudioCanal.findOne({
      _id: djSession.canal_id,
      workspace_id: djSession.workspace_id,
    }).lean();
    if (!canal) throw new Error('Canal no encontrado');

    const generated = await generateDjSessionVisualAsset({
      session: djSession,
      canal: canal as {
        nombre?: string;
        nicho?: string;
        descripcion?: string;
        config?: {
          imagen_motor?: 'huggingface' | 'freepik' | 'comfyui';
          comfyui_api_key?: string;
          comfyui_workflow_overrides?: Record<string, string>;
          thumbnail_style_prompt?: string;
          hf_api_key?: string;
          huggingface_video_enabled?: boolean;
          huggingface_video_model?: string;
          huggingface_video_provider?: 'auto' | 'hf-inference' | 'fal-ai' | 'replicate' | 'novita' | 'wavespeed';
          huggingface_video_endpoint_url?: string;
          huggingface_video_seconds?: number;
          huggingface_video_width?: number;
          huggingface_video_height?: number;
          huggingface_video_fps?: number;
        };
      },
      outputDir: path.join(DJ_SESSION_ROOT, 'visuals', djSession.canal_id),
    });

    await connectDB();
    const update: Record<string, unknown> = {
      visual_prompt: generated.prompt,
      visual_status: 'ready',
      visual_error: null,
      visual_provider_attempted: generated.attemptedProvider,
      visual_fallback_reason: generated.fallbackReason,
      visual_provider_attempts: generated.providerAttempts,
      visual_provider: generated.provider,
      visual_workflow: generated.workflow,
      visual_model: generated.model,
      visual_output_kind: generated.outputKind,
      visual_generation_type: generated.generationType,
      visual_generated_at: new Date(),
      visual_mode: 'generated_visual',
    };

    if (generated.videoPath) {
      update.visual_video_path = generated.videoPath;
      update.visual_video_original_name = `${path.basename(generated.videoPath)}`;
      update.visual_video_mime_type = generated.videoMimeType ?? 'video/mp4';
      update.visual_video_size = generated.videoSize;
      update.visual_video_duration = generated.videoDuration;
    }

    if (generated.imagePath) {
      update.visual_image_path = generated.imagePath;
    } else {
      update.visual_image_path = null;
    }

    if (!generated.videoPath) {
      update.visual_video_original_name = null;
      update.visual_video_mime_type = null;
      update.visual_video_size = 0;
      update.visual_video_duration = 0;
    }

    await StudioDjSession.findOneAndUpdate(
      { _id: id, workspace_id: djSession.workspace_id, canal_id: djSession.canal_id, visual_status: 'generating' },
      { $set: update }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error generando visual';
    console.error('[dj-sessions/generate-visual] Error:', message);
    await connectDB();
    await StudioDjSession.findOneAndUpdate(
      { _id: id, visual_status: 'generating' },
      {
        $set: {
          visual_status: 'error',
          visual_error: message.slice(0, 1000),
          visual_fallback_reason: null,
          visual_provider_attempts: [],
          visual_generated_at: new Date(),
        },
      }
    );
  }
}

export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  try {
    const { id } = await params;
    await connectDB();

    const djSession = await StudioDjSession.findOne({
      _id: id,
      workspace_id: session.workspace_id,
      canal_id: session.canal_id,
    });
    if (!djSession) return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    if (djSession.visual_status === 'generating') {
      return NextResponse.json({ error: 'Ya hay una generación visual en curso para esta sesión' }, { status: 409 });
    }

    const canal = await StudioCanal.findOne({
      _id: session.canal_id,
      workspace_id: session.workspace_id,
    }).select('nombre nicho descripcion config').lean();

    const visualPrompt = buildDjVisualPrompt(djSession, {
      nombre: (canal as { nombre?: string } | null)?.nombre,
      nicho: (canal as { nicho?: string } | null)?.nicho,
      descripcion: (canal as { descripcion?: string } | null)?.descripcion,
      config: (canal as {
        config?: {
          imagen_motor?: 'huggingface' | 'freepik' | 'comfyui';
          comfyui_api_key?: string;
          comfyui_workflow_overrides?: Record<string, string>;
          thumbnail_style_prompt?: string;
          hf_api_key?: string;
          huggingface_video_enabled?: boolean;
          huggingface_video_model?: string;
          huggingface_video_provider?: 'auto' | 'hf-inference' | 'fal-ai' | 'replicate' | 'novita' | 'wavespeed';
          huggingface_video_endpoint_url?: string;
          huggingface_video_seconds?: number;
          huggingface_video_width?: number;
          huggingface_video_height?: number;
          huggingface_video_fps?: number;
        };
      } | null)?.config,
    });

    await StudioDjSession.findOneAndUpdate(
      { _id: id, workspace_id: session.workspace_id, canal_id: session.canal_id },
      {
        $set: {
          visual_prompt: visualPrompt,
          visual_status: 'generating',
          visual_error: null,
        },
      }
    );

    generateInBackground(id).catch((error) => {
      console.error('[dj-sessions/generate-visual] Background error:', error);
    });

    return NextResponse.json({ status: 'processing' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('[dj-sessions/generate-visual] Error iniciando:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
