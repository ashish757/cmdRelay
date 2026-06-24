import { type ReactNode } from 'react';
import { NetProvider } from './NetCtx';
import { UIProvider } from './UICtx';

export function Provider({ children }: { children: ReactNode }) {
    return (
        <NetProvider>
            <UIProvider>
                {children}
            </UIProvider>
        </NetProvider>
    );
}