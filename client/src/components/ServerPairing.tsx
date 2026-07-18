import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import QRCode from 'react-qr-code';

export function ServerPairing() {
    const [serverUrl, setServerUrl] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        invoke<string>('get_server_url')
            .then((url) => setServerUrl(url))
            .catch((err) => setError(err));
    }, []);

    return (
        // Full screen, native dark background, system fonts, prevent dragging/selecting
        <div className="w-screen h-screen bg-[#1e1e1e] flex flex-col items-center justify-center p-6 cursor-default select-none overflow-hidden font-sans">

            <h2 className="text-[20px] font-semibold tracking-tight text-center  text-white/90 mb-1.5">
                Scan to open the Controller.
            </h2>

            {error ? (
                <div className="text-red-400 text-sm">{error}</div>
            ) : serverUrl ? (
                // Tighter padding around the QR code, rounded corners
                <div className="bg-white p-3.5 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] my-8">
                    <QRCode
                        value={serverUrl}
                        size={160}
                        bgColor="#ffffff"
                        fgColor="#000000"
                    />
                </div>
            ) : (
                <div className="w-[160px] h-[160px] flex items-center justify-center bg-white/5 rounded-xl animate-pulse mb-8">
                    <span className="text-white/30 text-xs font-medium">Loading...</span>
                </div>
            )}

            <div className="w-full text-center flex flex-col items-center">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-2">
                    Or open this address
                </span>
                <div className="bg-black/30 border border-white/5 px-4 py-2 rounded-lg w-full max-w-[240px]">
                    {/* Only the URL is selectable */}
                    <p className="text-blue-400 font-mono text-[13px] tracking-wide select-all text-center m-0">
                        {serverUrl || '...'}
                    </p>
                </div>
            </div>
        </div>
    );
}