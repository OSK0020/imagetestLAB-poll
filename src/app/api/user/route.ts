import { NextResponse } from 'next/server';
import { isPollinationsKey, pollinationsHeaders } from '@/lib/pollinations';

export async function POST(req: Request) {
  try {
    const { key } = await req.json();

    if (!isPollinationsKey(key)) {
      return NextResponse.json({ error: 'A valid pk_ or sk_ key is required.' }, { status: 400 });
    }

    const headers = pollinationsHeaders(key);

    const [balanceRes, profileRes] = await Promise.all([
      fetch('https://gen.pollinations.ai/account/balance', { headers, cache: 'no-store' }),
      fetch('https://gen.pollinations.ai/account/profile', { headers, cache: 'no-store' })
    ]);

    // If either returns 401, the key is invalid
    if (balanceRes.status === 401 || profileRes.status === 401) {
       return NextResponse.json({ error: 'Invalid or inactive Pollinations key.' }, { status: 401 });
    }

    // Try parsing whatever we got
    let balanceData = null;
    let profileData = null;

    if (balanceRes.ok) {
        try { balanceData = await balanceRes.json(); } catch {}
    }
    
    if (profileRes.ok) {
        try { profileData = await profileRes.json(); } catch {}
    }

    // If we have either, it's a valid key
    if (balanceData || profileData) {
        return NextResponse.json({
            balance: balanceData,
            profile: profileData,
            timestamp: Date.now()
        });
    }

    // Fallback: If both requests failed (e.g. 500, 502, 504) without authorization errors,
    // the target service is down, so return a Bad Gateway error rather than a false positive.
    return NextResponse.json({ 
        error: 'Key verification failed. Pollinations API may be temporarily down.' 
    }, { status: 502 });

  } catch (error) {
    console.error('[API/USER] Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Key verification failed.' }, { status: 500 });
  }
}
