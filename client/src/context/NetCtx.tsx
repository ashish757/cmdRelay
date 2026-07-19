import { createContext, useContext, type ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useUI } from './UICtx.tsx';

const Net = createContext<any>(null);

export function useNet() {
    return useContext(Net);
}

export function NetProvider({ children }: { children: ReactNode }) {
    const { setActiveLayoutId, viewMode } = useUI();

    const { connectionStatus, sendPayload, currentApp, layouts, knownApps } = useWebSocket(setActiveLayoutId, viewMode);

    return (
        <Net.Provider value={{ connectionStatus, sendPayload, currentApp, layouts, knownApps }}>
            {children}
        </Net.Provider>
    );
}