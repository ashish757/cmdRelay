import React from 'react';
import type { InspectorProps } from '../../types/inspector';
import type { MacroStep } from '../../types/controlLayouts';
import { KeyCaptureInput } from '../../components/KeyCaptureInput';
import { ChevronDown, ChevronUp } from "lucide-react"

const DEFAULT_DELAY = 500;

export const MacroInspector: React.FC<InspectorProps> = ({ selectedComp, updateControlComponent }) => {
    const steps: MacroStep[] = selectedComp.data?.actionValue?.steps || [];

    const updateSteps = (newSteps: MacroStep[]) => {
        updateControlComponent(selectedComp.id, {
            data: { ...selectedComp.data, actionType: 'macro', actionValue: { ...selectedComp.data?.actionValue, steps: newSteps } }
        });
    };

    const addStep = () => {
        const newStep: MacroStep = {
            id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            state: 'click',
            keyId: ''
        };
        updateSteps([...steps, newStep]);
    };

    const removeStep = (id: string) => {
        updateSteps(steps.filter(s => s.id !== id));
    };

    const moveStep = (index: number, direction: -1 | 1) => {
        const newSteps = [...steps];
        const targetIndex = index + direction;

        if (targetIndex >= 0 && targetIndex < newSteps.length) {
            [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
            updateSteps(newSteps);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Macro Sequence</label>
                <span className="text-[10px] font-bold bg-surface border border-border text-text-main px-2 py-1 rounded">
                    {steps.length} Steps
                </span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex gap-2 items-center bg-background p-2 rounded-lg border border-border group">

                        <div className="w-5 h-5 shrink-0 flex items-center justify-center bg-surface border border-border rounded text-[10px] text-text-main font-bold">
                            {index + 1}
                        </div>

                        <select
                            value={step.state}
                            onChange={(e) => {
                                const nextState = e.target.value as MacroStep['state'];
                                const nextKeyId = nextState === 'delay'
                                    ? DEFAULT_DELAY.toString()
                                    : (step.state === 'delay' ? '' : step.keyId);

                                updateSteps(steps.map(s =>
                                    s.id === step.id
                                        ? { ...s, state: nextState, keyId: nextKeyId }
                                        : s
                                ));
                            }}
                            className="bg-surface border border-border rounded p-1.5 text-xs text-text-main outline-none focus:border-primary w-[90px] shrink-0"
                        >
                            <option value="click">Click Key</option>
                            <option value="down">Hold Down</option>
                            <option value="up">Release</option>
                            <option value="delay">Delay (ms)</option>
                        </select>


                        <div className="flex-1 min-w-0">
                            {step.state === 'delay' ? (
                                <input
                                    type="number"
                                    value={step.keyId}
                                    onChange={(e) => updateSteps(steps.map(s => s.id === step.id ? { ...s, keyId: e.target.value } : s))}
                                    placeholder="ms"
                                    className="w-full bg-surface border border-border rounded p-1.5 text-xs text-text-main outline-none focus:border-primary placeholder-text-muted"
                                />
                            ) : (
                                <KeyCaptureInput
                                    value={step.keyId}
                                    onChange={(val) => updateSteps(steps.map(s => s.id === step.id ? { ...s, keyId: val } : s))}
                                    placeholder="Key..."
                                />
                            )}
                        </div>

                        <div className="flex flex-col gap-0.4">
                            <button
                                onClick={() => moveStep(index, -1)}
                                disabled={index === 0}
                                className="h-5 text-text-muted hover:text-primary disabled:opacity-40"
                            ><ChevronUp/></button>
                            <button
                                onClick={() => moveStep(index, 1)}
                                disabled={index === steps.length - 1}
                                className="h-5 text-text-muted hover:text-primary disabled:opacity-40"
                            ><ChevronDown/></button>
                        </div>


                        <button
                            onClick={() => removeStep(step.id)}
                            className="w-6 h-6 shrink-0 flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addStep}
                className="w-full py-2 border-2 border-dashed border-border hover:border-primary hover:text-primary text-text-muted rounded-lg text-xs font-bold transition-colors uppercase tracking-wider"
            >
                + Add New Step
            </button>
        </div>
    );
};;