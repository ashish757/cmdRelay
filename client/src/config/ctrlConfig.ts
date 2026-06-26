import {TrackpadCtrl} from "../controls/TrackpadCtrl.tsx";
import {ArrowKeysCtrl} from "../controls/ArrowKeysCtrl.tsx";
import * as React from "react";

export const menuControlConfig = [
    {id: "arrowKeys", title: "Arrow Keys" },
    {id: "trackpad", title: "Track Pad" },
    {id: "media", title: "Media Controls" },
]
interface ControlLayouts {
    [key: string]: React.FC;
}

export const controlLayouts: ControlLayouts = {
        "arrowKeys":  ArrowKeysCtrl,
        "trackpad":  TrackpadCtrl,
        "media": ArrowKeysCtrl
}
