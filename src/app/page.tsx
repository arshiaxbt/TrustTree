import { LoginButton } from "@/components/LoginButton";
import { ProfileCard } from "@/components/ProfileCard";
import { EthosProfile } from "@/lib/ethos";

// Mock Data for the "Show Off" aspect (The Card Owner)
const MOCK_PROFILE: EthosProfile = {
  id: "satoshi.ethos",
  score: 2500, // Gold Badge
  vouchCount: 420,
  linkedAccounts: [
    { service: 'x', username: '@satoshi' },
    { service: 'discord', username: 'satoshi#1337' }
  ]
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden">

      {/* Navbar / Header */}
      <div className="absolute top-6 right-6 z-10">
        <LoginButton />
      </div>

      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex flex-col gap-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            TrustTree
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Prove your reputation on-chain.
          </p>
        </div>

        <ProfileCard profile={MOCK_PROFILE} />

        <div className="text-center text-xs text-gray-400">
          <p>Login to view secret content (Requires Score {'>'} 1200)</p>
        </div>
      </div>
    </main>
  );
}
