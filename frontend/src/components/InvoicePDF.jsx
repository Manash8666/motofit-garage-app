import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Download,
    Printer,
    Send,
    Eye,
    X,
    Plus,
} from 'lucide-react';
import InvoiceForm from './InvoiceForm';

// Sample invoice data
const sampleInvoice = {
    id: 'INV-2026-001',
    date: '2026-01-16',
    dueDate: '2026-01-23',
    status: 'pending',
    customer: {
        name: 'Raj Patel',
        phone: '9876543210',
        email: 'raj.patel@example.com',
        address: '123 Main Street, Ahmedabad, Gujarat 380001',
    },
    vehicle: {
        make: 'Royal Enfield',
        model: 'Classic 350',
        regNo: 'GJ-01-AB-1234',
        vin: 'RE350202401234567',
        odometer: '12,543'
    },
    items: [
        { description: 'Full Service', quantity: 1, rate: 1500, amount: 1500 },
        { description: 'Engine Oil (Castrol 10W40)', quantity: 1, rate: 650, amount: 650 },
        { description: 'Oil Filter', quantity: 1, rate: 250, amount: 250 },
        { description: 'Air Filter Cleaning', quantity: 1, rate: 150, amount: 150 },
        { description: 'Chain Lubrication', quantity: 1, rate: 100, amount: 100 },
        { description: 'Brake Inspection', quantity: 1, rate: 200, amount: 200 },
    ],
    subtotal: 2850,
    tax: 513,
    discount: 0,
    total: 3363,
};

// Printable Invoice Component
const PrintableInvoice = React.forwardRef(({ invoice }, ref) => {
    return (
        <div ref={ref} className="bg-white text-[#333] p-0 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col relative overflow-hidden" id="invoice-print">
            <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
          #invoice-print { padding: 0 !important; width: 210mm; height: 297mm; }
        }
        .invoice-watermark {
            position: absolute;
            top: 35%;
            left: 25%;
            width: 600px;
            height: 200px;
            opacity: 0.1;
            font-size: 100px;
            transform: rotate(-30deg);
            pointer-events: none;
            user-select: none;
            z-index: 0;
            color: #5d4037;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        .invoice-container {
            font-family: 'Arial', sans-serif;
            position: relative;
            z-index: 1;
            padding: 20px;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        .invoice-logo {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .invoice-logo img {
            width: 80px;
            height: 80px;
            object-fit: contain;
        }
        .invoice-logo-text {
            font-size: 28px;
            font-weight: bold;
            color: #5d4037;
            margin-top: -10px;
        }
        .invoice-company-details {
            color: #5d4037;
            font-size: 11px;
            line-height: 1.4;
        }
        .invoice-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }
        .invoice-form-section {
            border: 1px solid #00a699;
            padding: 10px;
            border-radius: 4px;
            background-color: #f9f9f9;
        }
        .invoice-section-title {
            font-weight: bold;
            margin-bottom: 8px;
            color: #5d4037;
            font-size: 12px;
            text-transform: uppercase;
        }
        .invoice-input-row {
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .invoice-input-label {
            font-weight: bold;
            font-size: 11px;
            min-width: 100px;
        }
        .invoice-input-value {
            font-size: 11px;
            border-bottom: 1px dashed #ddd;
            flex-grow: 1;
            min-height: 16px;
        }
        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #00a699;
            font-size: 11px;
        }
        .invoice-table th, .invoice-table td {
            border: 1px solid #00a699;
            padding: 6px 10px;
        }
        .invoice-table th {
            background-color: #e0f7fa;
            font-weight: bold;
            text-align: left;
        }
        .qr-code-placeholder {
            width: 80px;
            height: 80px;
            background: linear-gradient(45deg, #4CAF50, #2196F3);
            border: 1px solid #eee;
        }
        .invoice-footer {
            margin-top: auto;
        }
      `}</style>

            <div className="invoice-watermark">MOTOFIT</div>

            <div className="invoice-container">
                <div className="invoice-header">
                    <div className="invoice-company-details">
                        <div className="font-bold">SR. Mechanic: MUNNA</div>
                        <div>CONTACT: 9123293450</div>
                        <div>SHOP NO 9, MOTOFIT 2, NIGAM NAGAR,</div>
                        <div>CHANDKHEDA, AHMEDABAD</div>
                    </div>
                    <div className="invoice-logo">
                        <img src="/motofit-logo.png" alt="MotoFit Logo" />
                        <div className="invoice-logo-text">MOTOFIT</div>
                    </div>
                    <div className="invoice-company-details text-right">
                        <div className="font-bold">Owner: AKSHAT MOHANTY</div>
                        <div>CONTACT: 7259625881</div>
                        <div>SHOP NO 9, MOTOFIT 2, NIGAM NAGAR,</div>
                        <div>CHANDKHEDA, AHMEDABAD</div>
                    </div>
                </div>

                <div className="invoice-form-grid">
                    <div className="invoice-form-section">
                        <div className="invoice-section-title">INVOICE TO:</div>
                        <div className="invoice-input-row">
                            <div className="invoice-input-label">NAME:</div>
                            <div className="invoice-input-value font-bold">{invoice.customer.name}</div>
                        </div>
                        <div className="invoice-input-row">
                            <div className="invoice-input-label">MOBILE NUMBER:</div>
                            <div className="invoice-input-value">{invoice.customer.phone}</div>
                        </div>
                        <div className="invoice-input-row">
                            <div className="invoice-input-label">ADDRESS:</div>
                            <div className="invoice-input-value">{invoice.customer.address}</div>
                        </div>
                        <div className="invoice-input-row">
                            <div className="invoice-input-label">DATE:</div>
                            <div className="invoice-input-value font-mono">{invoice.date}</div>
                        </div>
                    </div>

                    <div className="invoice-form-section">
                        <div className="invoice-section-title">VEHICLE DETAILS:</div>
                        <div className="invoice-input-row">
                            <div className="invoice-input-label">MAKE & MODEL:</div>
                            <div className="invoice-input-value">{invoice.vehicle.make} {invoice.vehicle.model}</div>
                        </div>
                        <div className="invoice-input-row">
                            <div className="invoice-input-label">VEHICLE NUMBER:</div>
                            <div className="invoice-input-value font-bold">{invoice.vehicle.regNo}</div>
                        </div>
                        <div className="invoice-input-row">
                            <div className="invoice-input-label">METER READING:</div>
                            <div className="invoice-input-value">{invoice.vehicle.odometer}</div>
                        </div>
                        <div className="invoice-input-row">
                            <div className="invoice-input-label">INVOICE NO:</div>
                            <div className="invoice-input-value font-mono">{invoice.id}</div>
                        </div>
                    </div>
                </div>

                <table className="invoice-table">
                    <thead>
                        <tr>
                            <th className="w-12 text-center">S. No:</th>
                            <th>Description</th>
                            <th className="w-16 text-center">Unit</th>
                            <th className="w-24 text-right">Unit Price</th>
                            <th className="w-20 text-right">Discount</th>
                            <th className="w-24 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...invoice.items, ...Array(Math.max(0, 13 - invoice.items.length)).fill({})].map((item, index) => (
                            <tr key={index} className="h-7">
                                <td className="text-center text-gray-400">{item.description ? index + 1 : ''}</td>
                                <td className="font-medium">{item.description || ''}</td>
                                <td className="text-center">{item.description ? 'Nos' : ''}</td>
                                <td className="text-right font-mono">{item.rate ? `₹${item.rate.toLocaleString()}` : ''}</td>
                                <td className="text-right text-gray-400 font-mono">{item.discount ? `₹${item.discount}` : ''}</td>
                                <td className="text-right font-bold text-gray-800 font-mono">{item.amount ? `₹${item.amount.toLocaleString()}` : ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-between items-center mt-4 border-b-2 border-gray-100 pb-2">
                    <div className="text-[14px] font-bold text-gray-500 uppercase">Grand Total :</div>
                    <div className="text-2xl font-black text-[#00a699] font-mono">
                        ₹{invoice.total.toLocaleString()}
                    </div>
                </div>

                <div className="invoice-footer mt-auto">
                    <div className="flex justify-between items-end">
                        <div className="w-1/2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center border-t border-[#00a699] pt-2 mt-12">
                                    <div className="text-[10px] font-bold uppercase">CLIENT SIGNATURE</div>
                                </div>
                                <div className="text-center border-t border-[#00a699] pt-2 mt-12">
                                    <div className="text-[10px] font-bold uppercase">AUTHORIZED SIGNATURE</div>
                                </div>
                            </div>
                            <div className="mt-4 text-[9px] text-gray-500 leading-tight space-y-0.5 uppercase">
                                <p>• SERVICE DELIVERY TIMINGS MAY DIFFER SUBJECT TO 2-3 HOURS FROM SAID TIME.</p>
                                <p>• DISCOUNTS OFFERED ARE SOLELY ON THE DISCRETION OF MOTOFIT 2.</p>
                                <p>• SALE AND PURCHASE OF SPARES WILL BE ON MRP ONLY.</p>
                                <p className="font-bold text-teal-600">• COMMENT GENUINE REVIEW ON GOOGLE BY SCANNING THE QR CODE.</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="qr-code-placeholder flex items-center justify-center">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://g.page/motofit-2/review`} alt="QR Code" className="w-full h-full opacity-80" />
                            </div>
                            <div className="text-[8px] font-bold text-gray-400">SCAN TO REVIEW</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

// Invoice Manager Component
const InvoicePDF = () => {
    const [showPreview, setShowPreview] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [invoices] = useState([
        { ...sampleInvoice },
        { ...sampleInvoice, id: 'INV-2026-002', customer: { ...sampleInvoice.customer, name: 'Amit Shah' }, total: 5200, status: 'paid' },
        { ...sampleInvoice, id: 'INV-2026-003', customer: { ...sampleInvoice.customer, name: 'Priya Sharma' }, total: 1850, status: 'pending' },
    ]);
    const [selectedInvoice, setSelectedInvoice] = useState(sampleInvoice);
    const printRef = useRef();

    const handlePrint = () => {
        const printContent = printRef.current;
        const originalBody = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalBody;
        window.location.reload();
    };

    const handleDownloadPDF = () => {
        alert('PDF download would be triggered here. In production, use jsPDF or html2pdf library.');
    };

    const handleSendEmail = () => {
        alert(`Invoice ${selectedInvoice.id} would be sent to ${selectedInvoice.customer.email}`);
    };

    return (
        <div className="p-6">
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/20">
                        <FileText className="w-6 h-6 text-teal-400" />
                    </div>
                    Invoice Generator
                </h1>
                <p className="text-gray-400">Generate and print professional invoices</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <motion.div
                        className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm 
                       border border-white/[0.08] rounded-2xl p-5"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-lg font-semibold text-white mb-4">Recent Invoices</h2>
                        <div className="space-y-3">
                            {invoices.map((inv) => (
                                <motion.div
                                    key={inv.id}
                                    className={`p-4 rounded-xl cursor-pointer transition-all ${selectedInvoice.id === inv.id
                                        ? 'bg-teal-500/20 border border-teal-500/30'
                                        : 'bg-white/5 border border-white/5 hover:bg-white/10'
                                        }`}
                                    onClick={() => setSelectedInvoice(inv)}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-mono text-sm text-teal-400">{inv.id}</div>
                                            <div className="text-white font-medium">{inv.customer.name}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-white">₹{inv.total.toLocaleString()}</div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {inv.status}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="lg:col-span-2">
                    <motion.div
                        className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm 
                       border border-white/[0.08] rounded-2xl p-5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex gap-3 mb-6">
                            <motion.button
                                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white 
                         font-medium rounded-xl shadow-lg shadow-teal-500/25"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowCreateForm(true)}
                            >
                                <Plus className="w-5 h-5" />
                                Create Invoice
                            </motion.button>
                            <motion.button
                                className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl"
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowPreview(true)}
                            >
                                <Eye className="w-4 h-4" />
                                Preview
                            </motion.button>
                            <motion.button
                                className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl"
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handlePrint}
                            >
                                <Printer className="w-4 h-4" />
                                Print
                            </motion.button>
                            <motion.button
                                className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl"
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleDownloadPDF}
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </motion.button>
                            <motion.button
                                className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-emerald-500/30 text-emerald-400 rounded-xl"
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(16,185,129,0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSendEmail}
                            >
                                <Send className="w-4 h-4" />
                                Email
                            </motion.button>
                        </div>

                        <div className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-2xl font-mono font-bold text-teal-400">{selectedInvoice.id}</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedInvoice.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {selectedInvoice.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Customer</div>
                                    <div className="text-white font-medium">{selectedInvoice.customer.name}</div>
                                    <div className="text-sm text-gray-400">{selectedInvoice.customer.phone}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Vehicle</div>
                                    <div className="text-white font-medium">{selectedInvoice.vehicle.make} {selectedInvoice.vehicle.model}</div>
                                    <div className="text-sm text-gray-400">{selectedInvoice.vehicle.regNo}</div>
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-white">₹{selectedInvoice.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">GST (18%)</span>
                                    <span className="text-white">₹{selectedInvoice.tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-lg mt-3 pt-3 border-t border-white/10">
                                    <span className="font-bold text-white">Total</span>
                                    <span className="font-bold text-2xl text-teal-400">₹{selectedInvoice.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="hidden">
                <PrintableInvoice ref={printRef} invoice={selectedInvoice} />
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-auto"
                    onClick={() => setShowPreview(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative max-w-4xl w-full max-h-[90vh] overflow-auto rounded-2xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                            onClick={() => setShowPreview(false)}
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                        <PrintableInvoice invoice={selectedInvoice} />
                    </motion.div>
                </motion.div>
            )}
            {/* Invoice Creation Form */}
            <InvoiceForm
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                onSave={(invoice) => {
                    console.log('Invoice created:', invoice);
                    setShowCreateForm(false);
                }}
            />
        </div>
    );
};

export default InvoicePDF;
