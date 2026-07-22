import { useNet } from "../context/NetCtx.tsx";
import { useEffect } from "react";
import type {ProcessInfo} from "../types/telemetry.ts";

export const SystemTelemetryDashboard = () => {
    const { sysInfo, sendPayload, connectionStatus } = useNet();


    useEffect(() => {
        if (connectionStatus === "CONNECTED") {
            sendPayload({
                actionType: "subscribeSystemTelemetry",
                payload: {},
            });
        }

        return () => {
            sendPayload({
                actionType: "unsubscribeSystemTelemetry",
                payload: {},
            });
        };
    }, [sendPayload, connectionStatus]);

    if(!sysInfo.ramUsed) {
        return (
            <div className="flex h-full items-center justify-center text-text-muted">
                Loading telemetry...
            </div>
        );
    }
    const ramPercentage = sysInfo.ramTotal ? (sysInfo.ramUsed / sysInfo.ramTotal) * 100 : 0;

    return (
        <div className="flex flex-col h-full bg-background p-6 text-text-main overflow-y-auto">
            <h1 className="text-2xl font-bold mb-6 text-primary">System Monitor</h1>

            <div className="grid gap-4">
                <div className="bg-surface border border-border p-5 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs uppercase font-bold text-text-muted tracking-widest">CPU Usage</span>
                        <span className="text-sm font-mono font-bold">{sysInfo.cpuUsage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-3 bg-background rounded-full overflow-hidden border border-border/50">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${sysInfo.cpuUsage}%` }}
                        />
                    </div>
                </div>

                <div className="bg-surface border border-border p-5 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs uppercase font-bold text-text-muted tracking-widest">Memory (RAM)</span>
                        <span className="text-sm font-mono font-bold">
                            {sysInfo.ramUsed.toFixed(1)} / {sysInfo.ramTotal.toFixed(1)} GB
                        </span>
                    </div>
                    <div className="w-full h-3 bg-background rounded-full overflow-hidden border border-border/50">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${ramPercentage}%` }}
                        />
                    </div>
                </div>
            </div>


            {sysInfo.processes && sysInfo.processes.length > 0 && (
                <div className="bg-surface border border-border p-5 rounded-xl shadow-lg mt-2">
        <span className="text-xs uppercase font-bold text-text-muted tracking-widest mb-4 block">
            Top Memory Consumers
        </span>

                    <div className="flex flex-col gap-3">
                        {sysInfo.processes.map((proc: ProcessInfo, index: number) => (
                            <div key={index} className="flex justify-between items-center text-sm border-b border-border/30 pb-2 last:border-0 last:pb-0">
                    <span className="font-semibold truncate w-1/2" title={proc.name}>
                        {proc.name}
                    </span>
                                <div className="flex gap-4 w-1/2 justify-end font-mono text-xs text-text-muted">
                                    <span className="w-16 text-right">{proc.cpuUsage.toFixed(1)}% CPU</span>
                                    <span className="w-16 text-right">{(proc.ramUsed * 1024).toFixed(0)} MB</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};