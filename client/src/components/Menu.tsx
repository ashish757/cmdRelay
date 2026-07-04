import {useUI} from '../context/UICtx';
import {menuControlConfig, preBuiltLayoutsMenu,} from "../config/ctrlConfig.ts";
import type {ControlLayout} from "../types/controlLayouts.ts";

export function MenuOverlay() {
    const { isMenuOpen, setIsMenuOpen, activeLayout, setActiveLayout, setActivePage } = useUI();

    if (!isMenuOpen) return null;

    const controlLayouts: ControlLayout[] = JSON.parse(localStorage.getItem("layouts") || "[]");

    return (
        <div className="fixed inset-0 bg-neutral-900 z-40 flex flex-col p-8 text-white">
            <div className="text-3xl mb-8 font-bold">Your Layouts</div>

            <div className="grid grid-cols-3 gap-6">
                {
                    controlLayouts.map((control ) => (
                        <button
                            key={control.id}
                            onClick={() => { setActiveLayout(control.id); setIsMenuOpen(false); }}
                            className={`p-4 text-left rounded ${activeLayout === control.id ? 'bg-green-600' : 'bg-neutral-800'}`}
                        >
                            {control.title}
                        </button>
                    ))
                }
            </div>
    <br/>
            <div className="text-3xl mb-8 font-bold">Options</div>
            <div className="grid grid-cols-3 gap-6">
                {
                    preBuiltLayoutsMenu.map((menuItem) => (
                        <button
                            key={menuItem.id}
                            onClick={() => { setActiveLayout(menuItem.id); setIsMenuOpen(false); }}
                            className={`p-4 text-left rounded ${activeLayout === menuItem.id ? 'bg-green-600' : 'bg-neutral-800'}`}
                        >
                            {menuItem.title}
                        </button>
                    ))
                }
                {
                    menuControlConfig.map((menuItem) => (
                        <button
                            key={menuItem.id}
                            onClick={() => { setActivePage(menuItem.id); setIsMenuOpen(false); }}
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