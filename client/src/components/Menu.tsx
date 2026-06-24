import { useUI } from '../context/UICtx';

export function MenuOverlay() {
    const { isMenuOpen, setIsMenuOpen, activeLayout, setActiveLayout } = useUI();

    if (!isMenuOpen) return null;

    return (
        <div className="fixed inset-0 bg-neutral-900 z-40 flex flex-col p-8 text-white">
            <button onClick={() => setIsMenuOpen(false)} className="self-end text-2xl mb-8">X</button>
            <div className="text-3xl mb-8 font-bold">Layouts</div>
            <button
                onClick={() => { setActiveLayout('trackpad'); setIsMenuOpen(false); }}
                className={`p-4 mb-4 text-left rounded ${activeLayout === 'trackpad' ? 'bg-green-600' : 'bg-neutral-800'}`}
            >
                Trackpad
            </button>
            <button
                onClick={() => { setActiveLayout('media'); setIsMenuOpen(false); }}
                className={`p-4 text-left rounded ${activeLayout === 'media' ? 'bg-green-600' : 'bg-neutral-800'}`}
            >
                Media Controls
            </button>
        </div>
    );
}