import React, { useState } from 'react';
import type { InspectorProps } from '../../types/inspector';
import { Eye, EyeOff, Search } from 'lucide-react';
import { COLOR_PRESETS, ICON_PRESETS, CATALOG_PRESETS } from '../../config/appearance';

export const AppearanceInspector: React.FC<InspectorProps> = ({ selectedComp, updateControlComponent }) => {
    const currentStyle = selectedComp.style || {};

    const [searchQuery, setSearchQuery] = useState('');

    const bgColor = currentStyle.bg || 'transparent';
    const textColor = currentStyle.color || '#ffffff';
    const showLabel = currentStyle.showLabel !== false;
    const selectedIcon = currentStyle.icon || '';
    const selectedImage = currentStyle.image || '';

    const updateStyle = (updates: Record<string, any>) => {

        updateControlComponent(selectedComp.id, {
            ...selectedComp,
            style: {
                ...currentStyle,
                ...updates
            }
        });

        console.log("style updated", {
            ...selectedComp,
            style: {
                ...currentStyle,
                ...updates
            }
        })
    };

    const assetMode = selectedImage ? 'image' : selectedIcon ? 'icon' : 'none';

    const filteredIcons = ICON_PRESETS.filter(item =>
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredImages = CATALOG_PRESETS.filter(app =>
        app.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">

            <div className="space-y-3">
                <label className="text-[10px] font-bold text-text-muted tracking-widest uppercase">
                    Colors
                </label>

                <div className="flex flex-col gap-3 p-3 bg-surface border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-text-main">Background</span>
                        <div className="flex items-center gap-1.5">
                            {COLOR_PRESETS.slice(0, 5).map(color => (
                                <button
                                    key={color}
                                    onClick={() => updateStyle({ bg: color })}
                                    className={`w-5 h-5 rounded-md border ${bgColor === color ? 'border-primary' : 'border-border'}`}
                                    style={{ backgroundColor: color === 'transparent' ? '#00000020' : color }}
                                />
                            ))}
                            <div className="w-[1px] h-4 bg-border mx-1"></div>
                            <input
                                type="color"
                                value={bgColor === 'transparent' ? '#000000' : bgColor}
                                onChange={(e) => updateStyle({ bg: e.target.value })}
                                className="w-5 h-5 rounded-md cursor-pointer border-0 p-0 bg-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-text-main">Text Color</span>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => updateStyle({ color: '#ffffff' })} className={`w-5 h-5 rounded-md border bg-white ${textColor === '#ffffff' ? 'border-primary' : 'border-border'}`} />
                            <button onClick={() => updateStyle({ color: '#9ca3af' })} className={`w-5 h-5 rounded-md border bg-gray-400 ${textColor === '#9ca3af' ? 'border-primary' : 'border-border'}`} />
                            <button onClick={() => updateStyle({ color: '#000000' })} className={`w-5 h-5 rounded-md border bg-black ${textColor === '#000000' ? 'border-primary' : 'border-border'}`} />
                            <div className="w-[1px] h-4 bg-border mx-1"></div>
                            <input
                                type="color"
                                value={textColor}
                                onChange={(e) => updateStyle({ color: e.target.value })}
                                className="w-5 h-5 rounded-md cursor-pointer border-0 p-0 bg-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-text-muted tracking-widest uppercase">
                        Label Display
                    </label>
                    <button
                        onClick={() => updateStyle({ showLabel: !showLabel })}
                        className="flex items-center gap-2 text-xs text-text-main bg-surface px-2 py-1 rounded border border-border hover:border-primary/50 transition-colors"
                    >
                        {showLabel ? <Eye size={14} className="text-primary" /> : <EyeOff size={14} className="text-text-muted" />}
                        {showLabel ? 'Visible' : 'Hidden'}
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-text-muted tracking-widest uppercase">
                        Icon & Graphic
                    </label>
                </div>

                <div className="flex p-1 bg-surface border border-border rounded-lg text-xs font-medium">
                    <button
                        onClick={() => {
                            if (assetMode !== 'none') updateStyle({ icon: '', image: '' });
                            setSearchQuery('');
                        }}
                        className={`flex-1 py-1.5 rounded-md transition-colors ${assetMode === 'none' ? 'bg-background text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                    >
                        None
                    </button>
                    <button
                        onClick={() => {
                            if (assetMode !== 'icon') updateStyle({ image: '', icon: ICON_PRESETS[0].id });
                            setSearchQuery('');
                        }}
                        className={`flex-1 py-1.5 rounded-md transition-colors ${assetMode === 'icon' ? 'bg-background text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Icon
                    </button>
                    <button
                        onClick={() => {
                            if (assetMode !== 'image') updateStyle({ icon: '', image: `catalog:${CATALOG_PRESETS[0].id}` });
                            setSearchQuery('');
                        }}
                        className={`flex-1 py-1.5 rounded-md transition-colors ${assetMode === 'image' ? 'bg-background text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Image (logo)
                    </button>
                </div>

                {assetMode !== 'none' && (
                    <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder={`Search ${assetMode}s...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background border border-border rounded-md pl-8 pr-3 py-1.5 text-xs text-text-main outline-none focus:border-primary transition-colors placeholder:text-text-muted/50"
                        />
                    </div>
                )}

                {assetMode === 'icon' && (
                    <div className="grid grid-cols-5 gap-2 p-3 bg-surface border border-border rounded-lg max-h-[160px] overflow-y-auto custom-scrollbar">
                        {filteredIcons.length > 0 ? (
                            filteredIcons.map((item) => {
                                const IconComp = item.icon;
                                const isSelected = selectedIcon === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => updateStyle({ icon: item.id, image: '' })}
                                        className={`flex items-center justify-center p-2 rounded border transition-colors ${
                                            isSelected ? 'bg-primary/20 border-primary text-primary' : 'border-border text-text-muted hover:border-text-muted hover:text-text-main'
                                        }`}
                                    >
                                        <IconComp size={18} />
                                    </button>
                                );
                            })
                        ) : (
                            <div className="col-span-5 text-center py-4 text-xs text-text-muted">No icons found.</div>
                        )}
                    </div>
                )}

                {assetMode === 'image' && (
                    <div className="grid grid-cols-2 gap-2 p-3 bg-surface border border-border rounded-lg max-h-[160px] overflow-y-auto custom-scrollbar">
                        {filteredImages.length > 0 ? (
                            filteredImages.map((app) => {
                                const catalogString = `catalog:${app.id}`;
                                const isSelected = selectedImage === catalogString;
                                return (
                                    <button
                                        key={app.id}
                                        onClick={() => updateStyle({ image: catalogString, icon: '' })}
                                        className={`flex items-center gap-2 p-2 rounded border transition-colors ${
                                            isSelected ? 'bg-primary/20 border-primary text-primary' : 'border-border text-text-muted hover:border-text-muted hover:text-text-main'
                                        }`}
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center bg-background rounded-sm border border-border/50">
                                            <img
                                                src={`/logos/${app.id}.svg`}
                                                alt={app.label}
                                                className="w-3.5 h-3.5 object-contain"
                                                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                                            />
                                        </div>
                                        <span className="text-xs truncate">{app.label}</span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="col-span-2 text-center py-4 text-xs text-text-muted">No images found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};