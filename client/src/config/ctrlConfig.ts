import {TrackpadCtrl} from "../controls/TrackpadCtrl.tsx";
import {ArrowKeysCtrl} from "../controls/ArrowKeysCtrl.tsx";
import * as React from "react";
import {TextCtrl} from "../controls/TextCtrl.tsx";

export const menuControlConfig = [
    {id: "arrowKeys", title: "Arrow Keys" },
    {id: "trackpad", title: "Track Pad" },
    {id: "text", title: "Typing" },
]
interface ControlLayouts {
    [key: string]: React.FC;
}

export const controlLayouts: ControlLayouts = {
        "arrowKeys":  ArrowKeysCtrl,
        "trackpad":  TrackpadCtrl,
        "text":  TextCtrl,
}
