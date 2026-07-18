import { useUI } from '../context/UICtx';
import { menuControlConfig, preBuiltLayoutsMenu } from "../config/ctrlConfig.ts";
import type { ControlLayout } from "../types/controlLayouts.ts";

export function MenuOverlay() {
    const { isMenuOpen, setIsMenuOpen, activeLayoutId, setActiveLayoutId, viewMode, setViewMode } = useUI();

    if (!isMenuOpen) return null;

    const customLayouts: ControlLayout[] = JSON.parse(localStorage.getItem("layouts") || "[]");

    return (
        <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-md z-40 flex flex-col p-10 text-white overflow-y-auto">
            <h2 className="text-2xl mb-6 font-bold text-zinc-100">Your Layouts</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {customLayouts.map((control) => (
                    <button
                        key={control.id}
                        onClick={() => {
                            setActiveLayoutId(control.id);
                            setIsMenuOpen(false);
                        }}
                        className={`p-5 text-left rounded-xl font-semibold transition-all ${
                            activeLayoutId === control.id && viewMode === 'renderer'
                                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                        }`}
                    >
                        {control.title}
                    </button>
                ))}
            </div>

            <h2 className="text-2xl mt-12 mb-6 font-bold text-zinc-100">Templates & Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {preBuiltLayoutsMenu.map((menuItem) => (
                    <button
                        key={menuItem.id}
                        onClick={() => {
                            setActiveLayoutId(menuItem.id);
                            setIsMenuOpen(false);
                        }}
                        className={`p-5 text-left rounded-xl font-semibold transition-all ${
                            activeLayoutId === menuItem.id && viewMode === 'renderer'
                                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                        }`}
                    >
                        {menuItem.title}
                    </button>
                ))}

                {menuControlConfig.map((menuItem) => (
                    <button
                        key={menuItem.id}
                        onClick={() => {
                            setViewMode('builder');
                            setIsMenuOpen(false);
                        }}
                        className={`p-5 text-left rounded-xl font-semibold transition-all ${
                            viewMode === 'builder'
                                ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                        }`}
                    >
                        {menuItem.title}
                    </button>
                ))}
            </div>
        </div>
    );
}