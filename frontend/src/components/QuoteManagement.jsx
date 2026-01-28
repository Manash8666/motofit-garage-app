/**
 * MotoFit 2 - Quote Management
 * CRM Quote Management UI with Tactical Theme
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Plus,
    Search,
    Filter,
    Eye,
    Edit2,
    Trash2,
    Send,
    CheckCircle,
    XCircle,
    ArrowRight,
    Calendar,
    DollarSign,
    User,
    Phone,
    Clock,
    RefreshCw,
} from 'lucide-react';

// Status colors
const STATUS_COLORS = {
    draft: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Draft' },
    sent: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Sent' },
    accepted: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Accepted' },
    rejected: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Rejected' },
    converted: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Converted' },
};

const API_BASE = 'http://localhost:5000/api';

const QuoteManagement = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [services, setServices] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        customer_id: '',
        valid_until: '',
        notes: '',
        items: [{ description: '', quantity: 1, unit_price: 0, service_id: '' }],
    });

    // Fetch quotes
    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/quotes`);
            const data = await response.json();
            setQuotes(data);
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch customers
    const fetchCustomers = async () => {
        try {
            const response = await fetch(`${API_BASE}/customers`);
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    // Fetch services
    const fetchServices = async () => {
        try {
            const response = await fetch(`${API_BASE}/services`);
            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    useEffect(() => {
        fetchQuotes();
        fetchCustomers();
        fetchServices();
    }, []);

    // Filter quotes
    const filteredQuotes = quotes.filter(quote => {
        const matchesSearch =
            quote.quote_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = selectedQuote ? 'PUT' : 'POST';
            const url = selectedQuote
                ? `${API_BASE}/quotes/${selectedQuote.id}`
                : `${API_BASE}/quotes`;

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            setShowModal(false);
            setSelectedQuote(null);
            resetForm();
            fetchQuotes();
        } catch (error) {
            console.error('Error saving quote:', error);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this quote?')) return;
        try {
            await fetch(`${API_BASE}/quotes/${id}`, { method: 'DELETE' });
            fetchQuotes();
        } catch (error) {
            console.error('Error deleting quote:', error);
        }
    };

    // Handle convert to job
    const handleConvert = async (id) => {
        if (!window.confirm('Convert this quote to a job?')) return;
        try {
            await fetch(`${API_BASE}/quotes/${id}/convert`, { method: 'POST' });
            fetchQuotes();
        } catch (error) {
            console.error('Error converting quote:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            customer_id: '',
            valid_until: '',
            notes: '',
            items: [{ description: '', quantity: 1, unit_price: 0, service_id: '' }],
        });
    };

    // Add item to quote
    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, unit_price: 0, service_id: '' }],
        }));
    };

    // Remove item from quote
    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    // Update item
    const updateItem = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ),
        }));
    };

    // Calculate total
    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FileText className="w-8 h-8 text-orange-500" />
                        Quote Management
                    </h1>
                    <p className="text-gray-400 mt-1">Create and manage customer quotes</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl flex items-center gap-2 hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    New Quote
                </motion.button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(STATUS_COLORS).map(([status, colors]) => {
                    const count = quotes.filter(q => q.status === status).length;
                    return (
                        <motion.div
                            key={status}
                            whileHover={{ scale: 1.02 }}
                            className={`p-4 rounded-xl ${colors.bg} border border-white/5`}
                        >
                            <div className={`text-2xl font-bold ${colors.text}`}>{count}</div>
                            <div className="text-gray-400 text-sm">{colors.label}</div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search quotes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                >
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_COLORS).map(([status, colors]) => (
                        <option key={status} value={status}>{colors.label}</option>
                    ))}
                </select>
                <button
                    onClick={fetchQuotes}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-orange-500/50 transition-all"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Quotes Table */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading quotes...</div>
                ) : filteredQuotes.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No quotes found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 text-left">
                                    <th className="p-4 text-gray-400 font-medium">Quote #</th>
                                    <th className="p-4 text-gray-400 font-medium">Customer</th>
                                    <th className="p-4 text-gray-400 font-medium">Date</th>
                                    <th className="p-4 text-gray-400 font-medium">Total</th>
                                    <th className="p-4 text-gray-400 font-medium">Status</th>
                                    <th className="p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQuotes.map((quote) => {
                                    const statusColors = STATUS_COLORS[quote.status] || STATUS_COLORS.draft;
                                    return (
                                        <motion.tr
                                            key={quote.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="p-4 text-white font-mono">{quote.quote_no}</td>
                                            <td className="p-4">
                                                <div className="text-white">{quote.customer_name}</div>
                                                <div className="text-gray-400 text-sm">{quote.customer_phone}</div>
                                            </td>
                                            <td className="p-4 text-gray-300">{quote.date}</td>
                                            <td className="p-4 text-green-400 font-medium">
                                                ₹{Number(quote.total).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-sm ${statusColors.bg} ${statusColors.text}`}>
                                                    {statusColors.label}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {quote.status === 'accepted' && (
                                                        <button
                                                            onClick={() => handleConvert(quote.id)}
                                                            className="p-2 hover:bg-purple-500/20 rounded-lg text-purple-400 transition-colors"
                                                            title="Convert to Job"
                                                        >
                                                            <ArrowRight className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => { setSelectedQuote(quote); setShowModal(true); }}
                                                        className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(quote.id)}
                                                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
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
                            className="bg-[#0A1628] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">
                                {selectedQuote ? 'Edit Quote' : 'New Quote'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Customer</label>
                                        <select
                                            value={formData.customer_id}
                                            onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                                            required
                                        >
                                            <option value="">Select Customer</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Valid Until</label>
                                        <input
                                            type="date"
                                            value={formData.valid_until}
                                            onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                                        />
                                    </div>
                                </div>

                                {/* Quote Items */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-gray-400 text-sm">Quote Items</label>
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" /> Add Item
                                        </button>
                                    </div>

                                    {formData.items.map((item, index) => (
                                        <div key={index} className="flex gap-2 items-start">
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                                required
                                            />
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                                min="1"
                                                required
                                            />
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                className="w-28 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                                min="0"
                                                required
                                            />
                                            {formData.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                                        rows={3}
                                    />
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                                    <span className="text-gray-400">Total Amount</span>
                                    <span className="text-2xl font-bold text-orange-400">
                                        ₹{calculateTotal().toLocaleString()}
                                    </span>
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
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700"
                                    >
                                        {selectedQuote ? 'Update Quote' : 'Create Quote'}
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

export default QuoteManagement;
