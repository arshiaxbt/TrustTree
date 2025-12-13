import { LoginButton } from "@/components/LoginButton";
import { ProfileCard } from "@/components/ProfileCard";

export default function Home() {
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

        {/* ProfileCard will handle its own data fetching based on auth state */}
        <ProfileCard />

        <div className="text-center text-xs text-gray-400">
          <p>Login to view your score and secret content.</p>
        </div>
      </div>
    </main>
  );
}
