import React, { useState, useEffect } from 'react';
import { useNet } from '../context/NetCtx.tsx';
import type { ControlComponent, Geo, ControlLayout } from "../types/controlLayouts.ts";
import { BuilderCanvas } from './BuilderCanvas';
import { BuilderSidebar } from './BuilderSidebar';

export function ControlLayoutBuilder() {
    const { sendPayload } = useNet();

    // 1. Core State
    const [allControlLayouts, setAllControlLayouts] = useState<ControlLayout[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const [layoutTitle, setLayoutTitle] = useState<string>('');
    const [componentArray, setComponentArray] = useState<ControlComponent[]>([]);

    // 2. UI View State
    const [isLandscape, setIsLandscape] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // 3. Status/Interaction State
    const [isListening, setIsListening] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        const cache = localStorage.getItem('layouts');
        if (cache) {
            try {
                const parsedData = JSON.parse(cache);
                if (Array.isArray(parsedData) && parsedData.length > 0) {
                    setAllControlLayouts(parsedData);
                    loadControlLayout(parsedData[0]);
                } else makeNewLayout();
            } catch (error) { makeNewLayout(); }
        } else makeNewLayout();
    }, []);

    useEffect(() => {
        if (!isListening || !selectedId) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            let keyName = e.key;
            if (keyName === ' ') keyName = 'Space';

            setComponentArray(prev => prev.map(c =>
                c.id !== selectedId ? c : { ...c, data: { ...c.data, actionType: 'keyPress', actionValue: keyName } }
            ));
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
        const foundLayout = allControlLayouts.find(layout => layout.id === targetValue);
        if (foundLayout) loadControlLayout(foundLayout);
    };

    const handleSave = async () => {
        const updated = allControlLayouts.map(l =>
            l.id === activeId ? { ...l, title: layoutTitle, components: componentArray } : l
        );
        setAllControlLayouts(updated);
        localStorage.setItem('layouts', JSON.stringify(updated));

        const res = await sendPayload({ actionType: "saveLayout", payload: { layouts: updated } });
        setSaveStatus(res === "fail" ? 'error' : 'success');
        setTimeout(() => setSaveStatus('idle'), 2000);
    };

    // Shared Helper Methods
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

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500/30">
            <BuilderCanvas
                isLandscape={isLandscape}
                setIsLandscape={setIsLandscape}
                componentArray={componentArray}
                setComponentArray={setComponentArray}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
            />
            <BuilderSidebar
                allControlLayouts={allControlLayouts}
                activeId={activeId}
                layoutTitle={layoutTitle}
                setLayoutTitle={setLayoutTitle}
                handleLayoutChange={handleLayoutChange}
                makeNewLayout={makeNewLayout}
                handleSave={handleSave}
                saveStatus={saveStatus}
                selectedComp={componentArray.find(c => c.id === selectedId)}
                isLandscape={isLandscape}
                updateControlComponent={updateControlComponent}
                updateGeometry={updateGeometry}
                removeControlComponent={removeControlComponent}
                isListening={isListening}
                setIsListening={setIsListening}
            />
        </div>
    );
}