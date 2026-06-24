import { useEffect, useRef, useState } from 'react';

export default function App() {
  const ws = useRef<WebSocket | null>(null);
  const [state, setState] = useState("Disconnected");

  useEffect(() => {
    const socket = new WebSocket('ws://192.168.1.197:3000');

      socket.onopen = () => {
      setState("SYS_LINKED");
    };

      socket.onclose = () => {
      setState("Disconnected");
    };

    ws.current = socket;

    return () => socket.close();
  }, []);

  const onTap = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send("Ping from Phone!");
    }
  };

  return (
      <div
          onClick={onTap}
          className={"text-4xl text-center"}
      >
        {state} (Tap to send ping)
      </div>
  );
}