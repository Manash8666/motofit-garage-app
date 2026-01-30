/**
 * MotoFit 2 - Repair Operations (Kanban)
 * Tactical Mission Management Board
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wrench,
    Plus,
    Clock,
    CheckCircle,
    AlertTriangle,
    ChevronRight,
    ChevronLeft,
    Search,
    Filter,
    MoreVertical,
    X,
    Calendar,
    Zap,
    User
} from 'lucide-react';
import { useMissions, useBays, useHybridStore } from '../stores/hybridStore';
import useCommandCenterStore from '../stores/commandCenterStore'; // Still used for non-mission global state
import JobCardForm from './JobCardForm';

// Glass Card Component Reuse
const GlassCard = ({ children, className = '' }) => (
    <div className={`
      relative overflow-hidden rounded-2xl
      bg-gradient-to-br from-white/[0.08] to-white/[0.02]
      backdrop-blur-xl border border-white/[0.1]
      shadow-[0_8px_32px_rgba(0,0,0,0.4)]
      ${className}
    `}>
        {children}
    </div>
);

// Kanban Column
const KanbanColumn = ({ title, status, missions, color, icon: Icon, onMove }) => {
    return (
        <div className="flex-1 min-w-[320px] flex flex-col h-full bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className={`p-4 border-b border-white/5 flex justify-between items-center ${color}`}>
                <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-white/80" />
                    <h3 className="font-bold text-white">{title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs font-mono text-white/70">
                        {missions.length}
                    </span>
                </div>
            </div>

            {/* Cards Area */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                <AnimatePresence>
                    {missions.map((mission) => (
                        <motion.div
                            key={mission.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group relative"
                        >
                            <GlassCard className={`p-4 hover:border-${mission.priority === 'red' ? 'red' : 'cyan'}-500/50 transition-colors`}>
                                {/* Priority Strip */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${mission.priority === 'red' ? 'bg-red-500' :
                                    mission.priority === 'orange' ? 'bg-orange-500' :
                                        mission.priority === 'yellow' ? 'bg-yellow-500' : 'bg-emerald-500'
                                    }`} />

                                <div className="pl-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-mono text-xs text-slate-400">{mission.missionCode}</span>
                                        <div className="flex gap-1">
                                            {status !== 'pending' && (
                                                <button
                                                    onClick={() => onMove(mission.id, 'prev')}
                                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                                    title="Move Back"
                                                >
                                                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                                                </button>
                                            )}
                                            {status !== 'completed' && (
                                                <button
                                                    onClick={() => onMove(mission.id, 'next')}
                                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                                    title="Move Forward"
                                                >
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-cyan-400" />
                                        {mission.services?.[0] || "General Repair"}
                                    </h4>

                                    <div className="text-sm text-slate-300 mb-3">
                                        Vehicle ID: {mission.vehicleId}
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-3">
                                        <div className="flex items-center gap-1">
                                            <Zap className="w-3 h-3" />
                                            Bay {mission.bay || 'TBD'}
                                        </div>
                                        <div className="font-mono text-cyan-400">
                                            ₹{mission.estimatedCost?.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {missions.length === 0 && (
                    <div className="text-center py-10 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                        No Missions
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Component
const RepairOperations = () => {
    const missions = useMissions();
    const bays = useBays();
    const { createMission, updateMission } = useHybridStore();
    const [isJobCardFormOpen, setIsJobCardFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleJobCardSave = (job) => {
        console.log('Job card created:', job);
        setIsJobCardFormOpen(false);
        // Optionally create a mission from the job card
        // createMission({ ... });
    };

    const [newMission, setNewMission] = useState({
        missionCode: `JC-${String(Math.floor(Math.random() * 900) + 100)}`,
        vehicleId: '',
        priority: 'yellow',
        status: 'pending',
        estimatedCost: 0,
        bay: '',
        services: []
    });

    const handleMove = (id, direction) => {
        const mission = missions.find(m => m.id === id);
        if (!mission) return;

        const nextStatus = {
            'pending': 'in-progress',
            'in-progress': 'completed'
        };
        const prevStatus = {
            'completed': 'in-progress',
            'in-progress': 'pending'
        };

        const targetStatus = direction === 'next' ? nextStatus[mission.status] : prevStatus[mission.status];
        if (targetStatus) {
            updateMission(id, { status: targetStatus });
        }
    };

    const handleCreate = () => {
        createMission({
            ...newMission,
            customerId: 'walk-in',
            bay: newMission.bay || null
        });
        setIsModalOpen(false);
    };

    const filteredMissions = missions.filter(m =>
        m.missionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-xl">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Wrench className="w-7 h-7 text-cyan-500" />
                        Tactical Repair Ops
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Live Mission Control & Deployment</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search missions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none w-64"
                        />
                    </div>
                    <button
                        onClick={() => setIsJobCardFormOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl font-bold text-white hover:shadow-lg hover:from-orange-500 hover:to-orange-400 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Create Job Card
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
                <KanbanColumn
                    title="Pending Deployment"
                    status="pending"
                    icon={Clock}
                    color="bg-yellow-500/10 border-yellow-500/20"
                    missions={filteredMissions.filter(m => m.status === 'pending')}
                    onMove={handleMove}
                />
                <KanbanColumn
                    title="Active Operations"
                    status="in-progress"
                    icon={Zap}
                    color="bg-blue-500/10 border-blue-500/20"
                    missions={filteredMissions.filter(m => m.status === 'in-progress')}
                    onMove={handleMove}
                />
                <KanbanColumn
                    title="Mission Complete"
                    status="completed"
                    icon={CheckCircle}
                    color="bg-emerald-500/10 border-emerald-500/20"
                    missions={filteredMissions.filter(m => m.status === 'completed')}
                    onMove={handleMove}
                />
            </div>

            {/* New Mission Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-lg"
                        >
                            <GlassCard className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white">Initialize New Mission</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Vehicle ID / Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white font-mono"
                                            placeholder="e.g. GJ-01-AB-1234"
                                            value={newMission.vehicleId}
                                            onChange={e => setNewMission({ ...newMission, vehicleId: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Priority Level</label>
                                            <select
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                                value={newMission.priority}
                                                onChange={e => setNewMission({ ...newMission, priority: e.target.value })}
                                            >
                                                <option value="yellow">Standard (Yellow)</option>
                                                <option value="orange">Urgent (Orange)</option>
                                                <option value="red">Critical (Red)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Status</label>
                                            <select
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                                value={newMission.status}
                                                onChange={e => setNewMission({ ...newMission, status: e.target.value })}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in-progress">Repairing</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Est. Cost</label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                                placeholder="0"
                                                value={newMission.estimatedCost}
                                                onChange={e => setNewMission({ ...newMission, estimatedCost: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Assign Bay</label>
                                            <select
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                                value={newMission.bay || ''}
                                                onChange={e => setNewMission({ ...newMission, bay: e.target.value })}
                                            >
                                                <option value="">No Bay Assigned</option>
                                                {bays.filter(b => b.status === 'available').map(bay => (
                                                    <option key={bay.id} value={bay.id}>Bay {bay.id} (Available)</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Mission Objective</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                            placeholder="e.g. Engine Diagnostic, Oil Change"
                                            onChange={e => {
                                                const service = e.target.value;
                                                const isEngineRepair = service.toLowerCase().includes('engine repair');
                                                setNewMission({
                                                    ...newMission,
                                                    services: [service],
                                                    warranty: isEngineRepair ? newMission.warranty : undefined
                                                });
                                            }}
                                        />
                                    </div>

                                    {/* Conditional Warranty Dropdown */}
                                    {newMission.services[0]?.toLowerCase().includes('engine repair') && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <label className="block text-sm text-orange-400 mb-1 font-bold">Warranty Coverage</label>
                                            <select
                                                className="w-full bg-slate-800 border border-orange-500/50 rounded-xl px-4 py-2 text-white"
                                                value={newMission.warranty ? 'yes' : 'no'}
                                                onChange={e => setNewMission({ ...newMission, warranty: e.target.value === 'yes' })}
                                            >
                                                <option value="no">No Coverage</option>
                                                <option value="yes">Yes - Under Warranty</option>
                                            </select>
                                            <p className="text-xs text-orange-500/70 mt-1">
                                                *Warranty applies only to approved Engine Repair work
                                            </p>
                                        </motion.div>
                                    )}

                                    <div className="pt-4 flex justify-end gap-3">
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreate}
                                            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all"
                                        >
                                            Deploy Mission
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Job Card Creation Form */}
            <JobCardForm
                isOpen={isJobCardFormOpen}
                onClose={() => setIsJobCardFormOpen(false)}
                onSave={handleJobCardSave}
            />
        </div>
    );
};

export default RepairOperations;
