'use client';

import { usePrivy } from '@privy-io/react-auth';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getEthosData } from '@/lib/ethos';

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

export function LoginButton() {
    const { login, logout, authenticated, user, ready } = usePrivy();
    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Fetch user profile to get username for redirect
    useEffect(() => {
        async function fetchProfile() {
            if (authenticated && user) {
                const walletAddress = getEthosWalletAddress(user);
                if (walletAddress) {
                    const profile = await getEthosData(walletAddress);
                    if (profile?.username) {
                        setUsername(profile.username);
                        setAvatarUrl(profile.avatarUrl || null);
                    }
                }
            }
        }
        fetchProfile();
    }, [authenticated, user]);

    const handleProfileClick = () => {
        if (username) {
            router.push(`/${username}`);
        }
    };

    if (authenticated && user) {
        const walletAddress = getEthosWalletAddress(user);
        const displayName = username
            ? `@${username}`
            : walletAddress
                ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
                : 'User';

        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-2 h-9 px-3 rounded-full bg-[#f5f5f7] dark:bg-[#2d2d2f] hover:bg-[#e8e8ed] dark:hover:bg-[#3d3d3f] transition-colors cursor-pointer"
                    title="Go to your profile"
                >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#a855f7] flex items-center justify-center">
                            <User size={12} className="text-white" />
                        </div>
                    )}
                    <span className="text-[13px] font-medium text-[#1d1d1f] dark:text-white">
                        {displayName}
                    </span>
                </button>
                <button
                    onClick={logout}
                    className="w-9 h-9 rounded-full bg-[#f5f5f7] dark:bg-[#2d2d2f] hover:bg-[#e8e8ed] dark:hover:bg-[#3d3d3f] flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
                    title="Logout"
                >
                    <LogOut size={15} />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={login}
            disabled={!ready}
            className="h-9 px-5 rounded-full bg-[#0071e3] text-white text-[13px] font-medium hover:bg-[#0077ed] disabled:opacity-50 transition-colors"
        >
            Log in with Ethos
        </button>
    );
}
