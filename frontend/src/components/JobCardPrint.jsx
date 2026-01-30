import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Printer,
    Wrench,
    X,
    Eye,
    Plus,
} from 'lucide-react';
import JobCardForm from './JobCardForm';

// Sample job card data
const sampleJobCards = [
    {
        id: 'JC-2026-001',
        tokenNo: '12',
        promisedDate: '2026-01-17',
        date: '2026-01-16',
        priority: 'high',
        customer: {
            name: 'Raj Patel',
            phone: '9876543210',
            address: '123 Main Street, Chandkheda, Ahmedabad',
        },
        vehicle: {
            make: 'Royal Enfield',
            model: 'Classic 350',
            regNo: 'GJ-01-AB-1234',
            vin: 'RE350202401234567',
            engineNo: 'ENG-RE-99221',
            odometer: '15,420 km',
        },
        mechanic: 'MUNNA BHAI',
        complaints: 'Engine making clicking noise, Brake feels spongy',
        mechanicNotes: 'Tappet adjustment needed, Brake bleeding required',
        services: [
            { name: 'Engine Inspection', quantity: '1', amount: 1200 },
            { name: 'Brake Bleeding', quantity: '1', amount: 800 },
        ],
        status: 'in-progress',
    },
];

const PrintableJobCard = React.forwardRef(({ jobCard, copyType = 'MOTOFIT COPY' }, ref) => {
    return (
        <div ref={ref} className="bg-white text-[#333] p-0 max-w-[297mm] mx-auto min-h-[210mm] flex flex-col relative overflow-hidden" id="jobcard-print">
            <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
          #jobcard-print { padding: 0 !important; width: 297mm; height: 210mm; }
        }
        .jc-watermark {
            position: absolute;
            top: 30%;
            left: 35%;
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
        .jc-container {
            font-family: 'Arial', sans-serif;
            position: relative;
            z-index: 1;
            padding: 15px;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .jc-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        .jc-logo {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .jc-logo img {
            width: 50px;
            height: 50px;
            object-fit: contain;
        }
        .jc-logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #5d4037;
        }
        .jc-company-details {
            background-color: #00a699;
            color: white;
            padding: 5px 12px;
            border-radius: 4px;
            font-size: 11px;
            line-height: 1.4;
        }
        .jc-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 10px;
        }
        .jc-section {
            border: 1px solid #00a699;
            padding: 8px;
            border-radius: 4px;
            background-color: #f9f9f9;
        }
        .jc-section-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: #5d4037;
            border-bottom: 1px solid #00a699;
            padding-bottom: 2px;
            font-size: 10px;
        }
        .jc-input-row {
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .jc-input-label {
            font-weight: bold;
            font-size: 10px;
            min-width: 80px;
        }
        .jc-input-value {
            font-size: 10px;
            border-bottom: 1px dashed #ddd;
            flex-grow: 1;
            min-height: 14px;
        }
        .jc-service-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 10px;
            border: 2px solid #00a699;
            padding: 8px;
            border-radius: 4px;
        }
        .jc-checkbox-group {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        .jc-checkbox-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 9px;
            width: 100%;
        }
        .jc-checkbox-box {
            width: 12px;
            height: 12px;
            border: 1px solid #00a699;
            border-radius: 2px;
            background: white;
        }
        .jc-spare-parts {
            border: 2px solid #00a699;
            padding: 6px;
            border-radius: 4px;
            margin-top: 10px;
        }
        .jc-spare-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 5px;
            text-align: center;
        }
        .jc-spare-label {
            font-size: 8px;
            font-weight: bold;
            color: #5d4037;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .jc-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #00a699;
            font-size: 10px;
            margin-top: 10px;
        }
        .jc-table th, .jc-table td {
            border: 1px solid #00a699;
            padding: 4px 8px;
        }
        .jc-table th {
            background-color: #e0f7fa;
            font-weight: bold;
        }
        .jc-footer {
            margin-top: auto;
            font-size: 9px;
        }
        .jc-signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
        }
        .jc-signature-box {
            width: 40%;
            border-top: 1px solid #00a699;
            padding-top: 5px;
            text-align: center;
            font-weight: bold;
        }
        .jc-terms {
            font-size: 8px;
            margin-top: 10px;
            color: #666;
        }
      `}</style>

            <div className="jc-watermark">MOTOFIT</div>

            <div className="jc-container">
                <div className="jc-header">
                    <div className="jc-logo">
                        <img src="/motofit-logo.png" alt="MotoFit Logo" />
                        <div className="jc-logo-text">MOTOFIT</div>
                    </div>
                    <div className="jc-company-details">
                        <div className="font-bold">AKSHAT MOHANTY - OWNER: 7259625881</div>
                        <div className="font-bold">MUNNA - SR. MECHANIC: 9123293450</div>
                    </div>
                </div>

                <div className="jc-grid">
                    <div className="jc-section">
                        <div className="jc-section-title">JOB CARD NO: {jobCard.id}</div>
                        <div className="jc-input-row">
                            <div className="jc-input-label">TOKEN NO:</div>
                            <div className="jc-input-value font-bold">{jobCard.tokenNo}</div>
                        </div>
                        <div className="jc-input-row">
                            <div className="jc-input-label">PROM. DATE:</div>
                            <div className="jc-input-value">{jobCard.promisedDate}</div>
                        </div>
                    </div>
                    <div className="jc-section">
                        <div className="jc-section-title">VEHICLE DETAILS</div>
                        <div className="jc-input-row">
                            <div className="jc-input-label">REG NUMBER:</div>
                            <div className="jc-input-value font-bold">{jobCard.vehicle.regNo}</div>
                        </div>
                        <div className="jc-input-row">
                            <div className="jc-input-label">MAKE/MODEL:</div>
                            <div className="jc-input-value">{jobCard.vehicle.make} {jobCard.vehicle.model}</div>
                        </div>
                    </div>
                    <div className="jc-section">
                        <div className="jc-section-title">REGISTRATION DETAILS</div>
                        <div className="jc-input-row">
                            <div className="jc-input-label">CHASSIS NO:</div>
                            <div className="jc-input-value">{jobCard.vehicle.vin}</div>
                        </div>
                        <div className="jc-input-row">
                            <div className="jc-input-label">ENGINE NO:</div>
                            <div className="jc-input-value">{jobCard.vehicle.engineNo}</div>
                        </div>
                    </div>
                </div>

                <div className="jc-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
                    <div className="jc-section">
                        <div className="jc-section-title">CUSTOMER DETAILS</div>
                        <div className="jc-input-row">
                            <div className="jc-input-label">NAME:</div>
                            <div className="jc-input-value font-bold">{jobCard.customer.name}</div>
                        </div>
                        <div className="flex gap-4">
                            <div className="jc-input-row flex-grow">
                                <div className="jc-input-label">MOBILE:</div>
                                <div className="jc-input-value">{jobCard.customer.phone}</div>
                            </div>
                            <div className="jc-input-row flex-grow">
                                <div className="jc-input-label">ADDRESS:</div>
                                <div className="jc-input-value">{jobCard.customer.address}</div>
                            </div>
                        </div>
                        <div className="jc-section-title mt-2">VEHICLE INSPECTION DETAILS</div>
                        <div className="text-[9px] min-h-[30px]">{jobCard.complaints}</div>
                    </div>
                    <div className="jc-section">
                        <div className="jc-section-title">MECHANIC INSPECTION</div>
                        <div className="text-[9px] min-h-[60px]">{jobCard.mechanicNotes}</div>
                    </div>
                </div>

                <div className="jc-service-grid">
                    <div>
                        <div className="font-bold text-[9px] mb-1">GENERAL SERVICING:</div>
                        <div className="jc-checkbox-group">
                            <div className="jc-checkbox-item"><div className="jc-checkbox-box"></div> AIR FILTER CHECK</div>
                            <div className="jc-checkbox-item"><div className="jc-checkbox-box"></div> ALLOY CLEAN</div>
                            <div className="jc-checkbox-item"><div className="jc-checkbox-box"></div> GREASE</div>
                        </div>
                    </div>
                    <div>
                        <div className="font-bold text-[9px] mb-1">OILING & CHECKUP:</div>
                        <div className="jc-checkbox-group">
                            <div className="jc-checkbox-item"><div className="jc-checkbox-box"></div> LIGHTS & INDICATOR</div>
                            <div className="jc-checkbox-item"><div className="jc-checkbox-box"></div> OIL CHANGE</div>
                            <div className="jc-checkbox-item"><div className="jc-checkbox-box"></div> WASHING</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="jc-input-row">
                            <div className="jc-input-label">MECHANIC:</div>
                            <div className="jc-input-value font-bold uppercase">{jobCard.mechanic}</div>
                        </div>
                        <div className="jc-input-row">
                            <div className="jc-input-label">READING:</div>
                            <div className="jc-input-value">{jobCard.vehicle.odometer}</div>
                        </div>
                    </div>
                </div>

                <div className="jc-spare-parts">
                    <div className="font-bold text-[9px] mb-1">SPARE PARTS PROBLEM DETAILS:</div>
                    <div className="jc-spare-grid">
                        <div className="jc-spare-label">BODY</div>
                        <div className="jc-spare-label">TYRES</div>
                        <div className="jc-spare-label">SUSPENSION</div>
                        <div className="jc-spare-label">SILENCER</div>
                        <div className="jc-spare-label">ENGINE</div>
                        <div className="jc-spare-label">CLUTCH</div>
                        <div className="jc-spare-label">ELECTRICAL</div>
                        <div className="flex justify-center"><div className="jc-checkbox-box"></div></div>
                        <div className="flex justify-center"><div className="jc-checkbox-box"></div></div>
                        <div className="flex justify-center"><div className="jc-checkbox-box"></div></div>
                        <div className="flex justify-center"><div className="jc-checkbox-box"></div></div>
                        <div className="flex justify-center"><div className="jc-checkbox-box"></div></div>
                        <div className="flex justify-center"><div className="jc-checkbox-box"></div></div>
                        <div className="flex justify-center"><div className="jc-checkbox-box"></div></div>
                    </div>
                </div>

                <table className="jc-table">
                    <thead>
                        <tr>
                            <th className="w-12">S. NO</th>
                            <th>WORK & SPARES</th>
                            <th className="w-24">QUANTITY</th>
                            <th className="w-32">AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...jobCard.services, ...Array(Math.max(0, 8 - jobCard.services.length)).fill({})].map((s, i) => (
                            <tr key={i} className="h-6">
                                <td className="text-center">{s.name ? i + 1 : ''}</td>
                                <td>{s.name || ''}</td>
                                <td className="text-center">{s.quantity || ''}</td>
                                <td className="text-right">{s.amount ? `₹${s.amount.toLocaleString()}` : ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="jc-footer">
                    <div className="jc-signature-section">
                        <div className="jc-signature-box">CLIENT SIGNATURE</div>
                        <div className="jc-signature-box">AUTHORIZED SIGNATURE</div>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        <div className="jc-terms">
                            <p>• SERVICE DELIVERY TIMINGS MAY DIFFER TO 1-2 HOURS.</p>
                            <p>• SPORTS SEGMENT VEHICLES DELIVERY WILL VARY ON PROBLEMS & SPARES AVAILABILITY.</p>
                            <p>• DISCOUNTS OFFERED ARE SOLELY ON THE DISCRETION OF MOTOFIT 2.</p>
                        </div>
                        <div className="font-bold text-[10px] text-gray-500">{copyType}</div>
                    </div>
                </div>
            </div>
        </div>
    );
});

// Job Card Manager Component
const JobCardPrint = () => {
    const [jobCards] = useState(sampleJobCards);
    const [selectedCard, setSelectedCard] = useState(sampleJobCards[0]);
    const [showPreview, setShowPreview] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const printRef = useRef();

    const handlePrint = () => {
        const printContent = printRef.current;
        const originalBody = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalBody;
        window.location.reload();
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
                        <Wrench className="w-6 h-6 text-teal-400" />
                    </div>
                    Job Card Printing
                </h1>
                <p className="text-gray-400">Generate and print professional job cards</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <motion.div
                        className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm 
                       border border-white/[0.08] rounded-2xl p-5"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-lg font-semibold text-white mb-4">Active Jobs</h2>
                        <div className="space-y-3">
                            {jobCards.map((card) => (
                                <motion.div
                                    key={card.id}
                                    className={`p-4 rounded-xl cursor-pointer transition-all ${selectedCard.id === card.id
                                        ? 'bg-teal-500/20 border border-teal-500/30'
                                        : 'bg-white/5 border border-white/5 hover:bg-white/10'
                                        }`}
                                    onClick={() => setSelectedCard(card)}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-mono text-sm text-teal-400">{card.id}</span>
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                            {card.priority}
                                        </span>
                                    </div>
                                    <div className="text-white font-medium">{card.customer.name}</div>
                                    <div className="text-sm text-gray-400">{card.vehicle.regNo}</div>
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
                                <Plus className="w-4 h-4" />
                                Create Job Card
                            </motion.button>
                            <motion.button
                                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white 
                         font-medium rounded-xl shadow-lg shadow-teal-500/25"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowPreview(true)}
                            >
                                <Eye className="w-4 h-4" />
                                Preview Sheets
                            </motion.button>
                            <motion.button
                                className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl"
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handlePrint}
                            >
                                <Printer className="w-4 h-4" />
                                Print All Copies
                            </motion.button>
                        </div>

                        <div className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-2xl font-mono font-bold text-teal-400">{selectedCard.id}</span>
                                <span className="px-3 py-1 text-sm rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold">
                                    {selectedCard.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Customer</div>
                                    <div className="text-white font-medium">{selectedCard.customer.name}</div>
                                    <div className="text-sm text-gray-400">{selectedCard.customer.phone}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Vehicle</div>
                                    <div className="text-white font-medium">{selectedCard.vehicle.make} {selectedCard.vehicle.model}</div>
                                    <div className="text-sm text-gray-400">{selectedCard.vehicle.regNo}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Print Template (Hidden) */}
            <div className="hidden">
                <div ref={printRef}>
                    <PrintableJobCard jobCard={selectedCard} copyType="MOTOFIT COPY" />
                    <div style={{ pageBreakBefore: 'always' }}></div>
                    <PrintableJobCard jobCard={selectedCard} copyType="CLIENT COPY" />
                </div>
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
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative max-w-5xl w-full max-h-[90vh] overflow-auto rounded-2xl shadow-2xl p-8 bg-black/40 backdrop-blur-xl border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Background Pulse Effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

                        <button
                            className="fixed top-8 right-8 z-50 p-3 rounded-xl bg-black/50 hover:bg-black/70 transition-colors shadow-2xl border border-white/20 hover:border-white/40 text-gray-400 hover:text-white"
                            onClick={() => setShowPreview(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="space-y-8 flex flex-col items-center">
                            <div className="w-full">
                                <p className="text-white text-center mb-4 font-mono text-sm opacity-50 uppercase tracking-widest bg-white/5 border border-white/10 mx-auto w-fit px-4 py-1 rounded-full">Preview: MotoFit Copy</p>
                                <div className="rounded-sm overflow-hidden shadow-2xl">
                                    <PrintableJobCard jobCard={selectedCard} copyType="MOTOFIT COPY" />
                                </div>
                            </div>
                            <div className="w-full">
                                <p className="text-white text-center mb-4 font-mono text-sm opacity-50 uppercase tracking-widest bg-white/5 border border-white/10 mx-auto w-fit px-4 py-1 rounded-full">Preview: Client Copy</p>
                                <div className="rounded-sm overflow-hidden shadow-2xl">
                                    <PrintableJobCard jobCard={selectedCard} copyType="CLIENT COPY" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Job Card Creation Form */}
            <JobCardForm
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                onSave={(job) => {
                    console.log('Job Card created:', job);
                    setShowCreateForm(false);
                }}
            />
        </div>
    );
};

export { PrintableJobCard };
export default JobCardPrint;
