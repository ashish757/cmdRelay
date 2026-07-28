import React from 'react';
import type { InspectorProps } from '../../types/inspector';
import { KeyCaptureInput } from '../../components/KeyCaptureInput';
import { AppOpenerInspector } from './AppOpenerInspector';
import { MacroInspector } from './MacroInspector';
import { CommandInspector } from './CommandInspector';
import {SpecialInspector} from "./SpecialInspector.tsx";

import { ACTION_TYPE_OPTIONS } from '../../config/ctrlConfig';
import type { ActionType } from '../../types/controlLayouts';
import {AppearanceInspector} from "./AppearanceInspector.tsx";
import {Accordion} from "../../components/Accordion.tsx";
import {WebsiteOpenerInspector} from "./WebsiteOpenerInspector.tsx";

export const ButtonInspector: React.FC<InspectorProps> = (props) => {
    const { selectedComp, updateControlComponent } = props;
    const actionType = selectedComp.data?.actionType || 'none';

    return (
        <>
            <Accordion title={"INSPECTOR"} defaultExpanded={true}>

            <div className="grid gap-2">
                <label className="text-[10px] uppercase text-text-muted tracking-widest font-bold">Action Behavior</label>
                <select
                    value={actionType}
                    onChange={(e) => {
                        updateControlComponent(selectedComp.id, {
                            data: { ...selectedComp.data, actionType: e.target.value as ActionType, actionValue: {} }
                        });
                    }}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary"
                >
                    {ACTION_TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>


                <div className="grid gap-2">
                    <label className="text-[10px] uppercase text-text-muted tracking-widest font-bold">Button Title</label>
                    <input
                        value={selectedComp.label || ''}
                        onChange={(e) => updateControlComponent(selectedComp.id, { label: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary"
                        placeholder="e.g., Save, Launch"
                    />
                </div>

                {(actionType === 'keyPress' || actionType === 'keyHoldToggle') && (
                    <div className="grid gap-2">
                        <label className="text-[10px] uppercase text-text-muted tracking-widest font-bold">Key Value</label>
                        <KeyCaptureInput
                            value={selectedComp.data?.actionValue?.keyId || ''}
                            onChange={(newVal: string) => updateControlComponent(selectedComp.id, {
                                data: { ...selectedComp.data, actionValue: { ...selectedComp.data.actionValue, keyId: newVal } }
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
                {actionType === 'specialFunction' && (
                    <SpecialInspector {...props} />
                )}
                {actionType === 'openWebsite' && (
                    <WebsiteOpenerInspector {...props} />
                )}

           </Accordion>
            
           <Accordion title={"APPEARANCE"} defaultExpanded={true}>
                    <AppearanceInspector {...props} />
                </Accordion>
    </>

    );
};