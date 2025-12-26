import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import '@styles/components/common/CustomSelect.css';

export default function CustomSelect({
    value,
    onChange,
    options = [],
    placeholder = 'Select...',
    className = ''
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useLayoutEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            });
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is outside both the trigger and the portal content
            const isClickInTrigger = containerRef.current && containerRef.current.contains(event.target);
            const isClickInPortal = event.target.closest('.custom-select-options');

            if (!isClickInTrigger && !isClickInPortal) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (isOpen) setIsOpen(false);
        };

        if (isOpen) {
            // Add a small delay before attaching scroll listener to avoid immediate close
            // due to layout shifts or momentum scrolling
            const timeoutId = setTimeout(() => {
                window.addEventListener('scroll', handleScroll, { capture: true });
            }, 100);

            return () => {
                clearTimeout(timeoutId);
                window.removeEventListener('scroll', handleScroll, { capture: true });
            };
        }
    }, [isOpen]);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const dropdownContent = (
        <div
            className="custom-select-options is-open"
            style={{
                top: position.top,
                left: position.left,
                width: position.width
            }}
        >
            {options.map((option) => (
                <div
                    key={option.value}
                    className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
                    onClick={() => handleSelect(option.value)}
                    role="option"
                    aria-selected={option.value === value}
                >
                    <span>{option.label}</span>
                    {option.value === value && <Check size={14} />}
                </div>
            ))}
        </div>
    );

    return (
        <div className={`custom-select-container ${className}`} ref={containerRef}>
            <div
                className={`custom-select-trigger ${isOpen ? 'is-open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }
                }}
            >
                <span className="custom-select-value">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} className="custom-select-arrow" />
            </div>

            {isOpen && createPortal(dropdownContent, document.body)}
        </div>
    );
}
