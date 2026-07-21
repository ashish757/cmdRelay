import React from 'react';
import type { InspectorProps } from '../../types/inspector';

export const CommandInspector: React.FC<InspectorProps> = ({ selectedComp, updateControlComponent }) => {
    const terminalData = typeof selectedComp.data?.actionValue === 'object'
        ? selectedComp.data.actionValue
        : { command: selectedComp.data?.actionValue || '', inBackground: false };

    const updateTerminalData = (updates: Partial<{ command: string; inBackground: boolean }>) => {
        updateControlComponent(selectedComp.id, {
            data: {
                ...selectedComp.data,
                actionType: 'terminalCommand',
                actionValue: { ...terminalData, ...updates } as any
            }
        });
    };

    return (
        <div className="grid gap-4 mt-2">
            <div className="grid gap-2">
                <label className="text-[10px] uppercase text-text-muted tracking-widest font-bold">
                    Terminal Command
                </label>
                <input
                    value={terminalData.command}
                    onChange={(e) => updateTerminalData({ command: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary font-mono"
                    placeholder="e.g., docker compose up -d"
                />
            </div>

            <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                    type="checkbox"
                    checked={terminalData.inBackground}
                    onChange={(e) => updateTerminalData({ inBackground: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary bg-background focus:ring-primary focus:ring-offset-background cursor-pointer"
                />
                <span className="text-xs text-text-main font-semibold">Run in Background (Silent)</span>
            </label>
        </div>
    );
};