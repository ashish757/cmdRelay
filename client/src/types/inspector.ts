import type { ControlComponent } from "./controlLayouts.ts"; 

export interface InspectorProps {
    selectedComp: ControlComponent;
    updateControlComponent: (id: string, updates: Partial<ControlComponent>) => void;
    isListening?: boolean;
    setIsListening?: (val: boolean) => void;
}