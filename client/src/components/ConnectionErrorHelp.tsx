import { useState } from 'react';

export const ConnectionErrorHelp = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full max-w-[260px] mt-6 flex flex-col items-center">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[11px] font-medium text-text-muted hover:text-primary transition-colors flex items-center gap-1.5 focus:outline-none"
            >
                <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isOpen ? 'Close Troubleshooting' : 'Phone won\'t connect?'}
            </button>

            {isOpen && (
                <div className="mt-3 p-4 bg-surface border border-border rounded-xl text-left w-full shadow-lg">
                    <h3 className="text-[10px] font-bold text-text-main uppercase tracking-widest mb-3">
                        Quick Fixes
                    </h3>

                    <ul className="text-[11px] text-text-muted space-y-3 m-0 p-0 list-none leading-relaxed">
                        <li className="flex items-start gap-2">
                            <span className="text-primary font-bold mt-0.5 opacity-80">1.</span>
                            <span>
                                <strong className="text-text-main font-semibold">Firewall:</strong> Search Windows for "Allow an app through firewall" and ensure BOTH Private and Public boxes are checked for cmdRelay.
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary font-bold mt-0.5 opacity-80">2.</span>
                            <span>
                                <strong className="text-text-main font-semibold">Network Type:</strong> Ensure your Windows Wi-Fi profile is set to Private, not Public.
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary font-bold mt-0.5 opacity-80">3.</span>
                            <span>
                                <strong className="text-text-main font-semibold">Strict Router:</strong> Public or strict Wi-Fi often blocks local traffic (AP Isolation). Connect your PC to your phone's Mobile Hotspot to bypass this.
                            </span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};