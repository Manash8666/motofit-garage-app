/**
 * MotoFit 2 - Accounting Ledger
 * Income/Expense Tracking UI with Tactical Theme
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Plus,
    Search,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    Filter,
    Trash2,
    Edit2,
    RefreshCw,
    ArrowUpCircle,
    ArrowDownCircle,
    PieChart,
    BarChart3,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const AccountingLedger = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [summary, setSummary] = useState({ income: 0, expense: 0, profit: 0, byCategory: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });

    // Form state
    const [formData, setFormData] = useState({
        type: 'income',
        category_id: '',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    // Fetch transactions
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (dateRange.start) params.append('start_date', dateRange.start);
            if (dateRange.end) params.append('end_date', dateRange.end);

            const response = await fetch(`${API_BASE}/transactions?${params}`);
            const data = await response.json();
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE}/transactions/categories`);
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Fetch summary
    const fetchSummary = async () => {
        try {
            const response = await fetch(`${API_BASE}/transactions/summary`);
            const data = await response.json();
            setSummary(data);
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    };

    useEffect(() => {
        fetchTransactions();
        fetchCategories();
        fetchSummary();
    }, [typeFilter, dateRange]);

    // Filter transactions
    const filteredTransactions = transactions.filter(t =>
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = selectedTransaction ? 'PUT' : 'POST';
            const url = selectedTransaction
                ? `${API_BASE}/transactions/${selectedTransaction.id}`
                : `${API_BASE}/transactions`;

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            setShowModal(false);
            setSelectedTransaction(null);
            resetForm();
            fetchTransactions();
            fetchSummary();
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
            fetchTransactions();
            fetchSummary();
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            type: 'income',
            category_id: '',
            amount: '',
            description: '',
            transaction_date: new Date().toISOString().split('T')[0],
        });
    };

    // Edit transaction
    const handleEdit = (transaction) => {
        setSelectedTransaction(transaction);
        setFormData({
            type: transaction.type || 'income',
            category_id: transaction.category_id || '',
            amount: transaction.amount || '',
            description: transaction.description || '',
            transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0],
        });
        setShowModal(true);
    };

    // Get filtered categories for form
    const filteredCategories = categories.filter(c => c.type === formData.type);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-purple-500" />
                        Accounting Ledger
                    </h1>
                    <p className="text-gray-400 mt-1">Track income and expenses</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { resetForm(); setSelectedTransaction(null); setShowModal(true); }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-xl flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Transaction
                </motion.button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-500/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <ArrowUpCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm">Income (This Month)</div>
                            <div className="text-2xl font-bold text-green-400">
                                ₹{Number(summary.income).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-red-900/50 to-red-800/30 border border-red-500/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <ArrowDownCircle className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm">Expenses (This Month)</div>
                            <div className="text-2xl font-bold text-red-400">
                                ₹{Number(summary.expense).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-5 rounded-xl border ${summary.profit >= 0
                            ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/20'
                            : 'bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-500/20'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${summary.profit >= 0 ? 'bg-blue-500/20' : 'bg-orange-500/20'
                            }`}>
                            <TrendingUp className={`w-6 h-6 ${summary.profit >= 0 ? 'text-blue-400' : 'text-orange-400'}`} />
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm">Net Profit</div>
                            <div className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                                ₹{Number(summary.profit).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-500/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm">Transactions</div>
                            <div className="text-2xl font-bold text-purple-400">
                                {transactions.length}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Category Breakdown */}
            {summary.byCategory?.length > 0 && (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-400" />
                        Category Breakdown
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {summary.byCategory.map((cat, index) => (
                            <div key={index} className={`p-3 rounded-xl ${cat.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                                }`}>
                                <div className="text-gray-400 text-xs truncate">{cat.name}</div>
                                <div className={`font-bold ${cat.type === 'income' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    ₹{Number(cat.total).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
                <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                />
                <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                />
                <button
                    onClick={() => { fetchTransactions(); fetchSummary(); }}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-purple-500/50 transition-all"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Transactions Table */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading transactions...</div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No transactions found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 text-left">
                                    <th className="p-4 text-gray-400 font-medium">Txn #</th>
                                    <th className="p-4 text-gray-400 font-medium">Date</th>
                                    <th className="p-4 text-gray-400 font-medium">Category</th>
                                    <th className="p-4 text-gray-400 font-medium">Description</th>
                                    <th className="p-4 text-gray-400 font-medium">Type</th>
                                    <th className="p-4 text-gray-400 font-medium">Amount</th>
                                    <th className="p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((transaction) => (
                                    <motion.tr
                                        key={transaction.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="p-4 text-white font-mono text-sm">{transaction.transaction_no}</td>
                                        <td className="p-4 text-gray-300">{transaction.transaction_date}</td>
                                        <td className="p-4 text-gray-300">{transaction.category_name || '-'}</td>
                                        <td className="p-4 text-white">{transaction.description}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 w-fit ${transaction.type === 'income'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {transaction.type === 'income' ? (
                                                    <ArrowUpCircle className="w-3 h-3" />
                                                ) : (
                                                    <ArrowDownCircle className="w-3 h-3" />
                                                )}
                                                {transaction.type}
                                            </span>
                                        </td>
                                        <td className={`p-4 font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(transaction)}
                                                    className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(transaction.id)}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
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
                            <h2 className="text-2xl font-bold text-white mb-6">
                                {selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, type: 'income', category_id: '' }))}
                                            className={`p-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.type === 'income'
                                                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <ArrowUpCircle className="w-5 h-5" />
                                            Income
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category_id: '' }))}
                                            className={`p-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.type === 'expense'
                                                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <ArrowDownCircle className="w-5 h-5" />
                                            Expense
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Amount (₹) *</label>
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Date *</label>
                                        <input
                                            type="date"
                                            value={formData.transaction_date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Category</label>
                                    <select
                                        value={formData.category_id}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                                    >
                                        <option value="">Select Category</option>
                                        {filteredCategories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Description *</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="What is this transaction for?"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                                        required
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
                                        className={`flex-1 px-6 py-3 text-white font-medium rounded-xl ${formData.type === 'income'
                                                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                                                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                                            }`}
                                    >
                                        {selectedTransaction ? 'Update' : 'Add'} {formData.type === 'income' ? 'Income' : 'Expense'}
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

export default AccountingLedger;
