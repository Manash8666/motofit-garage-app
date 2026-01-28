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

// Sample data (would come from API in production)
const revenueData = [
    { month: 'Jan', revenue: 125000, expenses: 45000, profit: 80000 },
    { month: 'Feb', revenue: 148000, expenses: 52000, profit: 96000 },
    { month: 'Mar', revenue: 156000, expenses: 48000, profit: 108000 },
    { month: 'Apr', revenue: 189000, expenses: 55000, profit: 134000 },
    { month: 'May', revenue: 178000, expenses: 51000, profit: 127000 },

    { month: 'Jun', revenue: 210000, expenses: 62000, profit: 148000 },
    // Forecast data
    { month: 'Jul (Est)', revenue: 225000, expenses: 65000, profit: 160000, isForecast: true },
];

const serviceDistribution = [
    { name: 'Basic Service', value: 35, color: '#FF6B35' },
    { name: 'Full Service', value: 25, color: '#06D6A0' },
    { name: 'Engine Repair', value: 20, color: '#FFD166' },
    { name: 'Electrical', value: 12, color: '#1E3A5F' },
    { name: 'Other', value: 8, color: '#9CA3AF' },
];

const mechanicPerformance = [
    { name: 'Vikram', jobs: 45, efficiency: 95, rating: 4.8 },
    { name: 'Suresh', jobs: 38, efficiency: 88, rating: 4.5 },
    { name: 'Anil', jobs: 42, efficiency: 92, rating: 4.7 },
    { name: 'Rajesh', jobs: 35, efficiency: 85, rating: 4.3 },
];

const dailyJobs = [
    { day: 'Mon', completed: 12, pending: 3 },
    { day: 'Tue', completed: 15, pending: 2 },
    { day: 'Wed', completed: 10, pending: 5 },
    { day: 'Thu', completed: 18, pending: 1 },
    { day: 'Fri', completed: 14, pending: 4 },
    { day: 'Sat', completed: 20, pending: 2 },
    { day: 'Sun', completed: 8, pending: 1 },
];

const topServices = [
    { name: 'Oil Change', count: 156, revenue: 124800 },
    { name: 'Full Service', count: 89, revenue: 267000 },
    { name: 'Brake Service', count: 67, revenue: 167500 },
    { name: 'Chain Replacement', count: 54, revenue: 54000 },
    { name: 'Engine Tune-up', count: 45, revenue: 135000 },
];

const inventoryStats = [
    { name: 'In Stock', value: 850, color: '#06D6A0' },
    { name: 'Low Stock', value: 45, color: '#FFD166' },
    { name: 'Out of Stock', value: 12, color: '#EF476F' },
];

const customerGrowth = [
    { month: 'Jan', new: 45, returning: 120 },
    { month: 'Feb', new: 52, returning: 135 },
    { month: 'Mar', new: 48, returning: 142 },
    { month: 'Apr', new: 65, returning: 155 },
    { month: 'May', new: 58, returning: 168 },
    { month: 'Jun', new: 75, returning: 180 },
    { month: 'Jun', new: 75, returning: 180 },
];

const customerValueData = [
    { segment: 'VIP', count: 120, value: 85000, avg: 708 },
    { segment: 'Regular', count: 450, value: 125000, avg: 277 },
    { segment: 'Occasional', count: 800, value: 95000, avg: 118 },
    { segment: 'New', count: 200, value: 15000, avg: 75 },
];

const turnoverData = [
    { month: 'Jan', ratio: 4.2 },
    { month: 'Feb', ratio: 4.5 },
    { month: 'Mar', ratio: 5.1 },
    { month: 'Apr', ratio: 4.8 },
    { month: 'May', ratio: 5.4 },
    { month: 'Jun', ratio: 5.8 },
];

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
        </div>
    );
};

export default ReportsAnalytics;
