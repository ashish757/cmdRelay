import { createContext, useContext, useState, type ReactNode } from 'react';

const UI = createContext<any>(null);

export function useUI() {
    return useContext(UI);
}

export function UIProvider({ children }: { children: ReactNode }) {
    const [activeLayout, setLayoutState] = useState<string>(localStorage.getItem('layout') || 'arrowKeys');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const setActiveLayout = (v: string) => {
        localStorage.setItem('layout', v);
        setLayoutState(v);
    };

    return (
        <UI.Provider value={{ activeLayout, setActiveLayout, isMenuOpen, setIsMenuOpen }}>
            {children}
        </UI.Provider>
    );
}