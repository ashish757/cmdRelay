import React, { useState } from 'react';
import type { ControlComponent } from "../types/controlLayouts.ts";

interface CanvasProps {
    isLandscape: boolean;
    setIsLandscape: (val: boolean) => void;
    componentArray: ControlComponent[];
    setComponentArray: (arr: ControlComponent[]) => void;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    removeControlComponent: (id: string) => void;
}

type DragState = {
    id: string; interactionType: 'move' | 'resize';
    startX: number; startY: number; originX: number;
    originY: number; originWidth: number; originHeight: number;
};

export function BuilderCanvas({ isLandscape, setIsLandscape, componentArray, setComponentArray, selectedId, setSelectedId, removeControlComponent }: CanvasProps) {
    const [dragState, setDragState] = useState<DragState | null>(null);

    const cellSize = 48;
    const cols = isLandscape ? 16 : 8;
    const rows = isLandscape ? 8 : 16;

    const addControlComponent = (targetX: number, targetY: number) => {
        const newId = `c_${Date.now()}`;
        const portraitGeo = isLandscape ? { x: Math.min(targetX, 7), y: Math.min(targetY, 15), w: 2, h: 2 } : { x: targetX, y: targetY, w: 2, h: 2 };
        const landscapeGeo = !isLandscape ? { x: Math.min(targetX, 15), y: Math.min(targetY, 7), w: 2, h: 2 } : { x: targetX, y: targetY, w: 2, h: 2 };

        setComponentArray([...componentArray, {
            id: newId, type: 'btn', label: 'Btn', portraitGeo, landscapeGeo,
            data: { actionType: 'keyPress', actionValue: { keyId: 'Space' } }
        }]);
        setSelectedId(newId);
    };

    const handlePointerDown = (event: React.PointerEvent, componentId: string, interactionType: 'move' | 'resize') => {
        event.stopPropagation();
        const targetComponent = componentArray.find(component => component.id === componentId);
        if (!targetComponent) return;

        setSelectedId(componentId);
        const activeGeometry = isLandscape ? targetComponent.landscapeGeo : targetComponent.portraitGeo;

        setDragState({
            id: componentId, interactionType, startX: event.clientX, startY: event.clientY,
            originX: activeGeometry.x, originY: activeGeometry.y,
            originWidth: activeGeometry.w, originHeight: activeGeometry.h
        });
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: React.PointerEvent) => {
        if (!dragState) return;
        const deltaX = Math.round((event.clientX - dragState.startX) / cellSize);
        const deltaY = Math.round((event.clientY - dragState.startY) / cellSize);

        setComponentArray(componentArray.map(component => {
            if (component.id !== dragState.id) return component;
            const activeGeometry = isLandscape ? component.landscapeGeo : component.portraitGeo;
            const newGeometry = { ...activeGeometry };

            if (dragState.interactionType === 'move') {
                newGeometry.x = Math.max(1, Math.min(dragState.originX + deltaX, cols - activeGeometry.w + 1));
                newGeometry.y = Math.max(1, Math.min(dragState.originY + deltaY, rows - activeGeometry.h + 1));
            } else {
                newGeometry.w = Math.max(1, Math.min(dragState.originWidth + deltaX, cols - activeGeometry.x + 1));
                newGeometry.h = Math.max(1, Math.min(dragState.originHeight + deltaY, rows - activeGeometry.y + 1));
            }
            return isLandscape ? { ...component, landscapeGeo: newGeometry } : { ...component, portraitGeo: newGeometry };
        }));
    };

    const handlePointerUp = (event: React.PointerEvent) => {
        if (dragState) {
            event.currentTarget.releasePointerCapture(event.pointerId);
            setDragState(null);
        }
    };

    const backgroundGrid = [];
    for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= cols; col++) {
            backgroundGrid.push(
                <div
                    key={`bg-${row}-${col}`}
                    className="border border-border/90 border-dashed rounded-md hover:bg-surface/50 transition-colors duration-200 cursor-crosshair"
                    style={{ gridRow: row, gridColumn: col }}
                    onClick={() => addControlComponent(col, row)}
                />
            );
        }
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center relative bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-surface to-background shadow-inner overflow-hidden">
            <div className="absolute top-8 left-8 flex p-1 bg-surface/80 rounded-xl border border-border backdrop-blur-xl z-0 shadow-2xl">
                <button onClick={() => setIsLandscape(false)} className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${!isLandscape ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}>Portrait</button>
                <button onClick={() => setIsLandscape(true)} className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${isLandscape ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}>Landscape</button>
            </div>

            <div
                className="bg-background border-4 border-border rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-border/10 relative shrink-0"
                style={{ width: (cols * cellSize) + 30, height: (rows * cellSize) + 30, transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1), height 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
                <div className="w-full h-full grid gap-1 relative place-content-center" style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize - 4}px)`, gridTemplateRows: `repeat(${rows}, ${cellSize - 4}px)` }}>
                    {backgroundGrid}
                    {componentArray.map(component => {
                        const componentGeometry = isLandscape ? component.landscapeGeo : component.portraitGeo;
                        const isSelected = selectedId === component.id;

                        return (
                            <div
                                key={component.id}
                                onPointerDown={(event) => handlePointerDown(event, component.id, 'move')}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                className={`flex items-center justify-center rounded-md font-bold text-sm tracking-wide select-none w-full h-full cursor-grab active:cursor-grabbing backdrop-blur-md transition-all duration-200 ${isSelected ? 'border-2 border-primary bg-primary/20 text-text-main shadow-md z-20 scale-[1.02]' : 'border-2 border-border/50 bg-surface/80 text-text-muted z-10 hover:border-border hover:bg-surface'}`}
                                style={{ gridColumnStart: componentGeometry.x, gridColumnEnd: `span ${componentGeometry.w}`, gridRowStart: componentGeometry.y, gridRowEnd: `span ${componentGeometry.h}`, position: 'relative', touchAction: 'none' }}
                                onClick={(e) => { e.stopPropagation(); setSelectedId(component.id); }}
                            >
                                <span className="truncate px-2 pointer-events-none drop-shadow-md">{component.label || component.type}</span>
                                {isSelected && (
                                    <>
                                    <div
                                        onPointerDown={(event) => { event.stopPropagation(); handlePointerDown(event, component.id, 'resize'); }}
                                        onPointerMove={handlePointerMove}
                                        onPointerUp={handlePointerUp}
                                        onPointerCancel={handlePointerUp}
                                        className="absolute -bottom-2 -right-2 w-6 h-6 bg-text-main rounded-full cursor-nwse-resize shadow-lg z-30 flex items-center justify-center border-2 border-primary hover:scale-110 transition-transform"
                                    ><div className="w-1.5 h-1.5 bg-primary rounded-full pointer-events-none" /></div>
                                    <button
                                    onPointerDown={(e) => {
                                    e.stopPropagation();
                                    removeControlComponent(component.id);
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg z-40 border-2 border-background hover:scale-110 hover:bg-red-400 transition-transform"
                            >
                                <span className="text-white text-[10px] font-bold">✕</span>
                            </button>         </>
                                )}
                            </div>

                        );
                    })}
                </div>
            </div>
        </div>
    );
}