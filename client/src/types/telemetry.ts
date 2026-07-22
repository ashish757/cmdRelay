export interface ProcessInfo {
    name: string;
    cpuUsage: number;
    ramUsed: number;
}
export interface SystemTelemetry {
    cpuUsage?: number;
    ramUsed?: number;
    ramTotal?: number;
    batteryLevel?: number;
    isCharging?: boolean;
    processes?: ProcessInfo[],
}
