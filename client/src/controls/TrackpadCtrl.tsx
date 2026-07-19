import React, { useRef, useState } from 'react';
import { useNet } from '../context/NetCtx.tsx';

const getMid = (t: React.TouchList) => {
    let x = 0;
    let y = 0;
    for (let i = 0; i < t.length; i++) {
        x += t[i].clientX;
        y += t[i].clientY;
    }
    return { x: x / t.length, y: y / t.length };
};

export function TrackpadCtrl() {
    const { sendPayload } = useNet();
    const [rotation, setRotation] = useState<boolean>(true);

    const status = useRef<'idle' | 'secondaryClick' | 'scroll'>('idle');
    const currCoords = useRef<{x: number | null, y: number | null}>({x: null, y: null});
    const startCoords = useRef<{x: number | null, y: number | null}>({x: null, y: null});

    const sAcc = useRef<{x: number, y: number}>({x: 0, y: 0});
    const sThresh = 1;

    const toggleRotation = () => {
        setRotation((prev) => !prev);
    }

    const onStart = (e: React.TouchEvent) => {
        const { x, y } = getMid(e.touches);
        currCoords.current = { x, y };

        if(e.touches.length === 2) {
            status.current = 'secondaryClick';
            startCoords.current = { x, y };
        }
    };

    const onMove = (e: React.TouchEvent) => {
        if (currCoords.current.x === null || currCoords.current.y === null) return;
        const scrollFriction = 0.1;

        const { x: cx, y: cy } = getMid(e.touches);

        const rawDx = cx - currCoords.current.x;
        const rawDy = cy - currCoords.current.y;

        const speedX = Math.abs(rawDx);
        const speedY = Math.abs(rawDy);

        const accelX = 1 + (speedX / 10);
        const accelY = 1 + (speedY / 10);

        const aDx = rawDx * accelX * scrollFriction;
        const aDy = rawDy * accelY * scrollFriction;

        const dx = rotation ? aDx : -aDy;
        const dy = rotation ? aDy : aDx;

        if(e.touches.length === 2) {
            const tDx = Math.abs(cx - (startCoords.current.x ?? cx));
            const tDy = Math.abs(cy - (startCoords.current.y ?? cy));

            if(tDx > 10 || tDy > 10) {
                status.current = 'scroll';
            }

            if(status.current === 'scroll') {
                sAcc.current.x += dx;
                sAcc.current.y += dy;

                const tX = Math.trunc(sAcc.current.x / sThresh);
                const tY = Math.trunc(sAcc.current.y / sThresh);

                if(tX !== 0 || tY !== 0) {
                    sAcc.current.x -= tX * sThresh;
                    sAcc.current.y -= tY * sThresh;
                    sendPayload({ actionType: "scroll", payload: { dx: -tX, dy: -tY } });
                }
            }
        } else if(e.touches.length === 1) {
            sendPayload({ actionType: "mouseMove", payload: {dx: rotation ? rawDx : -rawDy, dy: rotation ? rawDy : rawDx} });
        }

        currCoords.current = {x: cx, y: cy};
    };

    const onEnd = () => {
        if(status.current === 'secondaryClick') {
            sendPayload({ actionType: "secondaryClick", payload: {} });
        }

        status.current = 'idle';
        currCoords.current = {x: null, y: null};
        startCoords.current = {x: null, y: null};
        sAcc.current = {x: 0, y: 0};
    };

    const onClick = () => sendPayload({ actionType: "singleClick", payload: {} });
    const onDoubleClick = () => sendPayload({ actionType: "doubleClick", payload: {} });

    return (
        <div className="flex-1 w-full flex flex-col">
            <div className="absolute top-4 left-5 h-8 w-8 text-text-main" onClick={toggleRotation}>
                <svg viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg" aria-labelledby="rotateIconTitle" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" fill="none" color="currentColor"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title id="rotateIconTitle">Rotate</title> <path d="M22 12l-3 3-3-3"></path> <path d="M2 12l3-3 3 3"></path> <path d="M19.016 14v-1.95A7.05 7.05 0 0 0 8 6.22"></path> <path d="M16.016 17.845A7.05 7.05 0 0 1 5 12.015V10"></path> <path strokeLinecap="round" d="M5 10V9"></path> <path strokeLinecap="round" d="M19 15v-1"></path> </g></svg>
            </div>
            <div
                className="flex-1 w-full bg-background rounded-3xl border border-border touch-none shadow-inner"
                onTouchStart={onStart}
                onTouchMove={onMove}
                onTouchEnd={onEnd}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
            />
        </div>
    );
}