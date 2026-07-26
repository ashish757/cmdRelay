export type ActionType =  'keyPress' | 'keyHoldToggle' | 'macro' | 'openApp' | 'terminalCommand' | 'specialFunction' | 'openWebsite';

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

export interface ComponentStyle {
    bg?: string;
    color?: string;
    showLabel?: boolean;
    icon?: string;
    image?: string;
}

export interface ControlComponent {
    id: string;
    type: string;
    label: string;
    portraitGeo: Geo;
    landscapeGeo: Geo;
    style: ComponentStyle;
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
