import {useRef, useState} from 'react';
import { useNet } from '../context/NetCtx.tsx';

export function TrackpadCtrl() {
    const { sendPayload } = useNet();
    const lx = useRef<number | null>(null);
    const ly = useRef<number | null>(null);
    const [rotation, setRotation] = useState<boolean>(true); // 1 for vertical

    const toggleRotation = () => {
        setRotation((prev) => !prev);

    }
    const onStart = (e: React.TouchEvent) => {
        lx.current = e.touches[0].clientX;
        ly.current = e.touches[0].clientY;
    };

    const onMove = (e: React.TouchEvent) => {
        if (lx.current === null || ly.current === null) return;

        const cx = e.touches[0].clientX;
        const cy = e.touches[0].clientY;

        const rawDx = cx - lx.current;
        const rawDy = cy - ly.current;

        const dx = rotation ? rawDx : -rawDy;
        const dy = rotation ? rawDy : rawDx;

        sendPayload({ actionType: "mouseMove", payload: {dx, dy} });

        lx.current = cx;
        ly.current = cy;
    };

    const onEnd = () => {
        lx.current = null;
        ly.current = null;
    };

    return (
        <div className="flex-1 w-full p-4 flex flex-col">
            <div className="absolute top-4 left-6 h-8 w-8" onClick={toggleRotation}>
                <svg viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg" aria-labelledby="rotateIconTitle" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter" fill="none" color="#FFFFFF"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title id="rotateIconTitle">Rotate</title> <path d="M22 12l-3 3-3-3"></path> <path d="M2 12l3-3 3 3"></path> <path d="M19.016 14v-1.95A7.05 7.05 0 0 0 8 6.22"></path> <path d="M16.016 17.845A7.05 7.05 0 0 1 5 12.015V10"></path> <path stroke-linecap="round" d="M5 10V9"></path> <path stroke-linecap="round" d="M19 15v-1"></path> </g></svg>
            </div>
            <div
                className="flex-1 w-full bg-neutral-900 rounded-3xl border border-neutral-800 touch-none shadow-inner"
                onTouchStart={onStart}
                onTouchMove={onMove}
                onTouchEnd={onEnd}
            />
        </div>
    );
}