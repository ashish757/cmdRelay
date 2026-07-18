import React from 'react';
import type { InspectorProps } from '../../types/inspector';

export const ButtonInspector: React.FC<InspectorProps> = ({ selectedComp, updateControlComponent, isListening, setIsListening }) => (
    <>
        <div className="grid gap-2">
            <label className="text-[10px] uppercase text-zinc-500 font-bold">Label</label>
            <input
                value={selectedComp.label || ''}
                onChange={(e) => updateControlComponent(selectedComp.id, { label: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300"
            />
        </div>
        <div className="space-y-3 pt-4 border-t border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-500 uppercase">Actions</h3>
            <div className="grid gap-2">
                <label className="text-[10px] uppercase text-zinc-500 font-bold">Action Type</label>
                <select
                    value={selectedComp.data?.actionType || 'none'}
                    onChange={(e) => updateControlComponent(selectedComp.id, { data: { ...selectedComp.data, actionType: e.target.value } })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300"
                >
                    <option value="none">None</option>
                    <option value="keyPress">Key Press</option>
                    <option value="typing">Text Input</option>
                </select>
            </div>
            <div className="grid gap-2">
                <label className="text-[10px] uppercase text-zinc-500 font-bold">Value</label>
                <div className="flex gap-2">
                    <input
                        value={selectedComp.data?.actionValue || ''}
                        onChange={(e) => updateControlComponent(selectedComp.id, { data: { ...selectedComp.data, actionValue: e.target.value } })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300"
                        disabled={isListening}
                    />
                    <button
                        onClick={() => setIsListening && setIsListening(!isListening)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${
                            isListening
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 animate-pulse'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                        }`}
                    >
                        {isListening ? 'Press Key...' : 'Capture Key'}
                    </button>
                </div>
            </div>
        </div>
    </>
);