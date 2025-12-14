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
 * 
 * Priority order for Ethos lookup:
 * 1. Cross-app embedded wallet - Ethos search can resolve this to the full profile
 * 2. Regular connected wallet - fallback if no cross-app
 * 3. user.wallet fallback
 */
function getEthosWalletAddress(user: ReturnType<typeof usePrivy>['user']): string | null {
    if (!user) return null;

    // Debug: Log the user object structure
    console.log('[DEBUG] user.linkedAccounts:', user.linkedAccounts);

    // PRIORITY 1: Check for cross-app linked accounts FIRST
    // The cross-app embedded wallet is linked to the user's Ethos profile in their system
    const crossAppAccount = user.linkedAccounts?.find(
        (account) => account.type === 'cross_app'
    );

    console.log('[DEBUG] crossAppAccount:', crossAppAccount);

    if (crossAppAccount && 'embeddedWallets' in crossAppAccount) {
        const wallets = (crossAppAccount as { embeddedWallets?: Array<{ address: string }> }).embeddedWallets;
        console.log('[DEBUG] embeddedWallets:', wallets);
        if (wallets?.[0]?.address) {
            console.log('[DEBUG] Using cross-app embedded wallet address:', wallets[0].address);
            return wallets[0].address;
        }
    }

    // PRIORITY 2: Check for regular wallet accounts
    const walletAccount = user.linkedAccounts?.find(
        (account) => account.type === 'wallet' && 'address' in account
    );

    if (walletAccount && 'address' in walletAccount) {
        const address = (walletAccount as { address: string }).address;
        console.log('[DEBUG] Using connected wallet address:', address);
        return address;
    }

    // PRIORITY 3: Fallback to user.wallet
    console.log('[DEBUG] Fallback to user.wallet:', user.wallet);
    return user.wallet?.address || null;
}

export function ProfileCard({ initialProfile }: ProfileCardProps) {
    const { authenticated, user } = usePrivy();
    const [profile, setProfile] = useState<EthosProfile | null>(initialProfile || null);
    const [isCopied, setIsCopied] = useState(false);
    const [debugInfo, setDebugInfo] = useState<string>('');

    useEffect(() => {
        async function fetchUserProfile() {
            const walletAddress = getEthosWalletAddress(user);
            setDebugInfo(`Wallet: ${walletAddress || 'none'}`);

            if (authenticated && walletAddress) {
                console.log('[ProfileCard] Fetching Ethos profile for:', walletAddress);

                const data = await getEthosData(walletAddress);
                console.log('[ProfileCard] Received Ethos data:', data);

                if (data) {
                    setProfile(data);
                    setDebugInfo(`Wallet: ${walletAddress}, Score: ${data.score}`);
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

    // Get current wallet for debug display
    const currentWallet = getEthosWalletAddress(user);

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

                {/* DEBUG INFO - Remove after debugging */}
                {authenticated && (
                    <div className="bg-yellow-100 dark:bg-yellow-900 p-3 text-xs font-mono border-b border-yellow-300 dark:border-yellow-700 overflow-x-auto">
                        <div className="font-bold text-yellow-800 dark:text-yellow-200 mb-1">🔍 Debug Info (remove after testing)</div>
                        <div className="text-yellow-700 dark:text-yellow-300 space-y-1">
                            <div>Using Wallet: {currentWallet || 'NOT FOUND'}</div>
                            <div>Score: {displayProfile.score}</div>
                            <div>linkedAccounts types: {user?.linkedAccounts?.map(a => a.type).join(', ') || 'none'}</div>
                            <div className="border-t border-yellow-400 pt-1 mt-1">All accounts:</div>
                            {user?.linkedAccounts?.map((acc, i) => (
                                <div key={i} className="pl-2 text-[10px]">
                                    [{i}] type: {acc.type}
                                    {'address' in acc && ` | addr: ${(acc as { address: string }).address}`}
                                    {'embeddedWallets' in acc && ` | embedded: ${JSON.stringify((acc as { embeddedWallets?: Array<{ address: string }> }).embeddedWallets?.map(w => w.address))}`}
                                    {'providerApp' in acc && ` | provider: ${(acc as { providerApp?: { name: string } }).providerApp?.name}`}
                                    {'subject' in acc && ` | subject: ${(acc as { subject: string }).subject}`}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
