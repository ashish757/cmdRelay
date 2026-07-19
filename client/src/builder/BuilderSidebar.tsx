import React, {useState} from 'react';
import { controlElementsRegistry } from '../config/ctrlConfig.ts';
import type { ControlComponent, Geo, ControlLayout } from "../types/controlLayouts.ts";
import { Accordion } from '../components/Accordion';
import { MonitorSmartphone, Settings2, BoxSelect } from 'lucide-react';

interface SidebarProps {
    allControlLayouts: ControlLayout[];
    activeId: string;
    layoutTitle: string;
    setLayoutTitle: (title: string) => void;
    handleLayoutChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    makeNewLayout: () => void;
    handleSave: () => void;
    saveStatus: 'idle' | 'success' | 'error';
    selectedComp: ControlComponent | undefined;
    isLandscape: boolean;
    updateControlComponent: (id: string, updates: Partial<ControlComponent>) => void;
    updateGeometry: (id: string, axis: keyof Geo, value: number) => void;
}


export function BuilderSidebar(props: SidebarProps) {
    const {
        allControlLayouts, activeId, layoutTitle, setLayoutTitle, handleLayoutChange, makeNewLayout, handleSave, saveStatus,
        selectedComp, isLandscape, updateControlComponent, updateGeometry
    } = props;

    const activeGeo = selectedComp ? (isLandscape ? selectedComp.landscapeGeo : selectedComp.portraitGeo) : null;
    const SpecificInspector = selectedComp ? controlElementsRegistry[selectedComp.type]?.inspector : null;
    const [isAppModalOpen, setIsAppModalOpen] = useState(false);

    return (
        <div className="w-[440px] shrink-0 bg-background flex flex-col shadow-2xl border-l border-border relative z-20">

            <div className="p-5 border-b border-border bg-surface/40">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                        <MonitorSmartphone className="w-3 h-3" /> Edit & Create Control Layouts
                    </h2>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Current Layout</label>
                        <div className="flex gap-2 items-center">
                            <select
                                value={activeId}
                                onChange={handleLayoutChange}
                                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 text-text-main text-sm focus:border-primary outline-none cursor-pointer"
                            >
                                {allControlLayouts.map(layout => (
                                    <option key={layout.id} value={layout.id}>{layout.title}</option>
                                ))}
                            </select>

                            <button
                                onClick={makeNewLayout}
                                className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md shadow-emerald-900/20 transition-all flex items-center gap-1"
                            >
                                <span className="text-lg leading-none">+</span> New
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Layout Name</label>
                        <input
                            type="text"
                            value={layoutTitle}
                            onChange={(e) => setLayoutTitle(e.target.value)}
                            className="w-full bg-surface border border-border rounded-lg focus:border-primary px-3 py-2.5 text-text-main text-sm outline-none transition-colors"
                            placeholder="e.g., Gaming Setup, Productivity"
                        />
                    </div>
                </div>

                <div className="mt-5">
                    <button onClick={() => setIsAppModalOpen(true)} className="w-full flex items-center justify-between bg-surface hover:bg-border/50 border border-border rounded-lg p-3 transition-colors group">
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-bold uppercase text-text-muted tracking-widest">Target Application</span>
                            <span className="text-sm font-semibold text-text-muted group-hover:text-text-main">Global (All Apps)</span>
                        </div>
                        <Settings2 className="w-4 h-4 text-text-muted group-hover:text-primary" />
                    </button>
                </div>

                <button onClick={handleSave} disabled={saveStatus === 'success'} className={`w-full mt-4 font-bold p-2.5 rounded-lg text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${saveStatus === 'idle' ? 'bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/20' : ''} ${saveStatus === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : ''} ${saveStatus === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : ''}`}>
                    {saveStatus === 'idle' && 'Save & Sync Layout'}
                    {saveStatus === 'success' && 'Synced Successfully!'}
                    {saveStatus === 'error' && 'Sync Failed'}
                </button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                {selectedComp && activeGeo ? (
                    <div className="space-y-2 pb-10">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <BoxSelect className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-bold text-text-main">Selected Control Settings</h3>
                        </div>

                        <Accordion title="Control Appearance" defaultExpanded={true}>
                            <div className="grid gap-2">
                                <label className="text-[10px] uppercase text-text-muted tracking-widest font-bold">Widget Type</label>
                                <select
                                    value={selectedComp.type}
                                    onChange={(e) => updateControlComponent(selectedComp.id, { type: e.target.value })}
                                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-main outline-none"
                                >
                                    {Object.keys(controlElementsRegistry).map(key => (
                                        <option key={key} value={key}>
                                            {controlElementsRegistry[key].title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </Accordion>

                        {SpecificInspector && (
                            <Accordion title="Button Actions" defaultExpanded={true}>
                                <SpecificInspector
                                    selectedComp={selectedComp}
                                    updateControlComponent={updateControlComponent}
                                />
                            </Accordion>
                        )}

                        <Accordion title={`Size & Position (${isLandscape ? 'Landscape' : 'Portrait'})`} defaultExpanded={false}>
                            <div className="grid grid-cols-2 gap-3 bg-surface/50 p-3 rounded-lg border border-border/50">
                                {(['x', 'y', 'w', 'h'] as const).map(axis => (
                                    <div key={axis} className="grid gap-1">
                                        <label className="text-[10px] uppercase text-text-muted font-bold">{axis.toUpperCase()}</label>
                                        <input type="number" value={activeGeo[axis]} onChange={(e) => updateGeometry(selectedComp.id, axis, Number(e.target.value))} className="w-full bg-background border border-border rounded flex-1 px-2 py-1.5 text-sm text-text-main outline-none focus:border-primary text-center font-mono" />
                                    </div>
                                ))}
                            </div>
                        </Accordion>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted space-y-4">
                        <BoxSelect className="w-12 h-12 text-border" />
                        <span className="text-sm font-semibold tracking-wide">Select an element to edit</span>
                    </div>
                )}
            </div>

            {isAppModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-background border border-border rounded-xl shadow-2xl w-[400px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50">
                            <h3 className="font-bold text-sm text-text-main">Map Layout to Application</h3>
                            <button onClick={() => setIsAppModalOpen(false)} className="text-text-muted hover:text-text-main">✕</button>
                        </div>

                        <div className="p-5 space-y-4">
                            <p className="text-xs text-text-muted">
                                This layout will automatically activate on your phone when this application is focused on your computer.
                            </p>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Application Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Spotify, VS Code"
                                    className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-text-main focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-surface/50 border-t border-border flex justify-end gap-2">
                            <button
                                onClick={() => setIsAppModalOpen(false)}
                                className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-main transition-colors tracking-widest uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setIsAppModalOpen(false);
                                }}
                                className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg text-xs font-bold transition-colors tracking-widest uppercase"
                            >
                                Save Mapping
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}