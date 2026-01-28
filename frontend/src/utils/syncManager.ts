/**
 * Offline-First Sync Manager
 * Handles syncing data between API and localStorage
 */

import { jobsApi, customersApi, servicesApi, bikesApi, isOnline } from './api';

interface SyncQueueItem {
    type: 'create' | 'update' | 'delete';
    entity: 'jobs' | 'customers' | 'services' | 'bikes';
    id?: string;
    data?: any;
    timestamp: number;
}

class SyncManager {
    private syncQueue: SyncQueueItem[] = [];
    private isSyncing = false;

    constructor() {
        this.loadQueue();
        this.startAutoSync();
        this.listenToOnlineStatus();
    }

    // Load pending operations from localStorage
    private loadQueue() {
        const stored = localStorage.getItem('sync_queue');
        if (stored) {
            this.syncQueue = JSON.parse(stored);
        }
    }

    // Save queue to localStorage
    private saveQueue() {
        localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    }

    // Add operation to queue
    addToQueue(item: Omit<SyncQueueItem, 'timestamp'>) {
        this.syncQueue.push({
            ...item,
            timestamp: Date.now(),
        });
        this.saveQueue();
        console.log('📝 Added to sync queue:', item);
    }

    // Sync data from API to localStorage
    async syncDown(entity: 'jobs' | 'customers' | 'services' | 'bikes') {
        if (!isOnline()) {
            console.log('📴 Offline - skipping syncDown');
            return;
        }

        try {
            console.log(`⬇️ Syncing ${entity} from API...`);

            let data;
            switch (entity) {
                case 'jobs':
                    data = await jobsApi.getAll();
                    break;
                case 'customers':
                    data = await customersApi.getAll();
                    break;
                case 'services':
                    data = await servicesApi.getAll();
                    break;
                case 'bikes':
                    data = await bikesApi.getAll();
                    break;
            }

            // Save to localStorage
            localStorage.setItem(`${entity}_data`, JSON.stringify(data));
            localStorage.setItem(`${entity}_last_sync`, new Date().toISOString());

            console.log(`✅ ${entity} synced (${data.length} items)`);
            return data;
        } catch (error) {
            console.error(`❌ Failed to sync ${entity}:`, error);
            throw error;
        }
    }

    // Upload pending changes to API
    async syncUp() {
        if (!isOnline() || this.isSyncing || this.syncQueue.length === 0) {
            return;
        }

        this.isSyncing = true;
        console.log(`⬆️ Uploading ${this.syncQueue.length} pending changes...`);

        const failedItems: SyncQueueItem[] = [];

        for (const item of this.syncQueue) {
            try {
                switch (item.type) {
                    case 'create':
                        await this.syncCreate(item.entity, item.data);
                        break;
                    case 'update':
                        if (item.id) {
                            await this.syncUpdate(item.entity, item.id, item.data);
                        }
                        break;
                    case 'delete':
                        if (item.id) {
                            await this.syncDelete(item.entity, item.id);
                        }
                        break;
                }
                console.log(`✅ Synced ${item.type} ${item.entity}`, item.id);
            } catch (error) {
                console.error(`❌ Failed to sync ${item.type} ${item.entity}:`, error);
                failedItems.push(item);
            }
        }

        // Update queue with only failed items
        this.syncQueue = failedItems;
        this.saveQueue();
        this.isSyncing = false;

        if (failedItems.length === 0) {
            console.log('✅ All changes synced successfully');
        } else {
            console.log(`⚠️ ${failedItems.length} items failed to sync`);
        }
    }

    private async syncCreate(entity: string, data: any) {
        switch (entity) {
            case 'jobs':
                return await jobsApi.create(data);
            case 'customers':
                return await customersApi.create(data);
            case 'services':
                return await servicesApi.create(data);
            case 'bikes':
                return await bikesApi.create(data);
        }
    }

    private async syncUpdate(entity: string, id: string, data: any) {
        switch (entity) {
            case 'jobs':
                return await jobsApi.update(id, data);
            case 'customers':
                return await customersApi.update(id, data);
            case 'services':
                return await servicesApi.update(id, data);
            case 'bikes':
                return await bikesApi.update(id, data);
        }
    }

    private async syncDelete(entity: string, id: string) {
        switch (entity) {
            case 'jobs':
                return await jobsApi.delete(id);
            case 'customers':
                return await customersApi.delete(id);
            case 'services':
                return await servicesApi.delete(id);
            case 'bikes':
                return await bikesApi.delete(id);
        }
    }

    // Full sync - down then up
    async fullSync() {
        console.log('🔄 Starting full sync...');

        if (!isOnline()) {
            console.log('📴 Cannot sync - offline');
            return;
        }

        try {
            // Sync down (get latest from API)
            await Promise.all([
                this.syncDown('jobs'),
                this.syncDown('customers'),
                this.syncDown('services'),
                this.syncDown('bikes'),
            ]);

            // Sync up (push pending changes)
            await this.syncUp();

            console.log('✅ Full sync complete');
        } catch (error) {
            console.error('❌ Full sync failed:', error);
        }
    }

    // Auto-sync every 5 minutes
    private startAutoSync() {
        setInterval(() => {
            if (isOnline()) {
                this.fullSync();
            }
        }, 5 * 60 * 1000); // 5 minutes
    }

    // Listen to online/offline events
    private listenToOnlineStatus() {
        window.addEventListener('online', () => {
            console.log('🟢 Back online - starting sync');
            this.fullSync();
        });

        window.addEventListener('offline', () => {
            console.log('📴 Gone offline - using cached data');
        });
    }

    // Get sync status
    getStatus() {
        return {
            online: isOnline(),
            pendingChanges: this.syncQueue.length,
            lastSync: {
                jobs: localStorage.getItem('jobs_last_sync'),
                customers: localStorage.getItem('customers_last_sync'),
                services: localStorage.getItem('services_last_sync'),
                bikes: localStorage.getItem('bikes_last_sync'),
            },
        };
    }
}

// Export singleton instance
export const syncManager = new SyncManager();
