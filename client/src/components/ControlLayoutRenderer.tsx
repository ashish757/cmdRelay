import { useState, useEffect } from "react";
import { preBuiltLayouts, LayoutComponentMapping } from "../config/ctrlConfig.ts";
import { type ControlLayout } from "../types/controlLayouts.ts";

const useDeviceOrientation = () => {
    const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

    useEffect(() => {
        const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return isLandscape;
};

export default function ControlLayoutRenderer({ activeLayout }: { activeLayout: string }) {
    const isLandscape = useDeviceOrientation();

    const customLayouts: ControlLayout[] = JSON.parse(localStorage.getItem("layouts") || "[]");

    const layout: ControlLayout | undefined = [...preBuiltLayouts, ...customLayouts].find(
        (currentLayout) => currentLayout.id === activeLayout
    );

    if (!layout) {
        return <> </>;
    }

    const componentList = layout.components;

    const totalColumns = isLandscape ? 16 : 8;
    const totalRows = isLandscape ? 8 : 16;

    return (
        <div className="fixed inset-0 bg-black overflow-hidden p-2">
            <div
                className="w-full h-full grid gap-2"
                style={{
                    gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${totalRows}, minmax(0, 1fr))`,
                }}
            >
                {componentList.map((component) => {
                    const ComponentToRender = LayoutComponentMapping[component.type];

                    if (!ComponentToRender) return null;

                    const activeGeometry = isLandscape ? component.landscapeGeo : component.portraitGeo;

                    if (!activeGeometry || activeGeometry.w === 0 || activeGeometry.h === 0) return null;

                    return (
                        <div
                            key={component.id}
                            className="w-full h-full flex flex-col relative"
                            style={{
                                gridColumnStart: activeGeometry.x,
                                gridColumnEnd: `span ${activeGeometry.w}`,
                                gridRowStart: activeGeometry.y,
                                gridRowEnd: `span ${activeGeometry.h}`,
                            }}
                        >
                            <ComponentToRender component={component} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}