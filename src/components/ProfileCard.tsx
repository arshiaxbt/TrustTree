'use client';

import { EthosProfile, getEthosData } from '@/lib/ethos';
import { usePrivy } from '@privy-io/react-auth';
import { Copy, Lock, Twitter, Unlock, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ProfileCardProps {
    initialProfile?: EthosProfile;
}

/**
 * Gets the Ethos wallet address from the user's linked accounts.
 */
function getEthosWalletAddress(user: ReturnType<typeof usePrivy>['user']): string | null {
    if (!user) return null;

    // PRIORITY 1: Cross-app embedded wallet
    const crossAppAccount = user.linkedAccounts?.find(
        (account) => account.type === 'cross_app'
    );

    if (crossAppAccount && 'embeddedWallets' in crossAppAccount) {
        const wallets = (crossAppAccount as { embeddedWallets?: Array<{ address: string }> }).embeddedWallets;
        if (wallets?.[0]?.address) {
            return wallets[0].address;
        }
    }

    // PRIORITY 2: Regular wallet accounts
    const walletAccount = user.linkedAccounts?.find(
        (account) => account.type === 'wallet' && 'address' in account
    );

    if (walletAccount && 'address' in walletAccount) {
        return (walletAccount as { address: string }).address;
    }

    // PRIORITY 3: Fallback
    return user.wallet?.address || null;
}

export function ProfileCard({ initialProfile }: ProfileCardProps) {
    const { authenticated, user } = usePrivy();
    const [profile, setProfile] = useState<EthosProfile | null>(initialProfile || null);
    const [isCopied, setIsCopied] = useState(false);

    // Display settings
    const [showScore, setShowScore] = useState(true);
    const [showVouches, setShowVouches] = useState(true);
    const [showSocials, setShowSocials] = useState(true);

    useEffect(() => {
        async function fetchUserProfile() {
            const walletAddress = getEthosWalletAddress(user);

            if (authenticated && walletAddress) {
                const data = await getEthosData(walletAddress);
                if (data) {
                    setProfile(data);
                }
            }
        }

        if (authenticated) {
            fetchUserProfile();
        }
    }, [authenticated, user]);

    const displayProfile = profile || {
        id: 'Guest',
        score: 0,
        vouchCount: 0,
        linkedAccounts: []
    };

    // Gating Condition: Authenticated AND Score > 1200
    const isSecretVisible = authenticated && (displayProfile.score) > 1200;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // Get social info - use the profile username (X username)
    const xUsername = displayProfile.username; // This is the X username from Ethos API
    const hasDiscord = displayProfile.linkedAccounts.some(a => a.service === 'discord');
    const hasFarcaster = displayProfile.linkedAccounts.some(a => a.service === 'farcaster');
    const hasTelegram = displayProfile.linkedAccounts.some(a => a.service === 'telegram');

    return (
        <div className="w-full max-w-md mx-auto p-4 md:p-0">
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">

                <div className="relative p-8 flex flex-col items-center text-center space-y-6">
                    {/* Avatar */}
                    <div className="relative">
                        {displayProfile.avatarUrl ? (
                            <img
                                src={displayProfile.avatarUrl}
                                alt={displayProfile.displayName || displayProfile.username || 'Profile'}
                                className="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-black"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-2xl font-bold text-gray-800 dark:text-gray-100 ring-4 ring-white dark:ring-black">
                                {displayProfile.username ? displayProfile.username.substring(0, 2).toUpperCase() : '??'}
                            </div>
                        )}
                    </div>

                    {/* Display Name */}
                    {displayProfile.displayName && (
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {displayProfile.displayName}
                        </h2>
                    )}

                    {/* Stats */}
                    <div className="space-y-2">
                        {showScore && (
                            <div className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                {displayProfile.score > 0 ? `Trust Score: ${displayProfile.score}` : 'No Score Yet'}
                            </div>
                        )}
                        {showVouches && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {displayProfile.vouchCount} Vouches
                            </p>
                        )}
                    </div>

                    {/* Social Accounts */}
                    {showSocials && (
                        <div className="flex flex-wrap justify-center gap-2">
                            {xUsername && (
                                <a
                                    href={`https://x.com/${xUsername}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all text-xs"
                                >
                                    <Twitter size={14} />
                                    @{xUsername}
                                </a>
                            )}
                            {hasDiscord && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 text-xs">
                                    Discord Connected
                                </span>
                            )}
                            {hasFarcaster && (
                                <a
                                    href={xUsername ? `https://warpcast.com/${xUsername}` : 'https://warpcast.com'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-800/50 transition-all text-xs"
                                >
                                    Farcaster
                                    <ExternalLink size={12} />
                                </a>
                            )}
                            {hasTelegram && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800 text-xs">
                                    Telegram Connected
                                </span>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-xs transition-transform active:scale-95 hover:opacity-90"
                    >
                        <Copy size={14} />
                        {isCopied ? 'Copied' : 'Share Profile'}
                    </button>
                </div>

                {/* Ethos Profile Section */}
                <div className="border-t border-gray-100 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-900/30">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            Ethos Profile
                            {isSecretVisible ? <Unlock size={14} className="text-emerald-500" /> : <Lock size={14} className="text-gray-400" />}
                        </h3>
                    </div>

                    <div className="relative">
                        <div className={cn(
                            "p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 space-y-3",
                            !isSecretVisible && "blur-sm opacity-60"
                        )}>
                            {displayProfile.username && (
                                <a
                                    href={`https://app.ethos.network/profile/x/${displayProfile.username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    <span>View full profile on Ethos →</span>
                                </a>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                <p>✓ Verified Ethos member</p>
                                <p>✓ {displayProfile.vouchCount} vouches received from the community</p>
                            </div>
                        </div>

                        {!isSecretVisible && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="px-3 py-1.5 bg-black/80 text-white text-[10px] font-bold rounded-md shadow-lg backdrop-blur-sm">
                                    {authenticated ? "SCORE 1200+ REQUIRED" : "LOGIN REQUIRED"}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Settings - Only visible when logged in */}
                {authenticated && (
                    <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-900/50">
                        <details className="group">
                            <summary className="text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                                Display Settings
                            </summary>
                            <div className="mt-3 space-y-2 text-xs">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showScore}
                                        onChange={(e) => setShowScore(e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-600 dark:text-gray-400">Show Trust Score</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showVouches}
                                        onChange={(e) => setShowVouches(e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-600 dark:text-gray-400">Show Vouches</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showSocials}
                                        onChange={(e) => setShowSocials(e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-600 dark:text-gray-400">Show Social Accounts</span>
                                </label>
                            </div>
                        </details>
                    </div>
                )}
            </div>

            {/* Footer / Creator Credit */}
            <div className="mt-4 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    Created by{' '}
                    <a
                        href="https://x.com/0xarshia"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline"
                    >
                        0xarshia.eth
                    </a>
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">
                    Login to view your score and secret content.
                </p>
            </div>
        </div>
    );
}
