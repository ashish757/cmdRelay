import { useNet } from '../../context/NetCtx';
import { SearchableDropdown } from '../../components/SearchableDropdown';

export function AppOpenerInspector({ selectedComp, updateControlComponent }: any) {
    const { knownApps } = useNet();

    return (
        <div className="space-y-3 p-3">
            <label className="text-[10px] uppercase text-text-muted tracking-widest font-bold">
                Application to Open
            </label>

            <SearchableDropdown
                options={knownApps}
                value={selectedComp.data?.appId || ""}
                onChange={(selectedApp) => {
                    updateControlComponent(selectedComp.id, {
                        data: { ...selectedComp.data, appId: selectedApp }
                    });
                }}
            />
        </div>
    );
}