import React from 'react';
import { controlElementsRegistry } from '../config/ctrlConfig.ts';
import type { ControlComponent, Geo, ControlLayout } from "../types/controlLayouts.ts";
import { Accordion } from '../components/Accordion';
import { MonitorSmartphone, BoxSelect } from 'lucide-react';
import {useNet} from "../context/NetCtx.tsx";
import {SearchableDropdown} from "../components/SearchableDropdown.tsx";

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
    deleteLayout: (id: string) => void;
    updateLayoutApps: (apps: string[]) => void;
    activeLayout: ControlLayout | undefined;
}


export function BuilderSidebar(props: SidebarProps) {
    const {
        allControlLayouts, activeId, layoutTitle, setLayoutTitle, handleLayoutChange, makeNewLayout, handleSave, saveStatus,
        selectedComp, isLandscape, updateControlComponent, updateGeometry, deleteLayout, updateLayoutApps, activeLayout
    } = props;

    const { knownApps } = useNet();
    const selectedApps = activeLayout?.targetApps || [];

    const activeGeo = selectedComp ? (isLandscape ? selectedComp.landscapeGeo : selectedComp.portraitGeo) : null;
    const SpecificInspector = selectedComp ? controlElementsRegistry[selectedComp.type]?.inspector : null;

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
                                onClick={() => deleteLayout(activeId)}
                                className="shrink-0 flex items-center justify-center w-[42px] h-[42px] text-red-400 bg-red-400/10 border border-border hover:border-red-400/30 rounded-lg transition-colors"
                                title="Delete Current Layout"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
                            </button>

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

                <div className="mt-5 space-y-2">
                    <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest px-1">
                        Mapped Applications
                    </label>

                    <div className="flex flex-wrap gap-2 px-1">
                        {selectedApps.map(app => (
                            <div key={app} className="flex items-center gap-1 bg-primary/20 text-primary px-2.5 py-1 rounded-md text-[10px] font-bold border border-primary/30">
                                {app}
                                <button
                                    onClick={() => updateLayoutApps(selectedApps.filter(a => a !== app))}
                                    className="hover:text-white transition-colors ml-1"
                                >✕</button>
                            </div>
                        ))}
                    </div>

                    <SearchableDropdown
                        options={knownApps.filter((app: string) => !selectedApps.includes(app))}
                        value=""
                        placeholder="Search to add an app..."
                        onChange={(newApp) => {
                            updateLayoutApps([...selectedApps, newApp]);
                        }}
                    />
                </div>

                <button onClick={handleSave} disabled={saveStatus === 'success'} className={`w-full mt-4 font-bold p-2.5 rounded-lg text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${saveStatus === 'idle' ? 'bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/20' : ''} ${saveStatus === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : ''} ${saveStatus === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : ''}`}>
                    {saveStatus === 'idle' && 'Save & Sync Layout'}
                    {saveStatus === 'success' && 'Synced Successfully!'}
                    {saveStatus === 'error' && 'Sync Failed'}
                </button>
            </div>

            <div className="flex-1 p-1 overflow-y-auto custom-scrollbar">
                {selectedComp && activeGeo ? (
                    <div className="space-y-2 pb-10">
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
        </div>
    );
}