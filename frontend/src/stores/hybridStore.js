/**
 * MotoFit 2 - Hybrid Offline-First Store (Tactical UI Compatible)
 * Integrates API sync with localStorage persistence
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { jobsApi, customersApi, servicesApi, bikesApi, apiRequest, isOnline } from '../utils/api';
import { syncManager } from '../utils/syncManager';
import { logCreate, logUpdate, logDelete } from '../utils/auditLogger';

// Temp ID generator for offline creates
const generateTempId = (prefix = 'temp') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper: Map Backend Job to UI Mission
const mapJobToMission = (job) => {
    if (!job) return null;
    return {
        id: job.id,
        missionCode: job.job_no || job.jobNo,
        date: job.date,
        token: job.token,
        promisedDate: job.promised_date || job.promisedDate,
        customerId: job.customer_id || job.customerId,
        phone: job.phone,
        vehicleId: job.bike_id || job.bikeId || 'v1',
        bikeModel: job.bike_model || job.bikeModel,
        registration: job.registration,
        chassis: job.chassis,
        engine: job.engine,
        assignedMechanic: job.mechanic,
        estimatedCost: Number(job.estimated_cost || job.estimatedCost || 0),
        actualCost: Number(job.actual_cost || job.actualCost || 0),
        notes: job.notes,
        status: (job.status || 'Pending').toLowerCase().replace('repairing', 'in-progress'),
        priority: job.priority || 'yellow',
        warranty: job.warranty || false,
        createdAt: job.created_at || job.createdAt,
        updatedAt: job.updated_at || job.updatedAt,
        completedAt: job.completed_at || job.completedAt,
        services: job.services || [],
        parts: job.parts || [],
        bay: job.bay || 1
    };
};

// Helper: Map UI Mission to Backend Job
const mapMissionToJob = (mission) => {
    if (!mission) return null;
    return {
        jobNo: mission.missionCode,
        date: mission.date || new Date().toISOString().split('T')[0],
        token: mission.token,
        promisedDate: mission.promisedDate,
        customer: mission.customerName || mission.customerId, // Simplified for now
        phone: mission.phone,
        bikeModel: mission.bikeModel,
        registration: mission.registration,
        chassis: mission.chassis,
        engine: mission.engine,
        mechanic: mission.assignedMechanic || mission.mechanic,
        estimatedCost: mission.estimatedCost,
        notes: mission.notes,
        status: mission.status === 'in-progress' ? 'Repairing' : (mission.status?.charAt(0).toUpperCase() + mission.status?.slice(1)) || 'Pending',
        warranty: mission.warranty,
        services: mission.services?.map(s => typeof s === 'string' ? { name: s, price: 0 } : s) || [],
        parts: mission.parts?.map(p => typeof p === 'string' ? { name: p, price: 0 } : p) || [],
    };
};

export const useHybridStore = create(
    devtools(
        persist(
            (set, get) => ({
                // =====================
                // STATE (Tactical UI Names)
                // =====================
                activeMissions: [],
                customers: [],
                services: [],
                bikes: [],
                bays: [
                    { id: 1, status: 'available', progress: 0 },
                    { id: 2, status: 'available', progress: 0 },
                    { id: 3, status: 'available', progress: 0 },
                    { id: 4, status: 'available', progress: 0 },
                ],
                mechanics: [],
                alertLevel: 'green',

                loading: {
                    missions: false,
                    customers: false,
                    services: false,
                    bikes: false,
                },

                error: null,
                isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
                lastSynced: null,
                pendingSync: 0,

                // =====================
                // ONLINE STATUS
                // =====================
                setOnlineStatus: (status) => {
                    set({ isOnline: status });
                    if (status) {
                        syncManager.fullSync();
                    }
                },

                updateSyncStatus: () => {
                    const status = syncManager.getStatus();
                    set({
                        isOnline: status.online,
                        pendingSync: status.pendingChanges,
                        lastSynced: status.lastSync?.jobs,
                    });
                },

                // =====================
                // MISSIONS (formerly Jobs)
                // =====================
                fetchMissions: async () => {
                    set((state) => ({ loading: { ...state.loading, missions: true } }));

                    try {
                        const jobs = await apiRequest(
                            () => jobsApi.getAll(),
                            () => {
                                const cached = localStorage.getItem('missions_data');
                                return cached ? JSON.parse(cached) : [];
                            }
                        );

                        const missions = jobs.map(mapJobToMission);

                        set((state) => ({
                            activeMissions: missions,
                            loading: { ...state.loading, missions: false },
                            error: null,
                        }));

                        // Auto-calculate alert level
                        get().calculateAlertLevel();

                        if (isOnline()) {
                            localStorage.setItem('missions_data', JSON.stringify(jobs));
                            localStorage.setItem('missions_last_sync', new Date().toISOString());
                        }
                    } catch (error) {
                        set((state) => ({
                            loading: { ...state.loading, missions: false },
                            error: error.message,
                        }));
                    }
                },

                createMission: async (missionData) => {
                    const tempId = generateTempId('job');
                    const newMission = {
                        id: tempId,
                        ...missionData,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };

                    const currentMissions = get().activeMissions;
                    const updatedMissions = [...currentMissions, newMission];
                    set({ activeMissions: updatedMissions });
                    localStorage.setItem('missions_data', JSON.stringify(updatedMissions));

                    const jobData = mapMissionToJob(missionData);

                    if (isOnline()) {
                        try {
                            const createdJob = await jobsApi.create(jobData);
                            const finalMission = mapJobToMission(createdJob);

                            const finalMissions = updatedMissions.map(m =>
                                m.id === tempId ? finalMission : m
                            );
                            set({ activeMissions: finalMissions });
                            localStorage.setItem('missions_data', JSON.stringify(finalMissions));
                        } catch (error) {
                            syncManager.addToQueue({
                                type: 'create',
                                entity: 'jobs',
                                data: jobData,
                            });
                            get().updateSyncStatus();
                        }
                    } else {
                        syncManager.addToQueue({
                            type: 'create',
                            entity: 'jobs',
                            data: jobData,
                        });
                        get().updateSyncStatus();
                    }
                    logCreate('mission', tempId, { model: missionData.bikeModel });
                    get().calculateAlertLevel();
                },

                updateMission: async (id, missionData) => {
                    const currentMissions = get().activeMissions;
                    const updatedMissions = currentMissions.map(m =>
                        m.id === id ? { ...m, ...missionData, updatedAt: new Date().toISOString() } : m
                    );
                    set({ activeMissions: updatedMissions });
                    localStorage.setItem('missions_data', JSON.stringify(updatedMissions));
                    logUpdate('mission', id, { status: missionData.status });

                    const jobData = mapMissionToJob(missionData);

                    if (isOnline()) {
                        try {
                            await jobsApi.update(id, jobData);
                        } catch (error) {
                            syncManager.addToQueue({
                                type: 'update',
                                entity: 'jobs',
                                id,
                                data: jobData,
                            });
                            get().updateSyncStatus();
                        }
                    } else {
                        syncManager.addToQueue({
                            type: 'update',
                            entity: 'jobs',
                            id,
                            data: jobData,
                        });
                        get().updateSyncStatus();
                    }
                    get().calculateAlertLevel();
                },

                deleteMission: async (id) => {
                    const currentMissions = get().activeMissions;
                    const updatedMissions = currentMissions.filter(m => m.id !== id);
                    set({ activeMissions: updatedMissions });
                    localStorage.setItem('missions_data', JSON.stringify(updatedMissions));

                    if (isOnline()) {
                        try {
                            await jobsApi.delete(id);
                        } catch (error) {
                            syncManager.addToQueue({
                                type: 'delete',
                                entity: 'jobs',
                                id,
                            });
                            get().updateSyncStatus();
                        }
                    } else {
                        syncManager.addToQueue({
                            type: 'delete',
                            entity: 'jobs',
                            id,
                        });
                        get().updateSyncStatus();
                    }
                    get().calculateAlertLevel();
                },

                calculateAlertLevel: () => {
                    const missions = get().activeMissions;
                    const hasCritical = missions.some((m) => m.priority === 'black' || m.priority === 'red');
                    const hasUrgent = missions.some((m) => m.priority === 'orange');

                    if (hasCritical) {
                        set({ alertLevel: 'red' });
                    } else if (hasUrgent) {
                        set({ alertLevel: 'orange' });
                    } else {
                        set({ alertLevel: 'green' });
                    }
                },

                fetchCustomers: async () => {
                    set((state) => ({ loading: { ...state.loading, customers: true } }));
                    try {
                        const customers = await apiRequest(
                            () => customersApi.getAll(),
                            () => {
                                const cached = localStorage.getItem('customers_data');
                                return cached ? JSON.parse(cached) : [];
                            }
                        );
                        set({ customers, loading: { ...get().loading, customers: false } });
                        if (isOnline()) localStorage.setItem('customers_data', JSON.stringify(customers));
                    } catch (error) {
                        set({ loading: { ...get().loading, customers: false }, error: error.message });
                    }
                },

                fetchServices: async () => {
                    set((state) => ({ loading: { ...state.loading, services: true } }));
                    try {
                        const services = await apiRequest(
                            () => servicesApi.getAll(),
                            () => {
                                const cached = localStorage.getItem('services_data');
                                return cached ? JSON.parse(cached) : [];
                            }
                        );
                        set({ services, loading: { ...get().loading, services: false } });
                        if (isOnline()) localStorage.setItem('services_data', JSON.stringify(services));
                    } catch (error) {
                        set({ loading: { ...get().loading, services: false }, error: error.message });
                    }
                },

                fetchBikes: async () => {
                    set((state) => ({ loading: { ...state.loading, bikes: true } }));
                    try {
                        const bikes = await apiRequest(
                            () => bikesApi.getAll(),
                            () => {
                                const cached = localStorage.getItem('bikes_data');
                                return cached ? JSON.parse(cached) : [];
                            }
                        );
                        set({ bikes, loading: { ...get().loading, bikes: false } });
                        if (isOnline()) localStorage.setItem('bikes_data', JSON.stringify(bikes));
                    } catch (error) {
                        set({ loading: { ...get().loading, bikes: false }, error: error.message });
                    }
                },

                syncAll: async () => {
                    await Promise.all([
                        get().fetchMissions(),
                        get().fetchCustomers(),
                        get().fetchServices(),
                        get().fetchBikes(),
                    ]);
                    get().updateSyncStatus();
                },
            }),
            {
                name: 'motofit-hybrid-storage',
                version: 2, // Increment to clear old demo data from localStorage
                partialize: (state) => ({
                    activeMissions: state.activeMissions,
                    customers: state.customers,
                    services: state.services,
                    bikes: state.bikes,
                    lastSynced: state.lastSynced,
                }),
            }
        )
    )
);

const EMPTY_ARRAY = [];

// UI Compatibility Selectors
export const useMissions = () => useHybridStore((state) => state.activeMissions || EMPTY_ARRAY);
export const useAlertLevel = () => useHybridStore((state) => state.alertLevel || 'green');
export const useBays = () => useHybridStore((state) => state.bays || EMPTY_ARRAY);
export const useBayUtilization = () => {
    const bays = useHybridStore((state) => state.bays || EMPTY_ARRAY);
    if (!bays.length) return 0;
    const occupied = bays.filter(b => b && b.status === 'occupied').length;
    return Math.round((occupied / bays.length) * 100);
};

// Initialize listeners
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => useHybridStore.getState().setOnlineStatus(true));
    window.addEventListener('offline', () => useHybridStore.getState().setOnlineStatus(false));
}
