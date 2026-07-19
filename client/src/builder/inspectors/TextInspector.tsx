import React from 'react';
import type { InspectorProps } from '../../types/inspector';

export const TextInspector: React.FC<InspectorProps> = ({ selectedComp, updateControlComponent }) => (
    <div className="grid gap-2">
        <label className="text-[10px] uppercase text-text-muted tracking-widest font-bold">Display Text</label>
        <input
            value={selectedComp.label || ''}
            onChange={(e) => updateControlComponent(selectedComp.id, { label: e.target.value })}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary"
            placeholder="e.g., Welcome!"
        />
    </div>
);