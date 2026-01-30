/**
 * Custom Invoice Creation Form
 * Allows creating invoices with optional PDF attachments from Vyapar
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    X, Save, Upload, FileText, Receipt, User, DollarSign
} from 'lucide-react';

const InvoiceForm = ({ isOpen, onClose, onSave, customer = null, job = null }) => {
    const [formData, setFormData] = useState({
        customer_id: customer?.id || '',
        job_id: job?.id || '',
        invoice_no: '',
        amount: 0,
        items: '',
        notes: '',
        pdf_attachment: null
    });

    const [customers, setCustomers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchCustomers();
            fetchJobs();
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

    const fetchJobs = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/jobs`);
            const data = await response.json();
            setJobs(data);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
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

            // Upload PDF first (if attached)
            let pdfUrl = null;
            if (formData.pdf_attachment) {
                const formDataUpload = new FormData();
                formDataUpload.append('file', formData.pdf_attachment);
                formDataUpload.append('customer_id', formData.customer_id);
                formDataUpload.append('job_id', formData.job_id);
                formDataUpload.append('entity_type', 'invoice');

                const uploadResponse = await fetch(`${apiUrl}/upload`, {
                    method: 'POST',
                    body: formDataUpload
                });

                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    pdfUrl = uploadData.url || uploadData.path;
                }
            }

            // Create invoice record (this can be stored as a job update or separate table)
            const invoiceData = {
                customer_id: formData.customer_id,
                job_id: formData.job_id,
                invoice_no: formData.invoice_no,
                amount: formData.amount,
                items: formData.items,
                notes: formData.notes,
                pdf_url: pdfUrl
            };

            alert(`✅ Invoice ${formData.invoice_no} created successfully!`);
            console.log('Invoice Data:', invoiceData);

            onSave && onSave(invoiceData);
            onClose();
        } catch (error) {
            alert(`⚠️ Error: ${error.message}`);
        } finally {
            setLoading(false);
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
                        <div className="p-3 rounded-xl bg-emerald-500/20">
                            <Receipt className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Create Invoice</h2>
                            <p className="text-sm text-gray-400">Upload from Vyapar or enter manually</p>
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
                    {/* Invoice Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Invoice Number</label>
                        <input
                            type="text"
                            value={formData.invoice_no}
                            onChange={(e) => setFormData({ ...formData, invoice_no: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="INV-001"
                            required
                        />
                    </div>

                    {/* Customer Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <User className="w-4 h-4 inline mr-2" />
                            Customer
                        </label>
                        <select
                            value={formData.customer_id}
                            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                        >
                            <option value="">Select Customer</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                            ))}
                        </select>
                    </div>

                    {/* Job Selection (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Related Job (Optional)
                        </label>
                        <select
                            value={formData.job_id}
                            onChange={(e) => setFormData({ ...formData, job_id: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">None</option>
                            {jobs.map(j => (
                                <option key={j.id} value={j.id}>{j.job_no || j.id} - {j.status}</option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <DollarSign className="w-4 h-4 inline mr-2" />
                            Total Amount (₹)
                        </label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            min="0"
                            required
                        />
                    </div>

                    {/* Items/Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Items/Description</label>
                        <textarea
                            value={formData.items}
                            onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            rows="3"
                            placeholder="Service details, parts, labor, etc."
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            rows="2"
                            placeholder="Additional notes..."
                        />
                    </div>

                    {/* PDF Upload from Vyapar */}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <label className="block text-sm font-medium text-blue-300 mb-2">
                            <Upload className="w-4 h-4 inline mr-2" />
                            Upload Invoice PDF from Vyapar
                        </label>
                        <p className="text-xs text-gray-400 mb-3">
                            Upload the PDF invoice generated from your Vyapar mobile app
                        </p>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
                                     file:rounded-lg file:border-0 file:text-sm file:font-semibold
                                     file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30"
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
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-emerald-600 rounded-xl text-white font-bold 
                                     hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20
                                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Creating...' : 'Create Invoice'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default InvoiceForm;
