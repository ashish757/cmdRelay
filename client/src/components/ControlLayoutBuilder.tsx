import React, { useState, useEffect } from 'react';
import { useNet } from '../context/NetCtx.tsx';
import { LayoutComponentMapping } from '../config/ctrlConfig.ts';
import type { ControlComponent, Geo, ControlLayout } from "../types/controlLayouts.ts";

type DragState = {
    id: string;
    interactionType: 'move' | 'resize';
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    originWidth: number;
    originHeight: number;
};

export function ControlLayoutBuilder() {
    const { sendPayload } = useNet();

    const [allControlLayouts, setAllControlLayouts] = useState<ControlLayout[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const [layoutTitle, setLayoutTitle] = useState<string>('');
    const [isLandscape, setIsLandscape] = useState<boolean>(false);
    const [componentArray, setComponentArray] = useState<ControlComponent[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [isListening, setIsListening] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState('idle');

    useEffect(() => {
        const cache = localStorage.getItem('layouts');
        if (cache) {
            try {
                const parsedData = JSON.parse(cache);
                if (Array.isArray(parsedData) && parsedData.length > 0) {
                    setAllControlLayouts(parsedData);
                    loadControlLayout(parsedData[0]);
                } else {
                    makeNewLayout();
                }
            } catch (error) {
                makeNewLayout();
            }
        } else {
            makeNewLayout();
        }
    }, []);

    useEffect(() => {
        if (!isListening || !selectedId) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            let keyName = e.key;
            if (keyName === ' ') keyName = 'Space';

            setComponentArray(prev => prev.map(c => {
                if (c.id !== selectedId) return c;
                return {
                    ...c,
                    data: {
                        actionType: 'keyPress',
                        actionValue: keyName
                    }
                };
            }));
            setIsListening(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isListening, selectedId]);

    const loadControlLayout = (layout: ControlLayout) => {
        setActiveId(layout.id);
        setLayoutTitle(layout.title);
        setComponentArray(layout.components || []);
        setSelectedId(null);
        setIsListening(false);
    };

    const makeNewLayout = () => {
        const newId = `l_${Date.now()}`;
        const newControlLayout: ControlLayout = { id: newId, title: 'New Layout', components: [] };
        setAllControlLayouts(previous => [...previous, newControlLayout]);
        loadControlLayout(newControlLayout);
    };

    const handleLayoutChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const targetValue = event.target.value;
        if (targetValue === 'NEW') {
            makeNewLayout();
        } else {
            const foundLayout = allControlLayouts.find(layout => layout.id === targetValue);
            if (foundLayout) loadControlLayout(foundLayout);
        }
    };

    const handleSave = async () => {
        const updated = allControlLayouts.map(l =>
            l.id === activeId ? { ...l, title: layoutTitle, components: componentArray } : l
        );
        setAllControlLayouts(updated);
        localStorage.setItem('layouts', JSON.stringify(updated));

        const res = await sendPayload({
            actionType: "saveLayout",
            payload: { layouts: updated }
        });


        setSaveStatus(res);
        setTimeout(() => setSaveStatus('idle'), 2000);

    };

    const cellSize = 48;
    const cols = isLandscape ? 16 : 8;
    const rows = isLandscape ? 8 : 16;

    const addControlComponent = (targetX: number, targetY: number) => {
        const newId = `c_${Date.now()}`;
        const portraitGeo = isLandscape ? { x: Math.min(targetX, 7), y: Math.min(targetY, 15), w: 2, h: 2 } : { x: targetX, y: targetY, w: 2, h: 2 };
        const landscapeGeo = !isLandscape ? { x: Math.min(targetX, 15), y: Math.min(targetY, 7), w: 2, h: 2 } : { x: targetX, y: targetY, w: 2, h: 2 };

        setComponentArray([...componentArray, {
            id: newId,
            type: 'btn',
            label: 'Btn',
            portraitGeo,
            landscapeGeo,
            data: {
                actionType: 'keyPress',
                actionValue: 'Space'
            }
        }]);
        setSelectedId(newId);
        setIsListening(false);
    };

    const updateControlComponent = (componentId: string, updates: Partial<ControlComponent>) => {
        setComponentArray(componentArray.map(component => component.id === componentId ? { ...component, ...updates } : component));
    };

    const updateGeometry = (componentId: string, axis: keyof Geo, value: number) => {
        setComponentArray(componentArray.map(component => {
            if (component.id !== componentId) return component;
            const targetGeometry = isLandscape ? { ...component.landscapeGeo, [axis]: value } : { ...component.portraitGeo, [axis]: value };
            return isLandscape ? { ...component, landscapeGeo: targetGeometry } : { ...component, portraitGeo: targetGeometry };
        }));
    };

    const removeControlComponent = (componentId: string) => {
        setComponentArray(componentArray.filter(component => component.id !== componentId));
        if (selectedId === componentId) setSelectedId(null);
    };

    const handlePointerDown = (event: React.PointerEvent, componentId: string, interactionType: 'move' | 'resize') => {
        event.stopPropagation();
        const targetComponent = componentArray.find(component => component.id === componentId);
        if (!targetComponent) return;

        setSelectedId(componentId);
        const activeGeometry = isLandscape ? targetComponent.landscapeGeo : targetComponent.portraitGeo;

        setDragState({
            id: componentId,
            interactionType,
            startX: event.clientX,
            startY: event.clientY,
            originX: activeGeometry.x,
            originY: activeGeometry.y,
            originWidth: activeGeometry.w,
            originHeight: activeGeometry.h
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

    const selectedComp = componentArray.find(c => c.id === selectedId);
    const activeGeo = selectedComp ? (isLandscape ? selectedComp.landscapeGeo : selectedComp.portraitGeo) : null;

    const backgroundGrid = [];
    for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= cols; col++) {
            backgroundGrid.push(
                <div
                    key={`bg-${row}-${col}`}
                    className="border border-gray-400 border-dashed rounded-md hover:bg-white/40 transition-colors duration-200 cursor-crosshair"
                    style={{ gridRow: row, gridColumn: col }}
                    onClick={() => addControlComponent(col, row)}
                />
            );
        }
    }

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500/30">

            <div className="flex-1 flex flex-col items-center justify-center relative bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-zinc-900 to-zinc-950 shadow-inner overflow-hidden">


                <div className="absolute top-8 left-8 flex p-1 bg-zinc-900/80 rounded-xl border border-zinc-800 backdrop-blur-xl z-0 shadow-2xl">
                    <button
                        onClick={() => setIsLandscape(false)}
                        className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${!isLandscape ? 'bg-indigo-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Portrait
                    </button>
                    <button
                        onClick={() => setIsLandscape(true)}
                        className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${isLandscape ? 'bg-indigo-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Landscape
                    </button>
                </div>

                {/* Virtual Device Canvas */}
                <div
                    className="bg-[#09090b] border-4 border-zinc-800 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5 relative shrink-0"
                    style={{
                        width: (cols * cellSize) + 30,
                        height: (rows * cellSize) + 30,
                        transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1), height 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                >
                    <div
                        className="w-full h-full grid gap-1 relative place-content-center"
                        style={{
                            gridTemplateColumns: `repeat(${cols}, ${cellSize - 4}px)`,
                            gridTemplateRows: `repeat(${rows}, ${cellSize - 4}px)`
                        }}
                    >
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
                                    className={`
                                        flex items-center justify-center rounded-md font-bold text-sm tracking-wide select-none w-full h-full cursor-grab active:cursor-grabbing backdrop-blur-md transition-all duration-200
                                        ${isSelected
                                        ? 'border-2 border-indigo-500 bg-indigo-500/20 text-indigo-100 shadow-[0_0_30px_rgba(99,102,241,0.3)] z-20 scale-[1.02]'
                                        : 'border-2 border-white/10 bg-white/5 text-zinc-300 z-10 hover:border-white/20 hover:bg-white/10'}
                                    `}
                                    style={{
                                        gridColumnStart: componentGeometry.x,
                                        gridColumnEnd: `span ${componentGeometry.w}`,
                                        gridRowStart: componentGeometry.y,
                                        gridRowEnd: `span ${componentGeometry.h}`,
                                        position: 'relative',
                                        touchAction: 'none'
                                    }}
                                    onClick={(e) => { e.stopPropagation(); setSelectedId(component.id); }}
                                >
                                    <span className="truncate px-2 pointer-events-none drop-shadow-md">
                                        {component.label || component.type}
                                    </span>

                                    {/* Resize Handle */}
                                    {isSelected && (
                                        <div
                                            onPointerDown={(event) => {
                                                event.stopPropagation();
                                                handlePointerDown(event, component.id, 'resize');
                                            }}
                                            onPointerMove={handlePointerMove}
                                            onPointerUp={handlePointerUp}
                                            onPointerCancel={handlePointerUp}
                                            className="absolute -bottom-2 -right-2 w-6 h-6 bg-zinc-100 rounded-full cursor-nwse-resize shadow-lg z-30 flex items-center justify-center border-2 border-indigo-500 hover:scale-110 transition-transform"
                                        >
                                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full pointer-events-none" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* PROPERTIES SIDEBAR */}
            <div className="w-100 shrink-0  bg-zinc-900 border-l border-zinc-800 flex flex-col shadow-2xl relative z-20">
                <div className="p-5 border-b border-zinc-800 bg-zinc-900/50">
                    <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-10">Layout Settings</h2>

                    <div className="flex items-center justify-between mb-4 gap-2">
                        <select
                            value={activeId}
                            onChange={handleLayoutChange}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        >
                            {allControlLayouts.map(layout => (
                                <option key={layout.id} value={layout.id}>{layout.title}</option>
                            ))}
                        </select>

                        <button
                            onClick={makeNewLayout}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold p-2 rounded-lg text-sm transition-al"
                        >
                            Create New Layout
                        </button>
                    </div>

                    <div className="flex items-center justify-between mb-4 gap-2">
                        <input
                            type="text"
                            value={layoutTitle}
                            onChange={(event) => setLayoutTitle(event.target.value)}
                            className="w-full bg-zinc-900 border-b-2 border-zinc-800 px-3 py-2 text-zinc-200 text-sm outline-none "
                            placeholder="Layout Title"
                        />

                        <button
                            onClick={handleSave}
                            disabled={saveStatus === 'success'}
                            className={`
        w-full font-semibold p-2 rounded-lg text-sm transition-all flex gap-2  
        ${saveStatus === 'idle'
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-95' : ''}
  
        ${saveStatus === 'success'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-[1.02]' : ''}
        ${saveStatus === 'error'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse' : ''}
    `}
                        >
                            {saveStatus === 'idle' && (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    Save Layout
                                </>
                            )}
                            {saveStatus === 'success' && (
                                <>
                                    <svg className="w-5 h-5 animate-[bounce_0.5s_ease-in-out]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Layout Saved!
                                </>
                            )}

                            {saveStatus === 'error' && (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Failed to Save
                                </>
                            )}
                        </button>
                    </div>

                </div>

                <div className="flex-1 p-5 overflow-y-auto">
                    {selectedComp && activeGeo ? (
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase">Configuration</h3>
                                <div className="grid gap-2">
                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Type</label>
                                    <select
                                        value={selectedComp.type}
                                        onChange={(e) => updateControlComponent(selectedComp.id, { type: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300"
                                    >
                                        {Object.keys(LayoutComponentMapping).map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Label</label>
                                    <input
                                        value={selectedComp.label}
                                        onChange={(e) => updateControlComponent(selectedComp.id, { label: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase">Actions</h3>
                                <div className="grid gap-2">
                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Action Type</label>
                                    <select
                                        value={selectedComp.data?.actionType || 'none'}
                                        onChange={(e) => updateControlComponent(selectedComp.id, { data: { ...selectedComp.data, actionType: e.target.value } })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300"
                                    >
                                        <option value="none">None</option>
                                        <option value="keyPress">Key Press</option>
                                        <option value="typing">Text Input</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Value</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={selectedComp.data?.actionValue || ''}
                                            onChange={(e) => updateControlComponent(selectedComp.id, { data: { ...selectedComp.data, actionValue: e.target.value } })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300"
                                            disabled={isListening}
                                        />
                                        <button
                                            onClick={() => setIsListening(!isListening)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${
                                                isListening
                                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 animate-pulse'
                                                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                                            }`}
                                        >
                                            {isListening ? 'Press Key...' : 'Capture Key'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase">Geometry ({isLandscape ? 'Landscape' : 'Portrait'})</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['x', 'y', 'w', 'h'] as const).map(axis => (
                                        <div key={axis} className="grid gap-1">
                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">{axis.toUpperCase()}</label>
                                            <input
                                                type="number"
                                                value={activeGeo[axis]}
                                                onChange={(e) => updateGeometry(selectedComp.id, axis, Number(e.target.value))}
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => removeControlComponent(selectedComp.id)}
                                className="w-full text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-widest pt-2"
                            >
                                Delete Component
                            </button>
                        </div>
                    ) : (
                        <div className="text-center text-zinc-600 text-sm mt-10">Select an item to edit</div>
                    )}
                </div>
            </div>

        </div>
    );
}