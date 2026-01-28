/**
 * ServiceTimeline - Service History Visualization
 */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, Wrench, AlertCircle, CheckCircle, Plus, X, Edit3, Trash2,
    Settings, Zap, Shield, Droplets
} from 'lucide-react';
import { useServiceHistory, useCommandCenterStore } from '../stores/commandCenterStore';

const SERVICE_TYPES = {
    'maintenance': { icon: Settings, color: 'bg-blue-500', label: 'Maintenance' },
    'repair': { icon: Wrench, color: 'bg-orange-500', label: 'Repair' },
    'diagnostic': { icon: Zap, color: 'bg-purple-500', label: 'Diagnostic' },
    'inspection': { icon: Shield, color: 'bg-green-500', label: 'Inspection' },
    'wash': { icon: Droplets, color: 'bg-cyan-500', label: 'Wash/Clean' }
};

const ServiceTimeline = ({ vehicleId, vehicleName = 'Vehicle' }) => {
    const allHistory = useServiceHistory();
    const history = useMemo(() =>
        vehicleId ? allHistory.filter(s => s.vehicleId === vehicleId) : allHistory,
        [allHistory, vehicleId]
    );
    const store = useCommandCenterStore();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        serviceType: 'maintenance',
        description: '',
        mechanic: '',
        cost: 0,
        notes: ''
    });

    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

    const handleSubmit = () => {
        if (editingId) {
            store.updateServiceRecord(editingId, formData);
            setEditingId(null);
        } else {
            store.addServiceRecord({ vehicleId, ...formData });
        }
        setIsAdding(false);
        setFormData({ serviceType: 'maintenance', description: '', mechanic: '', cost: 0, notes: '' });
    };

    const handleEdit = (record) => {
        setFormData({
            serviceType: record.serviceType,
            description: record.description,
            mechanic: record.mechanic,
            cost: record.cost,
            notes: record.notes || ''
        });
        setEditingId(record.id);
        setIsAdding(true);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const TimelineItem = ({ record, isLast }) => {
        const config = SERVICE_TYPES[record.serviceType] || SERVICE_TYPES.maintenance;
        const IconComponent = config.icon;

        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative pl-8"
            >
                {/* Timeline Line */}
                {!isLast && (
                    <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-slate-700" />
                )}

                {/* Icon Node */}
                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full ${config.color} flex items-center justify-center`}>
                    <IconComponent className="w-3 h-3 text-white" />
                </div>

                {/* Content */}
                <div className="pb-6">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <span className="text-xs text-slate-400">{formatDate(record.date)}</span>
                            <h4 className="text-white font-bold">{record.description}</h4>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => handleEdit(record)}
                                className="p-1.5 hover:bg-white/10 rounded"
                            >
                                <Edit3 className="w-4 h-4 text-slate-400" />
                            </button>
                            <button
                                onClick={() => store.deleteServiceRecord(record.id)}
                                className="p-1.5 hover:bg-red-500/20 rounded"
                            >
                                <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
                        <div className="flex flex-wrap gap-3 text-sm">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.color} text-white`}>
                                {config.label}
                            </span>
                            {record.mechanic && (
                                <span className="text-slate-400">
                                    👤 {record.mechanic}
                                </span>
                            )}
                            {record.cost > 0 && (
                                <span className="text-green-400 font-medium">
                                    ₹{record.cost.toLocaleString()}
                                </span>
                            )}
                        </div>
                        {record.notes && (
                            <p className="text-sm text-slate-400 mt-2">{record.notes}</p>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        Service History
                    </h3>
                    <p className="text-sm text-slate-400">{sortedHistory.length} service records for {vehicleName}</p>
                </div>
                <button
                    onClick={() => { setIsAdding(true); setEditingId(null); }}
                    className="flex items-center gap-2 px-4 py-1.5 bg-cyan-600 rounded-lg text-white font-medium hover:bg-cyan-500"
                >
                    <Plus className="w-4 h-4" />
                    Add Record
                </button>
            </div>

            {/* Timeline */}
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5">
                {sortedHistory.length > 0 ? (
                    <div>
                        {sortedHistory.map((record, index) => (
                            <TimelineItem
                                key={record.id}
                                record={record}
                                isLast={index === sortedHistory.length - 1}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                        <p className="text-slate-500">No service history yet.</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">
                                    {editingId ? 'Edit Service Record' : 'Add Service Record'}
                                </h3>
                                <button onClick={() => { setIsAdding(false); setEditingId(null); }}>
                                    <X className="w-6 h-6 text-slate-400 hover:text-white" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Service Type</label>
                                    <select
                                        value={formData.serviceType}
                                        onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                    >
                                        {Object.entries(SERVICE_TYPES).map(([key, { label }]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="e.g. Oil change, brake inspection"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Mechanic</label>
                                        <input
                                            type="text"
                                            value={formData.mechanic}
                                            onChange={e => setFormData({ ...formData, mechanic: e.target.value })}
                                            placeholder="Name"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Cost (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.cost}
                                            onChange={e => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        rows={2}
                                        placeholder="Additional notes..."
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white resize-none"
                                    />
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-bold"
                                >
                                    {editingId ? 'Update Record' : 'Add Record'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ServiceTimeline;
