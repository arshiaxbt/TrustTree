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
export async function getEthosData(address: string): Promise<EthosProfile | null> {
    try {
        // Use our internal proxy to avoid CORS and handle headers
        const url = `/api/profile?address=${address}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch Ethos data (proxy):', response.status);
            return null;
        }

        const data = await response.json();

        // Verify we got a user object. API get-user-by-address usually returns the user object directly.
        if (!data || !data.score) {
            // It might be nested or just missing if user not found/scored
            console.warn('Ethos data missing or incomplete:', data);
        }

        return {
            id: data.profileId || data.username || data.id || address,
            score: data.score || 0,
            vouchCount: data.vouchCount || data.vouchesCount || 0,
            linkedAccounts: data.linkedAccounts || [],
        };
    } catch (error) {
        console.error('Error fetching Ethos data:', error);
        return null;
    }
}
