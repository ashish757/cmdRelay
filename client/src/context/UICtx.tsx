import { createContext, useContext, useState, type ReactNode } from 'react';
import type {ViewMode} from "../types/controlLayouts.ts";


interface UIContextType {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    activeLayoutId: string | null;
    setActiveLayoutId: (id: string) => void;
    isMenuOpen: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
}

const UI = createContext<UIContextType | null>(null);

export function useUI() {
    const ctx = useContext(UI);
    if (!ctx) throw new Error('useUI must be used within UIProvider');
    return ctx;
}

export function UIProvider({ children }: { children: ReactNode }) {
    const savedLayout = localStorage.getItem('activeLayoutId');
    const savedViewMode: ViewMode = localStorage.getItem('viewMode') as ViewMode;

    const [activeLayoutId, setActiveLayoutIdState] = useState<string | null>(savedLayout || 'l_global_desktop');
    const [viewMode, setView] = useState<ViewMode>(savedViewMode || 'controlLayout');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const setViewMode = (mode: ViewMode) => {
        localStorage.setItem('viewMode', mode);
        setView(mode);
    }

    const setActiveLayoutId = (id: string) => {
        localStorage.setItem('activeLayoutId', id);
        setActiveLayoutIdState(id);
    };



    return (
        <UI.Provider value={{ viewMode, setViewMode, activeLayoutId, setActiveLayoutId, isMenuOpen, setIsMenuOpen }}>
            {children}
        </UI.Provider>
    );
}