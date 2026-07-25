import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface AccordionProps {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    badge?: string | number;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, defaultExpanded = false, badge }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="border-b border-border last:border-b-0">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between py-3 px-1 text-left focus:outline-none group"
            >
                <div className="flex items-center gap-2">
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-primary" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-main" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted group-hover:text-text-main transition-colors">
                        {title}
                    </span>
                </div>
                {badge !== undefined && (
                    <span className="text-[10px] font-bold bg-surface border border-border text-text-main px-2 py-0.5 rounded">
                        {badge}
                    </span>
                )}
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                <div className="p-3 space-y-3">
                    {children}
                </div>
            </div>
        </div>
    );
};