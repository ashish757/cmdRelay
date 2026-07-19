import { useNet } from '../context/NetCtx';

export function ConnectionScreen() {
    const { connectionStatus } = useNet();

    if (connectionStatus === 'CONNECTED' || import.meta.env.VITE_ENV === 'dev') {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
            <div className="w-16 h-16 border-4 border-surface border-t-primary rounded-full animate-spin mb-8"></div>
            <div className="text-2xl font-bold text-text-main tracking-widest uppercase">
                {connectionStatus}
            </div>
        </div>
    );
}