/**
 * WarrantyClaims - Warranty Claim Management
 */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Plus, X, AlertCircle, CheckCircle, Clock, FileText, Trash2, Eye, Edit3
} from 'lucide-react';
import { useWarrantyClaims, useCommandCenterStore } from '../stores/commandCenterStore';

const STATUS_CONFIG = {
    'open': { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertCircle, label: 'Open' },
    'in-review': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock, label: 'In Review' },
    'approved': { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Approved' },
    'rejected': { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: X, label: 'Rejected' },
    'closed': { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: FileText, label: 'Closed' }
};

const CLAIM_TYPES = [
    'Parts Defect',
    'Labor Warranty',
    'Manufacturer Recall',
    'Service Guarantee',
    'Extended Warranty',
    'Other'
];

const WarrantyClaims = ({ vehicleId, vehicleName = 'Vehicle' }) => {
    const allClaims = useWarrantyClaims();
    const claims = useMemo(() =>
        vehicleId ? allClaims.filter(c => c.vehicleId === vehicleId) : allClaims,
        [allClaims, vehicleId]
    );
    const store = useCommandCenterStore();
    const [isCreating, setIsCreating] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [formData, setFormData] = useState({
        claimType: 'Parts Defect',
        description: '',
        partNumber: '',
        purchaseDate: ''
    });

    const filteredClaims = statusFilter === 'all'
        ? claims
        : claims.filter(c => c.status === statusFilter);

    const handleCreate = () => {
        store.createClaim({ vehicleId, ...formData });
        setIsCreating(false);
        setFormData({ claimType: 'Parts Defect', description: '', partNumber: '', purchaseDate: '' });
    };

    const handleStatusChange = (id, newStatus) => {
        store.updateClaim(id, { status: newStatus });
    };

    const handleClose = (id) => {
        const resolution = prompt('Enter resolution notes:');
        if (resolution) {
            store.closeClaim(id, resolution);
        }
    };

    const ClaimCard = ({ claim }) => {
        const config = STATUS_CONFIG[claim.status] || STATUS_CONFIG.open;
        const StatusIcon = config.icon;

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-xl border ${config.color} backdrop-blur-sm`}
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{config.label}</span>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setSelectedClaim(claim)}
                            className="p-1.5 hover:bg-white/10 rounded"
                        >
                            <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                            onClick={() => store.deleteClaim(claim.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded"
                        >
                            <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                    </div>
                </div>

                <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300 mb-2 inline-block">
                    {claim.claimType}
                </span>
                <p className="text-white font-medium mt-2">{claim.description}</p>

                <div className="text-xs text-slate-400 mt-3 mb-3">
                    Filed: {new Date(claim.filedAt).toLocaleDateString()}
                    {claim.resolvedAt && (
                        <span> • Resolved: {new Date(claim.resolvedAt).toLocaleDateString()}</span>
                    )}
                </div>

                {claim.resolution && (
                    <div className="p-2 bg-slate-800/50 rounded-lg text-sm text-slate-300 mb-3">
                        <strong>Resolution:</strong> {claim.resolution}
                    </div>
                )}

                {claim.status !== 'closed' && (
                    <div className="flex gap-2 flex-wrap">
                        {claim.status === 'open' && (
                            <button
                                onClick={() => handleStatusChange(claim.id, 'in-review')}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm font-medium"
                            >
                                Start Review
                            </button>
                        )}
                        {claim.status === 'in-review' && (
                            <>
                                <button
                                    onClick={() => handleStatusChange(claim.id, 'approved')}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-white text-sm font-medium"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleStatusChange(claim.id, 'rejected')}
                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-white text-sm font-medium"
                                >
                                    Reject
                                </button>
                            </>
                        )}
                        {(claim.status === 'approved' || claim.status === 'rejected') && (
                            <button
                                onClick={() => handleClose(claim.id)}
                                className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded-lg text-white text-sm font-medium"
                            >
                                Close Claim
                            </button>
                        )}
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-cyan-400" />
                        Warranty Claims
                    </h3>
                    <p className="text-sm text-slate-400">{claims.length} total claims</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-cyan-600 rounded-lg text-white font-medium hover:bg-cyan-500"
                >
                    <Plus className="w-4 h-4" />
                    New Claim
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                >
                    All ({claims.length})
                </button>
                {Object.entries(STATUS_CONFIG).map(([status, { label }]) => {
                    const count = claims.filter(c => c.status === status).length;
                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            {label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Claims Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {filteredClaims.map(claim => (
                        <ClaimCard key={claim.id} claim={claim} />
                    ))}
                </AnimatePresence>
                {filteredClaims.length === 0 && (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-slate-700 rounded-xl">
                        <Shield className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                        <p className="text-slate-500">No warranty claims found.</p>
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
                                <h3 className="text-xl font-bold text-white">File Warranty Claim</h3>
                                <button onClick={() => setIsCreating(false)}>
                                    <X className="w-6 h-6 text-slate-400 hover:text-white" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Claim Type</label>
                                    <select
                                        value={formData.claimType}
                                        onChange={e => setFormData({ ...formData, claimType: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                    >
                                        {CLAIM_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        placeholder="Describe the issue..."
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Part Number</label>
                                        <input
                                            type="text"
                                            value={formData.partNumber}
                                            onChange={e => setFormData({ ...formData, partNumber: e.target.value })}
                                            placeholder="Optional"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Purchase Date</label>
                                        <input
                                            type="date"
                                            value={formData.purchaseDate}
                                            onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleCreate}
                                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-bold"
                                >
                                    File Claim
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WarrantyClaims;
