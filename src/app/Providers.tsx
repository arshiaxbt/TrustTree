'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <PrivyProvider
            appId="cmj4fhb6302yhjm0d7tuhgds4"
            config={{
                // Customize Privy's appearance
                appearance: {
                    theme: 'light',
                    accentColor: '#676FFF',
                    logo: 'https://developers.ethos.network/logo.png', // Optional: Use Ethos or TrustTree logo
                },
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                    createOnLogin: 'users-without-wallets',
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}
