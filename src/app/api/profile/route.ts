import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    try {
        // Use search API instead of direct address lookup
        // The search API can resolve embedded wallet addresses to full profiles
        const url = `https://api.ethos.network/api/v2/users/search?query=${address}`;
        console.log(`[Proxy] Searching Ethos for address: ${address}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Ethos-Client': 'trust-tree-proxy'
            },
        });

        if (!response.ok) {
            console.error(`[Proxy] Ethos API Error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error(`[Proxy] Error Body: ${errorText}`);
            return NextResponse.json({ error: `Ethos API error: ${response.status}` }, { status: response.status });
        }

        const data = await response.json();

        // Search returns { values: [...], total, limit, offset }
        // Return the first matching user if found
        if (data.values && data.values.length > 0) {
            const user = data.values[0];
            console.log(`[Proxy] Found user: ${user.username} with score: ${user.score}`);

            // Transform to expected format
            return NextResponse.json({
                id: user.id,
                profileId: user.profileId,
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                score: user.score,
                vouchCount: user.stats?.vouch?.received?.count || 0,
                vouchesGiven: user.stats?.vouch?.given?.count || 0,
                reviewsReceived: user.stats?.review?.received || {},
                linkedAccounts: user.userkeys?.filter((k: string) => k.startsWith('service:')) || [],
                primaryAddress: user.userkeys?.find((k: string) => k.startsWith('address:'))?.replace('address:', '') || address,
                xpTotal: user.xpTotal,
                influenceFactor: user.influenceFactor,
                links: user.links,
            });
        }

        // No user found
        console.log(`[Proxy] No user found for address: ${address}`);
        return NextResponse.json({ error: 'User not found', code: 'NOT_FOUND' }, { status: 404 });

    } catch (error) {
        console.error('[Proxy] Internal Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
