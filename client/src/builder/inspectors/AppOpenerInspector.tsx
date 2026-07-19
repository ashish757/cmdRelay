import React from 'react';
import type { InspectorProps } from '../../types/inspector';

export const AppOpenerInspector: React.FC<InspectorProps> = ({ selectedComp, updateControlComponent }) => {
    const appName = (selectedComp.data?.actionValue as string) || "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateControlComponent(selectedComp.id, {
            data: { ...selectedComp.data, actionValue: e.target.value, actionType: "openApp" }
        });
    };

    return (
        <div className="grid gap-2">
            <label className="text-[10px] uppercase text-text-muted tracking-widest font-bold">Application to Launch</label>
            <input
                type="text"
                placeholder="e.g., Spotify, Chrome"
                value={appName}
                onChange={handleChange}
                className="bg-background border border-border rounded-lg px-3 py-2 text-text-main text-sm focus:outline-none focus:border-primary"
            />
            <p className="text-[10px] text-text-muted mt-1">
                Ensure this matches the app name in your /Applications folder exactly.
            </p>
        </div>
    );
};