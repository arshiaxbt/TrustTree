'use client';

import { LoginButton } from "@/components/LoginButton";
import { ProfileCard } from "@/components/ProfileCard";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getEthosData } from "@/lib/ethos";
import { Twitter } from "lucide-react";

// Helper to get wallet address from Privy user
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

  return user.wallet?.address || null;
}

export default function Home() {
  const { authenticated, ready, user } = usePrivy();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect to user's profile page after login
  useEffect(() => {
    async function redirectToProfile() {
      if (ready && authenticated && user && !isRedirecting) {
        setIsRedirecting(true);

        const walletAddress = getEthosWalletAddress(user);
        if (walletAddress) {
          const profile = await getEthosData(walletAddress);
          if (profile?.username) {
            router.push(`/${profile.username}`);
            return;
          }
        }

        setIsRedirecting(false);
      }
    }

    redirectToProfile();
  }, [ready, authenticated, user, router, isRedirecting]);

  // Show loading while redirecting
  if (isRedirecting) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white dark:bg-black/95">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden bg-white dark:bg-black/95">

      {/* Navbar / Header */}
      <div className="absolute top-6 right-6 z-10">
        <LoginButton />
      </div>

      <div className="z-10 w-full max-w-xl items-center justify-between font-mono text-sm lg:flex flex-col gap-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            TrustTree
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">
            Your on-chain reputation.
          </p>
        </div>

        {/* When not authenticated, show login prompt */}
        {!authenticated && (
          <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto flex items-center justify-center">
                <span className="text-2xl">🌲</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  View Your Trust Score
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connect with Ethos to see your reputation score, vouches, and more.
                </p>
              </div>
              <LoginButton />
            </div>
          </div>
        )}

        {/* When authenticated but still on home, show profile card */}
        {authenticated && !isRedirecting && (
          <ProfileCard isOwner={true} />
        )}

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">Created by</span>
          <a
            href="https://x.com/0xarshia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-xs"
          >
            <Twitter size={12} />
            0xarshia.eth
          </a>
        </div>
      </div>
    </main>
  );
}
