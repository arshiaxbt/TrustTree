'use client';

import { EthosProfile } from '@/lib/ethos';
import { ProfileCard } from '@/components/ProfileCard';
import { LoginButton } from '@/components/LoginButton';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// Helper to get wallet address from Privy user
function getEthosWalletAddress(user: ReturnType<typeof usePrivy>['user']): string | null {
    if (!user) return null;

    const crossAppAccount = user.linkedAccounts?.find(
        (account) => account.type === 'cross_app'
    );

    if (crossAppAccount && 'embeddedWallets' in crossAppAccount) {
        const wallets = (crossAppAccount as { embeddedWallets?: Array<{ address: string }> }).embeddedWallets;
        if (wallets?.[0]?.address) {
            return wallets[0].address;
        }
    }

    return user.wallet?.address || null;
}

export default function UserProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const { authenticated, user, ready } = usePrivy();
    const [profile, setProfile] = useState<EthosProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if current user is the owner of this profile
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/profile/by-username?username=${encodeURIComponent(username)}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Profile not found');
                    } else {
                        setError('Failed to load profile');
                    }
                    setLoading(false);
                    return;
                }

                const data = await response.json();

                // Parse linked accounts
                const socialAccounts: EthosProfile['linkedAccounts'] = [];
                if (data.linkedAccounts) {
                    for (const key of data.linkedAccounts) {
                        if (typeof key === 'string' && key.startsWith('service:')) {
                            const parts = key.split(':');
                            if (parts.length >= 2) {
                                const serviceRaw = parts[1];
                                const service = serviceRaw.replace('.com', '') as 'x' | 'discord' | 'farcaster' | 'telegram';
                                socialAccounts.push({
                                    service,
                                    username: parts[2] || '',
                                });
                            }
                        }
                    }
                }

                setProfile({
                    id: String(data.profileId || data.id),
                    score: data.score || 0,
                    vouchCount: data.vouchCount || 0,
                    linkedAccounts: socialAccounts,
                    primaryAddress: data.primaryAddress,
                    username: data.username,
                    displayName: data.displayName,
                    avatarUrl: data.avatarUrl,
                });
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile');
            }

            setLoading(false);
        }

        if (username) {
            fetchProfile();
        }
    }, [username]);

    // Check if current user owns this profile
    useEffect(() => {
        if (ready && authenticated && user && profile?.primaryAddress) {
            const userWallet = getEthosWalletAddress(user);
            if (userWallet && profile.primaryAddress) {
                // Check if any of the profile's addresses match the user's wallet
                setIsOwner(
                    userWallet.toLowerCase() === profile.primaryAddress.toLowerCase()
                );
            }
        } else {
            setIsOwner(false);
        }
    }, [ready, authenticated, user, profile]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-center max-w-md mx-auto p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Profile Not Found
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        The user @{username} doesn&apos;t have an Ethos profile yet.
                    </p>
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm hover:opacity-90 transition-all"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen py-16 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black">
            <div className="max-w-2xl mx-auto">
                {/* Header with Login */}
                <div className="flex justify-end mb-8">
                    <LoginButton />
                </div>

                {/* Profile Card */}
                <ProfileCard initialProfile={profile} />
            </div>
        </main>
    );
}
