import React, { useState, useRef, useEffect } from "react";
import { useNet } from "../context/NetCtx.tsx";
import type { ControlComponent } from "../types/controlLayouts.ts";

export const GenericButtonCtrl = ({ component }: { component: ControlComponent }) => {
    const data = component.data;
    const { sendPayload } = useNet();

    const [isPressed, setIsPressed] = useState(false);

    const repeatTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const repeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => stopRepeat();
    }, []);

    const stopRepeat = () => {
        if (repeatTimeout.current) clearTimeout(repeatTimeout.current);
        if (repeatInterval.current) clearInterval(repeatInterval.current);
    };

    const handlePointerDown = (event: React.PointerEvent) => {
        event.preventDefault();

        if (!data.actionType || data.actionType === "none" || isPressed) return;

        setIsPressed(true);
        (event.target as HTMLElement).setPointerCapture(event.pointerId);

        if (data.actionType === "macro") {
            sendPayload({
                actionType: "macro",
                payload: {
                    steps: data.actionValue
                }
            });
        } else {
            sendPayload({
                actionType: data.actionType,
                payload: {
                    keyId: data.actionValue as string,
                    state: "down"
                }
            });


            const modifiers = ["Shift", "Control", "Alt", "Meta", "OS"];
            const isModifier = modifiers.includes(data.actionValue as string);

            if (!isModifier && data.actionType === "keyPress") {

                repeatTimeout.current = setTimeout(() => {

                    repeatInterval.current = setInterval(() => {
                        sendPayload({
                            actionType: data.actionType,
                            payload: {
                                keyId: data.actionValue as string,
                                state: "click"
                            }
                        });
                    }, 50);
                }, 400);
            }
        }
    };

    const handlePointerRelease = (event: React.PointerEvent) => {
        event.preventDefault();

        if (!data.actionType || data.actionType === "none" || !isPressed) return;

        setIsPressed(false);
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);

        // 3. Stop the auto-repeat loop when the user lets go
        stopRepeat();

        if (data.actionType !== "macro") {
            sendPayload({
                actionType: data.actionType,
                payload: {
                    keyId: data.actionValue as string,
                    state: "up"
                }
            });
        }
    };

    return (
        <div
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerRelease}
            onPointerCancel={handlePointerRelease}
            className={`
                w-full h-full rounded-lg transition-all duration-75 flex items-center justify-center text-sm md:text-lg font-bold shadow-md select-none touch-none border-2
                ${isPressed || isLatched
                ? 'bg-primary border-primary text-white scale-[0.97] shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)]'
                : 'bg-surface border-border/50 text-text-main'
            }
            `}
        >
            {component.label || "Btn"}
        </div>
    );
};
