export interface SocialAccount {
    service: 'x' | 'discord' | 'farcaster' | 'google' | 'email';
    username: string;
}

export interface EthosProfile {
    id: string;
    score: number;
    vouchCount: number;
    linkedAccounts: SocialAccount[];
}

/**
 * Fetches Ethos profile data.
 * Calls the Ethos API v2 endpoint /profile.
 * 
 * Note: If profileId is "me" or similar, this might need an auth token.
 * For public profiles, we assume a public endpoint or generic fetch.
 * 
 * @param profileId - The ID of the profile to fetch.
 */
export async function getEthosData(profileId: string): Promise<EthosProfile | null> {
    try {
        const baseUrl = 'https://api.ethos.network/api/v2';
        // Assuming the endpoint for a specific profile follows standard REST conventions
        // or uses a query parameter. Adjusting to /profile/{id} as a best guess for public data
        // or /profile?id={id}.
        // Given the prompt says "calls... /profile", we'll target that.

        const url = `${baseUrl}/profile/${profileId}`;

        // In a real app, we might need to proxy this to avoid CORS or add API keys.
        // For this generic implementation, we use client-side fetch.
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Ethos-Client': 'trust-tree'
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch Ethos data:', response.statusText);
            return null;
        }

        const data = await response.json();

        // Transform API response to our interface if needed.
        // Assuming the API returns keys matching our interface or we map them.
        // This is a mock mapping based on typical API responses.
        return {
            id: data.id || profileId,
            score: data.score || 0,
            vouchCount: data.vouchesCount || data.vouchCount || 0,
            linkedAccounts: data.linkedAccounts || [],
        };
    } catch (error) {
        console.error('Error fetching Ethos data:', error);
        return null;
    }
}
