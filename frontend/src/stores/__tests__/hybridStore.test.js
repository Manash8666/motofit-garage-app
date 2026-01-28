import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHybridStore, useMissions, useBays, useBayUtilization } from '../hybridStore';
import { syncManager } from '../../utils/syncManager';
import { jobsApi, isOnline } from '../../utils/api';

// Mock the API and Sync Manager
vi.mock('../../utils/api', () => ({
    jobsApi: {
        getAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
    apiRequest: vi.fn((req) => req()),
    isOnline: vi.fn(),
}));

vi.mock('../../utils/syncManager', () => ({
    syncManager: {
        addToQueue: vi.fn(),
        getStatus: vi.fn(() => ({ online: true, pendingChanges: 0, lastSync: {} })),
        fullSync: vi.fn(),
    },
}));

describe('Hybrid Store - Offline-First Sync', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset store state
        useHybridStore.setState({
            activeMissions: [],
            isOnline: true,
            pendingSync: 0,
            bays: [
                { id: 1, status: 'available', progress: 0 },
                { id: 2, status: 'available', progress: 0 },
                { id: 3, status: 'available', progress: 0 },
                { id: 4, status: 'available', progress: 0 },
            ],
        });

        // Mock localStorage
        const storage = {};
        global.localStorage = {
            getItem: vi.fn((key) => storage[key] || null),
            setItem: vi.fn((key, value) => { storage[key] = value }),
            clear: vi.fn(() => { Object.keys(storage).forEach(k => delete storage[k]) }),
            removeItem: vi.fn((key) => { delete storage[key] }),
        };
    });

    it('should create a mission locally and call API when online', async () => {
        const missionData = { missionCode: 'TEST-1', customerId: 'c1', estimatedCost: 1000 };
        isOnline.mockReturnValue(true);
        jobsApi.create.mockResolvedValue({ id: 'real-id', job_no: 'TEST-1', ...missionData });

        await useHybridStore.getState().createMission(missionData);

        // Check local state updated immediately
        const state = useHybridStore.getState();
        expect(state.activeMissions.length).toBe(1);
        expect(state.activeMissions[0].missionCode).toBe('TEST-1');

        // Check API call
        expect(jobsApi.create).toHaveBeenCalled();

        // Final state should have the real ID from API
        expect(useHybridStore.getState().activeMissions[0].id).toBe('real-id');
    });

    it('should add to sync queue when creating mission while offline', async () => {
        const missionData = { missionCode: 'TEST-OFF', customerId: 'c2', estimatedCost: 500 };
        isOnline.mockReturnValue(false);

        await useHybridStore.getState().createMission(missionData);

        // Check local state updated
        expect(useHybridStore.getState().activeMissions.length).toBe(1);
        expect(useHybridStore.getState().activeMissions[0].id).toContain('job_'); // Temp ID

        // API should NOT be called
        expect(jobsApi.create).not.toHaveBeenCalled();

        // Should be added to sync queue
        expect(syncManager.addToQueue).toHaveBeenCalledWith(expect.objectContaining({
            type: 'create',
            entity: 'jobs',
        }));
    });

    it('should trigger full sync when coming back online', () => {
        useHybridStore.getState().setOnlineStatus(true);
        expect(syncManager.fullSync).toHaveBeenCalled();
    });

    it('should provide safety defaults for selectors', () => {
        // Set state to null/broken via direct state modification for testing
        useHybridStore.setState({ activeMissions: null, bays: null });

        // Use renderHook to test the hook selectors
        const { result: missionsResult } = renderHook(() => useMissions());
        expect(missionsResult.current).toEqual([]);

        const { result: baysResult } = renderHook(() => useBays());
        expect(baysResult.current).toEqual([]);

        const { result: utilResult } = renderHook(() => useBayUtilization());
        expect(utilResult.current).toBe(0);
    });
});
