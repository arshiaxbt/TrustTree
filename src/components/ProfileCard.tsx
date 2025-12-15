'use client';

import { EthosProfile, getEthosData } from '@/lib/ethos';
import { usePrivy } from '@privy-io/react-auth';
import { Copy, Settings, Search, Check, ExternalLink } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Official SVG Icons
const XIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const DiscordIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
);

const FarcasterIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M18.24 2.4H5.76C3.9384 2.4 2.4 3.9384 2.4 5.76v12.48c0 1.8216 1.5384 3.36 3.36 3.36h12.48c1.8216 0 3.36-1.5384 3.36-3.36V5.76c0-1.8216-1.5384-3.36-3.36-3.36zm-.72 13.92c0 .4968-.4032.9-.9.9H7.38c-.4968 0-.9-.4032-.9-.9V7.68c0-.4968.4032-.9.9-.9h9.24c.4968 0 .9.4032.9.9v8.64z" />
    </svg>
);

const TelegramIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

const DeBankIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-4-8h-2V7h2v2zm4 0h-2V7h2v2z" />
    </svg>
);

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
        if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
    } catch { }
    return defaultSettings;
}

function saveSettings(profileId: string, settings: ProfileSettings) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(`trusttree-settings-${profileId}`, JSON.stringify(settings));
    } catch { }
}

function getEthosWalletAddress(user: ReturnType<typeof usePrivy>['user']): string | null {
    if (!user) return null;
    const crossAppAccount = user.linkedAccounts?.find(a => a.type === 'cross_app');
    if (crossAppAccount && 'embeddedWallets' in crossAppAccount) {
        const wallets = (crossAppAccount as { embeddedWallets?: Array<{ address: string }> }).embeddedWallets;
        if (wallets?.[0]?.address) return wallets[0].address;
    }
    const walletAccount = user.linkedAccounts?.find(a => a.type === 'wallet' && 'address' in a);
    if (walletAccount && 'address' in walletAccount) return (walletAccount as { address: string }).address;
    return user.wallet?.address || null;
}

// Search with 5 live results
interface SearchResult {
    username: string;
    displayName?: string;
    avatarUrl?: string;
    score: number;
}

function UserSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const router = useRouter();

    const search = useCallback(async (q: string) => {
        if (q.length < 2) { setResults([]); return; }
        setLoading(true);
        try {
            // Direct call to Ethos API for multiple results
            const res = await fetch(`https://api.ethos.network/api/v2/users/search?query=${encodeURIComponent(q)}&limit=5`, {
                headers: { 'X-Ethos-Client': 'trust-tree' }
            });
            if (res.ok) {
                const data = await res.json();
                setResults((data.values || []).slice(0, 5).map((u: { username: string; displayName?: string; avatarUrl?: string; score?: number }) => ({
                    username: u.username,
                    displayName: u.displayName,
                    avatarUrl: u.avatarUrl,
                    score: u.score || 0,
                })));
            }
        } catch { }
        setLoading(false);
    }, []);

    useEffect(() => {
        const t = setTimeout(() => search(query), 250);
        return () => clearTimeout(t);
    }, [query, search]);

    return (
        <div className="relative w-full max-w-sm mx-auto mb-8">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setShowResults(true); }}
                    onFocus={() => setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    placeholder="Search users..."
                    className="w-full px-5 py-3.5 pl-12 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-black/5 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-sm"
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                {loading && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-xl overflow-hidden z-50">
                    {results.map(u => (
                        <button
                            key={u.username}
                            onMouseDown={() => { setShowResults(false); setQuery(''); router.push(`/${u.username}`); }}
                            className="w-full flex items-center gap-3 p-4 hover:bg-white/50 dark:hover:bg-white/10 transition-all"
                        >
                            {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/50">
                                    {u.username?.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 text-left">
                                <p className="font-medium text-gray-900 dark:text-white">{u.displayName || u.username}</p>
                                <p className="text-xs text-gray-500">@{u.username} • {u.score} score</p>
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
    const [myProfile, setMyProfile] = useState<EthosProfile | null>(null);

    const walletAddress = getEthosWalletAddress(user);
    const displayProfile = profile || initialProfile || { id: 'Guest', score: 0, vouchCount: 0, linkedAccounts: [] };

    useEffect(() => {
        async function fetchMyProfile() {
            if (authenticated && walletAddress) {
                const data = await getEthosData(walletAddress);
                if (data) {
                    setMyProfile(data);
                    if (!initialProfile) setProfile(data);
                }
            }
        }
        if (authenticated && walletAddress) fetchMyProfile();
    }, [authenticated, walletAddress, initialProfile]);

    useEffect(() => {
        if (ready && authenticated && myProfile?.username && displayProfile.username) {
            setIsOwner(myProfile.username.toLowerCase() === displayProfile.username.toLowerCase());
        } else if (ready && authenticated && !initialProfile && profile) {
            setIsOwner(true);
        } else {
            setIsOwner(false);
        }
    }, [ready, authenticated, myProfile, displayProfile, initialProfile, profile]);

    useEffect(() => {
        const id = displayProfile.id || displayProfile.username || walletAddress;
        if (id) setSettings(loadSettings(id));
    }, [displayProfile, walletAddress]);

    const updateSettings = (s: ProfileSettings) => {
        setSettings(s);
        const id = displayProfile.id || displayProfile.username || walletAddress;
        if (id) saveSettings(id, s);
    };

    const handleCopy = () => {
        const url = displayProfile.username ? `${window.location.origin}/${displayProfile.username}` : window.location.href;
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // Social data
    const xUsername = displayProfile.username;
    const discordAccount = displayProfile.linkedAccounts.find(a => a.service === 'discord');
    const farcasterAccount = displayProfile.linkedAccounts.find(a => a.service === 'farcaster');
    const telegramAccount = displayProfile.linkedAccounts.find(a => a.service === 'telegram');
    const primaryWallet = displayProfile.primaryAddress;

    const canEdit = authenticated && isOwner;

    return (
        <div className="w-full max-w-md mx-auto p-4 md:p-0">
            <UserSearch />

            {/* Glass Card */}
            <div className="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-2xl shadow-black/10">

                {/* Gradient Orbs for Glass Effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-400/30 to-purple-500/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl" />

                {/* Settings Button */}
                {canEdit && (
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={cn(
                            "absolute top-5 right-5 p-2.5 rounded-xl backdrop-blur-xl transition-all z-10",
                            showSettings
                                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                                : "bg-white/50 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-white/20"
                        )}
                    >
                        <Settings size={18} />
                    </button>
                )}

                <div className="relative p-10 flex flex-col items-center text-center space-y-6">
                    {/* Avatar */}
                    <div className="relative">
                        {displayProfile.avatarUrl ? (
                            <img
                                src={displayProfile.avatarUrl}
                                alt=""
                                className="w-28 h-28 rounded-3xl object-cover shadow-2xl shadow-black/20 ring-4 ring-white/50"
                            />
                        ) : (
                            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-purple-500/30">
                                {displayProfile.username?.substring(0, 2).toUpperCase() || '??'}
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <div className="space-y-1.5">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            {displayProfile.displayName || displayProfile.username || 'Guest'}
                        </h2>
                        {displayProfile.username && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">@{displayProfile.username}</p>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                                {displayProfile.score > 0 ? displayProfile.score : '—'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Trust</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                {displayProfile.vouchCount || '—'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Vouches</div>
                        </div>
                    </div>

                    {/* Social Icons - Glass Style */}
                    <div className="flex gap-3">
                        {settings.showX && xUsername && (
                            <a href={`https://x.com/${xUsername}`} target="_blank" rel="noopener noreferrer"
                                className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-xl text-gray-700 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-lg shadow-black/5">
                                <XIcon />
                            </a>
                        )}
                        {settings.showDiscord && discordAccount?.username && (
                            <a href={`https://discord.com/users/${discordAccount.username}`} target="_blank" rel="noopener noreferrer"
                                className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-black/5">
                                <DiscordIcon />
                            </a>
                        )}
                        {settings.showFarcaster && farcasterAccount?.username && (
                            <a href={`https://warpcast.com/~/profiles/${farcasterAccount.username}`} target="_blank" rel="noopener noreferrer"
                                className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-xl text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white transition-all shadow-lg shadow-black/5">
                                <FarcasterIcon />
                            </a>
                        )}
                        {settings.showTelegram && telegramAccount?.username && (
                            <a href={`https://t.me/user?id=${telegramAccount.username}`} target="_blank" rel="noopener noreferrer"
                                className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-xl text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white transition-all shadow-lg shadow-black/5">
                                <TelegramIcon />
                            </a>
                        )}
                        {settings.showDeBank && primaryWallet && (
                            <a href={`https://debank.com/profile/${primaryWallet}`} target="_blank" rel="noopener noreferrer"
                                className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-xl text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white transition-all shadow-lg shadow-black/5">
                                <DeBankIcon />
                            </a>
                        )}
                    </div>

                    {/* Copy Button */}
                    <button onClick={handleCopy}
                        className={cn(
                            "flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all backdrop-blur-xl shadow-lg",
                            isCopied
                                ? "bg-green-500 text-white shadow-green-500/30"
                                : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 active:scale-95 shadow-indigo-500/30"
                        )}>
                        {isCopied ? <><Check size={18} /> Copied!</> : <><Copy size={18} /> Copy Profile Link</>}
                    </button>

                    {/* Ethos Link */}
                    {displayProfile.username && (
                        <a href={`https://app.ethos.network/profile/x/${displayProfile.username}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-500 transition-colors">
                            View on Ethos <ExternalLink size={14} />
                        </a>
                    )}
                </div>

                {/* Settings Panel */}
                {showSettings && canEdit && (
                    <div className="border-t border-white/20 dark:border-white/10 p-6 bg-white/30 dark:bg-white/5 backdrop-blur-xl">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Display Settings</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { key: 'showX', label: 'X', Icon: XIcon },
                                { key: 'showDiscord', label: 'Discord', Icon: DiscordIcon },
                                { key: 'showFarcaster', label: 'Farcaster', Icon: FarcasterIcon },
                                { key: 'showTelegram', label: 'Telegram', Icon: TelegramIcon },
                                { key: 'showDeBank', label: 'DeBank', Icon: DeBankIcon },
                            ].map(({ key, label, Icon }) => (
                                <label key={key} className="flex items-center gap-2 p-3 rounded-xl bg-white/50 dark:bg-white/10 cursor-pointer hover:bg-white/70 dark:hover:bg-white/20 transition-all text-sm">
                                    <input type="checkbox" checked={settings[key as keyof ProfileSettings]}
                                        onChange={e => updateSettings({ ...settings, [key]: e.target.checked })}
                                        className="rounded border-gray-300 text-indigo-500" />
                                    <Icon />
                                    <span className="text-gray-700 dark:text-gray-300">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center space-y-1">
                <div className="flex items-center justify-center gap-3">
                    <span className="text-xs text-gray-400">Created by 0xarshia.eth</span>
                    <a href="https://x.com/0xarshia" target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-xl text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white transition-all">
                        <XIcon />
                    </a>
                </div>
                <p className="text-[10px] text-gray-400">
                    Powered by <a href="https://ethos.network" target="_blank" className="text-indigo-500 hover:underline">Ethos</a>
                </p>
            </div>
        </div>
    );
}
