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
                className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-orange-500/20">
                            <Wrench className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Create Job Card</h2>
                            <p className="text-sm text-gray-400">Fill in the details below</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Customer Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <User className="w-4 h-4 inline mr-2" />
                            Customer
                        </label>
                        <select
                            value={formData.customer_id}
                            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        >
                            <option value="">Select Customer</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                            ))}
                        </select>
                    </div>

                    {/* Vehicle Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <Bike className="w-4 h-4 inline mr-2" />
                            Vehicle
                        </label>
                        <select
                            value={formData.vehicle_id}
                            onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        >
                            <option value="">Select Vehicle</option>
                            {bikes.map(b => (
                                <option key={b.id} value={b.id}>{b.registration_no} - {b.manufacturer} {b.model}</option>
                            ))}
                        </select>
                    </div>

                    {/* Services */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Services Required</label>
                        <textarea
                            value={formData.services}
                            onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            rows="3"
                            placeholder="General Service, Oil Change, etc."
                            required
                        />
                    </div>

                    {/* Priority and Amount */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <DollarSign className="w-4 h-4 inline mr-2" />
                                Amount (₹)
                            </label>
                            <input
                                type="number"
                                value={formData.total_amount}
                                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            rows="2"
                            placeholder="Additional notes..."
                        />
                    </div>

                    {/* PDF Upload */}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <label className="block text-sm font-medium text-blue-300 mb-2">
                            <Upload className="w-4 h-4 inline mr-2" />
                            Attach Invoice PDF (Optional)
                        </label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
                                     file:rounded-lg file:border-0 file:text-sm file:font-semibold
                                     file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30"
                        />
                        {formData.pdf_attachment && (
                            <p className="text-sm text-emerald-400 mt-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                {formData.pdf_attachment.name}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold 
                                     hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="flex-1 px-4 py-3 bg-orange-600 rounded-xl text-white font-bold 
                                     hover:bg-orange-500 transition-colors shadow-lg shadow-orange-500/20
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
