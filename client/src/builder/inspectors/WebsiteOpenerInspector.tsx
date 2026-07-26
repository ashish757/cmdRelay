export function WebsiteOpenerInspector({ selectedComp, updateControlComponent }: any) {
    const currentValue = selectedComp.data?.actionValue?.url || "";

    const handleUrlChange = (newUrl: string) => {
        updateControlComponent(selectedComp.id, {
            data: {
                ...selectedComp.data,
                actionValue: {
                    ...selectedComp.data?.actionValue,
                    webUrl: newUrl
                }
            }
        });
    };

    return (
        <div className="space-y-3 p-3">
            <label className="text-[10px] uppercase text-text-muted tracking-widest font-bold">
                Website URL
            </label>

            <input
                type="url"
                value={currentValue}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://github.com or google.com"
                className="w-full bg-[#1e1e1e] text-white text-sm rounded-md px-3 py-2 border border-[#333] focus:outline-none focus:border-blue-500"
            />

            <p className="text-[10px] text-text-muted mt-1">
                The URL will automatically open in the host computer's default browser.
            </p>
        </div>
    );
}