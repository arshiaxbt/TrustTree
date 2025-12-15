'use client';

import { EthosProfile, getEthosData } from '@/lib/ethos';
import { usePrivy } from '@privy-io/react-auth';
import { Copy, Twitter, ExternalLink, MessageCircle, Settings, Wallet, Search, Send } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ProfileCardProps {
    initialProfile?: EthosProfile;
}

interface ProfileSettings {
    showX: boolean;
    showDiscord: boolean;
    showFarcaster: boolean;
    showTelegram: boolean;
    showDeBank: boolean;
}

const defaultSettings: ProfileSettings = {
    showX: true,
    showDiscord: true,
    showFarcaster: true,
    showTelegram: true,
    showDeBank: true,
};

function loadSettings(profileId: string): ProfileSettings {
    if (typeof window === 'undefined') return defaultSettings;
    try {
        const stored = localStorage.getItem(`trusttree-settings-${profileId}`);
        if (stored) {
            return { ...defaultSettings, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error('Error loading settings:', e);
    }
    return defaultSettings;
}

function saveSettings(profileId: string, settings: ProfileSettings) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(`trusttree-settings-${profileId}`, JSON.stringify(settings));
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

// Search Component with Live Suggestions
interface SearchResult {
    username: string;
    displayName?: string;
    avatarUrl?: string;
    score: number;
}

function UserSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const router = useRouter();

    // Debounced search
    const searchUsers = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`/api/profile/by-username?username=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.username) {
                    setSuggestions([{
                        username: data.username,
                        displayName: data.displayName,
                        avatarUrl: data.avatarUrl,
                        score: data.score || 0,
                    }]);
                } else {
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
            }
        } catch {
            setSuggestions([]);
        }
        setIsSearching(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            searchUsers(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, searchUsers]);

    const handleSelect = (username: string) => {
        setShowSuggestions(false);
        setSearchQuery('');
        router.push(`/${username}`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setShowSuggestions(false);
            router.push(`/${searchQuery.trim()}`);
        }
    };

    return (
        <div className="relative w-full max-w-sm mx-auto mb-6">
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Search by username..."
                        className="w-full px-4 py-2.5 pl-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            </form>

            {/* Live Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden z-50">
                    {suggestions.map((user) => (
                        <button
                            key={user.username}
                            onClick={() => handleSelect(user.username)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                    {user.username.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user.displayName || user.username}
                                </div>
                                <div className="text-xs text-gray-500">@{user.username} · Score: {user.score}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function ProfileCard({ initialProfile }: ProfileCardProps) {
    const { authenticated, user, ready } = usePrivy();
    const [profile, setProfile] = useState<EthosProfile | null>(initialProfile || null);
    const [isCopied, setIsCopied] = useState(false);
    const [settings, setSettings] = useState<ProfileSettings>(defaultSettings);
    const [showSettings, setShowSettings] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    const walletAddress = getEthosWalletAddress(user);

    // Auto-detect if current user is the owner
    useEffect(() => {
        if (ready && authenticated && walletAddress && profile?.primaryAddress) {
            const isMatch = walletAddress.toLowerCase() === profile.primaryAddress.toLowerCase();
            setIsOwner(isMatch);
        } else if (ready && authenticated && walletAddress && !initialProfile) {
            // If no initial profile, user is viewing their own profile
            setIsOwner(true);
        } else {
            setIsOwner(false);
        }
    }, [ready, authenticated, walletAddress, profile, initialProfile]);

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

        // Load settings based on profile ID
        const profileId = profile?.id || initialProfile?.id || walletAddress;
        if (profileId) {
            setSettings(loadSettings(profileId));
        }
    }, [authenticated, walletAddress, initialProfile, profile]);

    const updateSettings = (newSettings: ProfileSettings) => {
        setSettings(newSettings);
        const profileId = profile?.id || initialProfile?.id || walletAddress;
        if (profileId) {
            saveSettings(profileId, newSettings);
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
    const telegramAccount = displayProfile.linkedAccounts.find(a => a.service === 'telegram');
    const telegramId = telegramAccount?.username;
    const primaryWallet = displayProfile.primaryAddress;

    const canEdit = authenticated && isOwner;

    return (
        <div className="w-full max-w-md mx-auto p-4 md:p-0">
            {/* Search Bar */}
            <UserSearch />

            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">

                {/* Edit Button - Always visible for owner */}
                {canEdit && (
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={cn(
                            "absolute top-4 right-4 p-2.5 rounded-full transition-all z-10 shadow-sm",
                            showSettings
                                ? "bg-indigo-500 text-white shadow-indigo-200 dark:shadow-indigo-900"
                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                        )}
                        title="Edit Profile Settings"
                    >
                        <Settings size={18} />
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

                        {/* Discord */}
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

                        {/* Farcaster */}
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

                        {/* Telegram using tg://user?id= protocol */}
                        {settings.showTelegram && telegramId && (
                            <a
                                href={`tg://user?id=${telegramId}`}
                                className="p-3 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-800 transition-all"
                                title="Open in Telegram"
                            >
                                <Send size={18} />
                            </a>
                        )}

                        {/* DeBank */}
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
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Settings size={14} />
                            Display Settings
                        </h3>

                        <div className="space-y-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Show/Hide Socials
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="flex items-center gap-2 cursor-pointer text-xs p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={settings.showX}
                                        onChange={(e) => updateSettings({ ...settings, showX: e.target.checked })}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <Twitter size={14} className="text-gray-500" />
                                    <span className="text-gray-700 dark:text-gray-300">X</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-xs p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={settings.showDiscord}
                                        onChange={(e) => updateSettings({ ...settings, showDiscord: e.target.checked })}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <MessageCircle size={14} className="text-indigo-500" />
                                    <span className="text-gray-700 dark:text-gray-300">Discord</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-xs p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={settings.showFarcaster}
                                        onChange={(e) => updateSettings({ ...settings, showFarcaster: e.target.checked })}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <ExternalLink size={14} className="text-purple-500" />
                                    <span className="text-gray-700 dark:text-gray-300">Farcaster</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-xs p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={settings.showTelegram}
                                        onChange={(e) => updateSettings({ ...settings, showTelegram: e.target.checked })}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <Send size={14} className="text-sky-500" />
                                    <span className="text-gray-700 dark:text-gray-300">Telegram</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-xs p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors col-span-2">
                                    <input
                                        type="checkbox"
                                        checked={settings.showDeBank}
                                        onChange={(e) => updateSettings({ ...settings, showDeBank: e.target.checked })}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <Wallet size={14} className="text-orange-500" />
                                    <span className="text-gray-700 dark:text-gray-300">DeBank</span>
                                </label>
                            </div>
                        </div>

                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4 flex items-center gap-1">
                            ✓ Settings saved to your browser
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
