'use client';

import { EthosProfile, getEthosData } from '@/lib/ethos';
import { usePrivy } from '@privy-io/react-auth';
import { Copy, Settings, Search, Check, ExternalLink, Loader2, Plus, Trash2, GripVertical, Sun, Moon, Monitor, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ========== BRAND SVG ICONS ==========

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
    <svg width="18" height="18" viewBox="0 0 1000 1000" fill="none">
        <rect width="1000" height="1000" rx="200" fill="#855DCD" />
        <path d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z" fill="white" />
        <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z" fill="white" />
        <path d="M871.111 253.333H693.333V746.667C681.06 746.667 671.111 756.616 671.111 768.889V795.556H666.667C654.394 795.556 644.444 805.505 644.444 817.778V844.445H893.333V817.778C893.333 805.505 883.384 795.556 871.111 795.556H866.667V768.889C866.667 756.616 856.717 746.667 844.444 746.667V351.111H868.889L897.778 253.333H871.111Z" fill="white" />
    </svg>
);

const TelegramIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="24" fill="#0088CC" />
        <path d="M10.9 23.3c6.5-2.8 10.8-4.7 13-5.6 6.2-2.6 7.5-3 8.3-3 .2 0 .6 0 .9.3.2.2.3.5.3.7v.6c-.2 2.5-1.2 8.5-1.7 11.3-.2 1.2-.6 1.6-1.1 1.6-.9.1-1.6-.6-2.5-1.2-1.4-.9-2.2-1.5-3.5-2.4-1.5-1-.6-1.6.3-2.5.2-.2 4.2-3.9 4.3-4.2 0-.1 0-.2-.1-.3-.1 0-.2 0-.3 0-.1 0-2.3 1.5-6.6 4.4-.6.4-1.2.6-1.7.6-.6 0-1.6-.3-2.4-.6-1-.3-1.8-.5-1.7-1 0-.3.4-.6 1.1-.9z" fill="white" />
    </svg>
);

const DeBankIcon = () => (
    <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="#FE815F" />
        <path d="M11 11h10c4.97 0 9 4.03 9 9s-4.03 9-9 9H11V11zm4 4v10h6c2.76 0 5-2.24 5-5s-2.24-5-5-5h-6z" fill="white" />
    </svg>
);

// Common emojis for picker
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
        if (res.ok) {
            const data = await res.json();
            return data.username || null;
        }
    } catch (e) {
        console.error('[Telegram] Error:', e);
    }
    return null;
}

// ========== THEME TOGGLE ==========

function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center p-1 rounded-full bg-gray-100 dark:bg-gray-800">
            <button
                onClick={() => setTheme('light')}
                className={cn("p-2 rounded-full transition-all", theme === 'light' ? "bg-white shadow text-yellow-500" : "text-gray-400 hover:text-gray-600")}
                title="Light mode"
            >
                <Sun size={16} />
            </button>
            <button
                onClick={() => setTheme('system')}
                className={cn("p-2 rounded-full transition-all", theme === 'system' ? "bg-white dark:bg-gray-700 shadow text-blue-500" : "text-gray-400 hover:text-gray-600")}
                title="System mode"
            >
                <Monitor size={16} />
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={cn("p-2 rounded-full transition-all", theme === 'dark' ? "bg-gray-700 shadow text-purple-400" : "text-gray-400 hover:text-gray-600")}
                title="Dark mode"
            >
                <Moon size={16} />
            </button>
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
        <div className="relative flex-1">
            <div className="relative">
                <input type="text" value={q} onChange={e => { setQ(e.target.value); setShow(true); }} onFocus={() => setShow(true)} onBlur={() => setTimeout(() => setShow(false), 150)} placeholder="Search users..."
                    className="w-full h-11 px-4 pl-10 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                {loading && <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />}
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

// ========== EMOJI PICKER ==========

function EmojiPicker({ value, onChange, onClose }: { value: string; onChange: (emoji: string) => void; onClose: () => void }) {
    return (
        <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="grid grid-cols-5 gap-2 mb-3">
                {EMOJI_OPTIONS.map(emoji => (
                    <button key={emoji} onClick={() => onChange(emoji)}
                        className={cn("w-9 h-9 rounded-lg text-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all", value === emoji && "bg-blue-100 dark:bg-blue-900")}>
                        {emoji}
                    </button>
                ))}
            </div>
            <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                <button onClick={onClose} className="flex-1 h-8 rounded-lg bg-blue-500 text-sm text-white hover:bg-blue-600">Done</button>
            </div>
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
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [newLinkEmoji, setNewLinkEmoji] = useState('🔗');
    const [showAddLink, setShowAddLink] = useState(false);
    const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
    const [editEmoji, setEditEmoji] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
    const [draggedLink, setDraggedLink] = useState<string | null>(null);

    const wallet = getWallet(user);
    const dp = profile || initialProfile || { id: 'Guest', score: 0, vouchCount: 0, linkedAccounts: [] };
    const profileId = dp.id || dp.username || wallet || 'guest';

    useEffect(() => { if (authenticated && wallet) { getEthosData(wallet).then(d => { if (d) { setMyProfile(d); if (!initialProfile) setProfile(d); } }); } }, [authenticated, wallet, initialProfile]);
    useEffect(() => { if (ready && authenticated && myProfile?.username && dp.username) { setIsOwner(myProfile.username.toLowerCase() === dp.username.toLowerCase()); } else if (ready && authenticated && !initialProfile && profile) { setIsOwner(true); } else setIsOwner(false); }, [ready, authenticated, myProfile, dp, initialProfile, profile]);
    useEffect(() => { if (profileId) { setSettings(loadSettings(profileId)); setCustomLinks(loadCustomLinks(profileId)); } }, [profileId]);

    // Telegram username resolution
    const telegram = dp.linkedAccounts.find(a => a.service === 'telegram');
    useEffect(() => {
        if (telegram?.username) {
            setTelegramLoading(true);
            getTelegramUsername(telegram.username).then(username => {
                setTelegramUsername(username);
                setTelegramLoading(false);
            });
        }
    }, [telegram?.username]);

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

    const startEditEmoji = (link: CustomLink) => {
        setEditingLinkId(link.id);
        setEditEmoji(link.emoji);
        setShowEmojiPicker(link.id);
    };

    const saveEmojiEdit = () => {
        if (editingLinkId && editEmoji) {
            updateLinks(customLinks.map(l => l.id === editingLinkId ? { ...l, emoji: editEmoji } : l));
        }
        setEditingLinkId(null);
        setShowEmojiPicker(null);
    };

    const cancelEmojiEdit = () => {
        setEditingLinkId(null);
        setShowEmojiPicker(null);
        setEditEmoji('');
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

    return (
        <div className="w-full max-w-md mx-auto px-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <UserSearch />
                <ThemeToggle />
            </div>

            {/* Card */}
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                {canEdit && (
                    <button onClick={() => setShowSettings(!showSettings)}
                        className={cn("absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            showSettings ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white")}>
                        <Settings size={18} />
                    </button>
                )}

                <div className="p-8 flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="mb-5">
                        {dp.avatarUrl ? <img src={dp.avatarUrl} alt="" className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-800" />
                            : <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white">{dp.username?.substring(0, 2).toUpperCase() || '??'}</div>}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{dp.displayName || dp.username || 'Guest'}</h2>
                    {dp.username && <p className="text-gray-500 mt-1 mb-5">@{dp.username}</p>}

                    {/* Stats */}
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

                    {/* Social Icons */}
                    <div className="flex gap-3 mb-6">
                        {settings.showX && dp.username && (
                            <a href={`https://x.com/${dp.username}`} target="_blank" rel="noopener noreferrer"
                                className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-white hover:bg-black hover:text-white transition-all">
                                <XIcon size={18} />
                            </a>
                        )}
                        {settings.showDiscord && discord?.username && (
                            <a href={`https://discord.com/users/${discord.username}`} target="_blank" rel="noopener noreferrer"
                                className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#5865F2] hover:bg-[#5865F2] hover:text-white transition-all">
                                <DiscordIcon />
                            </a>
                        )}
                        {settings.showFarcaster && farcaster?.username && (
                            <a href={`https://warpcast.com/${farcaster.username}`} target="_blank" rel="noopener noreferrer"
                                className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-[#855DCD] transition-all overflow-hidden">
                                <FarcasterIcon />
                            </a>
                        )}
                        {settings.showTelegram && telegram?.username && (
                            telegramUsername ? (
                                <a href={`https://t.me/${telegramUsername}`} target="_blank" rel="noopener noreferrer"
                                    className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-[#0088CC] transition-all overflow-hidden">
                                    <TelegramIcon />
                                </a>
                            ) : telegramLoading ? (
                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <Loader2 size={18} className="text-[#0088CC] animate-spin" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center opacity-50" title="Telegram connected">
                                    <TelegramIcon />
                                </div>
                            )
                        )}
                        {settings.showDeBank && dp.primaryAddress && (
                            <a href={`https://debank.com/profile/${dp.primaryAddress}`} target="_blank" rel="noopener noreferrer"
                                className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-[#FE815F] transition-all overflow-hidden">
                                <DeBankIcon />
                            </a>
                        )}
                    </div>

                    {/* Custom Links */}
                    {customLinks.length > 0 && (
                        <div className="w-full space-y-2 mb-6">
                            {customLinks.map(link => (
                                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group">
                                    <span className="text-xl">{link.emoji}</span>
                                    <span className="flex-1 text-sm font-medium text-gray-800 dark:text-white">{link.title}</span>
                                    <ExternalLink size={14} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white" />
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Copy Button */}
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

                {/* Settings Panel */}
                {showSettings && canEdit && (
                    <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-900/50 space-y-6">
                        {/* Social Toggles */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Show/Hide</p>
                            <div className="grid grid-cols-2 gap-2">
                                {([
                                    ['showX', 'X', XIcon],
                                    ['showDiscord', 'Discord', DiscordIcon],
                                    ['showFarcaster', 'Farcaster', FarcasterIcon],
                                    ['showTelegram', 'Telegram', TelegramIcon],
                                    ['showDeBank', 'DeBank', DeBankIcon],
                                ] as const).map(([key, label, Icon]) => (
                                    <label key={key} className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-gray-800 cursor-pointer text-sm">
                                        <input type="checkbox" checked={settings[key]} onChange={e => update({ ...settings, [key]: e.target.checked })} className="rounded text-blue-500" />
                                        <Icon />
                                        <span className="text-gray-700 dark:text-white">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Custom Links */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Custom Links</p>
                                <button onClick={() => setShowAddLink(!showAddLink)} className="text-blue-500 text-sm font-medium flex items-center gap-1">
                                    <Plus size={14} /> Add
                                </button>
                            </div>

                            {showAddLink && (
                                <div className="space-y-2 mb-4 p-4 rounded-xl bg-white dark:bg-gray-800">
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <button onClick={() => setShowEmojiPicker('new')} className="w-12 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-xl flex items-center justify-center">{newLinkEmoji}</button>
                                            {showEmojiPicker === 'new' && (
                                                <EmojiPicker value={newLinkEmoji} onChange={setNewLinkEmoji} onClose={() => setShowEmojiPicker(null)} />
                                            )}
                                        </div>
                                        <input type="text" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} placeholder="Title" className="flex-1 h-10 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm" />
                                    </div>
                                    <input type="text" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="https://..." className="w-full h-10 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm" />
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowAddLink(false)} className="flex-1 h-10 rounded-lg bg-gray-200 dark:bg-gray-600 text-sm">Cancel</button>
                                        <button onClick={addLink} className="flex-1 h-10 rounded-lg bg-blue-500 text-white text-sm">Save</button>
                                    </div>
                                </div>
                            )}

                            {customLinks.length > 0 && (
                                <div className="space-y-2">
                                    {customLinks.map(link => (
                                        <div key={link.id} draggable onDragStart={() => handleDragStart(link.id)} onDragOver={e => handleDragOver(e, link.id)} onDragEnd={handleDragEnd}
                                            className={cn("flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-gray-800 cursor-grab", draggedLink === link.id && "opacity-50")}>
                                            <GripVertical size={14} className="text-gray-400" />
                                            <div className="relative">
                                                <button onClick={() => startEditEmoji(link)} className="text-xl hover:scale-110 transition-transform">{link.emoji}</button>
                                                {showEmojiPicker === link.id && (
                                                    <EmojiPicker value={editEmoji} onChange={setEditEmoji} onClose={saveEmojiEdit} />
                                                )}
                                            </div>
                                            <span className="flex-1 text-sm text-gray-700 dark:text-white truncate">{link.title}</span>
                                            <button onClick={() => removeLink(link.id)} className="text-red-500 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Created by 0xarshia.eth</span>
                    <a href="https://x.com/0xarshia" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><XIcon size={10} /></a>
                </div>
                <p className="text-xs text-gray-400">Powered by <a href="https://ethos.network" target="_blank" className="text-blue-500 hover:underline">Ethos</a></p>
            </div>
        </div>
    );
}
