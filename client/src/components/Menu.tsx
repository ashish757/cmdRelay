import { useUI } from '../context/UICtx';
import {MENU_OPTIONS, type MenuItem, preBuiltLayouts} from "../config/ctrlConfig.ts";
import type { ControlLayout } from "../types/controlLayouts.ts";
import { useTheme } from '../hooks/useTheme';
import { Moon, Sun } from 'lucide-react';
import type {ViewMode} from "../types/controlLayouts.ts";

export function MenuOverlay() {
    const { isMenuOpen, setIsMenuOpen, activeLayoutId, setActiveLayoutId, viewMode, setViewMode } = useUI();
    const { theme, toggleTheme } = useTheme();

    if (!isMenuOpen) return null;

    const customLayouts: ControlLayout[] = JSON.parse(localStorage.getItem("layouts") || "[]");

    const handleMenuOptionClick = (control: ControlLayout | MenuItem, view: ViewMode) => {
        if(view == "controlLayout") setActiveLayoutId(control.id);
        setViewMode(view)
        setIsMenuOpen(false);
    }

    return (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-40 flex flex-col p-10 text-text-main overflow-y-auto">
            
            <div className="flex justify-between items-center mb-6 pr-4">
                <h2 className="text-2xl font-bold">Your Layouts</h2>
                
                <button
                    onClick={toggleTheme}
                    className="p-3 rounded-full bg-surface border border-border text-text-muted hover:text-text-main hover:bg-border/50 transition-all flex items-center justify-center shadow-sm"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {customLayouts.map((control) => (
                    <button
                        key={control.id}
                        onClick={() => handleMenuOptionClick(control, "controlLayout")}
                        className={`p-5 text-left rounded-xl font-semibold transition-all ${
                            activeLayoutId === control.id && viewMode === 'controlLayout'
                                ? 'bg-primary text-white shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.4)]'
                                : 'bg-surface border border-border text-text-muted hover:text-text-main hover:border-text-muted'
                        }`}
                    >
                        {control.title}
                    </button>
                ))}
            </div>

            <h2 className="text-2xl mt-12 mb-6 font-bold">Templates & Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {preBuiltLayouts.map((control: ControlLayout) => (
                    <button
                        key={control.id}
                        onClick={() => handleMenuOptionClick(control, "controlLayout")}
                        className={`p-5 text-left rounded-xl font-semibold transition-all ${
                            activeLayoutId === control.id && viewMode === 'controlLayout'
                                ? 'bg-primary text-white shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.4)]'
                                : 'bg-surface border border-border text-text-muted hover:text-text-main hover:border-text-muted'
                        }`}
                    >
                        {control.title}
                    </button>
                ))}

                {MENU_OPTIONS.map((menuItem) => (
                    <button
                        key={menuItem.id}
                        onClick={() => handleMenuOptionClick(menuItem, menuItem.viewType)}
                        className={`p-5 text-left rounded-xl font-semibold transition-all ${
                             viewMode === menuItem.viewType
                                ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                : 'bg-surface border border-border text-text-muted hover:text-text-main hover:border-text-muted'
                        }`}
                    >
                        {menuItem.title}
                    </button>
                ))}

            </div>
        </div>
    );
}