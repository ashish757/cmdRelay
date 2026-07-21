import { useEffect, useRef, useState } from "react";


export function useWebSocket(setActiveLayoutId: (id: string) => void, viewMode: string) {
    const [connectionStatus, setStatus] = useState("Connecting");
    const [currentApp, setCurrentApp] = useState("");
    const [knownApps, setKnownApps] = useState<string[]>([]);
    const [layouts, setLayouts] = useState<any[]>([]);

    const ws = useRef<WebSocket | null>(null);
    const timer = useRef<number | null>(null);

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
                        if(viewMode !== "builder") {
                            const savedData = localStorage.getItem('layouts');
                            const savedLayouts = savedData ? JSON.parse(savedData) : [];

                            const matchingLayout = savedLayouts.find((l: any) =>
                                l.targetApps?.includes(msg.payload.appId)
                            );

                            if (matchingLayout) {
                                setActiveLayoutId(matchingLayout.id);
                            }
                        }
                    }
                    else if (msg.actionType === "syncApps" || msg.actionType === "syncAppList") {
                        const apps = msg.payload.apps || (msg.payload.discovery && msg.payload.discovery.knownApps) || [];
                        setKnownApps(apps);
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
    }, [setActiveLayoutId, url]);

    const sendPayload = (payload: any): string => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(payload));
            return "success";
        }
        return "fail";
    }

    return { connectionStatus, sendPayload, currentApp, layouts, knownApps };
}