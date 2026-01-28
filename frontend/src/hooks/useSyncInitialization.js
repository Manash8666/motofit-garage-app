/**
 * App Initialization - Sync Setup
 * Add this to your main App.jsx or App.tsx
 */
import { useEffect } from 'react';
import { useHybridStore } from '../stores/hybridStore';
import { syncManager } from '../utils/syncManager';

export function useSyncInitialization() {
    const { setOnlineStatus, syncAll, updateSyncStatus } = useHybridStore();

    useEffect(() => {
        console.log('🚀 Initializing MotoFit 2 Offline-First System...');

        // 1. Set initial online status
        setOnlineStatus(navigator.onLine);

        // 2. Perform initial sync (if online)
        if (navigator.onLine) {
            console.log('🌐 Online - starting initial sync...');
            syncAll().then(() => {
                console.log('✅ Initial sync complete');
                updateSyncStatus();
            });
        } else {
            console.log('📴 Offline - using cached data');
        }

        // 3. Set up periodic sync (every 5 minutes)
        const syncInterval = setInterval(() => {
            if (navigator.onLine) {
                console.log('⏰ Periodic sync triggered');
                syncManager.fullSync();
                updateSyncStatus();
            }
        }, 5 * 60 * 1000); // 5 minutes

        // 4. Set up online/offline event listeners
        const handleOnline = () => {
            console.log('🟢 Connection restored - syncing...');
            setOnlineStatus(true);
            syncManager.fullSync().then(() => {
                updateSyncStatus();
            });
        };

        const handleOffline = () => {
            console.log('📴 Connection lost - switching to offline mode');
            setOnlineStatus(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // 5. Listen for visibility changes (sync when tab becomes visible)
        const handleVisibilityChange = () => {
            if (!document.hidden && navigator.onLine) {
                console.log('👁️ App visible - syncing...');
                syncManager.fullSync();
                updateSyncStatus();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup
        return () => {
            clearInterval(syncInterval);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [setOnlineStatus, syncAll, updateSyncStatus]);
}

// Usage in App.jsx:
/*
import { useSyncInitialization } from './hooks/useSyncInitialization';
import { SyncStatusIndicator } from './components/SyncStatusIndicator';

function App() {
  useSyncInitialization(); // Initialize sync

  return (
    <div>
      <header>
        <SyncStatusIndicator /> // Add status indicator
      </header>
      // ... rest of your app
    </div>
  );
}
*/
