export interface Geo {
    h: number;
    w: number;
    x: number;
    y: number;
}

export interface ControlComponent {
    id: string;
    type: string;
    label: string;
    portraitGeo: Geo;
    landscapeGeo: Geo;
    data: {
        actionType: string; // keypress, shortcuts, other macros
        actionValue: string;
    }
}

export interface ControlLayout {
    id: string;
    title: string;
    components: ControlComponent[];
}
