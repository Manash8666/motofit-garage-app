/**
 * Custom Job Card Creation Form
 * Allows creating job cards with optional PDF attachments
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    X, Save, Upload, FileText, AlertCircle, Wrench, User, Bike, Calendar, DollarSign
} from 'lucide-react';

const JobCardForm = ({ isOpen, onClose, onSave, customer = null }) => {
    const [formData, setFormData] = useState({
        customer_id: customer?.id || '',
        customer_name: '',
        vehicle_id: '',
        vehicle_reg: '',
        services: '',
        priority: 'normal',
        status: 'pending',
        total_amount: 0,
        notes: '',
        pdf_attachment: null
    });

    const [customers, setCustomers] = useState([]);
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchCustomers();
            fetchBikes();
        }
    }, [isOpen]);

    const fetchCustomers = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/customers`);
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        }
    };

    const fetchBikes = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/bikes`);
            const data = await response.json();
            setBikes(data);
        } catch (error) {
            console.error('Failed to fetch bikes:', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setFormData({ ...formData, pdf_attachment: file });
        } else {
            alert('Please select a PDF file');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            // Create job card
            const jobData = {
                customer_id: formData.customer_id,
                vehicle_id: formData.vehicle_id,
                services: formData.services,
                priority: formData.priority,
                status: formData.status,
                total_amount: formData.total_amount,
                notes: formData.notes
            };

            const jobResponse = await fetch(`${apiUrl}/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData)
            });

            if (!jobResponse.ok) throw new Error('Failed to create job card');

            const createdJob = await jobResponse.json();

            // Upload PDF if attached
            if (formData.pdf_attachment) {
                setUploading(true);
                const formDataUpload = new FormData();
                formDataUpload.append('file', formData.pdf_attachment);
                formDataUpload.append('job_id', createdJob.id);
                formDataUpload.append('entity_type', 'job');

                await fetch(`${apiUrl}/upload`, {
                    method: 'POST',
                    body: formDataUpload
                });
            }

            alert(`✅ Job Card ${createdJob.job_no || createdJob.id} created successfully!`);
            onSave && onSave(createdJob);
            onClose();
        } catch (error) {
            alert(`⚠️ Error: ${error.message}`);
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                className="bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
            >
                {/* Background Pulse Effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                            <Wrench className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">Create Job Card</h2>
                            <p className="text-sm text-gray-400 font-medium">Fill in the details below</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                    >
                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300 ml-1 flex items-center gap-2">
                            <User className="w-4 h-4 text-orange-400" />
                            Customer
                        </label>
                        <div className="relative group">
                            <select
                                value={formData.customer_id}
                                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                                required
                            >
                                <option value="" className="bg-slate-900 text-gray-400">Select Customer</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.name} - {c.phone}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300 ml-1 flex items-center gap-2">
                            <Bike className="w-4 h-4 text-blue-400" />
                            Vehicle
                        </label>
                        <div className="relative group">
                            <select
                                value={formData.vehicle_id}
                                onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                                required
                            >
                                <option value="" className="bg-slate-900 text-gray-400">Select Vehicle</option>
                                {bikes.map(b => (
                                    <option key={b.id} value={b.id} className="bg-slate-900 text-white">{b.registration_no} - {b.manufacturer} {b.model}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300 ml-1">Services Required</label>
                        <textarea
                            value={formData.services}
                            onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
                            rows="3"
                            placeholder="General Service, Oil Change, etc."
                            required
                        />
                    </div>

                    {/* Priority and Amount */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300 ml-1">Priority</label>
                            <div className="relative">
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="low" className="bg-slate-900">Low</option>
                                    <option value="normal" className="bg-slate-900">Normal</option>
                                    <option value="high" className="bg-slate-900">High</option>
                                    <option value="urgent" className="bg-slate-900">Urgent</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300 ml-1 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                                Amount (₹)
                            </label>
                            <input
                                type="number"
                                value={formData.total_amount}
                                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300 ml-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all placeholder:text-gray-600"
                            rows="2"
                            placeholder="Additional notes..."
                        />
                    </div>

                    {/* PDF Upload */}
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl hover:border-blue-500/40 transition-all group">
                        <label className="block text-sm font-bold text-blue-300 mb-2 cursor-pointer group-hover:text-blue-200 transition-colors">
                            <Upload className="w-4 h-4 inline mr-2" />
                            Attach Invoice PDF (Optional)
                        </label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4
                                     file:rounded-lg file:border-0 file:text-sm file:font-semibold
                                     file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-500/30 file:cursor-pointer cursor-pointer"
                        />
                        {formData.pdf_attachment && (
                            <motion.p
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-emerald-400 mt-2 flex items-center gap-2 font-medium"
                            >
                                <FileText className="w-4 h-4" />
                                {formData.pdf_attachment.name}
                            </motion.p>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold 
                                     hover:bg-white/10 hover:border-white/20 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="flex-1 px-4 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-white font-bold 
                                     hover:from-orange-400 hover:to-red-500 transition-all shadow-lg shadow-orange-500/20
                                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Creating...' : uploading ? 'Uploading...' : 'Create Job Card'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default JobCardForm;
