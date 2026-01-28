/**
 * MotoFit 2 - Inventory Manager & Logistics Hub
 * Tactical Parts, Vendor & Order Control
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Search,
    Filter,
    Plus,
    Minus,
    AlertTriangle,
    X,
    Trash2,
    Edit3,
    Box,
    Truck,
    FileText,
    Phone,
    Star,
    ClipboardList,
    User,
    Download,
    RefreshCw
} from 'lucide-react';
import { useInventory, useSuppliers, useOrders, useCommandCenterStore } from '../stores/commandCenterStore';

// Reusable Glass Card
const GlassCard = ({ children, className = '' }) => (
    <div className={`
      relative overflow-hidden rounded-2xl
      bg-gradient-to-br from-white/[0.08] to-white/[0.02]
      backdrop-blur-xl border border-white/[0.1]
      shadow-[0_8px_32px_rgba(0,0,0,0.4)]
      ${className}
    `}>
        {children}
    </div>
);

// Suppliers View Component
const SuppliersView = ({ searchTerm }) => {
    const suppliers = useSuppliers();
    const store = useCommandCenterStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', contact: '', phone: '', category: 'General', rating: 5 });

    const handleSave = () => {
        store.addSupplier(formData);
        setIsModalOpen(false);
        setFormData({ name: '', contact: '', phone: '', category: 'General', rating: 5 });
    };

    const filtered = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Vendor Network</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all"
                >
                    <Plus className="w-5 h-5" /> Add Vendor
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(s => (
                    <GlassCard key={s.id} className="p-5 hover:border-emerald-500/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-lg text-white">{s.name}</h4>
                            <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded text-yellow-400 text-xs font-bold">
                                <Star className="w-3 h-3 fill-yellow-400" /> {s.rating}
                            </div>
                        </div>
                        <div className="space-y-3 text-sm text-slate-300">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-slate-800 rounded-lg"><User className="w-4 h-4 text-emerald-500" /></div>
                                {s.contact}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-slate-800 rounded-lg"><Phone className="w-4 h-4 text-emerald-500" /></div>
                                {s.phone}
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-medium text-slate-400">{s.category}</span>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md">
                            <h3 className="text-xl font-bold text-white mb-6">Add New Vendor</h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-400">Company Name</label>
                                    <input className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-400">Contact Person</label>
                                    <input className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-400">Phone</label>
                                    <input className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                                    <button onClick={handleSave} className="px-5 py-2 bg-emerald-600 rounded-xl text-white font-bold hover:bg-emerald-500 transition-colors">Save Vendor</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Purchase Orders View
const OrdersView = () => {
    const orders = useOrders();
    const inventory = useInventory(); // For creating orders
    const store = useCommandCenterStore();

    return (
        <div className="h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Purchase Orders</h3>
                <button onClick={() => alert("PO Creation Wizard coming soon!")} className="flex items-center gap-2 px-5 py-2 bg-blue-600 rounded-xl text-white font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all">
                    <ClipboardList className="w-5 h-5" /> Create PO
                </button>
            </div>
            <div className="space-y-4">
                {orders.map(order => (
                    <GlassCard key={order.id} className="p-4 flex justify-between items-center group hover:bg-white/5 transition-colors border-l-4 border-l-blue-500">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                <FileText className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-slate-500 text-sm">#{order.id.split('-')[1]}</span>
                                    <span className="font-bold text-white text-lg">Supplier Order</span>
                                </div>
                                <div className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                                    <span>{new Date(order.date).toLocaleDateString()}</span>
                                    <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                    <span>{order.items} Items</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-2xl text-white">₹{order.total.toLocaleString()}</div>
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-400/10 text-yellow-400 mt-1 uppercase tracking-wider">
                                {order.status}
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

const InventoryManager = () => {
    const [activeTab, setActiveTab] = useState('stock'); // stock, suppliers, orders
    const inventory = useInventory();
    const store = useCommandCenterStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPart, setEditingPart] = useState(null);

    const [formData, setFormData] = useState({
        name: '', category: 'Maintenance', stock: 0, minStock: 5, price: 0, location: ''
    });

    const resetForm = () => {
        setFormData({ name: '', category: 'Maintenance', stock: 0, minStock: 5, price: 0, location: '' });
        setEditingPart(null);
    };

    const handleSave = () => {
        if (editingPart) {
            store.updatePart(editingPart.id, formData);
        } else {
            store.addPart({ ...formData, stock: Number(formData.stock), minStock: Number(formData.minStock), price: Number(formData.price) });
        }
        setIsModalOpen(false);
        resetForm();
    };

    const openEdit = (part) => { setEditingPart(part); setFormData(part); setIsModalOpen(true); };
    const handleDelete = (id) => { if (window.confirm('Delete this part permanently?')) store.deletePart(id); };

    const categories = ['All', ...new Set(inventory.map(p => p.category))];
    const filteredInventory = inventory.filter(p => {
        return (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filterCategory === 'All' || p.category === filterCategory);
    });

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-xl">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        {activeTab === 'stock' ? <Package className="w-7 h-7 text-emerald-500" /> :
                            activeTab === 'suppliers' ? <Truck className="w-7 h-7 text-blue-500" /> :
                                <FileText className="w-7 h-7 text-yellow-500" />}
                        Logistics Hub
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        {activeTab === 'stock' ? 'Inventory Control' : activeTab === 'suppliers' ? 'Vendor Management' : 'Procurement'}
                    </p>
                </div>

                <div className="flex gap-1.5 bg-slate-800 rounded-xl p-1.5">
                    {['stock', 'suppliers', 'orders', 'audit'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {activeTab === 'stock' && (
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-48">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={() => { resetForm(); setIsModalOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg font-bold"
                        >
                            <Plus className="w-5 h-5" /> Add Part
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'stock' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4 custom-scrollbar h-full">
                        <AnimatePresence>
                            {filteredInventory.map((part) => (
                                <motion.div
                                    key={part.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full"
                                >
                                    <GlassCard className="p-5 h-full flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`p-2 rounded-lg ${part.stock <= part.minStock ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                                    <Box className="w-5 h-5" />
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEdit(part)} className="p-1 text-slate-300 hover:text-white"><Edit3 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(part.id)} className="p-1 text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-lg text-white mb-1 truncate">{part.name}</h3>
                                            <p className="text-slate-400 text-xs uppercase mb-4">{part.category}</p>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-slate-400">Stock</span>
                                                <span className={`font-mono font-bold ${part.stock <= part.minStock ? 'text-red-400' : 'text-white'}`}>{part.stock} / {part.minStock}</span>
                                            </div>
                                            {part.stock <= part.minStock && (
                                                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-md mb-3">
                                                    <AlertTriangle className="w-3 h-3" /> Low Stock
                                                </div>
                                            )}
                                        </div>
                                        <div className="border-t border-white/5 pt-3 flex justify-between mt-2">
                                            <span className="text-xs text-slate-500">{part.location}</span>
                                            <span className="font-bold text-emerald-400">₹{part.price}</span>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {activeTab === 'suppliers' && <SuppliersView searchTerm={searchTerm} />}
                {activeTab === 'orders' && <OrdersView />}

                {activeTab === 'audit' && (
                    <div className="h-full overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Stock Audit Trail</h3>
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors">
                                <Download className="w-4 h-4" /> Export Log
                            </button>
                        </div>
                        <div className="space-y-2">
                            {[
                                { id: 1, action: 'Stock Added', item: 'Engine Oil 10W-40', user: 'Manas M.', time: 'Today, 10:30 AM', change: '+20 units' },
                                { id: 2, action: 'Stock Used', item: 'Brake Pads (Rear)', user: 'Vikram S.', time: 'Today, 09:45 AM', change: '-2 units' },
                                { id: 3, action: 'Order Received', item: 'Air Filter (Sport)', user: 'System', time: 'Yesterday, 04:20 PM', change: '+50 units' },
                                { id: 4, action: 'Adjustment', item: 'Chain Lube', user: 'Admin', time: 'Yesterday, 02:00 PM', change: '-1 unit' },
                                { id: 5, action: 'Low Stock Alert', item: 'Spark Plugs', user: 'System', time: '15 Jan, 11:30 AM', change: 'Alert Triggered' },
                            ].map((log) => (
                                <GlassCard key={log.id} className="p-4 flex items-center justify-between group hover:bg-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${log.action.includes('Added') || log.action.includes('Received') ? 'bg-emerald-500/20 text-emerald-500' :
                                            log.action.includes('Used') || log.action.includes('Adjustment') ? 'bg-orange-500/20 text-orange-500' :
                                                'bg-blue-500/20 text-blue-500'
                                            }`}>
                                            <ClipboardList className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{log.action}</h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span>{log.item}</span>
                                                <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {log.user}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-mono font-bold text-sm ${log.change.includes('+') ? 'text-emerald-400' :
                                            log.change.includes('-') ? 'text-orange-400' : 'text-blue-400'
                                            }`}>{log.change}</div>
                                        <div className="text-xs text-slate-500 mt-1">{log.time}</div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Stock Modal (Only for Stock Tab) */}
            <AnimatePresence>
                {isModalOpen && activeTab === 'stock' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-lg">
                            <GlassCard className="p-6">
                                <h3 className="text-xl font-bold text-white mb-6">{editingPart ? 'Edit Item' : 'New Item'}</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1"><label className="text-sm text-slate-400">Name</label><input className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1"><label className="text-sm text-slate-400">Stock</label><input type="number" className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} /></div>
                                        <div className="space-y-1"><label className="text-sm text-slate-400">Price</label><input type="number" className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1"><label className="text-sm text-slate-400">Min. Alert</label><input type="number" className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: e.target.value })} /></div>
                                        <div className="space-y-1"><label className="text-sm text-slate-400">Location</label><input className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} /></div>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                                        <button onClick={handleSave} className="px-5 py-2 bg-emerald-600 rounded-xl text-white font-bold hover:bg-emerald-500 transition-colors">Save Item</button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InventoryManager;
