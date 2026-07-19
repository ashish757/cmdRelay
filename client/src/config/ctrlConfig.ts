import React from "react";
import { TrackpadCtrl } from "../controls/TrackpadCtrl.tsx";
import { TextCtrl } from "../controls/TextCtrl.tsx";
import { GenericButtonCtrl } from "../controls/GenericButtonCtrl.tsx";
import { ButtonInspector } from '../builder/inspectors/ButtonInspector';
import { TextInspector } from '../builder/inspectors/TextInspector';
import type { ControlLayout } from "../types/controlLayouts.ts";
import type { InspectorProps } from "../types/inspector.ts";

export interface ControlConfig {
    title: string;
    component: React.FC<any>;
    inspector: React.FC<InspectorProps> | null;
}

export const controlElementsRegistry: Record<string, ControlConfig> = {
    'btn': {
        title: 'Button',
        component: GenericButtonCtrl,
        inspector: ButtonInspector, 
    },
    'trackpad': {
        title: 'Trackpad',
        component: TrackpadCtrl,
        inspector: null,
    },
    'text': {
        title: 'Text Input/Typing',
        component: TextCtrl,
        inspector: TextInspector,
    },
};

export const preBuiltLayoutsMenu = [
    {id: "l_17429234", title: "Gamer" },
]

export const preBuiltLayouts: ControlLayout[] = [

    {
        "id": "l_17429234",
        "title": "Gamer",

        "components": [
            {
                "id": "32",
                "type": "btn",
                "label": "A",
                "landscapeGeo": {
                    "h": 2,
                    "w": 2,
                    "x": 5,
                    "y": 71
                },
                "portraitGeo": {
                    "h": 4,
                    "w": 4,
                    "x": 1,
                    "y": 1
                },
                "data": {
                    "actionType": "keyPress",
                    "actionValue": "A"
                }
            },
            {
                "id": "13233",
                "type": "btn",
                "label": "S",
                "landscapeGeo": {
                    "h": 2,
                    "w": 2,
                    "x": 5,
                    "y": 71
                },
                "portraitGeo": {
                    "h": 4,
                    "w": 4,
                    "x": 1,
                    "y": 5
                },
                "data": {
                    "actionType": "keyPress",
                    "actionValue": "S"
                }
            }
        ]

    }
]