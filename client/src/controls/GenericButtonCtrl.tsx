import React, { useState, useRef, useEffect } from "react";
import { useNet } from "../context/NetCtx.tsx";
import type { ControlComponent } from "../types/controlLayouts.ts";

export const GenericButtonCtrl = ({ component }: { component: ControlComponent }) => {
    const data = component.data;
    const { sendPayload } = useNet();

    const [isPressed, setIsPressed] = useState(false);
    const [isLatched, setIsLatched] = useState(false);

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

        if (!data.actionType || isPressed) return;

        setIsPressed(true);
        (event.target as HTMLElement).setPointerCapture(event.pointerId);

        if (data.actionType === "macro") {
            sendPayload({
                actionType: "macro",
                payload: { steps: data.actionValue?.steps }
            });
        }
        else if(data.actionType === "terminalCommand") {
            sendPayload({
                actionType: data.actionType,
                payload: {
                    command: data.actionValue?.command,
                    inBackground: !!data.actionValue?.inBackground,
                }
            });
        }
        else if (data.actionType === "openApp") {
            sendPayload({
                actionType: data.actionType,
                payload: { appId: data.actionValue?.appId }
            })
        }
        else if (data.actionType === "specialFunction") {
            sendPayload({
                actionType: data.actionType,
                payload: { command: data.actionValue?.command }
            })
        }
        else if (data.actionType === "keyPress") {
            sendPayload({
                actionType: data.actionType,
                payload: { keyId: data.actionValue?.keyId, state: "down" }
            });

            const modifiers = ["Shift", "Control", "Alt", "Meta", "OS"];
            const isModifier = modifiers.includes(data.actionValue?.keyId || "");

            if (!isModifier) {
                repeatTimeout.current = setTimeout(() => {
                    repeatInterval.current = setInterval(() => {
                        sendPayload({
                            actionType: data.actionType,
                            payload: { keyId: data.actionValue?.keyId, state: "click" }
                        });
                    }, 50);
                }, 400);
            }
        } else if (data.actionType === "keyHoldToggle") {
            if (!isLatched) {
                sendPayload({ actionType: "keyPress", payload: { keyId: data.actionValue?.keyId, state: "down" } });
                setIsLatched(true);
            } else {
                sendPayload({ actionType: "keyPress", payload: { keyId: data.actionValue?.keyId, state: "up" } });
                setIsLatched(false);
            }
        }
    };

    const handlePointerRelease = (event: React.PointerEvent) => {
        event.preventDefault();

        if (!data.actionType || !isPressed) return;

        setIsPressed(false);
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);
        stopRepeat();

        if (data.actionType === "keyPress") {
            sendPayload({
                actionType: data.actionType,
                payload: { keyId: data.actionValue?.keyId, state: "up" }
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