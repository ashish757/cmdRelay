import React, { useState, useRef, useEffect } from "react";
import { useNet } from "../context/NetCtx.tsx";
import type { ControlComponent } from "../types/controlLayouts.ts";
import { ICON_MAP } from "../config/appearance";

export const GenericButtonCtrl = ({ component }: { component: ControlComponent }) => {
    const data = component.data;
    const style = component.style || {};
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

    const isActive = isPressed || isLatched;
    const hasCustomBg = style.bg && style.bg !== 'transparent';
    const showLabel = style.showLabel !== false;

    const IconComponent = style.icon ? ICON_MAP[style.icon] : null;
    const isCatalogImage = style.image?.startsWith('catalog:');
    const catalogId = isCatalogImage ? style.image?.split(':')[1] : null;

    return (
        <div
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerRelease}
            onPointerCancel={handlePointerRelease}
            style={{
                backgroundColor: hasCustomBg ? style.bg : undefined,
                color: style.color ? style.color : undefined,
                transform: isActive ? 'scale(0.97)' : 'scale(1)',
                filter: isActive && hasCustomBg ? 'brightness(0.8)' : 'none',
            }}
            className={`
                w-full h-full rounded-lg transition-all duration-75 flex flex-col gap-1 items-center justify-center text-sm md:text-lg font-bold select-none touch-none border-2
                ${isActive && !hasCustomBg
                ? 'bg-primary border-primary text-white shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)]'
                : !hasCustomBg
                    ? `${catalogId ? "border-none" : "bg-surface border-border/50"}  text-text-main`
                    : 'border-transparent'
            }
            `}
        >
            {isCatalogImage && catalogId && (
                <img
                    key={catalogId}
                    src={`/catalog/${catalogId}.svg`}
                    alt={component.label}
                    className="w-full h-full object-contain pointer-events-none"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
            )}

            {IconComponent && !isCatalogImage && (
                <IconComponent size={24} className="pointer-events-none" />
            )}

            {showLabel && (
                <span className="pointer-events-none text-center leading-tight truncate px-2 w-full">
                    {component.label || "Btn"}
                </span>
            )}
        </div>
    );
};