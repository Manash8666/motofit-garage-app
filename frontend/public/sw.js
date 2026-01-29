// MotoFit 2 - Service Worker for Push Notifications
// This file handles background push events and displays native notifications

const CACHE_NAME = 'motofit-v1';

// Install event - cache essential assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Service Worker activated');
    event.waitUntil(clients.claim());
});

// Push event - display notification when push message received
self.addEventListener('push', (event) => {
    console.log('[SW] Push message received:', event);

    let data = {
        title: 'MotoFit 2',
        body: 'You have a new notification',
        icon: '/motofit-logo.png',
        badge: '/motofit-logo.png',
        tag: 'motofit-notification',
        data: { url: '/' }
    };

    // Try to parse push data if available
    if (event.data) {
        try {
            const pushData = event.data.json();
            data = { ...data, ...pushData };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/motofit-logo.png',
        badge: data.badge || '/motofit-logo.png',
        tag: data.tag || 'motofit-notification',
        vibrate: [100, 50, 100],
        data: data.data || { url: '/' },
        actions: [
            { action: 'open', title: 'Open App' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click - handle user interaction
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    // Open or focus the app
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there's already an open window
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(urlToOpen);
                    return client.focus();
                }
            }
            // Open new window if none found
            return clients.openWindow(urlToOpen);
        })
    );
});
