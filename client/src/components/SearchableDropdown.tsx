import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface SearchableDropdownProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchableDropdown({ options, value, onChange, placeholder = "Select an option..." }: SearchableDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            if (window.innerHeight - rect.bottom < 400) {
                setIsFlipped(true);
            } else {
                setIsFlipped(false);
            }
        }
    }, [isOpen]);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleDropdown = () => {
        if (!isOpen) setSearchTerm("");
        setIsOpen(!isOpen);
    };

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={toggleDropdown}
                className="w-full flex items-center justify-between bg-surface border border-border rounded-lg p-3 text-sm text-text-main focus:outline-none focus:border-primary transition-colors text-left"
            >
                <span className={`truncate ${!value ? 'text-text-muted' : ''}`}>
                    {value || placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="fixed z-[100] w-[300px]" style={{
                    top: dropdownRef.current?.getBoundingClientRect().bottom,
                    left: dropdownRef.current?.getBoundingClientRect().left
                    }}>
                <div className={`absolute z-50 w-full mt-2 ${isFlipped ? 'bottom-full mb-2' : 'top-full mt-2'} bg-background border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150`}>

                    <div className="flex items-center px-3 border-b border-border bg-surface/30">
                        <Search className="w-4 h-4 text-text-muted shrink-0" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search applications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent p-3 text-sm text-text-main outline-none placeholder:text-text-muted/60"
                        />
                    </div>

                    <div className="max-h-100 overflow-y-auto custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            <ul className="p-1">
                                {filteredOptions.map((option) => (
                                    <li key={option}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(option)}
                                            className="w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-md text-left transition-colors hover:bg-surface text-text-main"
                                        >
                                            <span className="truncate">{option}</span>
                                            {value === option && (
                                                <Check className="w-4 h-4 text-primary shrink-0" />
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 text-center text-sm text-text-muted">
                                No applications found
                            </div>
                        )}
                    </div>
                </div>
                </div>

            )}
        </div>
    );
}