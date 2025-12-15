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
                    logo: 'https://thick-emerald-possum.myfilebase.com/ipfs/QmVsumpPwi4ZpCfDrz6Pm7TkhGgt3GLvEi81aVcrr3iRix',
                },
                // Restrict login to only "Log in with Ethos"
                loginMethodsAndOrder: {
                    primary: ['privy:cm5l76en107pt1lpl2ve2ocfy'],
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
