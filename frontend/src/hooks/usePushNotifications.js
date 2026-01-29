/**
 * MotoFit 2 - Push Notifications Hook
 * Handles Service Worker registration and notification permissions
 */
import { useState, useEffect, useCallback } from 'react';

export const usePushNotifications = () => {
    const [permission, setPermission] = useState('default');
    const [isSupported, setIsSupported] = useState(false);
    const [swRegistration, setSwRegistration] = useState(null);

    // Check if notifications are supported
    useEffect(() => {
        const supported = 'Notification' in window && 'serviceWorker' in navigator;
        setIsSupported(supported);

        if (supported) {
            setPermission(Notification.permission);
        }
    }, []);

    // Register Service Worker
    useEffect(() => {
        if (!isSupported) return;

        const registerSW = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('[Push] Service Worker registered:', registration);
                setSwRegistration(registration);
            } catch (error) {
                console.error('[Push] Service Worker registration failed:', error);
            }
        };

        registerSW();
    }, [isSupported]);

    // Request notification permission
    const requestPermission = useCallback(async () => {
        if (!isSupported) {
            console.warn('[Push] Notifications not supported');
            return 'unsupported';
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            console.log('[Push] Permission result:', result);
            return result;
        } catch (error) {
            console.error('[Push] Permission request failed:', error);
            return 'denied';
        }
    }, [isSupported]);

    // Send a local notification (for testing and in-app triggers)
    const sendNotification = useCallback((title, options = {}) => {
        if (permission !== 'granted') {
            console.warn('[Push] Notifications not permitted');
            return false;
        }

        const defaultOptions = {
            body: 'MotoFit 2 Notification',
            icon: '/motofit-logo.png',
            badge: '/motofit-logo.png',
            tag: 'motofit-local',
            vibrate: [100, 50, 100],
            ...options
        };

        // Use Service Worker if available, otherwise use Notification API directly
        if (swRegistration) {
            swRegistration.showNotification(title, defaultOptions);
        } else {
            new Notification(title, defaultOptions);
        }

        return true;
    }, [permission, swRegistration]);

    // Test notification
    const sendTestNotification = useCallback(() => {
        return sendNotification('🏍️ MotoFit 2 Test', {
            body: 'Push notifications are working!',
            tag: 'motofit-test'
        });
    }, [sendNotification]);

    return {
        permission,
        isSupported,
        isEnabled: permission === 'granted',
        requestPermission,
        sendNotification,
        sendTestNotification
    };
};

export default usePushNotifications;
