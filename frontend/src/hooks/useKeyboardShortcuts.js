import { useEffect } from 'react';

/**
 * Custom hook for keyboard shortcuts
 * @param {Object} shortcuts - Object mapping key combinations to callback functions
 */
export const useKeyboardShortcuts = (shortcuts) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Check for each shortcut
            Object.entries(shortcuts).forEach(([key, callback]) => {
                const [mainKey, ...modifiers] = key.split('+').reverse();

                const ctrlPressed = modifiers.includes('ctrl') ? event.ctrlKey : !event.ctrlKey;
                const shiftPressed = modifiers.includes('shift') ? event.shiftKey : !event.shiftKey;
                const altPressed = modifiers.includes('alt') ? event.altKey : !event.altKey;

                // Handle special case for '/' key
                if (key === '/' && event.key === '/' && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                    event.preventDefault();
                    callback(event);
                    return;
                }

                // Handle Ctrl+K and other combinations
                if (
                    event.key.toLowerCase() === mainKey.toLowerCase() &&
                    (modifiers.includes('ctrl') ? event.ctrlKey : true) &&
                    (modifiers.includes('shift') ? event.shiftKey : true) &&
                    (modifiers.includes('alt') ? event.altKey : true)
                ) {
                    if (modifiers.length > 0) {
                        event.preventDefault();
                    }
                    callback(event);
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
};
