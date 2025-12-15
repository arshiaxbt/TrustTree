'use client';

import { EthosProfile, getEthosData } from '@/lib/ethos';
import { usePrivy } from '@privy-io/react-auth';
import { Copy, Twitter, ExternalLink, MessageCircle, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ProfileCardProps {
    initialProfile?: EthosProfile;
    isOwner?: boolean; // Whether the viewing user owns this profile
}

// Settings interface for per-social visibility
interface ProfileSettings {
    showX: boolean;
    showDiscord: boolean;
    showFarcaster: boolean;
    showTelegram: boolean;
}

const defaultSettings: ProfileSettings = {
    showX: true,
    showDiscord: true,
    showFarcaster: true,
    showTelegram: true,
};

// Load settings from localStorage
function loadSettings(walletAddress: string): ProfileSettings {
    if (typeof window === 'undefined') return defaultSettings;
    try {
        const stored = localStorage.getItem(`trusttree-settings-${walletAddress}`);
        if (stored) {
            return { ...defaultSettings, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error('Error loading settings:', e);
    }
    return defaultSettings;
}

// Save settings to localStorage
function saveSettings(walletAddress: string, settings: ProfileSettings) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(`trusttree-settings-${walletAddress}`, JSON.stringify(settings));
    } catch (e) {
        console.error('Error saving settings:', e);
    }
}

/**
 * Gets the Ethos wallet address from the user's linked accounts.
 */
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

    const walletAccount = user.linkedAccounts?.find(
        (account) => account.type === 'wallet' && 'address' in account
    );

    if (walletAccount && 'address' in walletAccount) {
        return (walletAccount as { address: string }).address;
    }

    return user.wallet?.address || null;
}

export function ProfileCard({ initialProfile, isOwner = false }: ProfileCardProps) {
    const { authenticated, user } = usePrivy();
    const [profile, setProfile] = useState<EthosProfile | null>(initialProfile || null);
    const [isCopied, setIsCopied] = useState(false);
    const [settings, setSettings] = useState<ProfileSettings>(defaultSettings);
    const [showSettings, setShowSettings] = useState(false);

    // Determine if current user is the owner of this profile
    const walletAddress = getEthosWalletAddress(user);
    const canEdit = authenticated && isOwner;

    useEffect(() => {
        async function fetchUserProfile() {
            if (authenticated && walletAddress) {
                const data = await getEthosData(walletAddress);
                if (data) {
                    setProfile(data);
                }
            }
        }

        if (authenticated && !initialProfile) {
            fetchUserProfile();
        }

        // Load settings if we have a wallet address
        if (walletAddress) {
            setSettings(loadSettings(walletAddress));
        }
    }, [authenticated, user, walletAddress, initialProfile]);

    // Save settings when they change
    const updateSettings = (newSettings: ProfileSettings) => {
        setSettings(newSettings);
        if (walletAddress) {
            saveSettings(walletAddress, newSettings);
        }
    };

    const displayProfile = profile || initialProfile || {
        id: 'Guest',
        score: 0,
        vouchCount: 0,
        linkedAccounts: []
    };

    const handleCopyLink = () => {
        const url = displayProfile.username
            ? `${window.location.origin}/${displayProfile.username}`
            : window.location.href;
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // Social info
    const xUsername = displayProfile.username;
    const hasDiscord = displayProfile.linkedAccounts.some(a => a.service === 'discord');
    const hasFarcaster = displayProfile.linkedAccounts.some(a => a.service === 'farcaster');
    const hasTelegram = displayProfile.linkedAccounts.some(a => a.service === 'telegram');

    // Get Farcaster FID from linkedAccounts
    const farcasterAccount = displayProfile.linkedAccounts.find(a => a.service === 'farcaster');
    const farcasterFid = farcasterAccount?.username;

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
                                className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-black shadow-lg"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white ring-4 ring-white dark:ring-black shadow-lg">
                                {displayProfile.username ? displayProfile.username.substring(0, 2).toUpperCase() : '??'}
                            </div>
                        )}
                    </div>

                    {/* Display Name & Username */}
                    <div className="space-y-1">
                        {displayProfile.displayName && (
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {displayProfile.displayName}
                            </h2>
                        )}
                        {displayProfile.username && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                @{displayProfile.username}
                            </p>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {displayProfile.score > 0 ? displayProfile.score : '—'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Trust Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {displayProfile.vouchCount || '—'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Vouches</div>
                        </div>
                    </div>

                    {/* Social Icons - Icon only buttons */}
                    <div className="flex gap-3">
                        {/* X (Twitter) */}
                        {settings.showX && xUsername && (
                            <a
                                href={`https://x.com/${xUsername}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition-all"
                                title={`@${xUsername} on X`}
                            >
                                <Twitter size={18} />
                            </a>
                        )}

                        {/* Discord */}
                        {settings.showDiscord && hasDiscord && (
                            <div
                                className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                                title="Discord connected"
                            >
                                <MessageCircle size={18} />
                            </div>
                        )}

                        {/* Farcaster */}
                        {settings.showFarcaster && hasFarcaster && (
                            <a
                                href={farcasterFid ? `https://warpcast.com/~/profiles/${farcasterFid}` : 'https://warpcast.com'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800 transition-all"
                                title="Farcaster profile"
                            >
                                <ExternalLink size={18} />
                            </a>
                        )}

                        {/* Telegram */}
                        {settings.showTelegram && hasTelegram && (
                            <a
                                href={`https://t.me/${xUsername || ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-800 transition-all"
                                title="Telegram"
                            >
                                <Send size={18} />
                            </a>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-xs transition-transform active:scale-95 hover:opacity-90"
                        >
                            <Copy size={14} />
                            {isCopied ? 'Copied' : 'Share'}
                        </button>

                        {displayProfile.username && (
                            <a
                                href={`https://app.ethos.network/profile/x/${displayProfile.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                            >
                                <ExternalLink size={14} />
                                Ethos
                            </a>
                        )}
                    </div>
                </div>

                {/* Settings - Only visible to profile owner */}
                {canEdit && (
                    <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-900/50">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 w-full text-left"
                        >
                            {showSettings ? '▼' : '▶'} Display Settings
                        </button>

                        {showSettings && (
                            <div className="mt-3 space-y-2 text-xs">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.showX}
                                        onChange={(e) => updateSettings({ ...settings, showX: e.target.checked })}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-600 dark:text-gray-400">Show X (Twitter)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.showDiscord}
                                        onChange={(e) => updateSettings({ ...settings, showDiscord: e.target.checked })}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-600 dark:text-gray-400">Show Discord</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.showFarcaster}
                                        onChange={(e) => updateSettings({ ...settings, showFarcaster: e.target.checked })}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-600 dark:text-gray-400">Show Farcaster</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.showTelegram}
                                        onChange={(e) => updateSettings({ ...settings, showTelegram: e.target.checked })}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-600 dark:text-gray-400">Show Telegram</span>
                                </label>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer / Creator Credit */}
            <div className="mt-6 flex items-center justify-center gap-2">
                <span className="text-xs text-gray-400 dark:text-gray-500">Created by</span>
                <a
                    href="https://x.com/0xarshia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-xs"
                >
                    <Twitter size={12} />
                    0xarshia.eth
                </a>
            </div>
        </div>
    );
}
