import { useUI } from '../context/UICtx';

export function MenuOverlay() {
    const { isMenuOpen, setIsMenuOpen, activeLayout, setActiveLayout } = useUI();

    const layouts = [
        {id: "arrowKeys", title: "Arrow Keys" },
        {id: "trackpad", title: "Track Pad" },
        {id: "media", title: "Media Controls" },


    ]

    if (!isMenuOpen) return null;

    return (
        <div className="fixed inset-0 bg-neutral-900 z-40 flex flex-col p-8 text-white">
            <button onClick={() => setIsMenuOpen(false)} className="self-end text-2xl mb-8">X</button>
            <div className="text-3xl mb-8 font-bold">Layouts</div>
            <div className="grid grid-cols-3 gap-6">
                {
                    layouts.map((layout) => (
                        <button
                            key={layout.id}
                            onClick={() => { setActiveLayout(layout.id); setIsMenuOpen(false); }}
                            className={`p-4 text-left rounded ${activeLayout === layout.id ? 'bg-green-600' : 'bg-neutral-800'}`}
                        >
                            {layout.title}
                        </button>
                    ))
                }
            </div>

        </div>
    );
}