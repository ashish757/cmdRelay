import React, { useState, useEffect, useRef } from 'react';
import { useNet } from '../context/NetCtx.tsx';
import type { ControlComponent, Geo, ControlLayout } from "../types/controlLayouts.ts";
import { BuilderCanvas } from './BuilderCanvas';
import { BuilderSidebar } from './BuilderSidebar';

import { getCurrentWindow } from '@tauri-apps/api/window';



export function ControlLayoutBuilder() {
    const { sendPayload, layouts: globalLayouts } = useNet();

    const [allControlLayouts, setAllControlLayouts] = useState<ControlLayout[]>([]);
    const [activeId, setActiveId] = useState<string>(localStorage.getItem("builderLayoutId") || "");
    const [layoutTitle, setLayoutTitle] = useState<string>('');
    const [componentArray, setComponentArray] = useState<ControlComponent[]>([]);

    const [isLandscape, setIsLandscape] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [isListening, setIsListening] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const hasLoadedData = useRef(false);

    useEffect(() => {
        const forceWindowsScaleUpdate = async () => {
            const appWindow = getCurrentWindow();
            const size = await appWindow.innerSize();
            await appWindow.setSize(size);
        };

        forceWindowsScaleUpdate();
    }, []);

    useEffect(() => {
        if (!globalLayouts) return;

        setAllControlLayouts(globalLayouts);

        if (!hasLoadedData.current && globalLayouts.length > 0) {
            const savedId = localStorage.getItem("builderLayoutId");
            const targetLayout = globalLayouts.find((l: ControlLayout) => l.id === savedId) || globalLayouts[0];

            loadControlLayout(targetLayout);
            hasLoadedData.current = true;
        }

    }, [globalLayouts]); 

    useEffect(() => {
        if (!isListening || !selectedId) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            let keyName = e.key;
            if (keyName === ' ') keyName = 'Space';

            setComponentArray(prev => prev.map(c =>
                c.id !== selectedId ? c : { ...c, data: { ...c.data, actionType: 'keyPress', actionValue: { ...c.data.actionValue, keyId: keyName } } }
            ));
            setIsListening(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isListening, selectedId]);

    const activeLayout = allControlLayouts.find(l => l.id === activeId);

    const updateLayoutApps = (newApps: string[]) => {
        setAllControlLayouts(prev => prev.map(l =>
            l.id === activeId ? { ...l, targetApps: newApps } : l
        ));
    };

    const loadControlLayout = (layout: ControlLayout) => {
        setActiveId(layout.id);
        localStorage.setItem('builderLayoutId', layout.id); // Centralized storage save
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

    const deleteLayout = async (layoutIdToDelete: string) => {
        if (!window.confirm("Are you sure you want to delete this layout? This action cannot be undone.")) {
            return;
        }

        const updatedLayouts = allControlLayouts.filter(layout => layout.id !== layoutIdToDelete);

        setAllControlLayouts(updatedLayouts);
        localStorage.setItem('layouts', JSON.stringify(updatedLayouts));

        if (activeId === layoutIdToDelete) {
            if (updatedLayouts.length > 0) {
                loadControlLayout(updatedLayouts[0]);
            } else {
                makeNewLayout();
            }
        }

        await sendPayload({ actionType: "deleteLayout", payload: { id: layoutIdToDelete } });
    };

    const handleLayoutChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const targetValue = event.target.value;
        const foundLayout = allControlLayouts.find(layout => layout.id === targetValue);
        if (foundLayout) loadControlLayout(foundLayout);
    };

    const handleSave = async () => {
        const updated = allControlLayouts.map(l => {
            return l.id === activeId ? { ...l, title: layoutTitle, components: componentArray } : l
        });

        setAllControlLayouts(updated);
        localStorage.setItem('layouts', JSON.stringify(updated));

        const res = await sendPayload({ actionType: "saveLayout", payload: { layouts: updated } });
        setSaveStatus(res === "fail" ? 'error' : 'success');
        setTimeout(() => setSaveStatus('idle'), 2000);
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

    return (
        <div className="flex h-screen bg-background text-text-main font-sans overflow-hidden selection:bg-primary/30">
            <BuilderCanvas
                isLandscape={isLandscape}
                setIsLandscape={setIsLandscape}
                componentArray={componentArray}
                setComponentArray={setComponentArray}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                removeControlComponent={removeControlComponent}
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
                deleteLayout={deleteLayout}
                activeLayout={activeLayout}
                updateLayoutApps={updateLayoutApps}
            />
        </div>
    );
}