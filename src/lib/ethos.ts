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
        // Based on API v2 documentation patterns
        const url = `https://api.ethos.network/api/v2/users/by/id/${address}`;

        // Note: The previous endpoint /profile might have been wrong.
        // Trying a more standard likelihood or logging response body.

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Ethos-Client': 'trust-tree'
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch Ethos data:', response.status, response.statusText);
            // Attempt fallback to another likely endpoint if first fails?
            return null;
        }

        const data = await response.json();

        return {
            id: data.profileId || data.username || address,
            score: data.score || 0,
            vouchCount: data.vouchCount || data.vouchesCount || 0,
            linkedAccounts: data.linkedAccounts || [],
        };
    } catch (error) {
        console.error('Error fetching Ethos data:', error);
        return null;
    }
}
