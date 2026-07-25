import React from 'react';
import type { InspectorProps } from '../../types/inspector';
import {
    Volume2, VolumeX, Play, SkipForward, SkipBack,
    Sun, Moon, MoonStar, Lock, AppWindow, Command, Monitor
} from 'lucide-react';

export const SPECIAL_FUNCTIONS = [
    {
        category: 'Media Controls',
        items: [
            { id: 'media_play_pause', label: 'Play / Pause', icon: Play },
            { id: 'media_next', label: 'Next Track', icon: SkipForward },
            { id: 'media_prev', label: 'Previous Track', icon: SkipBack },
            { id: 'volume_up', label: 'Volume Up', icon: Volume2 },
            { id: 'volume_down', label: 'Volume Down', icon: Volume2 },
            { id: 'volume_mute', label: 'Mute', icon: VolumeX },
        ],
    },
    {
        category: 'Display Controls',
        items: [
            { id: 'brightness_up', label: 'Brightness Up', icon: Sun },
            { id: 'brightness_down', label: 'Brightness Down', icon: Moon },
        ],
    },
    {
        category: 'System (Global)',
        items: [
            { id: 'system_sleep', label: 'Sleep', icon: MoonStar },
            { id: 'system_lock', label: 'Lock Screen', icon: Lock },
        ],
    },
    {
        category: 'System (macOS)',
        items: [
            { id: 'mac_mission_control', label: 'Mission Control', icon: AppWindow },
            { id: 'mac_spotlight', label: 'Spotlight Search', icon: Command },
            { id: 'mac_dnd', label: 'Do Not Disturb', icon: Moon },
        ],
    },
    {
        category: 'System (Windows)',
        items: [
            { id: 'win_task_view', label: 'Task View', icon: AppWindow },
            { id: 'win_start_menu', label: 'Start Menu', icon: Monitor },
        ],
    },
];

export const SpecialInspector: React.FC<InspectorProps> = ({ selectedComp, updateControlComponent }) => {
    const currentCommand = selectedComp.data?.actionValue?.command || '';

    const handleCommandSelect = (commandId: string) => {
        updateControlComponent(selectedComp.id, {
            data: {
                ...selectedComp.data,
                actionType: 'specialFunction',
                actionValue: {
                    ...selectedComp.data?.actionValue,
                    command: commandId
                }
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-muted tracking-widest uppercase">
                    OS Function
                </label>
                <span className="text-[10px] text-text-muted">
                    Trigger a system-level hardware or OS command.
                </span>
            </div>

            {/* Scrollable list matching the MacroInspector height/scrollbar */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {SPECIAL_FUNCTIONS.map((group) => (
                    <div key={group.category} className="space-y-2">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            {group.category}
                        </span>
                        <div className="grid grid-cols-1 gap-2">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isSelected = currentCommand === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleCommandSelect(item.id)}
                                        className={`flex items-center gap-3 p-2 rounded-lg border transition-colors text-xs text-left w-full group ${
                                            isSelected
                                                ? 'bg-primary/10 border-primary text-primary font-bold'
                                                : 'bg-surface border-border text-text-main hover:border-primary/50'
                                        }`}
                                    >
                                        <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                                            <Icon
                                                size={16}
                                                className={isSelected ? 'text-primary' : 'text-text-muted group-hover:text-primary'}
                                            />
                                        </div>
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};