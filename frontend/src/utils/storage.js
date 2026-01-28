// LocalStorage utility for MotoFit 2 Tactical Command Center
// Handles all data persistence operations

const STORAGE_KEYS = {
    JOBS: 'motofit_jobs',
    INVOICES: 'motofit_invoices',
    CUSTOMERS: 'motofit_customers',
    INVENTORY: 'motofit_inventory',
    MECHANICS: 'motofit_mechanics',
    SERVICES: 'motofit_services',
    BIKES: 'motofit_bikes',
    TIME_ENTRIES: 'motofit_time_entries',
    USERS: 'motofit_users',
    BAY_STATUS: 'motofit_bay_status',
    SETTINGS: 'motofit_settings',
    LAST_SYNC: 'motofit_last_sync'
};

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 * @returns {boolean} Success status
 */
export const saveToStorage = (key, data) => {
    try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
        return true;
    } catch (error) {
        console.error(`Error saving to localStorage [${key}]:`, error);
        return false;
    }
};

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} Stored data or default value
 */
export const loadFromStorage = (key, defaultValue = null) => {
    try {
        const serialized = localStorage.getItem(key);
        if (serialized === null) {
            return defaultValue;
        }
        return JSON.parse(serialized);
    } catch (error) {
        console.error(`Error loading from localStorage [${key}]:`, error);
        return defaultValue;
    }
};

/**
 * Remove specific key from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const removeFromStorage = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from localStorage [${key}]:`, error);
        return false;
    }
};

/**
 * Clear all MotoFit data from localStorage
 * @returns {boolean} Success status
 */
export const clearAllStorage = () => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
};

/**
 * Export all data as JSON
 * @returns {object} All stored data
 */
export const exportData = () => {
    const data = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        const value = loadFromStorage(key);
        if (value !== null) {
            data[name] = value;
        }
    });
    return data;
};

/**
 * Import data from JSON object
 * @param {object} data - Data to import
 * @returns {boolean} Success status
 */
export const importData = (data) => {
    try {
        Object.entries(data).forEach(([name, value]) => {
            const key = STORAGE_KEYS[name];
            if (key) {
                saveToStorage(key, value);
            }
        });
        return true;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
};

/**
 * Download data as JSON file
 */
export const downloadBackup = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `motofit-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Get storage usage statistics
 * @returns {object} Storage stats
 */
export const getStorageStats = () => {
    let totalSize = 0;
    const stats = {};

    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        const value = localStorage.getItem(key);
        if (value) {
            const size = new Blob([value]).size;
            stats[name] = {
                size: size,
                sizeKB: (size / 1024).toFixed(2),
                items: JSON.parse(value).length || 1
            };
            totalSize += size;
        }
    });

    return {
        individual: stats,
        total: totalSize,
        totalKB: (totalSize / 1024).toFixed(2),
        totalMB: (totalSize / 1024 / 1024).toFixed(2),
        available: 5120 - (totalSize / 1024), // Assuming 5MB limit
        percentUsed: ((totalSize / 1024 / 5120) * 100).toFixed(2)
    };
};

/**
 * Check if localStorage is available
 * @returns {boolean} Availability status
 */
export const isStorageAvailable = () => {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Get last sync timestamp
 * @returns {string|null} ISO timestamp or null
 */
export const getLastSync = () => {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
};

export { STORAGE_KEYS };
