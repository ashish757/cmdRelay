import React from 'react';
import type { InspectorProps } from '../../types/inspector';
import { KeyCaptureInput } from '../../components/KeyCaptureInput';
import { AppOpenerInspector } from './AppOpenerInspector';
import { MacroInspector } from './MacroInspector';
import { CommandInspector } from './CommandInspector';

export const ButtonInspector: React.FC<InspectorProps> = (props) => {
    const { selectedComp, updateControlComponent } = props;
    const actionType = selectedComp.data?.actionType || 'none';

    return (
        <>
            <div className="grid gap-2">
                <label className="text-[10px] uppercase text-text-muted tracking-widest font-bold">Action Behavior</label>
                <select
                    value={actionType}
                    onChange={(e) => {
                        updateControlComponent(selectedComp.id, {
                            data: { ...selectedComp.data, actionType: e.target.value, actionValue: '' }
                        });
                    }}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary"
                >
                    <option value="none">None</option>
                    <option value="keyPress">Trigger Key Press</option>
                    <option value="keyHoldToggle">Hold Key (Toggle)</option>
                    <option value="macro">Run Macro Sequence</option>
                    <option value="openApp">Launch Application</option>
                    <option value="terminalCommand">Execute Command</option>
                </select>
            </div>

            <div className="space-y-3 pt-4 border-t border-border mt-4">
                <div className="grid gap-2">
                    <label className="text-[10px] uppercase text-text-muted tracking-widest font-bold">Button Title</label>
                    <input
                        value={selectedComp.label || ''}
                        onChange={(e) => updateControlComponent(selectedComp.id, { label: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary"
                        placeholder="e.g., Save, Launch"
                    />
                </div>

                <div className="mt-4">
                    {(actionType === 'keyPress' || actionType === 'keyHoldToggle') && (
                        <div className="grid gap-2">
                            <label className="text-[10px] uppercase text-text-muted tracking-widest font-bold">Key Value</label>
                            <KeyCaptureInput
                                value={selectedComp.data?.actionValue as string || ''}
                                onChange={(newVal: string) => updateControlComponent(selectedComp.id, {
                                    data: { ...selectedComp.data, actionValue: newVal }
                                })}
                            />
                        </div>
                    )}

                    {actionType === 'openApp' && (
                        <AppOpenerInspector {...props} />
                    )}

                    {actionType === 'macro' && (
                        <MacroInspector {...props} />
                    )}

                    {actionType === 'terminalCommand' && (
                        <CommandInspector {...props} />
                    )}
                </div>
            </div>
        </>
    );
};