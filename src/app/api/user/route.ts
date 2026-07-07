import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { key } = await req.json();

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const appKey = process.env.POLLINATIONS_APP_KEY;

    // Parallel fetching to double the speed
    const headers = { 
      'Authorization': `Bearer ${key}`,
      ...(appKey ? { 'x-pollinations-app-key': appKey } : {})
    };

    const [balanceRes, profileRes] = await Promise.all([
      fetch("https://gen.pollinations.ai/account/balance", { headers }),
      fetch("https://gen.pollinations.ai/account/profile", { headers })
    ]);

    // If either returns 401, the key is invalid
    if (balanceRes.status === 401 || profileRes.status === 401) {
       return NextResponse.json({ error: 'Invalid or inactive secret key' }, { status: 401 });
    }

    // Try parsing whatever we got
    let balanceData = null;
    let profileData = null;

    if (balanceRes.ok) {
        try { balanceData = await balanceRes.json(); } catch (e) {}
    }
    
    if (profileRes.ok) {
        try { profileData = await profileRes.json(); } catch (e) {}
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

  } catch (error: any) {
    console.error('[API/USER] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
