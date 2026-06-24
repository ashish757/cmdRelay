import { useEffect, useRef, useState } from 'react';

export default function App() {
  const ws = useRef<WebSocket | null>(null);
  const [state, setState] = useState("Disconnected");

  useEffect(() => {
    const sckt = new WebSocket('ws://192.168.1.197:3000');

    sckt.onopen = () => {
      setState("SYS_LINKED");
    };

    sckt.onclose = () => {
      setState("Disconnected");
    };

    ws.current = sckt;

    return () => sckt.close();
  }, []);

  const onTap = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send("Ping from Phone!");
    }
  };

  return (
      <div
          onClick={onTap}
          style={{
            height: '100vh',
            width: '100vw',
            backgroundColor: '#1a1a1a',
            color: state === 'SYS_LINKED' ? '#4ade80' : '#f87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }}
      >
        {state} (Tap to send ping)
      </div>
  );
}