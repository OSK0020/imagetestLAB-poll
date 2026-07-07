import { NextResponse } from 'next/server';

// Built-in application public key — used as the default guest fallback.
// This is an app-level key (pk_...), NOT a user secret (sk_...).
// It must NEVER be sent as a Bearer authorization token.
const GUEST_APP_KEY = 'pk_CBViurgPPhpt77kS';

export async function POST(req: Request) {
  try {
    const { prompt, model, seed, width, height, userKey } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const isVideo = ['ltx-2', 'nova-reel'].includes(model || '');

    const baseUrl = isVideo ? 'https://gen.pollinations.ai/video/' : 'https://image.pollinations.ai/prompt/';
    
    // Resolve the effective app key: prefer the env variable, fall back to the built-in guest constant.
    const appKey = process.env.POLLINATIONS_APP_KEY || GUEST_APP_KEY;
    const keyToUse = userKey && !userKey.startsWith('pk_') ? userKey : appKey;

    let pollUrl = '';
    if (isVideo) {
      pollUrl = `${baseUrl}${encodeURIComponent(prompt)}?model=${model || 'ltx-2'}&key=${keyToUse}`;
    } else {
      pollUrl = `${baseUrl}${encodeURIComponent(prompt)}?width=${width || 1024}&height=${height || 1024}&seed=${seed || 42}&model=${model || 'flux'}&nologo=true`;
    }

    const headers: Record<string, string> = {};

    // ── Key routing logic ──────────────────────────────────────────────────────
    // pk_ keys are PUBLIC application tokens — they must NOT be used as Bearer
    // user authentication. Only sk_ (secret) keys are valid Bearer tokens.
    // If userKey is a pk_ key (or the guest constant), treat it as the app key.
    if (userKey && !userKey.startsWith('pk_')) {
      // Real user secret key — authorizes usage on behalf of that Pollinations account
      headers['Authorization'] = `Bearer ${userKey}`;
    }

    // Always include the app key header to credit this request to our registered application
    headers['x-pollinations-app-key'] = appKey;

    const isGuestMode = !userKey || userKey.startsWith('pk_');
    console.log(
      `[API] Generating: "${prompt.slice(0, 30)}..." | Model: ${model} | Mode: ${isGuestMode ? 'Guest (app token)' : 'Authenticated (user key)'}`
    );

    let response = await fetch(pollUrl, {
      method: 'GET',
      headers,
    });

    // Fallback: If request with user secret key fails (e.g. out of tokens/402, rate limit/429, invalid/401)
    if (!response.ok && userKey && !userKey.startsWith('pk_')) {
      console.warn(`[API] Request with user key failed with status ${response.status}. Retrying with app-level guest fallback...`);
      const fallbackHeaders: Record<string, string> = {
        'x-pollinations-app-key': appKey
      };
      response = await fetch(pollUrl, {
        method: 'GET',
        headers: fallbackHeaders,
      });
    }

    if (!response.ok) {
      const status = response.status;
      let userFriendlyError = 'AI Simulation failed due to a temporary protocol anomaly. Please retry.';
      
      if (status === 401) {
        userFriendlyError = 'Your API key is invalid or has expired. Please check your settings.';
      } else if (status === 402) {
        userFriendlyError = 'Your Pollinations key has run out of tokens. Please recharge your balance or use Guest Mode.';
      } else if (status === 429) {
        userFriendlyError = 'Rate limit exceeded. The AI model clusters are currently overloaded. Please wait a moment.';
      } else if (status >= 500) {
        userFriendlyError = 'The generative AI model cluster is temporarily offline or undergoing maintenance. Please try again shortly.';
      }
      
      console.error(`[API] Pollinations Error (${status}):`, userFriendlyError);
      throw new Error(userFriendlyError);
    }

    console.log(`[API] Success: ${model}`);
    const blob = await response.blob();
    return new Response(blob, {
      headers: {
        'Content-Type': isVideo ? 'video/mp4' : 'image/jpeg',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error: any) {
    console.error('API Generate Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
