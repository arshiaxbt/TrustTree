'use client';

import { EthosProfile, getEthosData } from '@/lib/ethos';
import { usePrivy } from '@privy-io/react-auth';
import { Copy, Settings, Search, Check, ExternalLink, Loader2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Official SVG Icons - Clean minimal style
const XIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const DiscordIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.11 13.11 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
);

// Farcaster - Purple arch logo
const FarcasterIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 4h18v16.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V18H7v2.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V4zm3 8.5a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5H6zm9 0a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-3zM4.5 2A.5.5 0 0 0 4 2.5v1a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-15z" />
    </svg>
);

const TelegramIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

const DeBankIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9v-6h2v6zm4 0h-2v-6h2v6z" />
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

function loadSettings(id: string): ProfileSettings {
    if (typeof window === 'undefined') return defaultSettings;
    try {
        const s = localStorage.getItem(`tt-${id}`);
        if (s) return { ...defaultSettings, ...JSON.parse(s) };
    } catch { }
    return defaultSettings;
}

function saveSettings(id: string, s: ProfileSettings) {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(`tt-${id}`, JSON.stringify(s)); } catch { }
}

function getWallet(user: ReturnType<typeof usePrivy>['user']): string | null {
    if (!user) return null;
    const ca = user.linkedAccounts?.find(a => a.type === 'cross_app');
    if (ca && 'embeddedWallets' in ca) {
        const w = (ca as { embeddedWallets?: { address: string }[] }).embeddedWallets;
        if (w?.[0]?.address) return w[0].address;
    }
    const wa = user.linkedAccounts?.find(a => a.type === 'wallet' && 'address' in a);
    if (wa && 'address' in wa) return (wa as { address: string }).address;
    return user.wallet?.address || null;
}

// Search Component - Apple style
interface SearchResult { username: string; displayName?: string; avatarUrl?: string; score: number; }

function UserSearch() {
    const [q, setQ] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const router = useRouter();

    const search = useCallback(async (query: string) => {
        if (query.length < 2) { setResults([]); return; }
        setLoading(true);
        try {
            const res = await fetch(`https://api.ethos.network/api/v2/users/search?query=${encodeURIComponent(query)}&limit=5`, {
                headers: { 'X-Ethos-Client': 'trust-tree' }
            });
            if (res.ok) {
                const data = await res.json();
                const users = (data.values || []).slice(0, 5).map((u: { username?: string; displayName?: string; avatarUrl?: string; score?: number }) => ({
                    username: u.username || '',
                    displayName: u.displayName,
                    avatarUrl: u.avatarUrl,
                    score: u.score || 0,
                })).filter((u: SearchResult) => u.username);
                setResults(users);
            }
        } catch { }
        setLoading(false);
    }, []);

    useEffect(() => {
        const t = setTimeout(() => search(q), 200);
        return () => clearTimeout(t);
    }, [q, search]);

    return (
        <div className="relative w-full max-w-sm mx-auto mb-8">
            <div className="relative group">
                <input
                    type="text"
                    value={q}
                    onChange={e => { setQ(e.target.value); setShow(true); }}
                    onFocus={() => setShow(true)}
                    onBlur={() => setTimeout(() => setShow(false), 150)}
                    placeholder="Search users..."
                    className="w-full h-12 px-5 pl-11 rounded-xl bg-[#f5f5f7] dark:bg-[#1d1d1f] text-[15px] text-[#1d1d1f] dark:text-white placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all"
                />
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]" />
                {loading && (
                    <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] animate-spin" />
                )}
            </div>

            {show && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1d1d1f] rounded-xl shadow-2xl border border-[#d2d2d7] dark:border-[#424245] overflow-hidden z-50">
                    {results.map(u => (
                        <button
                            key={u.username}
                            onMouseDown={() => { setShow(false); setQ(''); router.push(`/${u.username}`); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f7] dark:hover:bg-[#2d2d2f] transition-colors"
                        >
                            {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0071e3] to-[#a855f7] flex items-center justify-center text-white text-xs font-semibold">
                                    {u.username.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 text-left">
                                <p className="text-[15px] font-medium text-[#1d1d1f] dark:text-white">{u.displayName || u.username}</p>
                                <p className="text-[13px] text-[#86868b]">@{u.username} · {u.score}</p>
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
    const [copied, setCopied] = useState(false);
    const [settings, setSettings] = useState<ProfileSettings>(defaultSettings);
    const [showSettings, setShowSettings] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [myProfile, setMyProfile] = useState<EthosProfile | null>(null);

    const wallet = getWallet(user);
    const dp = profile || initialProfile || { id: 'Guest', score: 0, vouchCount: 0, linkedAccounts: [] };

    useEffect(() => {
        if (authenticated && wallet) {
            getEthosData(wallet).then(d => {
                if (d) { setMyProfile(d); if (!initialProfile) setProfile(d); }
            });
        }
    }, [authenticated, wallet, initialProfile]);

    useEffect(() => {
        if (ready && authenticated && myProfile?.username && dp.username) {
            setIsOwner(myProfile.username.toLowerCase() === dp.username.toLowerCase());
        } else if (ready && authenticated && !initialProfile && profile) {
            setIsOwner(true);
        } else setIsOwner(false);
    }, [ready, authenticated, myProfile, dp, initialProfile, profile]);

    useEffect(() => {
        const id = dp.id || dp.username || wallet;
        if (id) setSettings(loadSettings(id));
    }, [dp, wallet]);

    const update = (s: ProfileSettings) => {
        setSettings(s);
        const id = dp.id || dp.username || wallet;
        if (id) saveSettings(id, s);
    };

    const copy = () => {
        navigator.clipboard.writeText(dp.username ? `${window.location.origin}/${dp.username}` : window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const discord = dp.linkedAccounts.find(a => a.service === 'discord');
    const farcaster = dp.linkedAccounts.find(a => a.service === 'farcaster');
    const telegram = dp.linkedAccounts.find(a => a.service === 'telegram');
    const canEdit = authenticated && isOwner;

    return (
        <div className="w-full max-w-[400px] mx-auto">
            <UserSearch />

            {/* Apple-style Card */}
            <div className="relative bg-white dark:bg-[#1d1d1f] rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] overflow-hidden">

                {/* Settings */}
                {canEdit && (
                    <button onClick={() => setShowSettings(!showSettings)}
                        className={cn("absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            showSettings ? "bg-[#0071e3] text-white" : "bg-[#f5f5f7] dark:bg-[#2d2d2f] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white")}>
                        <Settings size={15} />
                    </button>
                )}

                <div className="p-8 flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="mb-5">
                        {dp.avatarUrl ? (
                            <img src={dp.avatarUrl} alt="" className="w-[88px] h-[88px] rounded-full object-cover shadow-lg" />
                        ) : (
                            <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-[#0071e3] to-[#a855f7] flex items-center justify-center text-[28px] font-bold text-white shadow-lg">
                                {dp.username?.substring(0, 2).toUpperCase() || '??'}
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <h2 className="text-[22px] font-semibold text-[#1d1d1f] dark:text-white mb-0.5">
                        {dp.displayName || dp.username || 'Guest'}
                    </h2>
                    {dp.username && <p className="text-[15px] text-[#86868b] mb-5">@{dp.username}</p>}

                    {/* Stats */}
                    <div className="flex gap-10 mb-6">
                        <div className="text-center">
                            <div className="text-[28px] font-semibold text-[#1d1d1f] dark:text-white">{dp.score > 0 ? dp.score : '—'}</div>
                            <div className="text-[13px] text-[#86868b]">Trust Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[28px] font-semibold text-[#1d1d1f] dark:text-white">{dp.vouchCount || '—'}</div>
                            <div className="text-[13px] text-[#86868b]">Vouches</div>
                        </div>
                    </div>

                    {/* Socials */}
                    <div className="flex gap-2 mb-6">
                        {settings.showX && dp.username && (
                            <a href={`https://x.com/${dp.username}`} target="_blank" rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-[#f5f5f7] dark:bg-[#2d2d2f] flex items-center justify-center text-[#1d1d1f] dark:text-white hover:bg-[#1d1d1f] hover:text-white dark:hover:bg-white dark:hover:text-[#1d1d1f] transition-colors">
                                <XIcon size={16} />
                            </a>
                        )}
                        {settings.showDiscord && discord?.username && (
                            <a href={`https://discord.com/users/${discord.username}`} target="_blank" rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-[#f5f5f7] dark:bg-[#2d2d2f] flex items-center justify-center text-[#5865F2] hover:bg-[#5865F2] hover:text-white transition-colors">
                                <DiscordIcon />
                            </a>
                        )}
                        {settings.showFarcaster && farcaster?.username && (
                            <a href={`https://warpcast.com/~/profiles/${farcaster.username}`} target="_blank" rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-[#f5f5f7] dark:bg-[#2d2d2f] flex items-center justify-center text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white transition-colors">
                                <FarcasterIcon />
                            </a>
                        )}
                        {settings.showTelegram && telegram?.username && (
                            <a href={`tg://user?id=${telegram.username}`}
                                className="w-10 h-10 rounded-full bg-[#f5f5f7] dark:bg-[#2d2d2f] flex items-center justify-center text-[#0088cc] hover:bg-[#0088cc] hover:text-white transition-colors"
                                title="Open in Telegram">
                                <TelegramIcon />
                            </a>
                        )}
                        {settings.showDeBank && dp.primaryAddress && (
                            <a href={`https://debank.com/profile/${dp.primaryAddress}`} target="_blank" rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-[#f5f5f7] dark:bg-[#2d2d2f] flex items-center justify-center text-[#f97316] hover:bg-[#f97316] hover:text-white transition-colors">
                                <DeBankIcon />
                            </a>
                        )}
                    </div>

                    {/* Copy Button */}
                    <button onClick={copy}
                        className={cn("w-full h-11 rounded-xl font-medium text-[15px] transition-all flex items-center justify-center gap-2",
                            copied ? "bg-[#34c759] text-white" : "bg-[#0071e3] text-white hover:bg-[#0077ed]")}>
                        {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy Profile Link</>}
                    </button>

                    {/* Ethos Link */}
                    {dp.username && (
                        <a href={`https://app.ethos.network/profile/x/${dp.username}`} target="_blank" rel="noopener noreferrer"
                            className="mt-4 text-[13px] text-[#0071e3] hover:underline flex items-center gap-1">
                            View on Ethos <ExternalLink size={12} />
                        </a>
                    )}
                </div>

                {/* Settings Panel */}
                {showSettings && canEdit && (
                    <div className="border-t border-[#d2d2d7] dark:border-[#424245] p-5 bg-[#f5f5f7] dark:bg-[#161617]">
                        <p className="text-[13px] font-medium text-[#86868b] mb-3 uppercase tracking-wide">Show/Hide</p>
                        <div className="grid grid-cols-2 gap-2">
                            {([
                                ['showX', 'X', XIcon],
                                ['showDiscord', 'Discord', DiscordIcon],
                                ['showFarcaster', 'Farcaster', FarcasterIcon],
                                ['showTelegram', 'Telegram', TelegramIcon],
                                ['showDeBank', 'DeBank', DeBankIcon],
                            ] as const).map(([key, label, Icon]) => (
                                <label key={key} className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-[#2d2d2f] cursor-pointer text-[13px]">
                                    <input type="checkbox" checked={settings[key]} onChange={e => update({ ...settings, [key]: e.target.checked })}
                                        className="rounded border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]" />
                                    <Icon />
                                    <span className="text-[#1d1d1f] dark:text-white">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer - Small creator button */}
            <div className="mt-6 flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#86868b]">Created by 0xarshia.eth</span>
                    <a href="https://x.com/0xarshia" target="_blank" rel="noopener noreferrer"
                        className="w-6 h-6 rounded-full bg-[#f5f5f7] dark:bg-[#2d2d2f] flex items-center justify-center text-[#1d1d1f] dark:text-white hover:bg-[#1d1d1f] hover:text-white dark:hover:bg-white dark:hover:text-[#1d1d1f] transition-colors">
                        <XIcon size={10} />
                    </a>
                </div>
                <p className="text-[11px] text-[#86868b]">
                    Powered by <a href="https://ethos.network" target="_blank" className="text-[#0071e3] hover:underline">Ethos</a>
                </p>
            </div>
        </div>
    );
}
