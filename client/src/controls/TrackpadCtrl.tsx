import { useRef } from 'react';
import { useNet } from '../context/NetCtx.tsx';

export function TrackpadCtrl() {
    const { sendPayload } = useNet();
    const lx = useRef<number | null>(null);
    const ly = useRef<number | null>(null);

    const onStart = (e: React.TouchEvent) => {
        lx.current = e.touches[0].clientX;
        ly.current = e.touches[0].clientY;
    };

    const onMove = (e: React.TouchEvent) => {
        if (lx.current === null || ly.current === null) return;

        const cx = e.touches[0].clientX;
        const cy = e.touches[0].clientY;

        const dx = cx - lx.current;
        const dy = cy - ly.current;

        sendPayload({ actionType: "mouseMove", payload: { dx, dy } });

        lx.current = cx;
        ly.current = cy;
    };

    const onEnd = () => {
        lx.current = null;
        ly.current = null;
    };

    return (
        <div className="flex-1 w-full p-4 flex flex-col">
            <div
                className="flex-1 w-full bg-neutral-900 rounded-3xl border border-neutral-800 touch-none shadow-inner"
                onTouchStart={onStart}
                onTouchMove={onMove}
                onTouchEnd={onEnd}
            />
        </div>
    );
}