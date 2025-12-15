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

// ==================== OFFICIAL BRAND SVG ICONS ====================

// X (Twitter) - Official 2023 rebrand logo
const XIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

// Discord - Official logo
const DiscordIcon = () => (
    <svg width="18" height="18" viewBox="0 0 71 55" fill="currentColor">
        <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3## 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1099 30.1693C30.1099 34.1136 27.2680 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9370 34.1136 40.9370 30.1693C40.9370 26.225 43.7636 23.0133 47.3178 23.0133C50.8999 23.0133 53.7545 26.2532 53.7018 30.1693C53.7018 34.1136 50.8999 37.3253 47.3178 37.3253Z" />
    </svg>
);

// Farcaster - Official logo (purple arch/castle)
const FarcasterIcon = () => (
    <svg width="18" height="18" viewBox="0 0 1000 1000" fill="currentColor">
        <path d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z" />
        <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z" />
        <path d="M871.111 253.333H693.333V746.667C681.06 746.667 671.111 756.616 671.111 768.889V795.556H666.667C654.394 795.556 644.444 805.505 644.444 817.778V844.445H893.333V817.778C893.333 805.505 883.384 795.556 871.111 795.556H866.667V768.889C866.667 756.616 856.717 746.667 844.444 746.667V351.111H868.889L897.778 253.333H871.111Z" />
    </svg>
);

// Telegram - Official logo
const TelegramIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

// DeBank - Official logo (stylized "D" with rabbit ears)
const DeBankIcon = () => (
    <svg width="18" height="18" viewBox="0 0 40 40" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40ZM25.5 10H12V30H25.5C30.1944 30 34 26.1944 34 21.5V18.5C34 13.8056 30.1944 10 25.5 10ZM25.5 26H16V14H25.5C27.9853 14 30 16.0147 30 18.5V21.5C30 23.9853 27.9853 26 25.5 26Z" />
    </svg>
);

// ==================== INTERFACES ====================

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

// ==================== SEARCH COMPONENT ====================

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
            <div className="relative">
                <input
                    type="text"
                    value={q}
                    onChange={e => { setQ(e.target.value); setShow(true); }}
                    onFocus={() => setShow(true)}
                    onBlur={() => setTimeout(() => setShow(false), 150)}
                    placeholder="Search users..."
                    className="w-full h-12 px-5 pl-11 rounded-2xl bg-[#f5f5f7] dark:bg-[#1d1d1f] border border-[#d2d2d7] dark:border-[#424245] text-[15px] text-[#1d1d1f] dark:text-white placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-all"
                />
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]" />
                {loading && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0071e3] animate-spin" />}
            </div>

            {show && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1d1d1f] rounded-2xl shadow-xl border border-[#d2d2d7] dark:border-[#424245] overflow-hidden z-50">
                    {results.map(u => (
                        <button
                            key={u.username}
                            onMouseDown={() => { setShow(false); setQ(''); router.push(`/${u.username}`); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f7] dark:hover:bg-[#2d2d2f] transition-colors"
                        >
                            {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0071e3] to-[#a855f7] flex items-center justify-center text-white text-sm font-semibold">
                                    {u.username.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 text-left">
                                <p className="text-[15px] font-medium text-[#1d1d1f] dark:text-white">{u.displayName || u.username}</p>
                                <p className="text-[13px] text-[#86868b]">@{u.username} · {u.score} score</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ==================== PROFILE CARD ====================

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

    // Get social accounts - Telegram username is available from Ethos API
    const discord = dp.linkedAccounts.find(a => a.service === 'discord');
    const farcaster = dp.linkedAccounts.find(a => a.service === 'farcaster');
    const telegram = dp.linkedAccounts.find(a => a.service === 'telegram');
    const canEdit = authenticated && isOwner;

    return (
        <div className="w-full max-w-[400px] mx-auto px-4">
            <UserSearch />

            {/* Card */}
            <div className="relative bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-[0_2px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_40px_rgba(0,0,0,0.4)] overflow-hidden border border-[#e5e5e5] dark:border-[#3a3a3c]">

                {/* Settings Button */}
                {canEdit && (
                    <button onClick={() => setShowSettings(!showSettings)}
                        className={cn("absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all",
                            showSettings ? "bg-[#0071e3] text-white" : "bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white")}>
                        <Settings size={16} />
                    </button>
                )}

                <div className="p-8 flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="mb-6">
                        {dp.avatarUrl ? (
                            <img src={dp.avatarUrl} alt="" className="w-24 h-24 rounded-full object-cover shadow-xl ring-4 ring-white dark:ring-[#1c1c1e]" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0071e3] to-[#a855f7] flex items-center justify-center text-3xl font-bold text-white shadow-xl ring-4 ring-white dark:ring-[#1c1c1e]">
                                {dp.username?.substring(0, 2).toUpperCase() || '??'}
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <h2 className="text-[24px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
                        {dp.displayName || dp.username || 'Guest'}
                    </h2>
                    {dp.username && <p className="text-[15px] text-[#86868b] mt-1 mb-6">@{dp.username}</p>}

                    {/* Stats */}
                    <div className="flex gap-12 mb-8">
                        <div className="text-center">
                            <div className="text-[32px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight">{dp.score > 0 ? dp.score : '—'}</div>
                            <div className="text-[13px] text-[#86868b] font-medium">Trust Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[32px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight">{dp.vouchCount || '—'}</div>
                            <div className="text-[13px] text-[#86868b] font-medium">Vouches</div>
                        </div>
                    </div>

                    {/* Social Icons */}
                    <div className="flex gap-3 mb-8">
                        {settings.showX && dp.username && (
                            <a href={`https://x.com/${dp.username}`} target="_blank" rel="noopener noreferrer"
                                className="w-11 h-11 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] flex items-center justify-center text-[#1d1d1f] dark:text-white hover:bg-[#000] hover:text-white dark:hover:bg-white dark:hover:text-[#000] transition-all">
                                <XIcon size={17} />
                            </a>
                        )}
                        {settings.showDiscord && discord?.username && (
                            <a href={`https://discord.com/users/${discord.username}`} target="_blank" rel="noopener noreferrer"
                                className="w-11 h-11 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] flex items-center justify-center text-[#5865F2] hover:bg-[#5865F2] hover:text-white transition-all">
                                <DiscordIcon />
                            </a>
                        )}
                        {settings.showFarcaster && farcaster?.username && (
                            <a href={`https://warpcast.com/${farcaster.username}`} target="_blank" rel="noopener noreferrer"
                                className="w-11 h-11 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] flex items-center justify-center text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white transition-all">
                                <FarcasterIcon />
                            </a>
                        )}
                        {settings.showTelegram && telegram?.username && (
                            <a href={`https://t.me/${telegram.username}`} target="_blank" rel="noopener noreferrer"
                                className="w-11 h-11 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] flex items-center justify-center text-[#0088cc] hover:bg-[#0088cc] hover:text-white transition-all">
                                <TelegramIcon />
                            </a>
                        )}
                        {settings.showDeBank && dp.primaryAddress && (
                            <a href={`https://debank.com/profile/${dp.primaryAddress}`} target="_blank" rel="noopener noreferrer"
                                className="w-11 h-11 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] flex items-center justify-center text-[#FE815F] hover:bg-[#FE815F] hover:text-white transition-all">
                                <DeBankIcon />
                            </a>
                        )}
                    </div>

                    {/* Copy Button */}
                    <button onClick={copy}
                        className={cn("w-full h-12 rounded-2xl font-semibold text-[15px] transition-all flex items-center justify-center gap-2",
                            copied ? "bg-[#34c759] text-white" : "bg-[#0071e3] text-white hover:bg-[#0077ed] active:scale-[0.98]")}>
                        {copied ? <><Check size={18} /> Copied!</> : <><Copy size={18} /> Copy Profile Link</>}
                    </button>

                    {/* Ethos Link */}
                    {dp.username && (
                        <a href={`https://app.ethos.network/profile/x/${dp.username}`} target="_blank" rel="noopener noreferrer"
                            className="mt-5 text-[13px] text-[#0071e3] hover:underline flex items-center gap-1.5 font-medium">
                            View on Ethos <ExternalLink size={13} />
                        </a>
                    )}
                </div>

                {/* Settings Panel */}
                {showSettings && canEdit && (
                    <div className="border-t border-[#e5e5e5] dark:border-[#3a3a3c] p-6 bg-[#f9f9f9] dark:bg-[#1c1c1e]">
                        <p className="text-[13px] font-semibold text-[#86868b] mb-4 uppercase tracking-wider">Display Settings</p>
                        <div className="grid grid-cols-2 gap-2">
                            {([
                                ['showX', 'X', XIcon, '#000'],
                                ['showDiscord', 'Discord', DiscordIcon, '#5865F2'],
                                ['showFarcaster', 'Farcaster', FarcasterIcon, '#8b5cf6'],
                                ['showTelegram', 'Telegram', TelegramIcon, '#0088cc'],
                                ['showDeBank', 'DeBank', DeBankIcon, '#FE815F'],
                            ] as const).map(([key, label, Icon, color]) => (
                                <label key={key} className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-[#2c2c2e] cursor-pointer hover:bg-[#f5f5f7] dark:hover:bg-[#3a3a3c] transition-colors text-[13px] border border-[#e5e5e5] dark:border-[#3a3a3c]">
                                    <input type="checkbox" checked={settings[key]} onChange={e => update({ ...settings, [key]: e.target.checked })}
                                        className="rounded border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3] w-4 h-4" />
                                    <span style={{ color }}><Icon /></span>
                                    <span className="text-[#1d1d1f] dark:text-white font-medium">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-8 flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#86868b]">Created by 0xarshia.eth</span>
                    <a href="https://x.com/0xarshia" target="_blank" rel="noopener noreferrer"
                        className="w-5 h-5 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] flex items-center justify-center text-[#1d1d1f] dark:text-white hover:bg-[#000] hover:text-white dark:hover:bg-white dark:hover:text-[#000] transition-all">
                        <XIcon size={9} />
                    </a>
                </div>
                <p className="text-[11px] text-[#86868b]">
                    Powered by <a href="https://ethos.network" target="_blank" className="text-[#0071e3] hover:underline font-medium">Ethos</a>
                </p>
            </div>
        </div>
    );
}
