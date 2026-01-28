import { useEffect, useRef, useCallback } from 'react';
import { logLogout } from '../utils/auditLogger';
import { clearSecureStorage } from '../utils/secureStorage';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_MS = 60 * 1000; // Show warning 1 minute before logout

/**
 * Hook to manage session timeout
 * Auto-logs out user after 30 minutes of inactivity
 * 
 * @param {Function} onLogout - Callback when session expires
 * @param {Function} onWarning - Callback when warning should be shown
 * @returns {Object} - resetTimer function
 */
export function useSessionTimeout(onLogout, onWarning = null) {
    const timeoutRef = useRef(null);
    const warningRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    const resetTimers = useCallback(() => {
        lastActivityRef.current = Date.now();

        // Clear existing timers
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);

        // Set warning timer
        if (onWarning) {
            warningRef.current = setTimeout(() => {
                onWarning(WARNING_BEFORE_MS / 1000); // Pass seconds until logout
            }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);
        }

        // Set logout timer
        timeoutRef.current = setTimeout(() => {
            console.log('⏰ Session timeout - logging out');

            // Log the logout action
            logLogout('session-timeout');

            // Clear sensitive data
            clearSecureStorage();
            localStorage.removeItem('auth_token');

            // Call logout callback
            if (onLogout) onLogout();
        }, IDLE_TIMEOUT_MS);
    }, [onLogout, onWarning]);

    useEffect(() => {
        // Activity events to track
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        const handleActivity = () => {
            resetTimers();
        };

        // Add event listeners
        events.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });

        // Start initial timer
        resetTimers();

        // Cleanup
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (warningRef.current) clearTimeout(warningRef.current);
        };
    }, [resetTimers]);

    return {
        resetTimer: resetTimers,
        getIdleTime: () => Date.now() - lastActivityRef.current,
    };
}

export default useSessionTimeout;
