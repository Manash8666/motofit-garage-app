/**
 * CustomerApproval - Approval Request System
 */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Check, X, Clock, AlertCircle, Mail, Phone, Plus, Trash2, Eye
} from 'lucide-react';
import { useApprovals, useCommandCenterStore } from '../stores/commandCenterStore';

const STATUS_CONFIG = {
    pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'Pending' },
    sent: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Send, label: 'Sent to Customer' },
    approved: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Check, label: 'Approved' },
    rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: X, label: 'Rejected' }
};

const CustomerApproval = ({ missionId, vehicleId, customerName = 'Customer', estimatedCost = 0 }) => {
    const allApprovals = useApprovals();
    const approvals = useMemo(() =>
        missionId ? allApprovals.filter(a => a.missionId === missionId) : allApprovals,
        [allApprovals, missionId]
    );
    const store = useCommandCenterStore();
    const [isCreating, setIsCreating] = useState(false);
    const [selectedApproval, setSelectedApproval] = useState(null);
    const [newApproval, setNewApproval] = useState({
        description: '',
        estimatedCost: estimatedCost,
        customerEmail: '',
        customerPhone: ''
    });

    const handleCreate = () => {
        store.createApproval({
            missionId,
            vehicleId,
            ...newApproval
        });
        setIsCreating(false);
        setNewApproval({ description: '', estimatedCost: 0, customerEmail: '', customerPhone: '' });
    };

    const handleSendApproval = (id) => {
        store.sendApproval(id);
        // Simulate notification
        alert('Approval request sent to customer! (Simulated)');
    };

    const handleStatusUpdate = (id, status) => {
        store.updateApprovalStatus(id, status);
        setSelectedApproval(null);
    };

    const ApprovalCard = ({ approval }) => {
        const config = STATUS_CONFIG[approval.status];
        const StatusIcon = config.icon;

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border ${config.color} backdrop-blur-sm`}
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{config.label}</span>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setSelectedApproval(approval)}
                            className="p-1.5 hover:bg-white/10 rounded"
                        >
                            <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                            onClick={() => store.deleteApproval(approval.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded"
                        >
                            <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                    </div>
                </div>

                <p className="text-white font-medium mb-2">{approval.description || 'Repair Approval Request'}</p>
                <p className="text-2xl font-bold text-white mb-3">₹{approval.estimatedCost?.toLocaleString()}</p>

                <div className="text-xs text-slate-400 mb-3">
                    Created: {new Date(approval.createdAt).toLocaleDateString()}
                    {approval.sentAt && <span> • Sent: {new Date(approval.sentAt).toLocaleDateString()}</span>}
                </div>

                {approval.status === 'pending' && (
                    <button
                        onClick={() => handleSendApproval(approval.id)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium flex items-center justify-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Send to Customer
                    </button>
                )}

                {approval.status === 'sent' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleStatusUpdate(approval.id, 'approved')}
                            className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Mark Approved
                        </button>
                        <button
                            onClick={() => handleStatusUpdate(approval.id, 'rejected')}
                            className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Rejected
                        </button>
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-cyan-400" />
                    Customer Approvals
                </h3>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-cyan-600 rounded-lg text-white font-medium hover:bg-cyan-500"
                >
                    <Plus className="w-4 h-4" />
                    New Request
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const count = approvals.filter(a => a.status === status).length;
                    return (
                        <div key={status} className={`p-3 rounded-xl border ${config.color}`}>
                            <p className="text-2xl font-bold">{count}</p>
                            <p className="text-xs uppercase tracking-wider">{config.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Approvals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {approvals.map(approval => (
                        <ApprovalCard key={approval.id} approval={approval} />
                    ))}
                </AnimatePresence>
                {approvals.length === 0 && (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-slate-700 rounded-xl">
                        <AlertCircle className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                        <p className="text-slate-500">No approval requests yet.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">New Approval Request</h3>
                                <button onClick={() => setIsCreating(false)}>
                                    <X className="w-6 h-6 text-slate-400 hover:text-white" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={newApproval.description}
                                        onChange={e => setNewApproval({ ...newApproval, description: e.target.value })}
                                        placeholder="e.g. Engine repair, brake replacement"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Estimated Cost (₹)</label>
                                    <input
                                        type="number"
                                        value={newApproval.estimatedCost}
                                        onChange={e => setNewApproval({ ...newApproval, estimatedCost: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Customer Email</label>
                                        <input
                                            type="email"
                                            value={newApproval.customerEmail}
                                            onChange={e => setNewApproval({ ...newApproval, customerEmail: e.target.value })}
                                            placeholder="email@example.com"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Customer Phone</label>
                                        <input
                                            type="tel"
                                            value={newApproval.customerPhone}
                                            onChange={e => setNewApproval({ ...newApproval, customerPhone: e.target.value })}
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleCreate}
                                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-bold"
                                >
                                    Create Approval Request
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomerApproval;
