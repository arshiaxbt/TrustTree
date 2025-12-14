'use client';

import { EthosProfile, getEthosData } from '@/lib/ethos';
import { usePrivy } from '@privy-io/react-auth';
import { Copy, Lock, ShieldCheck, Twitter, Disc, Unlock } from 'lucide-react';
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
 * When logging in with Ethos (cross-app auth via Privy), the wallet is stored
 * in linkedAccounts as a 'cross_app' type with embeddedWallets array.
 */
function getEthosWalletAddress(user: ReturnType<typeof usePrivy>['user']): string | null {
    if (!user) return null;

    // First, check for cross-app linked accounts (Ethos login)
    const crossAppAccount = user.linkedAccounts?.find(
        (account) => account.type === 'cross_app'
    );

    if (crossAppAccount && 'embeddedWallets' in crossAppAccount) {
        const wallets = (crossAppAccount as { embeddedWallets?: Array<{ address: string }> }).embeddedWallets;
        if (wallets?.[0]?.address) {
            return wallets[0].address;
        }
    }

    // Fallback to regular wallet address
    return user.wallet?.address || null;
}

export function ProfileCard({ initialProfile }: ProfileCardProps) {
    const { authenticated, user } = usePrivy();
    const [profile, setProfile] = useState<EthosProfile | null>(initialProfile || null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        async function fetchUserProfile() {
            const walletAddress = getEthosWalletAddress(user);
            if (authenticated && walletAddress) {
                console.log('[ProfileCard] Fetching Ethos profile for wallet:', walletAddress);
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

    // Use fetched profile or fall back to initial/empty state that is graceful
    const displayProfile = profile || {
        id: 'Guest',
        score: 0,
        vouchCount: 0,
        linkedAccounts: []
    };

    const hasGoldBadge = displayProfile.score > 2000;
    const hasSilverBadge = displayProfile.score > 1500 && !hasGoldBadge;

    // Gating Condition: Authenticated AND Score > 1200
    // Note: We use the fetched score for gating
    const isSecretVisible = authenticated && (displayProfile.score) > 1200;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 md:p-0">
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">

                <div className="relative p-8 flex flex-col items-center text-center space-y-6">
                    {/* Minimal Avatar */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-2xl font-bold text-gray-800 dark:text-gray-100 ring-4 ring-white dark:ring-black">
                            {displayProfile.id ? displayProfile.id.substring(0, 2).toUpperCase() : '??'}
                        </div>
                        {/* Badges */}
                        {(hasGoldBadge || hasSilverBadge) && (
                            <div className={cn(
                                "absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm flex items-center gap-1",
                                hasGoldBadge ? "bg-amber-500" : "bg-slate-500"
                            )}>
                                <ShieldCheck size={12} />
                                {hasGoldBadge ? 'GOLD' : 'SILVER'}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {displayProfile.score > 0 ? `Trust Score: ${displayProfile.score}` : 'No Score Yet'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {displayProfile.vouchCount} Vouches
                        </p>
                    </div>

                    {/* Connected Accounts */}
                    {displayProfile.linkedAccounts.length > 0 && (
                        <div className="flex gap-3">
                            {displayProfile.linkedAccounts.map((acc, i) => (
                                <div key={i} className="p-2 rounded-full bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                                    {acc.service === 'x' && <Twitter size={16} />}
                                    {acc.service === 'discord' && <Disc size={16} />}
                                </div>
                            ))}
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

                {/* Secret Content Section */}
                <div className="border-t border-gray-100 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-900/30">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            Secret Content
                            {isSecretVisible ? <Unlock size={14} className="text-emerald-500" /> : <Lock size={14} className="text-gray-400" />}
                        </h3>
                    </div>

                    <div className="relative">
                        <div className={cn(
                            "p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300",
                            !isSecretVisible && "blur-sm opacity-60"
                        )}>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                This content is exclusively available to trusted members of the Ethos network with a score over 1200.
                                Code: <strong>TRUST-TREE-VIP-PRIVY-2025</strong>
                            </p>
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
            </div>
        </div>
    );
}
