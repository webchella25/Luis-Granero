import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioConfig from '@/models/StudioConfig';

interface ApiStatusResponse {
  anthropic: boolean;
  elevenlabs: boolean;
  freepik: boolean;
  huggingface: boolean;
  youtube: boolean;
}

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();

    // YouTube: comprobar si hay tokens guardados en MongoDB
    const ytConfig = await StudioConfig.findOne({ key: 'youtube_oauth' }).lean();
    const hasYT = !!(ytConfig?.data && (ytConfig.data as Record<string, unknown>).access_token);

    // HuggingFace: env var o token guardado en MongoDB
    let hasHF = !!process.env.HUGGINGFACE_TOKEN;
    if (!hasHF) {
      const hfConfig = await StudioConfig.findOne({ key: 'image_engine_config' }).lean();
      hasHF = !!(hfConfig?.data && (hfConfig.data as Record<string, unknown>).hf_token);
    }

    const status: ApiStatusResponse = {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      freepik: !!process.env.FREEPIK_API_KEY,
      huggingface: hasHF,
      youtube: hasYT,
    };

    return NextResponse.json(status);
  } catch {
    return NextResponse.json({
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      freepik: !!process.env.FREEPIK_API_KEY,
      huggingface: !!process.env.HUGGINGFACE_TOKEN,
      youtube: false,
    });
  }
}
