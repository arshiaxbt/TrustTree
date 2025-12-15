'use client';

import { EthosProfile, getEthosData } from '@/lib/ethos';
import { usePrivy } from '@privy-io/react-auth';
import { Copy, Twitter, ExternalLink, MessageCircle, Settings, Wallet, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ProfileCardProps {
    initialProfile?: EthosProfile;
    isOwner?: boolean;
}

interface ProfileSettings {
    showX: boolean;
    showDiscord: boolean;
    showFarcaster: boolean;
    showDeBank: boolean;
}

const defaultSettings: ProfileSettings = {
    showX: true,
    showDiscord: true,
    showFarcaster: true,
    showDeBank: true,
};

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

function saveSettings(walletAddress: string, settings: ProfileSettings) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(`trusttree-settings-${walletAddress}`, JSON.stringify(settings));
    } catch (e) {
        console.error('Error saving settings:', e);
    }
}

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

// Search Component
function UserSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        // Navigate to the username page
        router.push(`/${searchQuery.trim()}`);
    };

    return (
        <form onSubmit={handleSearch} className="w-full max-w-sm mx-auto mb-6">
            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by username..."
                    className="w-full px-4 py-2.5 pl-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSearching ? '...' : 'Go'}
                </button>
            </div>
        </form>
    );
}

export function ProfileCard({ initialProfile, isOwner = false }: ProfileCardProps) {
    const { authenticated, user } = usePrivy();
    const [profile, setProfile] = useState<EthosProfile | null>(initialProfile || null);
    const [isCopied, setIsCopied] = useState(false);
    const [settings, setSettings] = useState<ProfileSettings>(defaultSettings);
    const [showSettings, setShowSettings] = useState(false);

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

        if (walletAddress) {
            setSettings(loadSettings(walletAddress));
        }
    }, [authenticated, user, walletAddress, initialProfile]);

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

    // Get social info with IDs from Ethos API
    const xUsername = displayProfile.username;
    const discordAccount = displayProfile.linkedAccounts.find(a => a.service === 'discord');
    const discordId = discordAccount?.username;
    const farcasterAccount = displayProfile.linkedAccounts.find(a => a.service === 'farcaster');
    const farcasterFid = farcasterAccount?.username;
    const primaryWallet = displayProfile.primaryAddress;

    return (
        <div className="w-full max-w-md mx-auto p-4 md:p-0">
            {/* Search Bar */}
            <UserSearch />

            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">

                {/* Edit Button for Owner */}
                {canEdit && (
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={cn(
                            "absolute top-4 right-4 p-2 rounded-full transition-all z-10",
                            showSettings
                                ? "bg-indigo-500 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                        title="Edit Profile Settings"
                    >
                        <Settings size={16} />
                    </button>
                )}

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

                    {/* Social Icons */}
                    <div className="flex gap-3 flex-wrap justify-center">
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

                        {/* Discord - using Discord user ID */}
                        {settings.showDiscord && discordId && (
                            <a
                                href={`https://discord.com/users/${discordId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-all"
                                title="Discord Profile"
                            >
                                <MessageCircle size={18} />
                            </a>
                        )}

                        {/* Farcaster - using FID */}
                        {settings.showFarcaster && farcasterFid && (
                            <a
                                href={`https://warpcast.com/~/profiles/${farcasterFid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800 transition-all"
                                title="Farcaster Profile"
                            >
                                <ExternalLink size={18} />
                            </a>
                        )}

                        {/* DeBank - using primary wallet address */}
                        {settings.showDeBank && primaryWallet && (
                            <a
                                href={`https://debank.com/profile/${primaryWallet}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-800 transition-all"
                                title="DeBank Portfolio"
                            >
                                <Wallet size={18} />
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

                {/* Settings Panel */}
                {showSettings && canEdit && (
                    <div className="border-t border-gray-100 dark:border-gray-800 p-6 bg-gray-50/50 dark:bg-gray-900/50">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                            ⚙️ Display Settings
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Show/Hide Socials
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <input
                                            type="checkbox"
                                            checked={settings.showX}
                                            onChange={(e) => updateSettings({ ...settings, showX: e.target.checked })}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <Twitter size={14} />
                                        <span className="text-gray-600 dark:text-gray-400">X</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <input
                                            type="checkbox"
                                            checked={settings.showDiscord}
                                            onChange={(e) => updateSettings({ ...settings, showDiscord: e.target.checked })}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <MessageCircle size={14} />
                                        <span className="text-gray-600 dark:text-gray-400">Discord</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <input
                                            type="checkbox"
                                            checked={settings.showFarcaster}
                                            onChange={(e) => updateSettings({ ...settings, showFarcaster: e.target.checked })}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <ExternalLink size={14} />
                                        <span className="text-gray-600 dark:text-gray-400">Farcaster</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <input
                                            type="checkbox"
                                            checked={settings.showDeBank}
                                            onChange={(e) => updateSettings({ ...settings, showDeBank: e.target.checked })}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <Wallet size={14} />
                                        <span className="text-gray-600 dark:text-gray-400">DeBank</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4">
                            Settings are saved to your browser.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">Created by 0xarshia.eth</span>
                    <a
                        href="https://x.com/0xarshia"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        title="@0xarshia on X"
                    >
                        <Twitter size={14} />
                    </a>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                    <span className="text-[10px] text-gray-400 dark:text-gray-600">Powered by</span>
                    <a
                        href="https://ethos.network"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        Ethos
                    </a>
                </div>
            </div>
        </div>
    );
}
