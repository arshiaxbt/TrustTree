'use client';

import { EthosProfile, getEthosData } from '@/lib/ethos';
import { usePrivy } from '@privy-io/react-auth';
import { Copy, Settings, Search, Check, ExternalLink, Loader2, Plus, Trash2, GripVertical, Sun, Moon, Monitor, Pencil } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ========== OFFICIAL BRAND SVG ICONS ==========

const XIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const DiscordIcon = () => (
    <svg width="18" height="18" viewBox="0 0 127.14 96.36" fill="currentColor">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
);

const FarcasterIcon = () => (
    <svg width="18" height="18" viewBox="0 0 1260 1260" fill="currentColor">
        <path d="M947.747 1259.61H311.861C139.901 1259.61 0 1119.72 0 947.752V311.871C0 139.907 139.901 0.00585938 311.861 0.00585938H947.747C1119.71 0.00585938 1259.61 139.907 1259.61 311.871V947.752C1259.61 1119.72 1119.71 1259.61 947.747 1259.61Z" fill="#855DCD" />
        <path d="M826.513 398.633L764.404 631.889L826.513 398.633H433.108L371.001 631.889L433.108 398.633H826.513ZM826.513 398.633H893.47V816.082C893.47 842.096 872.476 863.089 846.463 863.089H826.513H433.108H413.158C387.145 863.089 366.151 842.096 366.151 816.082V398.633H433.108" fill="#855DCD" />
        <path d="M433.108 631.889H826.513" stroke="white" strokeWidth="83.7044" strokeLinecap="round" />
        <path d="M705.152 631.889V758.613C705.152 791.248 678.735 817.665 646.1 817.665H612.87C580.235 817.665 553.818 791.248 553.818 758.613V631.889" stroke="white" strokeWidth="83.7044" strokeLinecap="round" />
    </svg>
);

const TelegramIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

const DeBankIcon = () => (
    <svg width="18" height="18" viewBox="0 0 40 40" fill="currentColor">
        <circle cx="20" cy="20" r="20" fill="#FE815F" />
        <path d="M11 11h10c4.97 0 9 4.03 9 9s-4.03 9-9 9H11V11zm4 4v10h6c2.76 0 5-2.24 5-5s-2.24-5-5-5h-6z" fill="white" />
    </svg>
);

// ========== INTERFACES ==========

interface ProfileCardProps { initialProfile?: EthosProfile; }
interface ProfileSettings { showX: boolean; showDiscord: boolean; showFarcaster: boolean; showTelegram: boolean; showDeBank: boolean; socialOrder: string[]; }
interface CustomLink { id: string; title: string; url: string; emoji: string; }

const defaultSocialOrder = ['x', 'discord', 'farcaster', 'telegram', 'debank'];
const defaultSettings: ProfileSettings = { showX: true, showDiscord: true, showFarcaster: true, showTelegram: true, showDeBank: true, socialOrder: defaultSocialOrder };

function loadSettings(id: string): ProfileSettings {
    if (typeof window === 'undefined') return defaultSettings;
    try { const s = localStorage.getItem(`tt-settings-${id}`); if (s) return { ...defaultSettings, ...JSON.parse(s) }; } catch { }
    return defaultSettings;
}
function saveSettings(id: string, s: ProfileSettings) {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(`tt-settings-${id}`, JSON.stringify(s)); } catch { }
}
function loadCustomLinks(id: string): CustomLink[] {
    if (typeof window === 'undefined') return [];
    try { const s = localStorage.getItem(`tt-links-${id}`); if (s) return JSON.parse(s); } catch { }
    return [];
}
function saveCustomLinks(id: string, links: CustomLink[]) {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(`tt-links-${id}`, JSON.stringify(links)); } catch { }
}
function getWallet(user: ReturnType<typeof usePrivy>['user']): string | null {
    if (!user) return null;
    const ca = user.linkedAccounts?.find(a => a.type === 'cross_app');
    if (ca && 'embeddedWallets' in ca) { const w = (ca as { embeddedWallets?: { address: string }[] }).embeddedWallets; if (w?.[0]?.address) return w[0].address; }
    const wa = user.linkedAccounts?.find(a => a.type === 'wallet' && 'address' in a);
    if (wa && 'address' in wa) return (wa as { address: string }).address;
    return user.wallet?.address || null;
}

async function getTelegramUsername(userId: string): Promise<string | null> {
    try { const res = await fetch(`/api/telegram?userId=${userId}`); if (res.ok) { const data = await res.json(); return data.username || null; } } catch { }
    return null;
}

// ========== THEME TOGGLE ==========

function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    return (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-xl">
            {[
                { value: 'light', Icon: Sun },
                { value: 'system', Icon: Monitor },
                { value: 'dark', Icon: Moon },
            ].map(({ value, Icon }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value as 'light' | 'dark' | 'system')}
                    className={cn(
                        "p-2 rounded-lg transition-all",
                        theme === value ? "bg-white dark:bg-white/20 shadow-sm text-blue-500" : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
                    )}
                >
                    <Icon size={14} />
                </button>
            ))}
        </div>
    );
}

// ========== SEARCH ==========

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
        <div className="relative w-full max-w-sm mx-auto mb-6">
            <div className="relative">
                <input type="text" value={q} onChange={e => { setQ(e.target.value); setShow(true); }} onFocus={() => setShow(true)} onBlur={() => setTimeout(() => setShow(false), 150)} placeholder="Search users..."
                    className="w-full h-12 px-5 pl-12 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/50 dark:border-white/20 text-[15px] text-gray-900 dark:text-white placeholder-gray-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                {loading && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />}
            </div>
            {show && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden z-50">
                    {results.map(u => (
                        <button key={u.username} onMouseDown={() => { setShow(false); setQ(''); router.push(`/${u.username}`); }}
                            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/50 dark:hover:bg-white/10 transition-all">
                            {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50" />
                                : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">{u.username.substring(0, 2).toUpperCase()}</div>}
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
    const [telegramUsername, setTelegramUsername] = useState<string | null>(null);
    const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [newLinkEmoji, setNewLinkEmoji] = useState('🔗');
    const [showAddLink, setShowAddLink] = useState(false);
    const [editingLink, setEditingLink] = useState<string | null>(null);
    const [draggedLink, setDraggedLink] = useState<string | null>(null);

    const wallet = getWallet(user);
    const dp = profile || initialProfile || { id: 'Guest', score: 0, vouchCount: 0, linkedAccounts: [] };
    const profileId = dp.id || dp.username || wallet || 'guest';

    useEffect(() => { if (authenticated && wallet) { getEthosData(wallet).then(d => { if (d) { setMyProfile(d); if (!initialProfile) setProfile(d); } }); } }, [authenticated, wallet, initialProfile]);
    useEffect(() => { if (ready && authenticated && myProfile?.username && dp.username) { setIsOwner(myProfile.username.toLowerCase() === dp.username.toLowerCase()); } else if (ready && authenticated && !initialProfile && profile) { setIsOwner(true); } else setIsOwner(false); }, [ready, authenticated, myProfile, dp, initialProfile, profile]);
    useEffect(() => { if (profileId) { setSettings(loadSettings(profileId)); setCustomLinks(loadCustomLinks(profileId)); } }, [profileId]);

    const telegram = dp.linkedAccounts.find(a => a.service === 'telegram');
    useEffect(() => { if (telegram?.username) { getTelegramUsername(telegram.username).then(setTelegramUsername); } }, [telegram?.username]);

    const update = (s: ProfileSettings) => { setSettings(s); saveSettings(profileId, s); };
    const updateLinks = (links: CustomLink[]) => { setCustomLinks(links); saveCustomLinks(profileId, links); };
    const copy = () => { navigator.clipboard.writeText(dp.username ? `${window.location.origin}/${dp.username}` : window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    const addLink = () => {
        if (!newLinkTitle || !newLinkUrl) return;
        const newLink: CustomLink = { id: Date.now().toString(), title: newLinkTitle, url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`, emoji: newLinkEmoji };
        updateLinks([...customLinks, newLink]);
        setNewLinkTitle(''); setNewLinkUrl(''); setNewLinkEmoji('🔗'); setShowAddLink(false);
    };

    const removeLink = (id: string) => updateLinks(customLinks.filter(l => l.id !== id));

    const updateLinkEmoji = (id: string, emoji: string) => {
        updateLinks(customLinks.map(l => l.id === id ? { ...l, emoji } : l));
        setEditingLink(null);
    };

    const handleDragStart = (id: string) => setDraggedLink(id);
    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedLink || draggedLink === targetId) return;
        const oldIndex = customLinks.findIndex(l => l.id === draggedLink);
        const newIndex = customLinks.findIndex(l => l.id === targetId);
        const newLinks = [...customLinks];
        const [removed] = newLinks.splice(oldIndex, 1);
        newLinks.splice(newIndex, 0, removed);
        updateLinks(newLinks);
    };
    const handleDragEnd = () => setDraggedLink(null);

    const discord = dp.linkedAccounts.find(a => a.service === 'discord');
    const farcaster = dp.linkedAccounts.find(a => a.service === 'farcaster');
    const canEdit = authenticated && isOwner;

    const socialButtons = [
        { key: 'x', show: settings.showX && dp.username, href: `https://x.com/${dp.username}`, Icon: XIcon, color: 'text-gray-700 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black' },
        { key: 'discord', show: settings.showDiscord && discord?.username, href: `https://discord.com/users/${discord?.username}`, Icon: DiscordIcon, color: 'text-[#5865F2] hover:bg-[#5865F2] hover:text-white' },
        { key: 'farcaster', show: settings.showFarcaster && farcaster?.username, href: `https://warpcast.com/${farcaster?.username}`, Icon: FarcasterIcon, color: '' },
        { key: 'telegram', show: settings.showTelegram && telegram?.username && telegramUsername, href: `https://t.me/${telegramUsername}`, Icon: TelegramIcon, color: 'text-[#0088CC] hover:bg-[#0088CC] hover:text-white' },
        { key: 'debank', show: settings.showDeBank && dp.primaryAddress, href: `https://debank.com/profile/${dp.primaryAddress}`, Icon: DeBankIcon, color: '' },
    ];

    const orderedSocials = (settings.socialOrder || defaultSocialOrder).map(key => socialButtons.find(s => s.key === key)).filter(Boolean);

    return (
        <div className="w-full max-w-[420px] mx-auto px-4">
            {/* Header with Search and Theme */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex-1"><UserSearch /></div>
                <ThemeToggle />
            </div>

            {/* Glass Card */}
            <div className="relative bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-[32px] shadow-[0_8px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_60px_rgba(0,0,0,0.5)] border border-white/60 dark:border-white/10 overflow-hidden">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-emerald-400/10 via-cyan-400/10 to-blue-400/10 rounded-full blur-3xl pointer-events-none" />

                {canEdit && (
                    <button onClick={() => setShowSettings(!showSettings)}
                        className={cn("absolute top-5 right-5 z-10 w-10 h-10 rounded-2xl backdrop-blur-xl flex items-center justify-center transition-all",
                            showSettings ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-white/50 dark:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white")}>
                        <Settings size={18} />
                    </button>
                )}

                <div className="relative p-10 flex flex-col items-center text-center">
                    <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-30 scale-110" />
                        {dp.avatarUrl ? <img src={dp.avatarUrl} alt="" className="relative w-28 h-28 rounded-full object-cover ring-4 ring-white/80 dark:ring-white/20 shadow-2xl" />
                            : <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white ring-4 ring-white/80 dark:ring-white/20 shadow-2xl">{dp.username?.substring(0, 2).toUpperCase() || '??'}</div>}
                    </div>

                    <h2 className="text-[26px] font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">{dp.displayName || dp.username || 'Guest'}</h2>
                    {dp.username && <p className="text-[15px] text-gray-500 mt-1 mb-6">@{dp.username}</p>}

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

                    {/* Social Icons */}
                    <div className="flex gap-3 mb-6">
                        {orderedSocials.map(s => s && s.show && (
                            <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer"
                                className={cn("w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl flex items-center justify-center transition-all shadow-lg overflow-hidden hover:scale-105", s.color)}>
                                <s.Icon />
                            </a>
                        ))}
                    </div>

                    {/* Custom Links */}
                    {customLinks.length > 0 && (
                        <div className="w-full space-y-2 mb-6">
                            {customLinks.map(link => (
                                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl hover:bg-white dark:hover:bg-white/20 transition-all shadow-md group">
                                    <span className="text-xl">{link.emoji}</span>
                                    <span className="flex-1 text-[15px] font-medium text-gray-800 dark:text-white">{link.title}</span>
                                    <ExternalLink size={14} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white" />
                                </a>
                            ))}
                        </div>
                    )}

                    <button onClick={copy}
                        className={cn("w-full h-14 rounded-2xl font-semibold text-[15px] transition-all flex items-center justify-center gap-2.5",
                            copied ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 active:scale-[0.98]")}>
                        {copied ? <><Check size={18} /> Copied!</> : <><Copy size={18} /> Copy Profile Link</>}
                    </button>

                    {dp.username && (
                        <a href={`https://app.ethos.network/profile/x/${dp.username}`} target="_blank" rel="noopener noreferrer"
                            className="mt-5 text-[13px] text-blue-500 hover:text-blue-600 flex items-center gap-1.5 font-medium">
                            View on Ethos <ExternalLink size={13} />
                        </a>
                    )}
                </div>

                {/* Settings Panel */}
                {showSettings && canEdit && (
                    <div className="border-t border-white/30 dark:border-white/10 p-6 bg-white/50 dark:bg-white/5 backdrop-blur-xl space-y-6">
                        <div>
                            <p className="text-[13px] font-semibold text-gray-500 mb-3 uppercase tracking-wider">Show/Hide Socials</p>
                            <div className="grid grid-cols-2 gap-2">
                                {(['showX', 'showDiscord', 'showFarcaster', 'showTelegram', 'showDeBank'] as const).map((key) => {
                                    const icons = { showX: XIcon, showDiscord: DiscordIcon, showFarcaster: FarcasterIcon, showTelegram: TelegramIcon, showDeBank: DeBankIcon };
                                    const labels = { showX: 'X', showDiscord: 'Discord', showFarcaster: 'Farcaster', showTelegram: 'Telegram', showDeBank: 'DeBank' };
                                    const Icon = icons[key];
                                    return (
                                        <label key={key} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 dark:bg-white/10 cursor-pointer hover:bg-white dark:hover:bg-white/20 transition-all text-[13px]">
                                            <input type="checkbox" checked={settings[key]} onChange={e => update({ ...settings, [key]: e.target.checked })} className="rounded border-gray-300 text-blue-500 w-4 h-4" />
                                            <Icon />
                                            <span className="text-gray-700 dark:text-white font-medium">{labels[key]}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Custom Links</p>
                                <button onClick={() => setShowAddLink(!showAddLink)} className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"><Plus size={14} /> Add</button>
                            </div>

                            {showAddLink && (
                                <div className="space-y-2 mb-4 p-4 rounded-xl bg-white/70 dark:bg-white/10">
                                    <div className="flex gap-2">
                                        <input type="text" value={newLinkEmoji} onChange={e => setNewLinkEmoji(e.target.value)} placeholder="🔗" maxLength={2} className="w-12 h-10 text-center rounded-lg bg-white dark:bg-white/20 border border-gray-200 dark:border-white/10 text-lg" />
                                        <input type="text" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} placeholder="Title" className="flex-1 h-10 px-3 rounded-lg bg-white dark:bg-white/20 border border-gray-200 dark:border-white/10 text-sm" />
                                    </div>
                                    <input type="text" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="https://..." className="w-full h-10 px-3 rounded-lg bg-white dark:bg-white/20 border border-gray-200 dark:border-white/10 text-sm" />
                                    <button onClick={addLink} className="w-full h-10 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">Add Link</button>
                                </div>
                            )}

                            {customLinks.length > 0 && (
                                <div className="space-y-2">
                                    {customLinks.map(link => (
                                        <div key={link.id} draggable onDragStart={() => handleDragStart(link.id)} onDragOver={e => handleDragOver(e, link.id)} onDragEnd={handleDragEnd}
                                            className={cn("flex items-center gap-2 p-3 rounded-xl bg-white/70 dark:bg-white/10 cursor-grab transition-all", draggedLink === link.id && "opacity-50 scale-95")}>
                                            <GripVertical size={14} className="text-gray-400" />
                                            {editingLink === link.id ? (
                                                <input type="text" value={link.emoji} onChange={e => updateLinkEmoji(link.id, e.target.value)} onBlur={() => setEditingLink(null)} autoFocus maxLength={2}
                                                    className="w-8 h-8 text-center bg-white dark:bg-white/20 rounded border text-lg" />
                                            ) : (
                                                <button onClick={() => setEditingLink(link.id)} className="text-xl hover:scale-110 transition-transform">{link.emoji}</button>
                                            )}
                                            <span className="flex-1 text-sm text-gray-700 dark:text-white truncate">{link.title}</span>
                                            <button onClick={() => setEditingLink(link.id)} className="text-gray-400 hover:text-blue-500 p-1"><Pencil size={12} /></button>
                                            <button onClick={() => removeLink(link.id)} className="text-red-500 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-400">Created by 0xarshia.eth</span>
                    <a href="https://x.com/0xarshia" target="_blank" rel="noopener noreferrer" className="w-5 h-5 rounded-lg bg-white/50 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-white hover:bg-black hover:text-white transition-all"><XIcon size={9} /></a>
                </div>
                <p className="text-[11px] text-gray-400">Powered by <a href="https://ethos.network" target="_blank" className="text-blue-500 hover:underline font-medium">Ethos</a></p>
            </div>
        </div>
    );
}
