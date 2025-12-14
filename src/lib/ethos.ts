export interface SocialAccount {
    service: 'x' | 'discord' | 'farcaster' | 'google' | 'email' | 'telegram';
    username: string;
}

export interface EthosProfile {
    id: string;
    score: number;
    vouchCount: number;
    linkedAccounts: SocialAccount[];
    primaryAddress?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
}

/**
 * Fetches Ethos profile data using the internal proxy.
 * The proxy uses the Ethos search API which can resolve cross-app embedded wallets
 * to the user's full Ethos profile.
 * 
 * @param address - The wallet address to search for
 */
export async function getEthosData(address: string): Promise<EthosProfile | null> {
    try {
        console.log('[Ethos] Fetching profile for address:', address);

        const response = await fetch(`/api/profile?address=${address}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('[Ethos] Failed to fetch profile:', response.status);
            return null;
        }

        const data = await response.json();

        if (data.error || data.code === 'NOT_FOUND') {
            console.warn('[Ethos] Profile not found:', data.error);
            return null;
        }

        console.log('[Ethos] Received profile data:', data);

        // Parse linked accounts from userkeys format (e.g., "service:x.com:123")
        const socialAccounts: SocialAccount[] = [];
        if (data.linkedAccounts) {
            for (const key of data.linkedAccounts) {
                if (typeof key === 'string' && key.startsWith('service:')) {
                    const parts = key.split(':');
                    if (parts.length >= 2) {
                        const serviceRaw = parts[1];
                        const service = serviceRaw.replace('.com', '') as SocialAccount['service'];
                        socialAccounts.push({
                            service,
                            username: parts[2] || '',
                        });
                    }
                }
            }
        }

        return {
            id: String(data.profileId || data.id || address),
            score: data.score || 0,
            vouchCount: data.vouchCount || 0,
            linkedAccounts: socialAccounts,
            primaryAddress: data.primaryAddress || address,
            username: data.username,
            displayName: data.displayName,
            avatarUrl: data.avatarUrl,
        };
    } catch (error) {
        console.error('[Ethos] Error fetching profile:', error);
        return null;
    }
}
