import { NextResponse } from 'next/server';

/**
 * API route to resolve Telegram user ID to username using Bot API
 * GET /api/telegram?userId=105356242
 * Returns: { username: "ArshiaGS" } or { error: "message" }
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
        console.error('[Telegram API] TELEGRAM_BOT_TOKEN not configured');
        return NextResponse.json({ error: 'Telegram not configured' }, { status: 500 });
    }

    try {
        // Call Telegram Bot API getChat method
        const response = await fetch(
            `https://api.telegram.org/bot${botToken}/getChat?chat_id=${userId}`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                // Cache for 1 hour to reduce API calls
                next: { revalidate: 3600 }
            }
        );

        const data = await response.json();

        if (!data.ok) {
            console.error('[Telegram API] Error:', data.description);
            return NextResponse.json({
                error: data.description || 'Failed to get chat info'
            }, { status: 404 });
        }

        // Extract username from response
        const username = data.result?.username;

        if (!username) {
            return NextResponse.json({
                error: 'User has no public username',
                firstName: data.result?.first_name
            }, { status: 200 });
        }

        return NextResponse.json({
            username,
            firstName: data.result?.first_name,
            lastName: data.result?.last_name
        });

    } catch (error) {
        console.error('[Telegram API] Fetch error:', error);
        return NextResponse.json({
            error: 'Failed to fetch from Telegram API'
        }, { status: 500 });
    }
}
