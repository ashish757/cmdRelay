import React from "react";
import { useNet } from "../context/NetCtx.tsx";
import type {ControlComponent} from "../types/controlLayouts.ts";

export const GenericButtonCtrl = ({ component }: {component: ControlComponent}) => {
    const data = component.data;

    const { sendPayload } = useNet();

    const handleTouchStart = (_event: React.TouchEvent) => {
        // event.preventDefault();

        if (!data.actionType || data.actionType === "none") return;

        const payloadData ={ keyId: data.actionValue };

        sendPayload({ actionType: data.actionType, payload: payloadData });
    };

    return (
        <div
            onTouchStart={handleTouchStart}
            className="w-full h-full bg-neutral-800 rounded-md active:bg-green-600 flex items-center justify-center text-4xl"
        >
            {component.label || "Btn"}
        </div>
    );
};