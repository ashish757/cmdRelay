import {TrackpadCtrl} from "../controls/TrackpadCtrl.tsx";
import  React from "react";
import {TextCtrl} from "../controls/TextCtrl.tsx";
import type {ControlLayout} from "../types/controlLayouts.ts";
import {GenericButtonCtrl} from "../controls/GenericButtonCtrl.tsx";


interface ControlLayoutMapping {
    [key: string]: React.FC<any>;
}


export const LayoutComponentMapping: ControlLayoutMapping = {
    "btn":  GenericButtonCtrl,
    "trackpad":  TrackpadCtrl,
    "text":  TextCtrl,
}



export const preBuiltLayoutsMenu = [
    {id: "l_17429234", title: "Gamer" },
]

export const menuControlConfig = [
    {id: "builder", title: "Edit Layout" },
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