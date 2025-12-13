'use client';

import { usePrivy } from '@privy-io/react-auth';
import { LogOut } from 'lucide-react';

export function LoginButton() {
    const { login, logout, authenticated, user } = usePrivy();

    // If authenticated, show user info and logout button
    if (authenticated && user) {
        const displayIdentifier = user.wallet?.address
            ? `${user.wallet.address.substring(0, 6)}...`
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
            Log in
        </button>
    );
}
