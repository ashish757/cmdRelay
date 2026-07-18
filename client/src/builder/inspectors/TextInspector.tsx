import React from 'react';
import type { InspectorProps } from '../../types/inspector';

export const TextInspector: React.FC<InspectorProps> = ({ selectedComp, updateControlComponent }) => (
    <div className="grid gap-2">
        <label className="text-[10px] uppercase text-zinc-500 font-bold">Placeholder</label>
        <input
            value={selectedComp.label || ''}
            onChange={(e) => updateControlComponent(selectedComp.id, { label: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300"
        />
    </div>
);