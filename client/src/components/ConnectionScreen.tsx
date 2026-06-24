import { useNet } from '../context/NetCtx';

export function ConnectionScreen() {
    const { connectionStatus } = useNet();

    if (connectionStatus === 'CONNECTED') {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
            <div className="w-16 h-16 border-4 border-neutral-800 border-t-green-500 rounded-full animate-spin mb-8"></div>
            <div className="text-2xl font-bold text-white tracking-widest uppercase">
                {connectionStatus}
            </div>
        </div>
    );
}