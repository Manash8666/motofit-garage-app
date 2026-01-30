import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart2,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Wrench,
    Calendar,
    Download,
    Filter,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    Bike,
    Clock,
    Target,
    Zap,
    PieChart,
    Activity,
    Package,
    FileText,
} from 'lucide-react';
import Papa from 'papaparse';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart as RechartsPie,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

// Data arrays - empty (will be populated from backend API)
const revenueData = [];
const serviceDistribution = [];
const mechanicPerformance = [];
const dailyJobs = [];
const topServices = [];
const inventoryStats = [];
const customerGrowth = [];
const customerValueData = [];
const turnoverData = [];

// Stat Card Component
const StatCard = ({ title, value, change, trend, icon: Icon, color = 'orange' }) => (
    <motion.div
        className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm 
               border border-white/[0.08] rounded-2xl p-6 hover:border-orange-500/30 transition-all"
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-gray-400 mb-1">{title}</p>
                <h3 className={`text-3xl font-bold bg-gradient-to-r from-${color}-400 to-${color}-600 bg-clip-text text-transparent`}>
                    {value}
                </h3>
                {change && (
                    <div className="flex items-center gap-1 mt-2">
                        {trend === 'up' ? (
                            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {change}
                        </span>
                        <span className="text-xs text-gray-500">vs last month</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br from-${color}-500/20 to-${color}-500/5`}>
                <Icon className={`w-6 h-6 text-${color}-400`} />
            </div>
        </div>
    </motion.div>
);

// Chart Card Wrapper
const ChartCard = ({ title, subtitle, children, action }) => (
    <motion.div
        className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm 
               border border-white/[0.08] rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
            </div>
            {action}
        </div>
        {children}
    </motion.div>
);

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800/90 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
                <p className="text-sm text-white font-medium mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: {typeof entry.value === 'number' && entry.value > 1000
                            ? `₹${(entry.value / 1000).toFixed(0)}K`
                            : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const GenerateReportModal = ({ isOpen, onClose }) => {
    const [reportType, setReportType] = useState('financial');
    const [format, setFormat] = useState('pdf');
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate generation
        setTimeout(() => {
            setIsGenerating(false);
            onClose();
            // In a real app, this would trigger a download
            console.log(`Generating ${reportType} report in ${format} format`);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden relative"
            >
                {/* Background Pulse Effect */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl -z-10 pointer-events-none" />

                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Generate Report</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">Report Type</label>
                        <div className="relative">
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                            >
                                <option value="financial" className="bg-slate-900">Financial Report</option>
                                <option value="operational" className="bg-slate-900">Operational Report</option>
                                <option value="inventory" className="bg-slate-900">Inventory Status</option>
                                <option value="mechanic" className="bg-slate-900">Mechanic Performance</option>
                                <option value="customer" className="bg-slate-900">Customer Analytics</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">Date Range</label>
                        <div className="relative">
                            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer">
                                <option value="last30" className="bg-slate-900">Last 30 Days</option>
                                <option value="thisMonth" className="bg-slate-900">This Month</option>
                                <option value="lastMonth" className="bg-slate-900">Last Month</option>
                                <option value="thisYear" className="bg-slate-900">This Year</option>
                                <option value="custom" className="bg-slate-900">Custom Range</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">Export Format</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['pdf', 'csv', 'excel'].map((fmt) => (
                                <button
                                    key={fmt}
                                    onClick={() => setFormat(fmt)}
                                    className={`px-3 py-3 rounded-xl text-sm font-bold uppercase border transition-all ${format === fmt
                                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.1)]'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {fmt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3.5 bg-white/5 hover:bg-white/10 hover:border-white/20 border border-white/10 text-white rounded-xl font-bold transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FileText className="w-5 h-5" />
                                Generate Report
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};



const ReportsAnalytics = () => {
    const [period, setPeriod] = useState('month');
    const [isLoading, setIsLoading] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const totalRevenue = useMemo(() =>
        revenueData.reduce((sum, d) => sum + d.revenue, 0),
        []);

    const totalJobs = useMemo(() =>
        dailyJobs.reduce((sum, d) => sum + d.completed + d.pending, 0),
        []);

    const handleExport = () => {
        const data = revenueData.map(item => ({
            Month: item.month,
            Revenue: item.revenue,
            Expenses: item.expenses,
            Profit: item.profit
        }));

        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <motion.div
                className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20">
                            <BarChart2 className="w-6 h-6 text-orange-400" />
                        </div>
                        Reports & Analytics
                    </h1>
                    <p className="text-gray-400">Business intelligence dashboard</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Period Selector */}
                    <div className="flex rounded-xl border border-white/10 overflow-hidden">
                        {['week', 'month', 'quarter', 'year'].map((p) => (
                            <button
                                key={p}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${period === p
                                    ? 'bg-orange-500/20 text-orange-400'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                onClick={() => setPeriod(p)}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>

                    <motion.button
                        className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRefresh}
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </motion.button>

                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-blue-400 transition-all"
                    >
                        <FileText className="w-5 h-5" /> Generate Report
                    </button>
                    <motion.button
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white 
                     font-medium rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExport}
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
                    change="+12.5%"
                    trend="up"
                    icon={DollarSign}
                    color="emerald"
                />
                <StatCard
                    title="Jobs Completed"
                    value="347"
                    change="+8.2%"
                    trend="up"
                    icon={Wrench}
                    color="orange"
                />
                <StatCard
                    title="Avg. Customer Value"
                    value="₹12.4K"
                    change="+5.3%"
                    trend="up"
                    icon={DollarSign}
                    color="blue"
                />
                <StatCard
                    title="Active Customers"
                    value="1,284"
                    change="+15.3%"
                    trend="up"
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Avg. Service Time"
                    value="2.4 hrs"
                    change="-5.1%"
                    trend="down"
                    icon={Clock}
                    color="purple"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue Chart */}
                <ChartCard
                    title="Revenue & Profit Trend"
                    subtitle="Last 6 months performance"
                >
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06D6A0" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                                <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `₹${v / 1000}K`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#FF6B35" fill="url(#colorRevenue)" strokeWidth={2} name="Revenue" />
                                <Area type="monotone" dataKey="profit" stroke="#06D6A0" fill="url(#colorProfit)" strokeWidth={2} name="Profit" />
                                <Line type="monotone" dataKey="revenue" stroke="#FF6B35" strokeDasharray="5 5" name="Forecast" activeDot={false} dot={false} strokeOpacity={0.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Service Distribution */}
                <ChartCard
                    title="Service Distribution"
                    subtitle="By service type"
                >
                    <div className="h-72 flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                                <Pie
                                    data={serviceDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {serviceDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </RechartsPie>
                        </ResponsiveContainer>
                        <div className="space-y-2">
                            {serviceDistribution.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm text-gray-400">{item.name}</span>
                                    <span className="text-sm text-white font-medium">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartCard>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Daily Jobs */}
                <ChartCard
                    title="Weekly Job Summary"
                    subtitle="Completed vs Pending"
                >
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyJobs}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                                <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                                <YAxis stroke="#6B7280" fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="completed" fill="#06D6A0" radius={[4, 4, 0, 0]} name="Completed" />
                                <Bar dataKey="pending" fill="#FFD166" radius={[4, 4, 0, 0]} name="Pending" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Mechanic Performance */}
                <ChartCard
                    title="Mechanic Performance"
                    subtitle="Efficiency & job count"
                    className="lg:col-span-2"
                >
                    <div className="space-y-4">
                        {mechanicPerformance.map((mechanic, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20 flex items-center justify-center">
                                    <span className="text-sm font-bold text-orange-400">{mechanic.name.charAt(0)}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-white">{mechanic.name}</span>
                                        <span className="text-xs text-gray-400">{mechanic.jobs} jobs</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${mechanic.efficiency}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-white">{mechanic.efficiency}%</div>
                                    <div className="text-xs text-yellow-400">★ {mechanic.rating}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>

            {/* Top Services Table */}
            <ChartCard
                title="Top Performing Services"
                subtitle="By revenue and job count"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-white/10">
                                <th className="pb-3 text-sm font-medium text-gray-400">#</th>
                                <th className="pb-3 text-sm font-medium text-gray-400">Service</th>
                                <th className="pb-3 text-sm font-medium text-gray-400 text-right">Jobs</th>
                                <th className="pb-3 text-sm font-medium text-gray-400 text-right">Revenue</th>
                                <th className="pb-3 text-sm font-medium text-gray-400 text-right">% Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topServices.map((service, index) => {
                                const totalServiceRevenue = topServices.reduce((sum, s) => sum + s.revenue, 0);
                                const share = ((service.revenue / totalServiceRevenue) * 100).toFixed(1);
                                return (
                                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 text-sm text-gray-500">{index + 1}</td>
                                        <td className="py-4">
                                            <span className="text-white font-medium">{service.name}</span>
                                        </td>
                                        <td className="py-4 text-right text-gray-400">{service.count}</td>
                                        <td className="py-4 text-right font-medium text-orange-400">
                                            ₹{(service.revenue / 1000).toFixed(0)}K
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-400 rounded-full">
                                                {share}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </ChartCard>

            {/* Charts Row 3 - New Additions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Inventory Health */}
                <ChartCard
                    title="Inventory Health"
                    subtitle="Stock status overview"
                >
                    <div className="h-64 flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                                <Pie
                                    data={inventoryStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {inventoryStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </RechartsPie>
                        </ResponsiveContainer>
                        <div className="space-y-4 pr-8">
                            {inventoryStats.map((item, index) => (
                                <div key={index} className="flex items-center justify-between gap-4 min-w-[140px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm text-gray-400">{item.name}</span>
                                    </div>
                                    <span className="text-sm text-white font-bold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartCard>

                {/* Customer Growth */}
                <ChartCard
                    title="Customer Growth"
                    subtitle="New vs Returning"
                >
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={customerGrowth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                                <YAxis stroke="#6B7280" fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="new" fill="#FFD166" name="New" stackId="a" />
                                <Bar dataKey="returning" fill="#118AB2" name="Returning" stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>

            {/* Charts Row 4 - CLV & Turnover */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* CLV Analysis */}
                <ChartCard
                    title="Customer Lifetime Value"
                    subtitle="Value distribution by segment"
                >
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={customerValueData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                                <XAxis type="number" stroke="#6B7280" fontSize={12} tickFormatter={(v) => `₹${v / 1000}K`} />
                                <YAxis dataKey="segment" type="category" stroke="#6B7280" fontSize={12} width={80} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="#8884d8" name="Total Value" radius={[0, 4, 4, 0]}>
                                    {customerValueData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#FF6B35', '#06D6A0', '#FFD166', '#1E3A5F'][index % 4]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Inventory Turnover */}
                <ChartCard
                    title="Inventory Turnover Rate"
                    subtitle="Monthly stock rotation"
                >
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={turnoverData}>
                                <defs>
                                    <linearGradient id="colorTurnover" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                                <YAxis stroke="#6B7280" fontSize={12} domain={[0, 8]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="ratio" stroke="#8884d8" fillOpacity={1} fill="url(#colorTurnover)" name="Turnover Ratio" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>

            <GenerateReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
            />
        </div>
    );
};

export default ReportsAnalytics;
