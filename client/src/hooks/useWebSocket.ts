import {useEffect, useRef, useState} from "react";


export function useWebSocket() {
    const [connectionStatus, setStatus] = useState("Connecting");
    const ws = useRef<WebSocket| null>(null);
    const timer = useRef<number | null>(null);

    const url = "ws://192.168.1.197:3000";

    const connect = () => {
        if(ws.current) ws.current.close();

        setStatus("CONNECTING");

        const s = new WebSocket(url);

        s.onopen = () => {
            setStatus("CONNECTED");
            if (timer.current) clearTimeout(timer.current);
        }

        s.onclose = () => {
        setStatus("DISCONNECTING");
            if (timer.current) clearTimeout(timer.current);
        }

        s.onerror = (e) => {
            setStatus("DISCONNECTED");
            console.error("WebSocket Error", e);
        }

    }

    useEffect(() => {
        connect();
        return () => {
            if (ws.current) ws.current.close();
            if (timer.current) clearTimeout(timer.current);
        }
    }, [])

    const send = (payload: any)=> {
        if(ws.current?.readyState == WebSocket.OPEN) {
            ws.current.send(JSON.stringify(payload));
        }
    }

    return {connectionStatus, send};
}