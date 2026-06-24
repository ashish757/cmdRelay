import { useNet } from '../context/NetCtx';

export function ArrowKeysCtrl() {
    const { sendPayload } = useNet();

    const handleArrowPress = (directionPayload: string) => {
        sendPayload({ actionType: "keyPress", payload: { keyId: directionPayload } });
    };

    return (
        <div className="flex-1 w-full flex flex-col items-center justify-center gap-6">
            <button
                onClick={() => handleArrowPress('UP')}
                className="w-24 h-24 bg-neutral-800 rounded-2xl active:bg-green-600 flex items-center justify-center text-4xl"
            >
                ↑
            </button>
            <div className="flex gap-6">
                <button
                    onClick={() => handleArrowPress('LEFT')}
                    className="w-24 h-24 bg-neutral-800 rounded-2xl active:bg-green-600 flex items-center justify-center text-4xl"
                >
                    ←
                </button>
                <button
                    onClick={() => handleArrowPress('DOWN')}
                    className="w-24 h-24 bg-neutral-800 rounded-2xl active:bg-green-600 flex items-center justify-center text-4xl"
                >
                    ↓
                </button>
                <button
                    onClick={() => handleArrowPress('RIGHT')}
                    className="w-24 h-24 bg-neutral-800 rounded-2xl active:bg-green-600 flex items-center justify-center text-4xl"
                >
                    →
                </button>
            </div>
        </div>
    );
}