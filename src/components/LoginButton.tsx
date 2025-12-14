'use client';

import { usePrivy } from '@privy-io/react-auth';
import { LogOut } from 'lucide-react';

/**
 * Gets the Ethos wallet address from the user's linked accounts.
 * When logging in with Ethos (cross-app auth via Privy), the wallet is stored
 * in linkedAccounts as a 'cross_app' type with embeddedWallets array.
 */
function getEthosWalletAddress(user: ReturnType<typeof usePrivy>['user']): string | null {
    if (!user) return null;

    // First, check for cross-app linked accounts (Ethos login)
    const crossAppAccount = user.linkedAccounts?.find(
        (account) => account.type === 'cross_app'
    );

    if (crossAppAccount && 'embeddedWallets' in crossAppAccount) {
        const wallets = (crossAppAccount as { embeddedWallets?: Array<{ address: string }> }).embeddedWallets;
        if (wallets?.[0]?.address) {
            return wallets[0].address;
        }
    }

    // Fallback to regular wallet address
    return user.wallet?.address || null;
}

export function LoginButton() {
    const { login, logout, authenticated, user } = usePrivy();

    // If authenticated, show user info and logout button
    if (authenticated && user) {
        const walletAddress = getEthosWalletAddress(user);
        const displayIdentifier = walletAddress
            ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
            : user.email?.address
                ? user.email.address
                : 'User';

        return (
            <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                    {displayIdentifier}
                </div>
                <button
                    onClick={logout}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={login}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
            Log in with Ethos
        </button>
    );
}
