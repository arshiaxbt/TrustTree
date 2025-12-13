'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
            config={{
                loginMethodsAndOrder: {
                    primary: ['privy:cm5l76en107pt1lpl2ve2ocfy'], // Specific for "Log in with Ethos"
                },
                appearance: {
                    theme: 'light',
                    accentColor: '#676FFF',
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}
