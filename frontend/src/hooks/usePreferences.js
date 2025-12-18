import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@context/AuthContext';

/**
 * Centralized preference management hook
 * 
 * Handles:
 * - Single source of truth for all preferences
 * - Write queue to prevent race conditions
 * - Optimistic updates with rollback
 * - Atomic sync of AuthContext + localStorage + backend
 */
export function usePreferences() {
    const { user, token, updateUser } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Current preferences (optimistic state)
    const [preferences, setPreferences] = useState(() => {
        // Initialize from user or localStorage
        if (user?.preferences) {
            return user.preferences;
        }

        // Fallback to localStorage for non-authenticated users
        try {
            const localPrefs = localStorage.getItem('localPreferences');
            if (localPrefs) {
                return JSON.parse(localPrefs);
            }
        } catch (e) {
            // Ignore parse errors
        }

        // Default preferences
        return {
            displayOptions: {
                year: true,
                month: true,
                week: false,
                weekday: true,
                day: true,
                time: false,
                timeZone: 'America/Argentina/Buenos_Aires',
                timeFormat: '24h',
                showAccountIndicator: false,
                language: 'auto',
                fullboardMode: false,
            },
            ui: {
                leftSidebarPinned: false,
                rightSidebarPinned: false,
            },
            accessibility: {
                highContrast: false,
                textScale: 'normal',
                reducedMotion: false,
            },
            circlePattern: 'none',
        };
    });

    // Last successfully saved preferences (for rollback)
    const lastGoodPreferences = useRef(preferences);

    // Current save operation in flight
    const saveInFlight = useRef(null);

    // Queued changes waiting to be saved
    const queuedChanges = useRef(null);

    // Debounce timer
    const debounceTimer = useRef(null);

    // Track which preference paths have pending changes
    const pendingPaths = useRef(new Set());

    // Save state
    const [isPending, setIsPending] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(null);

    /**
     * Deep merge utility
     */
    const deepMerge = useCallback((target, source) => {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }, []);

    /**
     * Get value at path from object
     */
    const getByPath = useCallback((obj, path) => {
        const keys = path.split('.');
        let current = obj;
        for (const key of keys) {
            if (current == null) return undefined;
            current = current[key];
        }
        return current;
    }, []);

    /**
     * Set value at path in object (mutates)
     */
    const setByPath = useCallback((obj, path, value) => {
        const keys = path.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
    }, []);

    // Sync preferences when user changes, but preserve optimistic values for pending paths
    useEffect(() => {
        if (user?.preferences) {
            setPreferences(prev => {
                const incoming = user.preferences;

                // If no pending changes, accept all incoming
                if (pendingPaths.current.size === 0) {
                    lastGoodPreferences.current = incoming;
                    return incoming;
                }

                // Merge, but preserve optimistic values for pending paths
                const merged = deepMerge({}, incoming);

                pendingPaths.current.forEach(path => {
                    const optimisticValue = getByPath(prev, path);
                    if (optimisticValue !== undefined) {
                        setByPath(merged, path, optimisticValue);
                    }
                });

                // Only update lastGood for non-pending paths
                lastGoodPreferences.current = incoming;

                return merged;
            });
        }
    }, [user?.preferences]); // Callbacks are stable, no need to include them

    /**
     * Execute the actual save to backend and localStorage
     */
    const executeSave = useCallback(async (prefsToSave) => {
        try {
            if (token) {
                // Save to backend
                const response = await fetch(`${API_URL}/api/auth/preferences`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ preferences: prefsToSave }),
                });

                if (!response.ok) {
                    throw new Error('Failed to save preferences to backend');
                }

                // Update AuthContext
                const updatedUser = { ...user, preferences: prefsToSave };
                updateUser(updatedUser);
            } else {
                // No user - save to localStorage only
                localStorage.setItem('localPreferences', JSON.stringify(prefsToSave));
            }

            // Mark as successfully saved
            lastGoodPreferences.current = prefsToSave;
            setLastSyncTime(Date.now());

            // Clear all pending paths on successful save
            pendingPaths.current.clear();

            return true;
        } catch (error) {
            console.error('Error saving preferences:', error);
            throw error;
        }
    }, [token, user, updateUser, API_URL]);

    /**
     * Process save queue
     */
    const processSaveQueue = useCallback(async () => {
        // If already saving, do nothing (queued changes will be processed after)
        if (saveInFlight.current) {
            return;
        }

        // Nothing to save
        if (!queuedChanges.current) {
            setIsPending(false);
            return;
        }

        // Get the changes to save and clear the queue
        const changesToSave = queuedChanges.current;
        queuedChanges.current = null;

        // Mark as saving
        const savePromise = executeSave(changesToSave);
        saveInFlight.current = savePromise;
        setIsPending(true);

        try {
            await savePromise;
        } catch (error) {
            // Rollback to last good state
            setPreferences(lastGoodPreferences.current);

            // Re-queue the failed changes for retry (optional)
            // For now, we just rollback and let user retry manually
        } finally {
            saveInFlight.current = null;

            // Process any changes that were queued while we were saving
            if (queuedChanges.current) {
                // Schedule next save
                setTimeout(() => processSaveQueue(), 0);
            } else {
                setIsPending(false);
            }
        }
    }, [executeSave]);

    /**
     * Queue preference changes for save
     */
    const queueSave = useCallback((newPreferences) => {
        // Merge with any already-queued changes
        if (queuedChanges.current) {
            queuedChanges.current = deepMerge(queuedChanges.current, newPreferences);
        } else {
            queuedChanges.current = newPreferences;
        }

        // Clear existing debounce timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new debounce timer (500ms)
        debounceTimer.current = setTimeout(() => {
            debounceTimer.current = null;
            processSaveQueue();
        }, 500);
    }, [deepMerge, processSaveQueue]);

    /**
     * Update a specific preference path
     * Example: updatePreference('displayOptions.fullboardMode', true)
     */
    const updatePreference = useCallback((path, value) => {
        // Mark this path as pending
        pendingPaths.current.add(path);

        setPreferences(prev => {
            const newPrefs = { ...prev };
            const keys = path.split('.');
            let current = newPrefs;

            // Navigate to the parent of the target key
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                } else {
                    current[keys[i]] = { ...current[keys[i]] };
                }
                current = current[keys[i]];
            }

            // Set the value
            current[keys[keys.length - 1]] = value;

            // Queue for save
            queueSave(newPrefs);

            return newPrefs;
        });
    }, [queueSave]);

    /**
     * Update multiple preferences at once
     * Example: updatePreferences({ displayOptions: { ... }, ui: { ... } })
     */
    const updatePreferences = useCallback((updates) => {
        setPreferences(prev => {
            const newPrefs = deepMerge(prev, updates);

            // Queue for save
            queueSave(newPrefs);

            return newPrefs;
        });
    }, [deepMerge, queueSave]);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    /**
     * Check if a specific preference path has pending changes
     */
    const isPendingPath = useCallback((path) => {
        return pendingPaths.current.has(path);
    }, []);

    return {
        preferences,
        updatePreference,
        updatePreferences,
        isPending,
        isPendingPath,
        lastSyncTime,
    };
}
