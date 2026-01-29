/**
 * MotoFit 2 - Notification Center Component
 * Real-time notifications and alerts panel
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    X,
    Check,
    AlertTriangle,
    Info,
    CheckCircle,
    Trash2,
    Settings,
    Clock,
    Wrench,
    Package,
    User,
} from 'lucide-react';

// Sample notifications data
const SAMPLE_NOTIFICATIONS = [
    {
        id: 1,
        type: 'job',
        title: 'Job JC-002 Completed',
        message: 'TVS Apache repair completed by Vikram Singh',
        time: '2 minutes ago',
        read: false,
        priority: 'normal',
        icon: Wrench,
    },
    {
        id: 2,
        type: 'alert',
        title: 'Low Stock Alert',
        message: 'Engine Oil (20W-50) is below minimum threshold',
        time: '15 minutes ago',
        read: false,
        priority: 'high',
        icon: AlertTriangle,
    },
    {
        id: 3,
        type: 'system',
        title: 'Bay 4 Maintenance Due',
        message: 'Scheduled maintenance for Bay 4 is due today',
        time: '1 hour ago',
        read: false,
        priority: 'medium',
        icon: Info,
    },
    {
        id: 4,
        type: 'job',
        title: 'New Job Assigned',
        message: 'Honda Activa brake service assigned to Bay 2',
        time: '2 hours ago',
        read: true,
        priority: 'normal',
        icon: Wrench,
    },
    {
        id: 5,
        type: 'inventory',
        title: 'Parts Received',
        message: 'Order #PO-2024-089 received (15 items)',
        time: '3 hours ago',
        read: true,
        priority: 'normal',
        icon: Package,
    },
];

// Notification Item Component
const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
    const Icon = notification.icon;

    const priorityColors = {
        high: 'border-l-red-500 bg-red-500/5',
        medium: 'border-l-yellow-500 bg-yellow-500/5',
        normal: 'border-l-blue-500 bg-blue-500/5',
    };

    const iconColors = {
        high: 'text-red-400 bg-red-500/20',
        medium: 'text-yellow-400 bg-yellow-500/20',
        normal: 'text-blue-400 bg-blue-500/20',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`relative p-4 border-l-4 rounded-r-xl ${priorityColors[notification.priority]} ${notification.read ? 'opacity-60' : ''
                }`}
        >
            <div className="flex gap-3">
                <div className={`p-2 rounded-lg ${iconColors[notification.priority]}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-medium ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                            {notification.title}
                        </h4>
                        {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-2" />
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notification.time}
                        </span>
                        <div className="flex gap-2">
                            {!notification.read && (
                                <button
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                    onClick={() => onMarkRead(notification.id)}
                                >
                                    <Check className="w-3 h-3" />
                                    Mark read
                                </button>
                            )}
                            <button
                                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                                onClick={() => onDelete(notification.id)}
                            >
                                <Trash2 className="w-3 h-3" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Notification Bell (for header integration)
export const NotificationBell = ({ onClick, unreadCount = 0 }) => {
    return (
        <motion.button
            className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
        >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full"
                >
                    {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
            )}
        </motion.button>
    );
};

// Main Notification Center Component
const NotificationCenter = ({ isOpen, onClose, pushPermission, pushSupported, onRequestPush, onTestPush }) => {
    const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
    const [filter, setFilter] = useState('all');

    const unreadCount = notifications.filter(n => !n.read).length;

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.type === filter;
    });

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-gradient-to-b from-[#0a1a3a] to-[#050A15] border-l border-white/10 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-orange-400" />
                                    <h2 className="text-lg font-bold text-white">Notifications</h2>
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-500/20 text-orange-400 rounded-full">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                <button
                                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                    onClick={onClose}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {['all', 'unread', 'job', 'alert', 'system'].map((f) => (
                                    <button
                                        key={f}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${filter === f
                                            ? 'bg-orange-500/20 text-orange-400'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        onClick={() => setFilter(f)}
                                    >
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Push Notification Settings */}
                        {pushSupported && (
                            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-300">Browser Notifications</span>
                                    </div>
                                    {pushPermission === 'granted' ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Enabled
                                            </span>
                                            <button
                                                className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                                                onClick={onTestPush}
                                            >
                                                Test
                                            </button>
                                        </div>
                                    ) : pushPermission === 'denied' ? (
                                        <span className="text-xs text-red-400">Blocked</span>
                                    ) : (
                                        <button
                                            className="px-3 py-1 text-xs bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors"
                                            onClick={onRequestPush}
                                        >
                                            Enable
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions Bar */}
                        <div className="px-4 py-2 border-b border-white/5 flex justify-between">
                            <button
                                className="text-xs text-blue-400 hover:text-blue-300"
                                onClick={markAllAsRead}
                            >
                                Mark all as read
                            </button>
                            <button
                                className="text-xs text-red-400 hover:text-red-300"
                                onClick={clearAll}
                            >
                                Clear all
                            </button>
                        </div>

                        {/* Notification List */}
                        <div className="overflow-y-auto h-[calc(100vh-180px)] p-4 space-y-3">
                            <AnimatePresence>
                                {filteredNotifications.length > 0 ? (
                                    filteredNotifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onMarkRead={markAsRead}
                                            onDelete={deleteNotification}
                                        />
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-12"
                                    >
                                        <CheckCircle className="w-12 h-12 mx-auto text-emerald-500/50 mb-3" />
                                        <p className="text-gray-400">All caught up!</p>
                                        <p className="text-sm text-gray-600">No notifications to show</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationCenter;
