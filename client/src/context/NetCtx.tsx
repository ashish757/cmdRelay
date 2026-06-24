import { createContext, useContext, type ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const Net = createContext<any>(null);

export function useNet() {
    return useContext(Net);
}

export function NetProvider({ children }: { children: ReactNode }) {
    const { connectionStatus, send } = useWebSocket();

    return (
        <Net.Provider value={{ connectionStatus, send }}>
            {children}
        </Net.Provider>
);
}