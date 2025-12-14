export interface SocialAccount {
    service: 'x' | 'discord' | 'farcaster' | 'google' | 'email';
    username: string;
}

export interface EthosProfile {
    id: string;
    score: number;
    vouchCount: number;
    linkedAccounts: SocialAccount[];
    primaryAddress?: string;
}

/**
 * Fetches Ethos profile data by address (unauthenticated).
 * Falls back to this if no auth token is available.
 */
export async function getEthosDataByAddress(address: string): Promise<EthosProfile | null> {
    try {
        const url = `/api/profile?address=${address}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch Ethos data by address:', response.status);
            return null;
        }

        const data = await response.json();

        if (!data || data.code === 'NOT_FOUND') {
            console.warn('Ethos profile not found for address:', address);
            return null;
        }

        return {
            id: data.profileId || data.username || data.id || address,
            score: data.score || 0,
            vouchCount: data.vouchCount || data.vouchesCount || 0,
            linkedAccounts: data.linkedAccounts || [],
            primaryAddress: data.primaryAddress || address,
        };
    } catch (error) {
        console.error('Error fetching Ethos data by address:', error);
        return null;
    }
}

/**
 * Fetches authenticated user's Ethos profile using Privy access token.
 * This exchanges the Privy token for Ethos session and gets the user's actual profile.
 */
export async function getAuthenticatedEthosProfile(accessToken: string): Promise<EthosProfile | null> {
    try {
        console.log('[Ethos] Fetching authenticated profile...');

        // First, exchange Privy token for Ethos auth
        const authResponse = await fetch('https://api.ethos.network/api/v2/auth/exchange', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'X-Ethos-Client': 'trust-tree',
            },
            credentials: 'include', // Important for cookies
        });

        console.log('[Ethos] Auth exchange response:', authResponse.status);

        if (!authResponse.ok) {
            const errorText = await authResponse.text();
            console.error('[Ethos] Auth exchange failed:', errorText);
            return null;
        }

        const authData = await authResponse.json();
        console.log('[Ethos] Auth exchange data:', authData);

        // The auth exchange should return user info including profileId
        // Now fetch the user profile using the profile ID or address from auth
        if (authData.profileId || authData.address || authData.userAddress) {
            const profileAddress = authData.userAddress || authData.address || `profileId:${authData.profileId}`;

            // Call our proxy with the authenticated user's address
            const profileData = await getEthosDataByAddress(profileAddress);
            if (profileData) {
                return profileData;
            }
        }

        // If auth data contains user info directly
        if (authData.score !== undefined) {
            return {
                id: authData.profileId || authData.username || 'user',
                score: authData.score || 0,
                vouchCount: authData.vouchCount || 0,
                linkedAccounts: authData.linkedAccounts || [],
                primaryAddress: authData.primaryAddress,
            };
        }

        return null;
    } catch (error) {
        console.error('[Ethos] Error fetching authenticated profile:', error);
        return null;
    }
}

/**
 * Fetches Ethos profile - tries authenticated first, then falls back to address lookup.
 */
export async function getEthosData(address: string, accessToken?: string): Promise<EthosProfile | null> {
    // If we have an access token, try authenticated approach first
    if (accessToken) {
        const authProfile = await getAuthenticatedEthosProfile(accessToken);
        if (authProfile && authProfile.score > 0) {
            console.log('[Ethos] Got authenticated profile:', authProfile);
            return authProfile;
        }
    }

    // Fall back to address lookup
    return getEthosDataByAddress(address);
}
