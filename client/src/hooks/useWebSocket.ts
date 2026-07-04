import {useEffect, useRef, useState} from "react";


export function useWebSocket() {
    const [connectionStatus, setStatus] = useState("Connecting");
    const ws = useRef<WebSocket| null>(null);
    const timer = useRef<number | null>(null);

    const url = "ws://10.206.99.95:3000";

    const connect = () => {
        if(ws.current) ws.current.close();

        setStatus("CONNECTING");

        const s = new WebSocket(url);
        ws.current = s;

        s.onopen = () => {
            setStatus("CONNECTED");
            if (timer.current) clearTimeout(timer.current);
        }

        s.onmessage = (event) => {
            const msg = JSON.parse(event.data);

            if (msg.actionType === "syncLayout") {
                localStorage.setItem('layouts', JSON.stringify(msg.payload));
            }
        };

        s.onclose = () => {
            setStatus("RECONNECTING");
            timer.current = setTimeout(connect, 3000) as any;
        }

        s.onerror = () => {
            setStatus("DISCONNECTED");
        }

    }

    useEffect(() => {
        connect();
        return () => {
            if (ws.current) ws.current.close();
            if (timer.current) clearTimeout(timer.current);
        }
    }, [])

    const sendPayload = (payload: any): string => {
        if(ws.current?.readyState == WebSocket.OPEN) {
            ws.current.send(JSON.stringify(payload));
            return "success";
        }

        return "fail"
    }

    return {connectionStatus, sendPayload};
}