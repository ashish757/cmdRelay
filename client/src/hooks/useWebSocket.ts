import { useEffect, useRef, useState, useCallback } from "react";
import type { ViewMode } from "../types/controlLayouts.ts";
import type { SystemTelemetry } from "../types/telemetry.ts";

export function useWebSocket(setActiveLayoutId: (id: string) => void, viewMode: ViewMode) {
    const [connectionStatus, setStatus] = useState("Connecting");
    const [currentApp, setCurrentApp] = useState("");
    const [knownApps, setKnownApps] = useState<string[]>([]);
    const [layouts, setLayouts] = useState<any[]>([]);
    const [sysInfo, setSysInfo] = useState<SystemTelemetry>({});

    const ws = useRef<WebSocket | null>(null);
    const timer = useRef<number | null>(null);

    const viewModeRef = useRef(viewMode);
    const setActiveLayoutIdRef = useRef(setActiveLayoutId);

    useEffect(() => {
        viewModeRef.current = viewMode;
        setActiveLayoutIdRef.current = setActiveLayoutId;
    }, [viewMode, setActiveLayoutId]);

    const serverIp = window.location.hostname;
    const url = `ws://${serverIp}:3000/ws`;

    useEffect(() => {
        const connect = () => {
            if (ws.current) ws.current.close();
            setStatus("CONNECTING");

            const s = new WebSocket(url);
            ws.current = s;

            s.onopen = () => {
                setStatus("CONNECTED");
                if (timer.current) clearTimeout(timer.current);
            }

            s.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);

                    if (msg.actionType === "syncLayout") {
                        localStorage.setItem('layouts', JSON.stringify(msg.payload));
                        setLayouts(msg.payload);
                    }
                    else if (msg.actionType === "APP_SWITCHED") {
                        setCurrentApp(msg.payload.appId);

                        if (viewModeRef.current !== "layoutBuilder") {
                            const savedData = localStorage.getItem('layouts');
                            const savedLayouts = savedData ? JSON.parse(savedData) : [];

                            const matchingLayout = savedLayouts.find((l: any) =>
                                l.targetApps?.includes(msg.payload.appId)
                            );

                            if (matchingLayout) {
                                setActiveLayoutIdRef.current(matchingLayout.id);
                            }
                        }
                    }
                    else if (msg.actionType === "syncApps" || msg.actionType === "syncAppList") {
                        const apps = msg.payload.apps || (msg.payload.discovery && msg.payload.discovery.knownApps) || [];
                        setKnownApps(apps);
                    } else if (msg.actionType === "systemTelemetry") {
                        setSysInfo(msg.payload);
                    }
                } catch (error) {
                    console.error("Error handling WebSocket message:", error);
                }
            };

            s.onclose = () => {
                setStatus("RECONNECTING");
                timer.current = setTimeout(connect, 3000) as any;
            }

            s.onerror = () => {
                setStatus("DISCONNECTED");
            }
        };

        connect();

        return () => {
            if (ws.current) ws.current.close();
            if (timer.current) clearTimeout(timer.current);
        }
    }, [url]);

    const sendPayload = useCallback((payload: any): string => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(payload));
            return "success";
        }
        return "fail";
    }, []);

    return { connectionStatus, sendPayload, currentApp, layouts, knownApps, sysInfo };
}