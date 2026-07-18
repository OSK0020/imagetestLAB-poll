import { NextResponse } from 'next/server';
import { pollinationsHeaders, resolvePollinationsKey } from '@/lib/pollinations';

const VIDEO_MODELS = new Set([
  'veo',
  'seedance',
  'seedance-pro',
  'seedance-2.0',
  'wan',
  'wan-fast',
  'wan-pro',
  'wan-pro-1080p',
  'grok-video-pro',
  'ltx-2',
  'p-video-720p',
  'p-video-1080p',
  'nova-reel',
]);

function errorMessage(status: number): string {
  if (status === 401) return 'Your Pollinations key is invalid or expired.';
  if (status === 402) return 'Your Pollinations balance or key budget is exhausted.';
  if (status === 429) return 'Pollinations is rate limiting requests. Please retry shortly.';
  if (status >= 500) return 'The selected model is temporarily unavailable.';
  return 'Pollinations could not complete this generation.';
}

export async function POST(req: Request) {
  try {
    const { prompt, model = 'zimage', seed = -1, width = 1024, height = 1024, userKey } = await req.json();

    if (typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }
    if (typeof model !== 'string' || !model) {
      return NextResponse.json({ error: 'Model is required.' }, { status: 400 });
    }

    const key = resolvePollinationsKey(userKey);
    const isVideo = VIDEO_MODELS.has(model);
    const path = isVideo ? 'video' : 'image';
    const params = new URLSearchParams({
      model,
      width: String(width),
      height: String(height),
      seed: String(seed),
      safe: 'true',
    });
    const generationUrl = `https://gen.pollinations.ai/${path}/${encodeURIComponent(prompt.trim())}?${params}`;

    const generationResponse = await fetch(generationUrl, {
      headers: pollinationsHeaders(key),
      cache: 'no-store',
    });

    if (!generationResponse.ok) {
      return NextResponse.json(
        { error: errorMessage(generationResponse.status) },
        { status: generationResponse.status },
      );
    }

    const media = await generationResponse.blob();
    const contentType = generationResponse.headers.get('content-type') || media.type || (isVideo ? 'video/mp4' : 'image/jpeg');
    const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : isVideo ? 'mp4' : 'jpg';
    const upload = new FormData();
    upload.append('file', media, `generation-${seed}.${extension}`);

    const uploadResponse = await fetch('https://media.pollinations.ai/upload', {
      method: 'POST',
      headers: pollinationsHeaders(key),
      body: upload,
      cache: 'no-store',
    });

    if (!uploadResponse.ok) {
      return NextResponse.json(
        { error: 'The generation succeeded, but its media URL could not be stored.' },
        { status: 502 },
      );
    }

    const stored = await uploadResponse.json();
    if (typeof stored.url !== 'string') {
      return NextResponse.json({ error: 'Pollinations returned an invalid media response.' }, { status: 502 });
    }

    return NextResponse.json({ url: stored.url, contentType, model });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed.';
    const status = message.includes('must start with') || message.includes('must be a publishable') ? 400 : 500;
    console.error('[API/generate]', error);
    return NextResponse.json({ error: message }, { status });
  }
}
