/**
 * MotoFit 2 - Payment Management
 * Payment Tracking UI with Tactical Theme
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    Plus,
    Search,
    DollarSign,
    TrendingUp,
    Calendar,
    Filter,
    Trash2,
    Edit2,
    RefreshCw,
    Wallet,
    Smartphone,
    Building,
    Banknote,
    FileText,
} from 'lucide-react';
import InvoiceForm from './InvoiceForm';

// Payment method icons and colors
const PAYMENT_METHODS = {
    cash: { icon: Banknote, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Cash' },
    upi: { icon: Smartphone, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'UPI' },
    card: { icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Card' },
    bank_transfer: { icon: Building, color: 'text-cyan-400', bg: 'bg-cyan-500/20', label: 'Bank' },
    other: { icon: Wallet, color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Other' },
};

const API_BASE = 'http://localhost:5000/api';

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState({ today: 0, month: 0, byMethod: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [methodFilter, setMethodFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        job_id: '',
        customer_id: '',
        amount: '',
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        reference_no: '',
        notes: '',
    });

    // Fetch payments
    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/payments`);
            const data = await response.json();
            setPayments(data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch summary
    const fetchSummary = async () => {
        try {
            const response = await fetch(`${API_BASE}/payments/summary`);
            const data = await response.json();
            setSummary(data);
        } catch (error) {
            console.error('Error fetching summary:', error);
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

    // Fetch jobs
    const fetchJobs = async () => {
        try {
            const response = await fetch(`${API_BASE}/jobs`);
            const data = await response.json();
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    useEffect(() => {
        fetchPayments();
        fetchSummary();
        fetchCustomers();
        fetchJobs();
    }, []);

    // Filter payments
    const filteredPayments = payments.filter(payment => {
        const matchesSearch =
            payment.payment_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter;
        return matchesSearch && matchesMethod;
    });

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch(`${API_BASE}/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            setShowModal(false);
            resetForm();
            fetchPayments();
            fetchSummary();
        } catch (error) {
            console.error('Error saving payment:', error);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payment?')) return;
        try {
            await fetch(`${API_BASE}/payments/${id}`, { method: 'DELETE' });
            fetchPayments();
            fetchSummary();
        } catch (error) {
            console.error('Error deleting payment:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            job_id: '',
            customer_id: '',
            amount: '',
            payment_method: 'cash',
            payment_date: new Date().toISOString().split('T')[0],
            reference_no: '',
            notes: '',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-green-500" />
                        Payment Management
                    </h1>
                    <p className="text-gray-400 mt-1">Track and manage all payments</p>
                </div>
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowInvoiceForm(true)}
                        className="px-6 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all"
                    >
                        <FileText className="w-5 h-5" />
                        Create Invoice
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Record Payment
                    </motion.button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-500/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm">Today</div>
                            <div className="text-2xl font-bold text-green-400">
                                ₹{Number(summary.today).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-500/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm">This Month</div>
                            <div className="text-2xl font-bold text-blue-400">
                                ₹{Number(summary.month).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Payment method breakdown */}
                {summary.byMethod?.slice(0, 2).map((method) => {
                    const methodConfig = PAYMENT_METHODS[method.payment_method] || PAYMENT_METHODS.other;
                    const Icon = methodConfig.icon;
                    return (
                        <motion.div
                            key={method.payment_method}
                            whileHover={{ scale: 1.02 }}
                            className={`p-5 rounded-xl ${methodConfig.bg} border border-white/10`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl ${methodConfig.bg} flex items-center justify-center`}>
                                    <Icon className={`w-6 h-6 ${methodConfig.color}`} />
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">{methodConfig.label}</div>
                                    <div className={`text-2xl font-bold ${methodConfig.color}`}>
                                        ₹{Number(method.total).toLocaleString()}
                                    </div>
                                </div>
                            </div>
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
                        placeholder="Search payments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500/50"
                    />
                </div>
                <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                >
                    <option value="all">All Methods</option>
                    {Object.entries(PAYMENT_METHODS).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                    ))}
                </select>
                <button
                    onClick={() => { fetchPayments(); fetchSummary(); }}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-green-500/50 transition-all"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Payments Table */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading payments...</div>
                ) : filteredPayments.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No payments found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 text-left">
                                    <th className="p-4 text-gray-400 font-medium">Payment #</th>
                                    <th className="p-4 text-gray-400 font-medium">Customer</th>
                                    <th className="p-4 text-gray-400 font-medium">Job</th>
                                    <th className="p-4 text-gray-400 font-medium">Date</th>
                                    <th className="p-4 text-gray-400 font-medium">Amount</th>
                                    <th className="p-4 text-gray-400 font-medium">Method</th>
                                    <th className="p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map((payment) => {
                                    const methodConfig = PAYMENT_METHODS[payment.payment_method] || PAYMENT_METHODS.other;
                                    const Icon = methodConfig.icon;
                                    return (
                                        <motion.tr
                                            key={payment.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="p-4 text-white font-mono">{payment.payment_no}</td>
                                            <td className="p-4 text-white">{payment.customer_name}</td>
                                            <td className="p-4 text-gray-400">{payment.job_no || '-'}</td>
                                            <td className="p-4 text-gray-300">{payment.payment_date}</td>
                                            <td className="p-4 text-green-400 font-bold">
                                                ₹{Number(payment.amount).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 w-fit ${methodConfig.bg} ${methodConfig.color}`}>
                                                    <Icon className="w-3 h-3" />
                                                    {methodConfig.label}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleDelete(payment.id)}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
                            className="bg-[#0A1628] border border-white/10 rounded-2xl p-6 w-full max-w-lg"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Record Payment</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Customer</label>
                                    <select
                                        value={formData.customer_id}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                                        required
                                    >
                                        <option value="">Select Customer</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Job (Optional)</label>
                                    <select
                                        value={formData.job_id}
                                        onChange={(e) => setFormData(prev => ({ ...prev, job_id: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                                    >
                                        <option value="">No Job</option>
                                        {jobs.map(j => (
                                            <option key={j.id} value={j.id}>{j.job_no} - {j.bike_model}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Date</label>
                                        <input
                                            type="date"
                                            value={formData.payment_date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Payment Method</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {Object.entries(PAYMENT_METHODS).map(([key, config]) => {
                                            const Icon = config.icon;
                                            const isSelected = formData.payment_method === key;
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, payment_method: key }))}
                                                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${isSelected
                                                        ? `${config.bg} border-white/30 ${config.color}`
                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    <span className="text-xs">{config.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Reference # (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.reference_no}
                                        onChange={(e) => setFormData(prev => ({ ...prev, reference_no: e.target.value }))}
                                        placeholder="Transaction ID, Cheque #, etc."
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
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
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700"
                                    >
                                        Record Payment
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Invoice Creation Form */}
            <InvoiceForm
                isOpen={showInvoiceForm}
                onClose={() => setShowInvoiceForm(false)}
                onSave={(invoice) => {
                    console.log('Invoice created:', invoice);
                    // Optionally fetch payments or invoices here
                }}
            />
        </div>
    );
};

export default PaymentManagement;
