export type ActionType = 'none' | 'keyPress' | 'keyHoldToggle' | 'macro' | 'openApp' | 'terminalCommand';

export type ViewMode = 'controlLayout' | 'layoutBuilder' | "systemInfo";

export interface Geo {
    h: number;
    w: number;
    x: number;
    y: number;
}

export interface MacroStep {
    id: string;
    state: 'click' | 'down' | 'up' | 'delay';
    keyId: string;
}

export interface ActionValue {
    keyId?: string;
    appId?: string;
    steps?: MacroStep[];
    command?: string;
    inBackground?: boolean;
}

export interface ControlComponent {
    id: string;
    type: string;
    label: string;
    portraitGeo: Geo;
    landscapeGeo: Geo;
    data: {
        actionType: ActionType;
        actionValue: ActionValue;
    }
}

export interface ControlLayout {
    id: string;
    title: string;
    targetApps?: string[];
    components: ControlComponent[];
}
