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

// ========== OFFICIAL BRAND SVG ICONS ==========

// X (Twitter) - Official rebrand logo 2023
const XIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

// Discord - Official Clyde logo
const DiscordIcon = () => (
    <svg width="18" height="18" viewBox="0 0 127.14 96.36" fill="currentColor">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
);

// Farcaster - Official purple arch logo
const FarcasterIcon = () => (
    <svg width="18" height="18" viewBox="0 0 1000 1000" fill="currentColor">
        <path d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z" />
        <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z" />
        <path d="M871.111 253.333H693.333V746.667C681.06 746.667 671.111 756.616 671.111 768.889V795.556H666.667C654.394 795.556 644.444 805.505 644.444 817.778V844.445H893.333V817.778C893.333 805.505 883.384 795.556 871.111 795.556H866.667V768.889C866.667 756.616 856.717 746.667 844.444 746.667V351.111H868.889L897.778 253.333H871.111Z" />
    </svg>
);

// Telegram - Official paper plane
const TelegramIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

// DeBank - Simple D logo
const DeBankIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2 15h-4V7h4c2.76 0 5 2.24 5 5s-2.24 5-5 5zm0-8h-2v6h2c1.66 0 3-1.34 3-3s-1.34-3-3-3z" />
    </svg>
);

// ========== INTERFACES ==========

interface ProfileCardProps { initialProfile?: EthosProfile; }
interface ProfileSettings { showX: boolean; showDiscord: boolean; showFarcaster: boolean; showTelegram: boolean; showDeBank: boolean; }

const defaultSettings: ProfileSettings = { showX: true, showDiscord: true, showFarcaster: true, showTelegram: true, showDeBank: true };

function loadSettings(id: string): ProfileSettings {
    if (typeof window === 'undefined') return defaultSettings;
    try { const s = localStorage.getItem(`tt-${id}`); if (s) return { ...defaultSettings, ...JSON.parse(s) }; } catch { }
    return defaultSettings;
}

function saveSettings(id: string, s: ProfileSettings) {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(`tt-${id}`, JSON.stringify(s)); } catch { }
}

function getWallet(user: ReturnType<typeof usePrivy>['user']): string | null {
    if (!user) return null;
    const ca = user.linkedAccounts?.find(a => a.type === 'cross_app');
    if (ca && 'embeddedWallets' in ca) { const w = (ca as { embeddedWallets?: { address: string }[] }).embeddedWallets; if (w?.[0]?.address) return w[0].address; }
    const wa = user.linkedAccounts?.find(a => a.type === 'wallet' && 'address' in a);
    if (wa && 'address' in wa) return (wa as { address: string }).address;
    return user.wallet?.address || null;
}

// ========== SEARCH COMPONENT ==========

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
            const res = await fetch(`https://api.ethos.network/api/v2/users/search?query=${encodeURIComponent(query)}&limit=5`, { headers: { 'X-Ethos-Client': 'trust-tree' } });
            if (res.ok) {
                const data = await res.json();
                setResults((data.values || []).slice(0, 5).map((u: { username?: string; displayName?: string; avatarUrl?: string; score?: number }) => ({
                    username: u.username || '', displayName: u.displayName, avatarUrl: u.avatarUrl, score: u.score || 0,
                })).filter((u: SearchResult) => u.username));
            }
        } catch { }
        setLoading(false);
    }, []);

    useEffect(() => { const t = setTimeout(() => search(q), 200); return () => clearTimeout(t); }, [q, search]);

    return (
        <div className="relative w-full max-w-sm mx-auto mb-8">
            <div className="relative">
                <input
                    type="text" value={q}
                    onChange={e => { setQ(e.target.value); setShow(true); }}
                    onFocus={() => setShow(true)}
                    onBlur={() => setTimeout(() => setShow(false), 150)}
                    placeholder="Search users..."
                    className="w-full h-12 px-5 pl-12 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/50 dark:border-white/20 text-[15px] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-black/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                {loading && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />}
            </div>

            {show && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 dark:border-white/10 overflow-hidden z-50">
                    {results.map(u => (
                        <button key={u.username} onMouseDown={() => { setShow(false); setQ(''); router.push(`/${u.username}`); }}
                            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/50 dark:hover:bg-white/10 transition-all">
                            {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50" />
                                : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/50">{u.username.substring(0, 2).toUpperCase()}</div>}
                            <div className="flex-1 text-left">
                                <p className="text-[15px] font-medium text-gray-900 dark:text-white">{u.displayName || u.username}</p>
                                <p className="text-[13px] text-gray-500">@{u.username} · {u.score} score</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ========== PROFILE CARD ==========

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

    useEffect(() => { if (authenticated && wallet) { getEthosData(wallet).then(d => { if (d) { setMyProfile(d); if (!initialProfile) setProfile(d); } }); } }, [authenticated, wallet, initialProfile]);
    useEffect(() => { if (ready && authenticated && myProfile?.username && dp.username) { setIsOwner(myProfile.username.toLowerCase() === dp.username.toLowerCase()); } else if (ready && authenticated && !initialProfile && profile) { setIsOwner(true); } else setIsOwner(false); }, [ready, authenticated, myProfile, dp, initialProfile, profile]);
    useEffect(() => { const id = dp.id || dp.username || wallet; if (id) setSettings(loadSettings(id)); }, [dp, wallet]);

    const update = (s: ProfileSettings) => { setSettings(s); const id = dp.id || dp.username || wallet; if (id) saveSettings(id, s); };
    const copy = () => { navigator.clipboard.writeText(dp.username ? `${window.location.origin}/${dp.username}` : window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    const discord = dp.linkedAccounts.find(a => a.service === 'discord');
    const farcaster = dp.linkedAccounts.find(a => a.service === 'farcaster');
    const telegram = dp.linkedAccounts.find(a => a.service === 'telegram');
    const canEdit = authenticated && isOwner;

    return (
        <div className="w-full max-w-[420px] mx-auto px-4">
            <UserSearch />

            {/* Glass Card */}
            <div className="relative bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-[32px] shadow-[0_8px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_60px_rgba(0,0,0,0.5)] border border-white/60 dark:border-white/10 overflow-hidden">

                {/* Ambient glow */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-emerald-400/10 via-cyan-400/10 to-blue-400/10 rounded-full blur-3xl pointer-events-none" />

                {/* Settings Button */}
                {canEdit && (
                    <button onClick={() => setShowSettings(!showSettings)}
                        className={cn("absolute top-5 right-5 z-10 w-10 h-10 rounded-2xl backdrop-blur-xl flex items-center justify-center transition-all",
                            showSettings ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-white/50 dark:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/20")}>
                        <Settings size={18} />
                    </button>
                )}

                <div className="relative p-10 flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-30 scale-110" />
                        {dp.avatarUrl ? (
                            <img src={dp.avatarUrl} alt="" className="relative w-28 h-28 rounded-full object-cover ring-4 ring-white/80 dark:ring-white/20 shadow-2xl" />
                        ) : (
                            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white ring-4 ring-white/80 dark:ring-white/20 shadow-2xl">
                                {dp.username?.substring(0, 2).toUpperCase() || '??'}
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <h2 className="text-[26px] font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent tracking-tight">
                        {dp.displayName || dp.username || 'Guest'}
                    </h2>
                    {dp.username && <p className="text-[15px] text-gray-500 dark:text-gray-400 mt-1 mb-6">@{dp.username}</p>}

                    {/* Stats */}
                    <div className="flex gap-12 mb-8">
                        <div className="text-center">
                            <div className="text-[36px] font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{dp.score > 0 ? dp.score : '—'}</div>
                            <div className="text-[13px] text-gray-500 font-medium uppercase tracking-wide">Trust</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[36px] font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{dp.vouchCount || '—'}</div>
                            <div className="text-[13px] text-gray-500 font-medium uppercase tracking-wide">Vouches</div>
                        </div>
                    </div>

                    {/* Social Icons - Glass buttons */}
                    <div className="flex gap-3 mb-8">
                        {settings.showX && dp.username && (
                            <a href={`https://x.com/${dp.username}`} target="_blank" rel="noopener noreferrer"
                                className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl flex items-center justify-center text-gray-700 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-lg shadow-black/5">
                                <XIcon size={18} />
                            </a>
                        )}
                        {settings.showDiscord && discord?.username && (
                            <a href={`https://discord.com/users/${discord.username}`} target="_blank" rel="noopener noreferrer"
                                className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl flex items-center justify-center text-[#5865F2] hover:bg-[#5865F2] hover:text-white transition-all shadow-lg shadow-black/5">
                                <DiscordIcon />
                            </a>
                        )}
                        {settings.showFarcaster && farcaster?.username && (
                            <a href={`https://warpcast.com/${farcaster.username}`} target="_blank" rel="noopener noreferrer"
                                className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl flex items-center justify-center text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white transition-all shadow-lg shadow-black/5">
                                <FarcasterIcon />
                            </a>
                        )}
                        {settings.showTelegram && telegram?.username && (
                            <span className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl flex items-center justify-center text-[#0088CC] cursor-default shadow-lg shadow-black/5" title="Telegram connected (ID only)">
                                <TelegramIcon />
                            </span>
                        )}
                        {settings.showDeBank && dp.primaryAddress && (
                            <a href={`https://debank.com/profile/${dp.primaryAddress}`} target="_blank" rel="noopener noreferrer"
                                className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl flex items-center justify-center text-[#FE815F] hover:bg-[#FE815F] hover:text-white transition-all shadow-lg shadow-black/5">
                                <DeBankIcon />
                            </a>
                        )}
                    </div>

                    {/* Copy Button - Glass style */}
                    <button onClick={copy}
                        className={cn("w-full h-14 rounded-2xl font-semibold text-[15px] transition-all flex items-center justify-center gap-2.5 backdrop-blur-xl",
                            copied ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                : "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 active:scale-[0.98]")}>
                        {copied ? <><Check size={18} /> Copied!</> : <><Copy size={18} /> Copy Profile Link</>}
                    </button>

                    {/* Ethos Link */}
                    {dp.username && (
                        <a href={`https://app.ethos.network/profile/x/${dp.username}`} target="_blank" rel="noopener noreferrer"
                            className="mt-5 text-[13px] text-blue-500 hover:text-blue-600 flex items-center gap-1.5 font-medium transition-colors">
                            View on Ethos <ExternalLink size={13} />
                        </a>
                    )}
                </div>

                {/* Settings Panel */}
                {showSettings && canEdit && (
                    <div className="border-t border-white/30 dark:border-white/10 p-6 bg-white/50 dark:bg-white/5 backdrop-blur-xl">
                        <p className="text-[13px] font-semibold text-gray-500 mb-4 uppercase tracking-wider">Display Settings</p>
                        <div className="grid grid-cols-2 gap-2">
                            {([['showX', 'X', XIcon, '#000'], ['showDiscord', 'Discord', DiscordIcon, '#5865F2'], ['showFarcaster', 'Farcaster', FarcasterIcon, '#8B5CF6'], ['showTelegram', 'Telegram', TelegramIcon, '#0088CC'], ['showDeBank', 'DeBank', DeBankIcon, '#FE815F']] as const).map(([key, label, Icon, color]) => (
                                <label key={key} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 dark:bg-white/10 backdrop-blur-xl cursor-pointer hover:bg-white dark:hover:bg-white/20 transition-all text-[13px] border border-white/50 dark:border-white/10">
                                    <input type="checkbox" checked={settings[key]} onChange={e => update({ ...settings, [key]: e.target.checked })} className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-4 h-4" />
                                    <span style={{ color }}><Icon /></span>
                                    <span className="text-gray-700 dark:text-white font-medium">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-8 flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-400">Created by 0xarshia.eth</span>
                    <a href="https://x.com/0xarshia" target="_blank" rel="noopener noreferrer"
                        className="w-5 h-5 rounded-lg bg-white/50 dark:bg-white/10 backdrop-blur-xl flex items-center justify-center text-gray-600 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                        <XIcon size={9} />
                    </a>
                </div>
                <p className="text-[11px] text-gray-400">Powered by <a href="https://ethos.network" target="_blank" className="text-blue-500 hover:underline font-medium">Ethos</a></p>
            </div>
        </div>
    );
}
