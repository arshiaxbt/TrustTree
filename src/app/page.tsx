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

      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:bg-purple-900/30 dark:mix-blend-normal"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:bg-yellow-900/30 dark:mix-blend-normal"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-900/30 dark:mix-blend-normal"></div>

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
          <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl">
            <div className="text-center space-y-6">
              <div className="mx-auto flex items-center justify-center">
                <img
                  src="https://thick-emerald-possum.myfilebase.com/ipfs/QmVsumpPwi4ZpCfDrz6Pm7TkhGgt3GLvEi81aVcrr3iRix"
                  alt="TrustTree"
                  className="w-20 h-20 object-contain drop-shadow-lg"
                />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your All-in-One On-Chain Bio
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Unify your digital identity. Show off your reputation score, social links, and vouches in one beautiful profile.
                  <br />
                  <span className="text-xs font-medium text-indigo-500 mt-2 block">Powered by Ethos</span>
                </p>
              </div>
              <LoginButton />
            </div>
          </div>
        )}

        {/* When authenticated but still on home, show profile card */}
        {authenticated && !isRedirecting && (
          <ProfileCard />
        )}

        {/* Footer */}
        <div className="mt-6 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Created by 0xarshia.eth</span>
            <a href="https://x.com/0xarshia" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://github.com/arshiaxbt/TrustTree" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.17 22 16.42 22 12A10 10 0 0 0 12 2z" />
              </svg>
            </a>
          </div>
          <p className="text-xs text-gray-400">Powered by <a href="https://ethos.network" target="_blank" className="text-blue-500 hover:underline">Ethos</a></p>
        </div>
      </div>
    </main>
  );
}
