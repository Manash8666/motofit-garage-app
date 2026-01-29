/**
 * MotoFit 2 - Command Center Store (Zustand)
 * Central state management for tactical operations
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Initial data - empty arrays (data comes from backend API)
const INITIAL_MISSIONS = [];
const INITIAL_MECHANICS = [];
const INITIAL_BAYS = [
    { id: 1, status: 'available', progress: 0 },
    { id: 2, status: 'available', progress: 0 },
];
const INITIAL_INVENTORY = [];
const INITIAL_SUPPLIERS = [];
const INITIAL_ORDERS = [];

export const useCommandCenterStore = create(
    devtools(
        persist(
            (set, get) => ({
                // State
                activeMissions: INITIAL_MISSIONS,
                alertLevel: 'green',
                mechanics: INITIAL_MECHANICS,
                bays: INITIAL_BAYS,
                inventory: INITIAL_INVENTORY,
                suppliers: INITIAL_SUPPLIERS,
                orders: INITIAL_ORDERS,
                customers: [],
                services: [],

                // Advanced Workshop Features
                photos: [],
                approvals: [],
                serviceHistory: [],
                warrantyClaims: [],

                isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
                lastSynced: new Date().toISOString(),

                // Actions
                setOnlineStatus: (status) => set({ isOnline: status }),
                setLastSynced: (date) => set({ lastSynced: date }),

                dispatchMechanic: (mechanicId, bayId) => {
                    set((state) => ({
                        mechanics: state.mechanics.map((m) =>
                            m.id === mechanicId ? { ...m, status: 'busy' } : m
                        ),
                        bays: state.bays.map((b) =>
                            b.id === bayId ? { ...b, status: 'occupied', mechanic: mechanicId } : b
                        ),
                    }));
                },

                updateMissionPriority: (missionId, priority) => {
                    set((state) => ({
                        activeMissions: state.activeMissions.map((m) =>
                            m.id === missionId ? { ...m, priority, updatedAt: new Date().toISOString() } : m
                        ),
                    }));

                    // Auto-update alert level
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

                updateMissionStatus: (missionId, status) => {
                    set((state) => {
                        const mission = state.activeMissions.find(m => m.id === missionId);
                        let updatedBays = state.bays;

                        // If completing, free the bay
                        if (status === 'completed' && mission?.bay) {
                            updatedBays = state.bays.map(b =>
                                b.id === Number(mission.bay)
                                    ? { ...b, status: 'available', currentMission: null, vehicleDetails: null, progress: 0 }
                                    : b
                            );
                        }

                        // Update mission status
                        const updatedMissions = state.activeMissions.map((m) =>
                            m.id === missionId
                                ? {
                                    ...m,
                                    status,
                                    updatedAt: new Date().toISOString(),
                                    completedAt: status === 'completed' ? new Date().toISOString() : undefined,
                                }
                                : m
                        );

                        return {
                            activeMissions: updatedMissions,
                            bays: updatedBays
                        };
                    });
                },

                createMission: (missionData) => {
                    const newMission = {
                        ...missionData,
                        id: `mission-${Date.now()}`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };

                    set((state) => {
                        let updatedBays = state.bays;

                        // If a bay is assigned, occupy it
                        if (missionData.bay) {
                            updatedBays = state.bays.map(b =>
                                b.id === Number(missionData.bay)
                                    ? {
                                        ...b,
                                        status: 'occupied',
                                        currentMission: newMission.missionCode,
                                        vehicleDetails: {
                                            vehicleId: newMission.vehicleId,
                                            model: 'CyberBike X1' // Default or passed in data
                                        },
                                        progress: 0
                                    }
                                    : b
                            );
                        }

                        return {
                            activeMissions: [...state.activeMissions, newMission],
                            bays: updatedBays
                        };
                    });

                    return newMission;
                },

                updateAlertLevel: (level) => {
                    set({ alertLevel: level });
                },

                // Inventory Actions
                addPart: (part) => set((state) => ({ inventory: [...state.inventory, { ...part, id: `p-${Date.now()}` }] })),
                updatePart: (id, updates) => set((state) => ({
                    inventory: state.inventory.map(p => p.id === id ? { ...p, ...updates } : p)
                })),
                deletePart: (id) => set((state) => ({ inventory: state.inventory.filter(p => p.id !== id) })),

                // Supplier Actions
                addSupplier: (supplier) => set((state) => ({ suppliers: [...state.suppliers, { ...supplier, id: `s-${Date.now()}` }] })),
                updateSupplier: (id, updates) => set((state) => ({
                    suppliers: state.suppliers.map(s => s.id === id ? { ...s, ...updates } : s)
                })),

                // Order Actions
                createOrder: (order) => set((state) => ({ orders: [...state.orders, { ...order, id: `po-${Date.now()}`, status: 'pending', date: new Date().toISOString() }] })),
                updateOrderStatus: (id, status) => set((state) => ({
                    orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
                })),

                // Bay Actions
                addBay: () => set((state) => {
                    const newId = state.bays.length > 0 ? Math.max(...state.bays.map(b => b.id)) + 1 : 1;
                    return {
                        bays: [...state.bays, { id: newId, status: 'available', progress: 0 }]
                    };
                }),
                deleteBay: (categoryId) => set((state) => ({
                    bays: state.bays.filter(b => b.id !== categoryId)
                })),

                // ========== PHOTO ACTIONS ==========
                addPhoto: (photo) => set((state) => ({
                    photos: [...state.photos, { ...photo, id: `photo-${Date.now()}`, createdAt: new Date().toISOString() }]
                })),
                updatePhoto: (id, updates) => set((state) => ({
                    photos: state.photos.map(p => p.id === id ? { ...p, ...updates } : p)
                })),
                deletePhoto: (id) => set((state) => ({
                    photos: state.photos.filter(p => p.id !== id)
                })),

                // ========== APPROVAL ACTIONS ==========
                createApproval: (approval) => set((state) => ({
                    approvals: [...state.approvals, {
                        ...approval,
                        id: `approval-${Date.now()}`,
                        status: 'pending',
                        createdAt: new Date().toISOString()
                    }]
                })),
                sendApproval: (id) => set((state) => ({
                    approvals: state.approvals.map(a =>
                        a.id === id ? { ...a, status: 'sent', sentAt: new Date().toISOString() } : a
                    )
                })),
                updateApprovalStatus: (id, status, notes = '') => set((state) => ({
                    approvals: state.approvals.map(a =>
                        a.id === id ? { ...a, status, notes, respondedAt: new Date().toISOString() } : a
                    )
                })),
                deleteApproval: (id) => set((state) => ({
                    approvals: state.approvals.filter(a => a.id !== id)
                })),

                // ========== SERVICE HISTORY ACTIONS ==========
                addServiceRecord: (record) => set((state) => ({
                    serviceHistory: [...state.serviceHistory, {
                        ...record,
                        id: `service-${Date.now()}`,
                        date: record.date || new Date().toISOString()
                    }]
                })),
                updateServiceRecord: (id, updates) => set((state) => ({
                    serviceHistory: state.serviceHistory.map(s => s.id === id ? { ...s, ...updates } : s)
                })),
                deleteServiceRecord: (id) => set((state) => ({
                    serviceHistory: state.serviceHistory.filter(s => s.id !== id)
                })),

                // ========== WARRANTY CLAIMS ACTIONS ==========
                createClaim: (claim) => set((state) => ({
                    warrantyClaims: [...state.warrantyClaims, {
                        ...claim,
                        id: `claim-${Date.now()}`,
                        status: 'open',
                        filedAt: new Date().toISOString()
                    }]
                })),
                updateClaim: (id, updates) => set((state) => ({
                    warrantyClaims: state.warrantyClaims.map(c => c.id === id ? { ...c, ...updates } : c)
                })),
                closeClaim: (id, resolution) => set((state) => ({
                    warrantyClaims: state.warrantyClaims.map(c =>
                        c.id === id ? { ...c, status: 'closed', resolution, resolvedAt: new Date().toISOString() } : c
                    )
                })),
                deleteClaim: (id) => set((state) => ({
                    warrantyClaims: state.warrantyClaims.filter(c => c.id !== id)
                })),
            }),
            {
                name: 'motofit-command-center',
                version: 2, // Increment to clear old demo data from localStorage
            }
        ),
        { name: 'CommandCenterStore' }
    )
);

// Selectors
export const useMissions = () => useCommandCenterStore((state) => state.activeMissions);
export const useAlertLevel = () => useCommandCenterStore((state) => state.alertLevel);
export const useMechanics = () => useCommandCenterStore((state) => state.mechanics);
export const useBays = () => useCommandCenterStore((state) => state.bays);
export const useInventory = () => useCommandCenterStore((state) => state.inventory);
export const useSuppliers = () => useCommandCenterStore((state) => state.suppliers);
export const useOrders = () => useCommandCenterStore((state) => state.orders);

// Computed selectors
export const useCriticalMissions = () =>
    useCommandCenterStore((state) =>
        state.activeMissions.filter((m) => m.priority === 'red' || m.priority === 'black')
    );

export const useBayUtilization = () =>
    useCommandCenterStore((state) => {
        const occupied = state.bays.filter((b) => b.status === 'occupied').length;
        return Math.round((occupied / state.bays.length) * 100);
    });

export default useCommandCenterStore;

// Advanced Workshop Feature Selectors
// Return full arrays - filtering should be done in component with useMemo
export const usePhotos = () => useCommandCenterStore((state) => state.photos);
export const useApprovals = () => useCommandCenterStore((state) => state.approvals);
export const useServiceHistory = () => useCommandCenterStore((state) => state.serviceHistory);
export const useWarrantyClaims = () => useCommandCenterStore((state) => state.warrantyClaims);
