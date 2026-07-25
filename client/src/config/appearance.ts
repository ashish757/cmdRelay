import React from 'react';
import {
    Monitor, Terminal, Play, Pause, Volume2,
    Globe, Folder, Gamepad2, Code, Zap
} from 'lucide-react';

export const COLOR_PRESETS = [
    'transparent', '#1f2937', '#ef4444', '#22c55e',
    '#3b82f6', '#eab308', '#a855f7', '#ec4899'
];

export const CATALOG_PRESETS = [
    { id: 'youtube', label: 'YouTube' },
    { id: 'vscode', label: 'VS Code' },
    { id: 'discord', label: 'Discord' },
    { id: 'spotify', label: 'Spotify' },
    { id: 'chrome', label: 'Chrome' },
];

export const ICON_PRESETS = [
    { id: 'Monitor', icon: Monitor },
    { id: 'Terminal', icon: Terminal },
    { id: 'Play', icon: Play },
    { id: 'Pause', icon: Pause },
    { id: 'Volume2', icon: Volume2 },
    { id: 'Globe', icon: Globe },
    { id: 'Folder', icon: Folder },
    { id: 'Gamepad2', icon: Gamepad2 },
    { id: 'Code', icon: Code },
    { id: 'Zap', icon: Zap }
];

export const ICON_MAP: Record<string, React.ElementType> = ICON_PRESETS.reduce((acc, curr) => {
    acc[curr.id] = curr.icon;
    return acc;
}, {} as Record<string, React.ElementType>);