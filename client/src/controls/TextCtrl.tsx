import { useState } from 'react';
import { useNet } from '../context/NetCtx.tsx';

export function TextCtrl() {
    const { sendPayload } = useNet();
    const [txtVal, setTxtVal] = useState("");

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newV = e.target.value;
        const oldV = txtVal;

        if (newV.length > oldV.length) {
            const added = newV.slice(oldV.length);

            sendPayload({actionType: "typing", payload: {text: added}});
        }
        
        setTxtVal(newV);
    }


    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Backspace') {
            sendPayload({ actionType: "keyPress", payload: { keyId: "Backspace" } });
        }
    };


    return (
        <div className="w-full p-4">
           <textarea
               value={txtVal}
               onChange={handleInput}
               onKeyDown={handleKeyDown}
               placeholder="Tap to type live..."
               autoComplete="off"
               autoCorrect="off"
               spellCheck="false"
               className="w-full h-32 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white outline-none focus:border-neutral-500 shadow-inner resize-none"
           />
        </div>
    );
}