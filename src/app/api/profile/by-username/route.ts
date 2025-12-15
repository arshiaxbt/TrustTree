import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    try {
        // Search for user by username
        const url = `https://api.ethos.network/api/v2/users/search?query=${encodeURIComponent(username)}`;
        console.log(`[Proxy] Searching Ethos for username: ${username}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Ethos-Client': 'trust-tree-proxy'
            },
        });

        if (!response.ok) {
            console.error(`[Proxy] Ethos API Error: ${response.status}`);
            return NextResponse.json({ error: `Ethos API error: ${response.status}` }, { status: response.status });
        }

        const data = await response.json();

        // Find exact match by username
        if (data.values && data.values.length > 0) {
            const exactMatch = data.values.find(
                (u: { username: string }) => u.username?.toLowerCase() === username.toLowerCase()
            );

            const user = exactMatch || data.values[0];
            console.log(`[Proxy] Found user: ${user.username} with score: ${user.score}`);

            return NextResponse.json({
                id: user.id,
                profileId: user.profileId,
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                score: user.score,
                vouchCount: user.stats?.vouch?.received?.count || 0,
                linkedAccounts: user.userkeys?.filter((k: string) => k.startsWith('service:')) || [],
                primaryAddress: user.userkeys?.find((k: string) => k.startsWith('address:'))?.replace('address:', ''),
                links: user.links,
            });
        }

        return NextResponse.json({ error: 'User not found', code: 'NOT_FOUND' }, { status: 404 });

    } catch (error) {
        console.error('[Proxy] Internal Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
