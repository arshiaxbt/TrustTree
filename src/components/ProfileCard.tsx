'use client';

import { EthosProfile, getEthosData } from '@/lib/ethos';
import { usePrivy } from '@privy-io/react-auth';
import { Copy, Lock, ShieldCheck, Twitter, Disc, Unlock, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ProfileCardProps {
    profile: EthosProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
    const { authenticated, user } = usePrivy();
    const [viewerScore, setViewerScore] = useState<number | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    // Fetch viewer score when wallet is connected
    useEffect(() => {
        async function fetchViewerScore() {
            if (authenticated && user?.wallet?.address) {
                const data = await getEthosData(user.wallet.address);
                if (data) {
                    setViewerScore(data.score);
                }
            }
        }

        if (authenticated) {
            fetchViewerScore();
        } else {
            setViewerScore(null);
        }
    }, [authenticated, user]);

    const hasGoldBadge = profile.score > 2000;
    const hasSilverBadge = profile.score > 1500 && !hasGoldBadge;

    // Gating logic: Must be authenticated AND have score > 1200
    const isSecretVisible = authenticated && (viewerScore ?? 0) > 1200;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-md md:max-w-lg mx-auto p-1 transition-all duration-300 hover:scale-[1.01]">
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-black shadow-2xl border border-gray-100 dark:border-gray-800">
                {/* Abstract Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 opacity-50 pointer-events-none" />

                <div className="relative p-6 sm:p-8 flex flex-col items-center text-center space-y-6">
                    {/* Avatar / Identity Placeholder */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-400 to-purple-600 p-1">
                            <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-3xl font-bold text-gray-800 dark:text-gray-100">
                                {profile.id.substring(0, 2).toUpperCase()}
                            </div>
                        </div>
                        {/* Badges */}
                        {(hasGoldBadge || hasSilverBadge) && (
                            <div className={cn(
                                "absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1",
                                hasGoldBadge ? "bg-amber-400" : "bg-slate-400"
                            )}>
                                <ShieldCheck size={14} />
                                {hasGoldBadge ? 'GOLD' : 'SILVER'}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white break-all">
                            Trust Score: {profile.score}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {profile.vouchCount} Vouches
                        </p>
                    </div>

                    {/* Connected Accounts */}
                    <div className="flex flex-wrap justify-center gap-4">
                        {profile.linkedAccounts.map((acc, i) => (
                            <div key={i} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                {acc.service === 'x' && <Twitter size={20} />}
                                {acc.service === 'discord' && <Disc size={20} />}
                            </div>
                        ))}
                    </div>

                    {/* Copy Link Button */}
                    <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-sm transition-transform active:scale-95 hover:opacity-90"
                    >
                        <Copy size={16} />
                        {isCopied ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>

                {/* Secret Content Section */}
                <div className="border-t border-gray-100 dark:border-gray-800 p-6 sm:p-8 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            Secret Content
                            {isSecretVisible ? <Unlock size={16} className="text-green-500" /> : <Lock size={16} className="text-gray-400" />}
                        </h3>
                    </div>

                    <div className="relative">
                        <div className={cn(
                            "p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-500",
                            !isSecretVisible && "blur-md select-none opacity-50"
                        )}>
                            <p className="text-gray-600 dark:text-gray-300">
                                This content is exclusively available to trusted members of the Ethos network with a score over 1200.
                                Here is the secret code: <strong>TRUST-TREE-VIP-PRIVY-2025</strong>
                            </p>
                        </div>

                        {!isSecretVisible && (
                            <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                                <div className="px-4 py-2 bg-black/80 text-white text-xs font-bold rounded-lg shadow-xl backdrop-blur-sm">
                                    {authenticated ? "SCORE > 1200 REQUIRED" : "LOGIN REQUIRED"}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
