import React from "react";
import { TrackpadCtrl } from "../controls/TrackpadCtrl.tsx";
import { TextCtrl } from "../controls/TextCtrl.tsx";
import { GenericButtonCtrl } from "../controls/GenericButtonCtrl.tsx";
import { ButtonInspector } from '../builder/inspectors/ButtonInspector';
import { TextInspector } from '../builder/inspectors/TextInspector';
import type {ActionType, ControlLayout} from "../types/controlLayouts.ts";
import type { InspectorProps } from "../types/inspector.ts";
import type {ViewMode} from "../types/controlLayouts.ts";

export interface ControlConfig {
    title: string;
    component: React.FC<any>;
    inspector: React.FC<InspectorProps> | null;
}

export const ACTION_TYPE_OPTIONS: { value: ActionType; label: string }[] = [
    { value: 'specialFunction', label: 'Special Functions' },
    { value: 'keyPress', label: 'Trigger Key Press' },
    { value: 'keyHoldToggle', label: 'Hold Key (Toggle)' },
    { value: 'macro', label: 'Run Macro Sequence' },
    { value: 'openApp', label: 'Launch Application' },
    { value: 'terminalCommand', label: 'Execute Command' },
];


export const controlElementsRegistry: Record<string, ControlConfig> = {
    'btn': {
        title: 'Button',
        component: GenericButtonCtrl,
        inspector: ButtonInspector, 
    },
    'trackpad': {
        title: 'Trackpad',
        component: TrackpadCtrl,
        inspector: TextInspector,
    },
    'text': {
        title: 'Text Input/Typing',
        component: TextCtrl,
        inspector: TextInspector,
    },
};

export interface MenuItem {
    id: string;
    title: string;
    viewType: ViewMode
}
export const MENU_OPTIONS: MenuItem[] = [
    {id: "l_1726454", title: "System Info", viewType: "systemInfo" },
    {id: "l_412644", title: "Layout Settings", viewType: "layoutBuilder" },
]

export const preBuiltLayouts: ControlLayout[] = [
    {
        id: "l_17429234",
        title: "Gamer",
        components: [
            {
                id: "32",
                type: "btn",
                label: "A",
                landscapeGeo: { h: 2, w: 2, x: 5, y: 71 },
                portraitGeo: { h: 4, w: 4, x: 1, y: 1 },
                style: {
                    bg: "#ef4444",
                    color: "#ffffff",
                    showLabel: true
                },
                data: {
                    actionType: "keyPress",
                    actionValue: { keyId: "A" }
                }
            },
            {
                id: "13233",
                type: "btn",
                label: "S",
                landscapeGeo: { h: 2, w: 2, x: 5, y: 71 },
                portraitGeo: { h: 4, w: 4, x: 1, y: 5 },
                style: {
                    bg: "#ef4444",
                    color: "#ffffff",
                    showLabel: true,
                },
                data: {
                    actionType: "keyPress",
                    actionValue: { keyId: "S" }
                }
            }
        ]
    }
];