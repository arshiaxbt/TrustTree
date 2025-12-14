import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    try {
        const url = `https://api.ethos.network/api/v2/users/by/address/${address}`;
        console.log(`[Proxy] Fetching Ethos profile for address: ${address} from ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Ethos-Client': 'trust-tree-proxy' // Simple client ID
            },
        });

        if (!response.ok) {
            console.error(`[Proxy] Ethos API Error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error(`[Proxy] Error Body: ${errorText}`);
            return NextResponse.json({ error: `Ethos API error: ${response.status}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[Proxy] Internal Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
