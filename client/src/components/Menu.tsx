import { useUI } from '../context/UICtx';
import {menuControlConfig} from "../config/ctrlConfig.ts";

export function MenuOverlay() {
    const { isMenuOpen, setIsMenuOpen, activeLayout, setActiveLayout } = useUI();

    if (!isMenuOpen) return null;

    return (
        <div className="fixed inset-0 bg-neutral-900 z-40 flex flex-col p-8 text-white">
            <button onClick={() => setIsMenuOpen(false)} className="self-end text-2xl mb-8">X</button>
            <div className="text-3xl mb-8 font-bold">Layouts</div>
            <div className="grid grid-cols-3 gap-6">
                {
                    menuControlConfig.map((menuItem) => (
                        <button
                            key={menuItem.id}
                            onClick={() => { setActiveLayout(menuItem.id); setIsMenuOpen(false); }}
                            className={`p-4 text-left rounded ${activeLayout === menuItem.id ? 'bg-green-600' : 'bg-neutral-800'}`}
                        >
                            {menuItem.title}
                        </button>
                    ))
                }
            </div>

        </div>
    );
}