'use client';

import { usePrivy } from '@privy-io/react-auth';

export function LoginButton() {
    const { login, ready, authenticated, user, logout } = usePrivy();

    if (!ready) {
        return null; // Or a loading spinner
    }

    if (authenticated && user?.wallet) {
        return (
            <div className="flex items-center gap-2">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Connected: {user.wallet.address.substring(0, 6)}...
                </div>
                <button
                    onClick={logout}
                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                    Logout
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={login}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
            Connect Ethos
        </button>
    );
}
