import { useState } from 'react';
import { useNet } from '../../context/NetCtx';
import { SearchableDropdown } from '../../components/SearchableDropdown';

export function AppOpenerInspector({ selectedComp, updateControlComponent }: any) {
    const { knownApps } = useNet();

    const [isCustomMode, setIsCustomMode] = useState(false);
    const currentValue = selectedComp.data?.actionValue?.appId || "";

    const handleAppChange = (selectedApp: string) => {
        updateControlComponent(selectedComp.id, {
            data: {
                ...selectedComp.data,
                actionValue: {
                    ...selectedComp.data?.actionValue,
                    appId: selectedApp
                }
            }
        });
    };

    return (
        <div className="space-y-3 p-3">
            <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase text-text-muted tracking-widest font-bold">
                    Application to Open
                </label>

                <button
                    type="button"
                    onClick={() => setIsCustomMode(!isCustomMode)}
                    className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
                >
                    {isCustomMode ? "Select from list" : "Enter custom app"}
                </button>
            </div>

            {isCustomMode ? (
                <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => handleAppChange(e.target.value)}
                    placeholder="e.g., custom-app.exe or /usr/bin/custom"
                    className="w-full bg-background text-text-muted text-sm rounded-md px-3 py-2 border border-[#333] focus:outline-none focus:border-blue-500"
                />
            ) : (
                <SearchableDropdown
                    options={knownApps}
                    value={currentValue}
                    onChange={handleAppChange}
                />
            )}
        </div>
    );
}