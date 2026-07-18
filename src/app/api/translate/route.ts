import { NextResponse } from 'next/server';
import { pollinationsHeaders, resolvePollinationsKey } from '@/lib/pollinations';

export async function POST(req: Request) {
  try {
    const { prompt, userKey } = await req.json();

    if (typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const key = resolvePollinationsKey(userKey);
    const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        ...pollinationsHeaders(key),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          {
            role: 'system',
            content: 'Translate the user text to English. Return only the translated prompt, without quotes or commentary.',
          },
          { role: 'user', content: prompt.trim() },
        ],
        temperature: 0,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Pollinations could not translate this prompt.' }, { status: response.status });
    }

    const result = await response.json();
    const text = result?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Pollinations returned an invalid translation.' }, { status: 502 });
    }

    return NextResponse.json({ text: text.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Translation failed.';
    const status = message.includes('must start with') || message.includes('must be a publishable') ? 400 : 500;
    console.error('[API/translate]', error);
    return NextResponse.json({ error: message }, { status });
  }
}
