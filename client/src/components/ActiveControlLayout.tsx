import {controlLayouts} from "../config/ctrlConfig.ts";

export default function ActiveControlLayout({activeId}: {activeId: string}) {

    const Comp = controlLayouts[activeId];
    return <Comp />
}
