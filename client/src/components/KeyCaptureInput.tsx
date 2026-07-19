import React, { useState, useEffect, useRef } from 'react';

interface KeyCaptureInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const KeyCaptureInput: React.FC<KeyCaptureInputProps> = ({
                                                                    value,
                                                                    onChange,
                                                                    placeholder = "e.g. Space, A, Enter"
                                                                }) => {
    const [isListening, setIsListening] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isListening) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();

            let keyName = e.code;

            if (keyName.length === 1) {
                keyName = keyName.toUpperCase();
            }

            onChange(keyName);
            setIsListening(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isListening, onChange]);

    return (
        <div className={`relative flex items-center w-full bg-surface border rounded-lg transition-all overflow-hidden ${
            isListening
                ? 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                : 'border-border focus-within:border-primary'
        }`}>
            <input
                ref={inputRef}
                value={isListening ? '' : value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 w-full bg-transparent pl-3 pr-2 py-2 text-sm text-text-main focus:outline-none placeholder-text-muted"
                disabled={isListening}
                placeholder={isListening ? "Listening..." : placeholder}
            />

            <div className="pr-1.5 shrink-0 flex items-center">
                {isListening ? (
                    <button
                        onClick={() => setIsListening(false)}
                        className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-[10px] font-bold transition-colors uppercase tracking-wider cursor-pointer"
                    >
                        Cancel
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setIsListening(true);
                            inputRef.current?.blur();
                        }}
                        className="px-2 py-1 bg-border/50 hover:bg-border text-text-main rounded text-[10px] font-bold transition-colors uppercase tracking-wider cursor-pointer"
                    >
                        Capture
                    </button>
                )}
            </div>
        </div>
    );
};