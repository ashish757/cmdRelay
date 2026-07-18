import React from 'react';
import { LayoutComponentMapping } from '../config/ctrlConfig.ts';
import { InspectorRegistry } from '../config/inspectorRegistry.ts';
import type { ControlComponent, Geo, ControlLayout } from "../types/controlLayouts.ts";

interface SidebarProps {
    // Layout State
    allControlLayouts: ControlLayout[];
    activeId: string;
    layoutTitle: string;
    setLayoutTitle: (title: string) => void;
    handleLayoutChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    makeNewLayout: () => void;
    handleSave: () => void;
    saveStatus: 'idle' | 'success' | 'error';

    // Component State
    selectedComp: ControlComponent | undefined;
    isLandscape: boolean;
    updateControlComponent: (id: string, updates: Partial<ControlComponent>) => void;
    updateGeometry: (id: string, axis: keyof Geo, value: number) => void;
    removeControlComponent: (id: string) => void;

    // Listening State
    isListening: boolean;
    setIsListening: (val: boolean) => void;
}

export function BuilderSidebar(props: SidebarProps) {
    const {
        allControlLayouts, activeId, layoutTitle, setLayoutTitle, handleLayoutChange, makeNewLayout, handleSave, saveStatus,
        selectedComp, isLandscape, updateControlComponent, updateGeometry, removeControlComponent, isListening, setIsListening
    } = props;

    const activeGeo = selectedComp ? (isLandscape ? selectedComp.landscapeGeo : selectedComp.portraitGeo) : null;
    const SpecificInspector = selectedComp ? InspectorRegistry[selectedComp.type] : null;

    return (
        <div className="w-[440px] shrink-0 bg-zinc-900 border-l border-zinc-800 flex flex-col shadow-2xl relative z-20">
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/50">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-10">Layout Settings</h2>

                <div className="flex items-center justify-between mb-4 gap-2">
                    <select value={activeId} onChange={handleLayoutChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 text-sm focus:border-indigo-500 transition-all">
                        {allControlLayouts.map(layout => <option key={layout.id} value={layout.id}>{layout.title}</option>)}
                    </select>
                    <button onClick={makeNewLayout} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold p-2 rounded-lg text-sm transition-all">
                        Create New
                    </button>
                </div>

                <div className="flex items-center justify-between mb-4 gap-2">
                    <input type="text" value={layoutTitle} onChange={(e) => setLayoutTitle(e.target.value)} className="w-full bg-zinc-900 border-b-2 border-zinc-800 px-3 py-2 text-zinc-200 text-sm outline-none" placeholder="Layout Title" />
                    <button onClick={handleSave} disabled={saveStatus === 'success'} className={`w-full font-semibold p-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${saveStatus === 'idle' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : ''} ${saveStatus === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : ''} ${saveStatus === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : ''}`}>
                        {saveStatus === 'idle' && 'Save Layout'}
                        {saveStatus === 'success' && 'Saved!'}
                        {saveStatus === 'error' && 'Failed'}
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
                                <select value={selectedComp.type} onChange={(e) => updateControlComponent(selectedComp.id, { type: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300">
                                    {Object.keys(LayoutComponentMapping).map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* RENDER SPECIFIC INSPECTOR MODULARLY */}
                        {SpecificInspector && (
                            <SpecificInspector
                                selectedComp={selectedComp}
                                updateControlComponent={updateControlComponent}
                                isListening={isListening}
                                setIsListening={setIsListening}
                            />
                        )}

                        <div className="space-y-3 pt-4 border-t border-zinc-800">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase">Geometry ({isLandscape ? 'Landscape' : 'Portrait'})</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {(['x', 'y', 'w', 'h'] as const).map(axis => (
                                    <div key={axis} className="grid gap-1">
                                        <label className="text-[10px] uppercase text-zinc-500 font-bold">{axis.toUpperCase()}</label>
                                        <input type="number" value={activeGeo[axis]} onChange={(e) => updateGeometry(selectedComp.id, axis, Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button onClick={() => removeControlComponent(selectedComp.id)} className="w-full text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-widest pt-2 border-t border-zinc-800 mt-4">
                            Delete Component
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-zinc-600 text-sm mt-10">Select an item to edit</div>
                )}
            </div>
        </div>
    );
}