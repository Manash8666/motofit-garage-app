/**
 * MotoFit 2 - Lead Management
 * CRM Lead Pipeline UI with Tactical Theme
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Plus,
    Search,
    Filter,
    Phone,
    Mail,
    Calendar,
    Trash2,
    Edit2,
    RefreshCw,
    UserPlus,
    MessageCircle,
    UserCheck,
    XCircle,
    ArrowRight,
    Bike,
} from 'lucide-react';

// Lead status colors and pipeline stages
const LEAD_STATUSES = {
    new: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'New' },
    contacted: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Contacted' },
    qualified: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Qualified' },
    converted: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Converted' },
    lost: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Lost' },
};

// Lead sources
const LEAD_SOURCES = {
    walk_in: { label: 'Walk-in', color: 'text-green-400' },
    referral: { label: 'Referral', color: 'text-blue-400' },
    social_media: { label: 'Social Media', color: 'text-pink-400' },
    advertisement: { label: 'Advertisement', color: 'text-orange-400' },
    website: { label: 'Website', color: 'text-cyan-400' },
    other: { label: 'Other', color: 'text-gray-400' },
};

const API_BASE = 'http://localhost:5000/api';

const LeadManagement = () => {
    const [leads, setLeads] = useState([]);
    const [pipeline, setPipeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        vehicle_interest: '',
        source: 'walk_in',
        assigned_to: '',
        notes: '',
        follow_up_date: '',
    });

    // Fetch leads
    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/leads`);
            const data = await response.json();
            setLeads(data);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch pipeline stats
    const fetchPipeline = async () => {
        try {
            const response = await fetch(`${API_BASE}/leads/pipeline`);
            const data = await response.json();
            setPipeline(data);
        } catch (error) {
            console.error('Error fetching pipeline:', error);
        }
    };

    useEffect(() => {
        fetchLeads();
        fetchPipeline();
    }, []);

    // Filter leads
    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone?.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = selectedLead ? 'PUT' : 'POST';
            const url = selectedLead
                ? `${API_BASE}/leads/${selectedLead.id}`
                : `${API_BASE}/leads`;

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            setShowModal(false);
            setSelectedLead(null);
            resetForm();
            fetchLeads();
            fetchPipeline();
        } catch (error) {
            console.error('Error saving lead:', error);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this lead?')) return;
        try {
            await fetch(`${API_BASE}/leads/${id}`, { method: 'DELETE' });
            fetchLeads();
            fetchPipeline();
        } catch (error) {
            console.error('Error deleting lead:', error);
        }
    };

    // Handle convert to customer
    const handleConvert = async (id) => {
        if (!window.confirm('Convert this lead to a customer?')) return;
        try {
            await fetch(`${API_BASE}/leads/${id}/convert`, { method: 'POST' });
            fetchLeads();
            fetchPipeline();
        } catch (error) {
            console.error('Error converting lead:', error);
        }
    };

    // Update lead status
    const updateStatus = async (id, newStatus) => {
        try {
            const lead = leads.find(l => l.id === id);
            await fetch(`${API_BASE}/leads/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...lead, status: newStatus }),
            });
            fetchLeads();
            fetchPipeline();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            vehicle_interest: '',
            source: 'walk_in',
            assigned_to: '',
            notes: '',
            follow_up_date: '',
        });
    };

    // Edit lead
    const handleEdit = (lead) => {
        setSelectedLead(lead);
        setFormData({
            name: lead.name || '',
            phone: lead.phone || '',
            email: lead.email || '',
            vehicle_interest: lead.vehicle_interest || '',
            source: lead.source || 'walk_in',
            status: lead.status || 'new',
            assigned_to: lead.assigned_to || '',
            notes: lead.notes || '',
            follow_up_date: lead.follow_up_date || '',
        });
        setShowModal(true);
    };

    // Kanban View
    const KanbanView = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(LEAD_STATUSES).map(([status, config]) => {
                const statusLeads = leads.filter(l => l.status === status);
                return (
                    <div key={status} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <div className={`p-3 border-b border-white/10 ${config.bg}`}>
                            <div className="flex items-center justify-between">
                                <span className={`font-medium ${config.text}`}>{config.label}</span>
                                <span className="text-white/60 text-sm">{statusLeads.length}</span>
                            </div>
                        </div>
                        <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                            {statusLeads.map(lead => (
                                <motion.div
                                    key={lead.id}
                                    layout
                                    className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20"
                                >
                                    <div className="font-medium text-white text-sm">{lead.name}</div>
                                    <div className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> {lead.phone}
                                    </div>
                                    {lead.vehicle_interest && (
                                        <div className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                                            <Bike className="w-3 h-3" /> {lead.vehicle_interest}
                                        </div>
                                    )}
                                    <div className="flex gap-1 mt-2">
                                        <button
                                            onClick={() => handleEdit(lead)}
                                            className="p-1 hover:bg-blue-500/20 rounded text-blue-400"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        {status === 'qualified' && (
                                            <button
                                                onClick={() => handleConvert(lead.id)}
                                                className="p-1 hover:bg-green-500/20 rounded text-green-400"
                                            >
                                                <UserCheck className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-500" />
                        Lead Management
                    </h1>
                    <p className="text-gray-400 mt-1">Track and convert potential customers</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-white/5 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === 'kanban' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Kanban
                        </button>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { resetForm(); setSelectedLead(null); setShowModal(true); }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Lead
                    </motion.button>
                </div>
            </div>

            {/* Pipeline Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(LEAD_STATUSES).map(([status, config]) => {
                    const stat = pipeline.find(p => p.status === status) || { count: 0 };
                    return (
                        <motion.div
                            key={status}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                            className={`p-4 rounded-xl cursor-pointer transition-all ${config.bg} border ${statusFilter === status ? 'border-white/30' : 'border-white/5'
                                }`}
                        >
                            <div className={`text-2xl font-bold ${config.text}`}>{stat.count}</div>
                            <div className="text-gray-400 text-sm">{config.label}</div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Search */}
            {viewMode === 'list' && (
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                        />
                    </div>
                    <button
                        onClick={() => { fetchLeads(); fetchPipeline(); }}
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Content */}
            {viewMode === 'kanban' ? (
                <KanbanView />
            ) : (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading leads...</div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No leads found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10 text-left">
                                        <th className="p-4 text-gray-400 font-medium">Name</th>
                                        <th className="p-4 text-gray-400 font-medium">Contact</th>
                                        <th className="p-4 text-gray-400 font-medium">Interest</th>
                                        <th className="p-4 text-gray-400 font-medium">Source</th>
                                        <th className="p-4 text-gray-400 font-medium">Status</th>
                                        <th className="p-4 text-gray-400 font-medium">Follow-up</th>
                                        <th className="p-4 text-gray-400 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeads.map((lead) => {
                                        const statusConfig = LEAD_STATUSES[lead.status] || LEAD_STATUSES.new;
                                        const sourceConfig = LEAD_SOURCES[lead.source] || LEAD_SOURCES.other;
                                        return (
                                            <motion.tr
                                                key={lead.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="border-b border-white/5 hover:bg-white/5"
                                            >
                                                <td className="p-4 text-white font-medium">{lead.name}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 text-gray-300">
                                                        <Phone className="w-3 h-3" /> {lead.phone}
                                                    </div>
                                                    {lead.email && (
                                                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                                                            <Mail className="w-3 h-3" /> {lead.email}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-gray-300">{lead.vehicle_interest || '-'}</td>
                                                <td className="p-4">
                                                    <span className={sourceConfig.color}>{sourceConfig.label}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm ${statusConfig.bg} ${statusConfig.text}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-400">
                                                    {lead.follow_up_date || '-'}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        {lead.status === 'qualified' && (
                                                            <button
                                                                onClick={() => handleConvert(lead.id)}
                                                                className="p-2 hover:bg-green-500/20 rounded-lg text-green-400"
                                                                title="Convert to Customer"
                                                            >
                                                                <UserCheck className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEdit(lead)}
                                                            className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(lead.id)}
                                                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0A1628] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">
                                {selectedLead ? 'Edit Lead' : 'Add New Lead'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Phone *</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Vehicle Interest</label>
                                    <input
                                        type="text"
                                        value={formData.vehicle_interest}
                                        onChange={(e) => setFormData(prev => ({ ...prev, vehicle_interest: e.target.value }))}
                                        placeholder="e.g., Royal Enfield Classic 350"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Source</label>
                                        <select
                                            value={formData.source}
                                            onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                        >
                                            {Object.entries(LEAD_SOURCES).map(([key, config]) => (
                                                <option key={key} value={key}>{config.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Follow-up Date</label>
                                        <input
                                            type="date"
                                            value={formData.follow_up_date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, follow_up_date: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                        />
                                    </div>
                                </div>

                                {selectedLead && (
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                        >
                                            {Object.entries(LEAD_STATUSES).map(([key, config]) => (
                                                <option key={key} value={key}>{config.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-gray-400 rounded-xl hover:bg-white/10"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl"
                                    >
                                        {selectedLead ? 'Update Lead' : 'Add Lead'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LeadManagement;
