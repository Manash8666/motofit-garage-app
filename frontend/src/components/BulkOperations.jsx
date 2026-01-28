/**
 * MotoFit 2 - Bulk Operations Component
 * Select, delete, export functionality for lists
 */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckSquare,
    Square,
    Trash2,
    Download,
    Edit3,
    X,
    AlertTriangle,
    CheckCircle,
    FileSpreadsheet,
    Filter,
} from 'lucide-react';

// Bulk Action Bar Component
export const BulkActionBar = ({
    selectedCount,
    totalCount,
    onSelectAll,
    onClearSelection,
    onDelete,
    onExport,
    onBulkEdit,
    itemType = 'items',
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (selectedCount === 0) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="sticky bottom-4 left-0 right-0 z-40 mx-auto max-w-2xl"
            >
                <div className="flex items-center justify-between gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-500/20 to-orange-500/10 backdrop-blur-xl border border-orange-500/30 shadow-lg shadow-orange-500/10">
                    {/* Selection Info */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-orange-400" />
                            <span className="font-medium text-white">
                                {selectedCount} of {totalCount} {itemType} selected
                            </span>
                        </div>
                        <button
                            className="text-sm text-orange-400 hover:text-orange-300"
                            onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
                        >
                            {selectedCount === totalCount ? 'Clear all' : 'Select all'}
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {onBulkEdit && (
                            <motion.button
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500/20 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onBulkEdit}
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit
                            </motion.button>
                        )}

                        <motion.button
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-500/20 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onExport}
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </motion.button>

                        <motion.button
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500/20 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </motion.button>

                        <button
                            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                            onClick={onClearSelection}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0a1a3a] border border-white/10 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <div className="inline-flex p-4 rounded-full bg-red-500/20 mb-4">
                                    <AlertTriangle className="w-8 h-8 text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Confirm Delete</h3>
                                <p className="text-gray-400">
                                    Are you sure you want to delete {selectedCount} {itemType}? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    className="flex-1 py-3 px-4 text-white font-medium bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    className="flex-1 py-3 px-4 text-white font-medium bg-red-500 rounded-xl shadow-lg shadow-red-500/25 hover:bg-red-600 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        onDelete();
                                        setShowDeleteConfirm(false);
                                    }}
                                >
                                    Delete
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Selectable Item Wrapper
export const SelectableItem = ({
    children,
    isSelected,
    onToggle,
    disabled = false,
}) => {
    return (
        <div
            className={`relative group ${isSelected ? 'ring-2 ring-orange-500/50' : ''
                }`}
        >
            <button
                className={`absolute top-3 left-3 z-10 p-1 rounded-lg transition-all ${isSelected
                        ? 'bg-orange-500 text-white'
                        : 'bg-black/50 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-white'
                    }`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) onToggle();
                }}
                disabled={disabled}
            >
                {isSelected ? (
                    <CheckSquare className="w-4 h-4" />
                ) : (
                    <Square className="w-4 h-4" />
                )}
            </button>
            {children}
        </div>
    );
};

// Export to CSV utility
export const exportToCSV = (data, filename, columns) => {
    if (!data || data.length === 0) return;

    const headers = columns.map(col => col.label).join(',');
    const rows = data.map(item =>
        columns.map(col => {
            const value = item[col.key];
            // Escape quotes and wrap in quotes if contains comma
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? '';
        }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Hook for managing bulk selection
export const useBulkSelection = (items) => {
    const [selectedIds, setSelectedIds] = useState(new Set());

    const toggleItem = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const selectAll = () => {
        setSelectedIds(new Set(items.map(item => item.id)));
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    const isSelected = (id) => selectedIds.has(id);

    const selectedItems = useMemo(() =>
        items.filter(item => selectedIds.has(item.id)),
        [items, selectedIds]
    );

    return {
        selectedIds,
        selectedCount: selectedIds.size,
        selectedItems,
        toggleItem,
        selectAll,
        clearSelection,
        isSelected,
    };
};

// Demo Bulk Operations Component
const BulkOperations = ({ items = [], onDelete, onExport, itemType = 'items' }) => {
    const {
        selectedCount,
        selectedItems,
        toggleItem,
        selectAll,
        clearSelection,
        isSelected,
    } = useBulkSelection(items);

    const handleExport = () => {
        const columns = [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Name' },
            { key: 'status', label: 'Status' },
        ];
        exportToCSV(selectedItems, itemType, columns);
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(selectedItems.map(item => item.id));
        }
        clearSelection();
    };

    return (
        <AnimatePresence>
            <BulkActionBar
                selectedCount={selectedCount}
                totalCount={items.length}
                onSelectAll={selectAll}
                onClearSelection={clearSelection}
                onDelete={handleDelete}
                onExport={handleExport}
                itemType={itemType}
            />
        </AnimatePresence>
    );
};

export default BulkOperations;
