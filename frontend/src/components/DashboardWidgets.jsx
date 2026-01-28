/**
 * MotoFit 2 - Dashboard Widgets Component
 * Customizable widget grid for command center
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    TrendingUp,
    Wrench,
    Users,
    Package,
    AlertTriangle,
    Clock,
    DollarSign,
    Eye,
    EyeOff,
    GripVertical,
    Settings,
    RefreshCw,
    X,
} from 'lucide-react';
import { useAlertLevel, useMissions, useBays, useMechanics } from '../stores/commandCenterStore';

// Widget configurations
const WIDGET_TYPES = {
    quickStats: {
        id: 'quickStats',
        title: 'Quick Stats',
        icon: TrendingUp,
        size: 'medium',
        color: 'orange',
    },
    recentJobs: {
        id: 'recentJobs',
        title: 'Recent Jobs',
        icon: Wrench,
        size: 'large',
        color: 'blue',
    },
    bayStatus: {
        id: 'bayStatus',
        title: 'Bay Status',
        icon: LayoutGrid,
        size: 'medium',
        color: 'emerald',
    },
    alerts: {
        id: 'alerts',
        title: 'Alerts',
        icon: AlertTriangle,
        size: 'small',
        color: 'red',
    },
    teamStatus: {
        id: 'teamStatus',
        title: 'Team Status',
        icon: Users,
        size: 'medium',
        color: 'purple',
    },
    revenueToday: {
        id: 'revenueToday',
        title: "Today's Revenue",
        icon: DollarSign,
        size: 'small',
        color: 'yellow',
    },
};

// Individual Widget Component
const Widget = ({ config, data, onToggleVisibility, visible }) => {
    const Icon = config.icon;
    const colorClasses = {
        orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/20',
        blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
        emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
        red: 'from-red-500/20 to-red-500/5 border-red-500/20',
        purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20',
        yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20',
    };

    const iconColors = {
        orange: 'text-orange-400',
        blue: 'text-blue-400',
        emerald: 'text-emerald-400',
        red: 'text-red-400',
        purple: 'text-purple-400',
        yellow: 'text-yellow-400',
    };

    if (!visible) return null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`
        relative p-5 rounded-2xl border backdrop-blur-sm
        bg-gradient-to-br ${colorClasses[config.color]}
        ${config.size === 'large' ? 'col-span-2 row-span-2' : config.size === 'medium' ? 'col-span-1 row-span-1' : 'col-span-1'}
      `}
        >
            {/* Widget Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${iconColors[config.color]}`} />
                    <h3 className="font-semibold text-white text-sm">{config.title}</h3>
                </div>
                <button
                    className="p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                    onClick={() => onToggleVisibility(config.id)}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Widget Content */}
            <div className="text-white">
                {data}
            </div>
        </motion.div>
    );
};

// Quick Stats Widget Content
const QuickStatsContent = () => {
    const missions = useMissions();
    const bays = useBays();

    const stats = [
        { label: 'Active Jobs', value: missions.filter(m => m.status === 'in-progress').length, color: 'text-blue-400' },
        { label: 'Pending', value: missions.filter(m => m.status === 'pending').length, color: 'text-yellow-400' },
        { label: 'Completed Today', value: 3, color: 'text-emerald-400' },
        { label: 'Bay Occupancy', value: `${Math.round((bays.filter(b => b.status === 'occupied').length / bays.length) * 100)}%`, color: 'text-orange-400' },
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, i) => (
                <div key={i} className="text-center p-2 rounded-xl bg-white/5">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
            ))}
        </div>
    );
};

// Recent Jobs Widget Content
const RecentJobsContent = () => {
    const missions = useMissions();

    return (
        <div className="space-y-2 max-h-48 overflow-y-auto">
            {missions.slice(0, 5).map((mission) => (
                <div
                    key={mission.id}
                    className={`flex items-center justify-between p-2 rounded-lg bg-white/5 border-l-3 ${mission.priority === 'red' ? 'border-l-red-500' :
                        mission.priority === 'orange' ? 'border-l-orange-500' :
                            'border-l-yellow-500'
                        }`}
                >
                    <div>
                        <div className="font-mono text-sm text-orange-400">{mission.missionCode}</div>
                        <div className="text-xs text-gray-500">{mission.services[0]}</div>
                    </div>
                    <div className={`px-2 py-0.5 text-xs rounded-full ${mission.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                        mission.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-emerald-500/20 text-emerald-400'
                        }`}>
                        {mission.status}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Bay Status Widget Content
const BayStatusContent = () => {
    const bays = useBays();

    const statusColors = {
        occupied: 'bg-orange-500',
        available: 'bg-emerald-500',
        maintenance: 'bg-yellow-500',
    };

    return (
        <div className="grid grid-cols-2 gap-2">
            {bays.map((bay) => (
                <div
                    key={bay.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white/5"
                >
                    <div className={`w-3 h-3 rounded-full ${statusColors[bay.status]}`} />
                    <div>
                        <div className="text-sm font-medium">Bay {bay.id}</div>
                        <div className="text-xs text-gray-500 capitalize">{bay.status}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Alerts Widget Content
const AlertsContent = () => {
    const alertLevel = useAlertLevel();

    const alerts = [
        { type: 'warning', message: 'Low stock: Engine Oil', time: '2m ago' },
        { type: 'info', message: 'Job JC-002 completed', time: '15m ago' },
        { type: 'critical', message: 'Bay 4 maintenance due', time: '1h ago' },
    ];

    return (
        <div className="space-y-2">
            {alerts.map((alert, i) => (
                <div
                    key={i}
                    className={`p-2 rounded-lg text-xs ${alert.type === 'critical' ? 'bg-red-500/20 text-red-400' :
                        alert.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                        }`}
                >
                    <div className="font-medium">{alert.message}</div>
                    <div className="text-gray-500 mt-1">{alert.time}</div>
                </div>
            ))}
        </div>
    );
};

// Team Status Widget Content
const TeamStatusContent = () => {
    const mechanics = useMechanics();

    return (
        <div className="space-y-2">
            {mechanics.map((mech) => (
                <div key={mech.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-400">
                            {mech.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <div className="text-sm font-medium">{mech.name}</div>
                            <div className="text-xs text-gray-500">{mech.specialty}</div>
                        </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${mech.status === 'active' ? 'bg-emerald-400' :
                        mech.status === 'busy' ? 'bg-orange-400' : 'bg-gray-400'
                        }`} />
                </div>
            ))}
        </div>
    );
};

// Revenue Widget Content
const RevenueContent = () => {
    return (
        <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">₹24,500</div>
            <div className="text-xs text-gray-500 mt-1">Today's Revenue</div>
            <div className="text-xs text-emerald-400 mt-2">↑ 12% vs yesterday</div>
        </div>
    );
};

// Main Dashboard Widgets Component
const DashboardWidgets = () => {
    const [widgetVisibility, setWidgetVisibility] = useState({
        quickStats: true,
        recentJobs: true,
        bayStatus: true,
        alerts: true,
        teamStatus: true,
        revenueToday: true,
    });
    const [showSettings, setShowSettings] = useState(false);

    const toggleWidget = (widgetId) => {
        setWidgetVisibility(prev => ({
            ...prev,
            [widgetId]: !prev[widgetId],
        }));
    };

    const widgetContent = {
        quickStats: <QuickStatsContent />,
        recentJobs: <RecentJobsContent />,
        bayStatus: <BayStatusContent />,
        alerts: <AlertsContent />,
        teamStatus: <TeamStatusContent />,
        revenueToday: <RevenueContent />,
    };

    const visibleCount = Object.values(widgetVisibility).filter(Boolean).length;

    return (
        <div className="space-y-4">
            {/* Widget Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <LayoutGrid className="w-4 h-4" />
                    <span>{visibleCount} widgets active</span>
                </div>
                <button
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setShowSettings(!showSettings)}
                >
                    <Settings className="w-4 h-4" />
                    Customize
                </button>
            </div>

            {/* Widget Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 overflow-hidden"
                    >
                        <h4 className="text-sm font-medium text-white mb-3">Toggle Widgets</h4>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(WIDGET_TYPES).map((widget) => (
                                <button
                                    key={widget.id}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${widgetVisibility[widget.id]
                                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                        : 'bg-white/5 text-gray-400 border border-white/10'
                                        }`}
                                    onClick={() => toggleWidget(widget.id)}
                                >
                                    {widgetVisibility[widget.id] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    {widget.title}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Widget Grid */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" layout>
                <AnimatePresence>
                    {Object.values(WIDGET_TYPES).map((widget) => (
                        <Widget
                            key={widget.id}
                            config={widget}
                            data={widgetContent[widget.id]}
                            visible={widgetVisibility[widget.id]}
                            onToggleVisibility={toggleWidget}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default DashboardWidgets;
