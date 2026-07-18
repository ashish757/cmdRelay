import React, { useState } from "react";
import { useNet } from "../context/NetCtx.tsx";
import type { ControlComponent } from "../types/controlLayouts.ts";

export const GenericButtonCtrl = ({ component }: { component: ControlComponent }) => {
    const data = component.data;
    const { sendPayload } = useNet();

    const [isPressed, setIsPressed] = useState(false);

    const handlePointerDown = (event: React.PointerEvent) => {
        event.preventDefault();

        if (!data.actionType || data.actionType === "none" || isPressed) return;

        setIsPressed(true);
        (event.target as HTMLElement).setPointerCapture(event.pointerId);

        sendPayload({
            actionType: data.actionType,
            payload: {
                keyId: data.actionValue,
                state: "down"
            }
        });
    };

    const handlePointerRelease = (event: React.PointerEvent) => {
        event.preventDefault();

        if (!data.actionType || data.actionType === "none" || !isPressed) return;

        setIsPressed(false);
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);

        sendPayload({
            actionType: data.actionType,
            payload: {
                keyId: data.actionValue,
                state: "up"
            }
        });
    };

    return (
        <div
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerRelease}
            onPointerCancel={handlePointerRelease}
            className={`
                w-full h-full rounded-lg transition-all duration-75 flex items-center justify-center text-sm md:text-lg font-bold shadow-md select-none touch-none border-2
                ${isPressed
                ? 'bg-indigo-600 border-indigo-400 text-white scale-[0.97] shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)]'
                : 'bg-zinc-800 border-zinc-700/50 text-zinc-200'
            }
            `}
        >
            {component.label || "Btn"}
        </div>
    );
};