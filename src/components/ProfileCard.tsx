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

// ========== BRAND SVG ICONS ==========

const XIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const DiscordIcon = () => (
    <svg width="20" height="20" viewBox="0 0 127.14 96.36" fill="currentColor">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
);

const TelegramIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

const GithubIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.17 22 16.42 22 12A10 10 0 0 0 12 2z" />
    </svg>
);

// Logo URLs - user provided IPFS links
const FARCASTER_LOGO = "https://thick-emerald-possum.myfilebase.com/ipfs/QmdoPVt3qcqi9XJcdhEQXUaXu6NvFPjsXzxmjvvUdUQoqP";
const DEBANK_LOGO = "https://thick-emerald-possum.myfilebase.com/ipfs/QmS1TQt75xygZ41BYfNZfXiNwFzTcjcP2YbfjPCypAzHDC";

const EMOJI_OPTIONS = ['🔗', '🌐', '📧', '💼', '🎮', '🎵', '📸', '🎨', '💰', '🛒', '📱', '💻', '🎬', '📚', '✨', '🚀', '💎', '🔥', '⚡', '🌟'];

// ========== INTERFACES ==========

interface ProfileCardProps { initialProfile?: EthosProfile; }
interface ProfileSettings { showX: boolean; showDiscord: boolean; showFarcaster: boolean; showTelegram: boolean; showDeBank: boolean; }
interface CustomLink { id: string; title: string; url: string; emoji: string; }

const defaultSettings: ProfileSettings = { showX: true, showDiscord: true, showFarcaster: true, showTelegram: true, showDeBank: true };

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
    try {
        const res = await fetch(`/api/telegram?userId=${userId}`);
        const data = await res.json();
        return data.username || null;
    } catch {
        return null;
    }
}

// ========== THEME TOGGLE ==========

function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    return (
        <div className="flex items-center gap-0.5 p-1 rounded-full bg-gray-100 dark:bg-gray-800">
            <button onClick={() => setTheme('light')} className={cn("p-2 rounded-full transition-all", theme === 'light' ? "bg-white shadow text-amber-500" : "text-gray-400")} title="Light"><Sun size={14} /></button>
            <button onClick={() => setTheme('system')} className={cn("p-2 rounded-full transition-all", theme === 'system' ? "bg-white dark:bg-gray-700 shadow text-blue-500" : "text-gray-400")} title="System"><Monitor size={14} /></button>
            <button onClick={() => setTheme('dark')} className={cn("p-2 rounded-full transition-all", theme === 'dark' ? "bg-gray-700 shadow text-purple-400" : "text-gray-400")} title="Dark"><Moon size={14} /></button>
        </div>
    );
}

// ========== SEARCH ==========

interface SearchResult { username: string; displayName?: string; avatarUrl?: string; score: number; }

function UserSearch() {
    const [q, setQ] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [show, setShow] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (q.length < 2) { setIsLoading(false); setResults([]); return; }
        // setIsLoading(true); // Moved inside timeout to prevent stuck state on debounce
        const controller = new AbortController();
        const timeoutId = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`https://api.ethos.network/api/v2/users/search?query=${encodeURIComponent(q)}&limit=5`, { headers: { 'X-Ethos-Client': 'trust-tree' }, signal: controller.signal });
                if (res.ok) {
                    const data = await res.json();
                    setResults((data.values || []).slice(0, 5).map((u: { username?: string; displayName?: string; avatarUrl?: string; score?: number }) => ({
                        username: u.username || '', displayName: u.displayName, avatarUrl: u.avatarUrl, score: u.score || 0,
                    })).filter((u: SearchResult) => u.username));
                }
            } catch { } finally { setIsLoading(false); }
        }, 300);
        return () => { clearTimeout(timeoutId); controller.abort(); };
    }, [q]);

    return (
        <div className="relative flex-1">
            <div className="relative">
                <input type="text" value={q} onChange={e => { setQ(e.target.value); setShow(true); }} onFocus={() => setShow(true)} onBlur={() => setTimeout(() => setShow(false), 200)} placeholder="Search users..."
                    className="w-full h-11 px-4 pl-10 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md border border-white/20 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                {isLoading && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
            {show && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    {results.map(u => (
                        <button key={u.username} onMouseDown={() => { setShow(false); setQ(''); router.push(`/${u.username}`); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                            {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                                : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{u.username.substring(0, 2).toUpperCase()}</div>}
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{u.displayName || u.username}</p>
                                <p className="text-xs text-gray-500">@{u.username} · {u.score}</p>
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
    const [telegramLoading, setTelegramLoading] = useState(false);
    const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);

    const [showLinkForm, setShowLinkForm] = useState(false);
    const [editingLink, setEditingLink] = useState<CustomLink | null>(null);
    const [formEmoji, setFormEmoji] = useState('🔗');
    const [formTitle, setFormTitle] = useState('');
    const [formUrl, setFormUrl] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [draggedLink, setDraggedLink] = useState<string | null>(null);

    const wallet = getWallet(user);
    const dp = profile || initialProfile || { id: 'Guest', score: 0, vouchCount: 0, linkedAccounts: [] };
    const profileId = dp.id || dp.username || wallet || 'guest';

    useEffect(() => { if (authenticated && wallet) { getEthosData(wallet).then(d => { if (d) { setMyProfile(d); if (!initialProfile) setProfile(d); } }); } }, [authenticated, wallet, initialProfile]);
    useEffect(() => { if (ready && authenticated && myProfile?.username && dp.username) { setIsOwner(myProfile.username.toLowerCase() === dp.username.toLowerCase()); } else if (ready && authenticated && !initialProfile && profile) { setIsOwner(true); } else setIsOwner(false); }, [ready, authenticated, myProfile, dp, initialProfile, profile]);
    useEffect(() => { if (profileId) { setSettings(loadSettings(profileId)); setCustomLinks(loadCustomLinks(profileId)); } }, [profileId]);

    const telegram = dp.linkedAccounts.find(a => a.service === 'telegram');
    useEffect(() => {
        let isMounted = true;
        if (telegram?.username) {
            setTelegramLoading(true);

            // Add a timeout to force stop loading if API hangs
            const timer = setTimeout(() => {
                if (isMounted) setTelegramLoading(false);
            }, 5000);

            getTelegramUsername(telegram.username)
                .then(username => {
                    if (isMounted) {
                        setTelegramUsername(username);
                        setTelegramLoading(false);
                    }
                })
                .catch(() => {
                    if (isMounted) setTelegramLoading(false);
                })
                .finally(() => clearTimeout(timer));
        }
        return () => { isMounted = false; };
    }, [telegram?.username]);

    const update = (s: ProfileSettings) => { setSettings(s); saveSettings(profileId, s); };
    const updateLinks = (links: CustomLink[]) => { setCustomLinks(links); saveCustomLinks(profileId, links); };
    const copy = () => { navigator.clipboard.writeText(dp.username ? `${window.location.origin}/${dp.username}` : window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    const openAddForm = () => { setEditingLink(null); setFormEmoji('🔗'); setFormTitle(''); setFormUrl(''); setShowLinkForm(true); };
    const openEditForm = (link: CustomLink) => { setEditingLink(link); setFormEmoji(link.emoji); setFormTitle(link.title); setFormUrl(link.url); setShowLinkForm(true); };
    const saveLink = () => {
        if (!formTitle || !formUrl) return;
        const url = formUrl.startsWith('http') ? formUrl : `https://${formUrl}`;
        if (editingLink) { updateLinks(customLinks.map(l => l.id === editingLink.id ? { ...l, emoji: formEmoji, title: formTitle, url } : l)); }
        else { updateLinks([...customLinks, { id: Date.now().toString(), emoji: formEmoji, title: formTitle, url }]); }
        setShowLinkForm(false); setShowEmojiPicker(false);
    };
    const cancelForm = () => { setShowLinkForm(false); setShowEmojiPicker(false); setEditingLink(null); };
    const removeLink = (id: string) => updateLinks(customLinks.filter(l => l.id !== id));

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

    // Consistent button style - all same size, same padding
    const btnBase = "w-11 h-11 rounded-full flex items-center justify-center transition-all overflow-hidden";
    const btnBg = "bg-gray-100 dark:bg-gray-800";

    return (
        <div className="w-full max-w-md mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
                <UserSearch />
                <ThemeToggle />
            </div>

            <div className="relative bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden">
                {canEdit && (
                    <button onClick={() => setShowSettings(!showSettings)}
                        className={cn("absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            showSettings ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white")}>
                        <Settings size={18} />
                    </button>
                )}

                <div className="p-8 flex flex-col items-center text-center">
                    <div className="mb-5">
                        {dp.avatarUrl ? <img src={dp.avatarUrl} alt="" className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-800" />
                            : <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white">{dp.username?.substring(0, 2).toUpperCase() || '??'}</div>}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{dp.displayName || dp.username || 'Guest'}</h2>
                    {dp.username && <p className="text-gray-500 mt-1 mb-5">@{dp.username}</p>}

                    <div className="flex gap-10 mb-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{dp.score > 0 ? dp.score : '—'}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Trust</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{dp.vouchCount || '—'}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Vouches</div>
                        </div>
                    </div>

                    {/* Social Icons - All consistent size */}
                    <div className="flex gap-2.5 mb-6">
                        {settings.showX && dp.username && (
                            <a href={`https://x.com/${dp.username}`} target="_blank" rel="noopener noreferrer"
                                className={cn(btnBase, btnBg, "text-gray-700 dark:text-white hover:bg-black hover:text-white")}>
                                <XIcon size={18} />
                            </a>
                        )}
                        {settings.showDiscord && discord?.username && (
                            <a href={`https://discord.com/users/${discord.username}`} target="_blank" rel="noopener noreferrer"
                                className={cn(btnBase, btnBg, "text-[#5865F2] hover:bg-[#5865F2] hover:text-white")}>
                                <DiscordIcon />
                            </a>
                        )}
                        {settings.showFarcaster && farcaster?.username && (
                            <a href={`https://farcaster.xyz/~/profiles/${farcaster.username}`} target="_blank" rel="noopener noreferrer"
                                className={cn(btnBase, btnBg, "text-purple-800 hover:text-white hover:bg-[#855DCD]")}>
                                <img src={FARCASTER_LOGO} alt="Farcaster" className="w-5 h-5 object-contain" />
                            </a>
                        )}
                        {settings.showTelegram && telegram?.username && (
                            telegramUsername ? (
                                <a href={`https://t.me/${telegramUsername}`} target="_blank" rel="noopener noreferrer"
                                    className={cn(btnBase, btnBg, "text-[#0088CC] hover:bg-[#0088CC] hover:text-white")}>
                                    <TelegramIcon />
                                </a>
                            ) : telegramLoading ? (
                                <div className={cn(btnBase, btnBg)}>
                                    <Loader2 size={18} className="text-[#0088CC] animate-spin" />
                                </div>
                            ) : (
                                <div className={cn(btnBase, btnBg, "opacity-50")} title="Telegram connected">
                                    <TelegramIcon />
                                </div>
                            )
                        )}
                        {settings.showDeBank && dp.primaryAddress && (
                            <a href={`https://debank.com/profile/${dp.primaryAddress}`} target="_blank" rel="noopener noreferrer"
                                className={cn(btnBase, btnBg, "hover:bg-[#FF6B4A] hover:text-white")}>
                                <img src={DEBANK_LOGO} alt="DeBank" className="w-5 h-5 object-contain" />
                            </a>
                        )}
                    </div>

                    {customLinks.length > 0 && (
                        <div className="w-full space-y-2 mb-6">
                            {customLinks.map(link => (
                                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group">
                                    <span className="text-xl">{link.emoji}</span>
                                    <span className="flex-1 text-sm font-medium text-gray-800 dark:text-white text-left">{link.title}</span>
                                    <ExternalLink size={14} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white" />
                                </a>
                            ))}
                        </div>
                    )}

                    <button onClick={copy}
                        className={cn("w-full h-12 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                            copied ? "bg-green-500 text-white" : "bg-blue-500 text-white hover:bg-blue-600")}>
                        {copied ? <><Check size={18} /> Copied!</> : <><Copy size={18} /> Copy Profile Link</>}
                    </button>

                    {dp.username && (
                        <a href={`https://app.ethos.network/profile/x/${dp.username}`} target="_blank" rel="noopener noreferrer"
                            className="mt-4 text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                            View on Ethos <ExternalLink size={12} />
                        </a>
                    )}
                </div>

                {showSettings && canEdit && (
                    <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-900/50 space-y-6">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Show/Hide</p>
                            <div className="grid grid-cols-2 gap-2">
                                {(['showX', 'showDiscord', 'showFarcaster', 'showTelegram', 'showDeBank'] as const).map((key) => {
                                    const labels: Record<string, string> = { showX: 'X', showDiscord: 'Discord', showFarcaster: 'Farcaster', showTelegram: 'Telegram', showDeBank: 'DeBank' };
                                    return (
                                        <label key={key} className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-gray-800 cursor-pointer text-sm">
                                            <input type="checkbox" checked={settings[key]} onChange={e => update({ ...settings, [key]: e.target.checked })} className="rounded text-blue-500" />
                                            <span className="text-gray-700 dark:text-white">{labels[key]}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Custom Links</p>
                                <button onClick={openAddForm} className="text-blue-500 text-sm font-medium flex items-center gap-1"><Plus size={14} /> Add</button>
                            </div>

                            {showLinkForm && (
                                <div className="mb-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-medium text-gray-500 mb-3">{editingLink ? 'Edit Link' : 'Add New Link'}</p>
                                    <div className="flex gap-2 mb-2">
                                        <div className="relative">
                                            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-12 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600">{formEmoji}</button>
                                            {showEmojiPicker && (
                                                <div className="absolute top-12 left-0 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 w-48">
                                                    <div className="grid grid-cols-5 gap-1">
                                                        {EMOJI_OPTIONS.map(e => (
                                                            <button key={e} onClick={() => { setFormEmoji(e); setShowEmojiPicker(false); }}
                                                                className={cn("w-8 h-8 rounded text-lg hover:bg-gray-100 dark:hover:bg-gray-700", formEmoji === e && "bg-blue-100 dark:bg-blue-900")}>{e}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Title" className="flex-1 h-10 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm border-0 focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <input type="text" value={formUrl} onChange={e => setFormUrl(e.target.value)} placeholder="https://example.com" className="w-full h-10 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm mb-3 border-0 focus:ring-2 focus:ring-blue-500" />
                                    <div className="flex gap-2">
                                        <button onClick={cancelForm} className="flex-1 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
                                        <button onClick={saveLink} className="flex-1 h-9 rounded-lg bg-blue-500 text-sm text-white hover:bg-blue-600">Save</button>
                                    </div>
                                </div>
                            )}

                            {customLinks.length > 0 && (
                                <div className="space-y-2">
                                    {customLinks.map(link => (
                                        <div key={link.id} draggable onDragStart={() => handleDragStart(link.id)} onDragOver={e => handleDragOver(e, link.id)} onDragEnd={handleDragEnd}
                                            className={cn("flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-gray-800 cursor-grab group", draggedLink === link.id && "opacity-50 scale-95")}>
                                            <GripVertical size={14} className="text-gray-400 flex-shrink-0" />
                                            <span className="text-lg flex-shrink-0">{link.emoji}</span>
                                            <span className="flex-1 text-sm text-gray-700 dark:text-white truncate">{link.title}</span>
                                            <button onClick={() => openEditForm(link)} className="text-gray-400 hover:text-blue-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Pencil size={14} /></button>
                                            <button onClick={() => removeLink(link.id)} className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Created by 0xarshia.eth</span>
                    <a href="https://x.com/0xarshia" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><XIcon size={14} /></a>
                    <a href="https://github.com/arshiaxbt/TrustTree" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><GithubIcon size={14} /></a>
                </div>
                <p className="text-xs text-gray-400">Powered by <a href="https://ethos.network" target="_blank" className="text-blue-500 hover:underline">Ethos</a></p>
            </div>
        </div>
    );
}
