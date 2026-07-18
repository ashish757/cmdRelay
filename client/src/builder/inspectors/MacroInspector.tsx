import React, { useState, useEffect } from 'react';
import type { InspectorProps } from '../../types/inspector';

export type MacroStep = {
    id: string;
    state: 'click' | 'down' | 'up' | 'delay';
    keyId: string;
};

export const MacroInspector: React.FC<InspectorProps> = ({ selectedComp, updateControlComponent }) => {
    // Track which specific step is currently listening for a physical keypress
    const [listeningStepId, setListeningStepId] = useState<string | null>(null);

    const steps: MacroStep[] = Array.isArray(selectedComp.data?.actionValue)
        ? selectedComp.data.actionValue
        : [];

    const updateSteps = (newSteps: MacroStep[]) => {
        updateControlComponent(selectedComp.id, {
            data: {
                ...selectedComp.data,
                actionType: 'macro',
                actionValue: newSteps as any
            }
        });
    };

    const addStep = () => {
        const newStep: MacroStep = {
            id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            state: 'click',
            keyId: ''
        };
        updateSteps([...steps, newStep]);
        // Automatically start listening for the new step to speed up workflow
        setListeningStepId(newStep.id);
    };

    const updateStep = (id: string, key: keyof MacroStep, val: string) => {
        updateSteps(steps.map(s => s.id === id ? { ...s, [key]: val } : s));
    };

    const removeStep = (id: string) => {
        updateSteps(steps.filter(s => s.id !== id));
        if (listeningStepId === id) setListeningStepId(null);
    };

    // Global Key Listener for Capturing
    useEffect(() => {
        if (!listeningStepId) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();

            let keyName = e.key;
            if (keyName === ' ') keyName = 'Space';

            // Standardize single letters to uppercase for cleaner UI
            if (keyName.length === 1) {
                keyName = keyName.toUpperCase();
            }

            updateStep(listeningStepId, 'keyId', keyName);
            setListeningStepId(null); // Stop listening once captured
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [listeningStepId, steps]);

    return (
        <>
            <div className="grid gap-2">
                <label className="text-[10px] uppercase text-zinc-500 font-bold">Button Label</label>
                <input
                    value={selectedComp.label || ''}
                    onChange={(e) => updateControlComponent(selectedComp.id, { label: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:border-indigo-500 outline-none"
                    placeholder="e.g., Save & Close"
                />
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase">Macro Sequence</h3>
                    <span className="text-[10px] font-bold bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                        {steps.length} Steps
                    </span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {steps.length === 0 ? (
                        <div className="text-xs text-zinc-500 text-center py-4 border border-zinc-800 border-dashed rounded-lg">
                            No steps added yet.
                        </div>
                    ) : (
                        steps.map((step, index) => (
                            <div key={step.id} className="flex gap-2 items-center bg-zinc-950 p-2 rounded-lg border border-zinc-800 relative group">

                                <div className="w-5 h-5 shrink-0 flex items-center justify-center bg-zinc-800 rounded text-[10px] text-zinc-400 font-bold">
                                    {index + 1}
                                </div>

                                <select
                                    value={step.state}
                                    onChange={(e) => {
                                        updateStep(step.id, 'state', e.target.value);
                                        if (e.target.value === 'delay') {
                                            updateStep(step.id, 'keyId', '500'); // Default to 500ms when switching to delay
                                            if (listeningStepId === step.id) setListeningStepId(null);
                                        } else if (step.state === 'delay') {
                                            updateStep(step.id, 'keyId', ''); // Clear number if switching back to key
                                        }
                                    }}
                                    className="bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-zinc-300 outline-none focus:border-indigo-500 w-[90px] shrink-0"
                                >
                                    <option value="click">Click Key</option>
                                    <option value="down">Hold Down</option>
                                    <option value="up">Release</option>
                                    <option value="delay">Delay (ms)</option>
                                </select>

                                {/* CONDITIONAL INPUT: Delay gets a number field, Keys get a Capture button */}
                                {step.state === 'delay' ? (
                                    <input
                                        type="number"
                                        value={step.keyId}
                                        onChange={(e) => updateStep(step.id, 'keyId', e.target.value)}
                                        placeholder="ms"
                                        className="flex-1 min-w-0 bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-zinc-300 outline-none focus:border-indigo-500 placeholder-zinc-600"
                                    />
                                ) : (
                                    <button
                                        onClick={() => setListeningStepId(listeningStepId === step.id ? null : step.id)}
                                        className={`flex-1 min-w-0 text-left rounded p-1.5 text-xs font-bold transition-colors border overflow-hidden whitespace-nowrap text-ellipsis ${
                                            listeningStepId === step.id
                                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 animate-pulse'
                                                : step.keyId
                                                    ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                                                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
                                        }`}
                                    >
                                        {listeningStepId === step.id
                                            ? 'Press Key...'
                                            : (step.keyId || 'Capture Key')}
                                    </button>
                                )}

                                <button
                                    onClick={() => removeStep(step.id)}
                                    className="w-6 h-6 shrink-0 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                    title="Remove Step"
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <button
                    onClick={addStep}
                    className="w-full py-2 border-2 border-dashed border-zinc-700 hover:border-indigo-500 hover:text-indigo-400 text-zinc-400 rounded-lg text-xs font-bold transition-colors uppercase tracking-wider"
                >
                    + Add New Step
                </button>
            </div>
        </>
    );
};