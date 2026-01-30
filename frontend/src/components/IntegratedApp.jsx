/**
 * MotoFit 2 - Integrated Tactical App
 * Premium Command Center with all features integrated
 */
import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    BarChart2,
    Wrench,
    Users,
    Package,
    FileText,
    Settings,
    Clock,
    Bike,
    Shield,
    DollarSign,
    User,
    Menu,
    X,
    Zap,
    LogOut,
    Box,
    CreditCard,
    BookOpen,
    UserPlus,
} from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';

// Import all components
// Import Tactical Loader
import TacticalLoader from './TacticalLoader';

// Lazy Load Components
const InventoryManager = lazy(() => import('./InventoryManager'));
const BikeDatabase = lazy(() => import('./BikeDatabase'));
const ReportsAnalytics = lazy(() => import('./ReportsAnalytics'));

const InvoicePDF = lazy(() => import('./InvoicePDF'));
const JobCardPrint = lazy(() => import('./JobCardPrint'));
const UserProfile = lazy(() => import('./UserProfile'));
const LoginPage = lazy(() => import('./LoginPage'));
const CommandCenterScene = lazy(() => import('./CommandCenterScene'));
const DashboardWidgets = lazy(() => import('./DashboardWidgets'));
// Keep NotificationCenter eager as NotificationBell is used in Header
import NotificationCenter, { NotificationBell } from './NotificationCenter';
import TimeClock from './TimeClock';
const TacticalVehicleViewer = lazy(() => import('./TacticalVehicleViewer'));
const RepairOperations = lazy(() => import('./RepairOperations'));
const PhotoGallery = lazy(() => import('./PhotoGallery'));
const CustomerApproval = lazy(() => import('./CustomerApproval'));
const ServiceTimeline = lazy(() => import('./ServiceTimeline'));
const WarrantyClaims = lazy(() => import('./WarrantyClaims'));
const QuoteManagement = lazy(() => import('./QuoteManagement'));
const PaymentManagement = lazy(() => import('./PaymentManagement'));
const LeadManagement = lazy(() => import('./LeadManagement'));
const AccountingLedger = lazy(() => import('./AccountingLedger'));
import { useAlertLevel, useBayUtilization, useMissions, useHybridStore } from '../stores/hybridStore';
import { useSyncInitialization } from '../hooks/useSyncInitialization';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { OfflineTestDemo } from './OfflineTestDemo';
import useSessionTimeout from '../hooks/useSessionTimeout';
import { logLogin, logLogout } from '../utils/auditLogger';
import { usePushNotifications } from '../hooks/usePushNotifications';

// Navigation items with paths
const NAV_ITEMS = [
    { id: 'command', label: 'Command Center', icon: Target, color: 'orange', path: '/command' },
    { id: 'viewer3d', label: '3D Viewer', icon: Bike, color: 'cyan', path: '/viewer' },
    { id: 'jobs', label: 'Repair Ops', icon: Wrench, color: 'blue', path: '/jobs' },
    { id: 'timeclock', label: 'Time Clock', icon: Clock, color: 'emerald', path: '/timeclock' },
    { id: 'inventory', label: 'Inventory', icon: Box, color: 'emerald', path: '/inventory' },
    { id: 'bikes', label: 'Bikes Database', icon: Package, color: 'indigo', path: '/bikes' },
    { id: 'servicehistory', label: 'Service History', icon: Clock, color: 'purple', path: '/service-history' },
    { id: 'warranty', label: 'Warranty Claims', icon: Shield, color: 'pink', path: '/warranty' },
    { id: 'reports', label: 'Reports', icon: BarChart2, color: 'yellow', path: '/reports' },
    { id: 'invoices', label: 'Invoices', icon: DollarSign, color: 'slate', path: '/invoices' },
    { id: 'jobcards', label: 'Job Cards', icon: FileText, color: 'gray', path: '/job-cards' },
    { id: 'synctest', label: 'Sync Test', icon: Zap, color: 'orange', path: '/sync-test' },
    // CRM & Accounting
    { id: 'quotes', label: 'Quotes', icon: FileText, color: 'orange', path: '/quotes' },
    { id: 'payments', label: 'Payments', icon: CreditCard, color: 'green', path: '/payments' },
    { id: 'leads', label: 'Leads', icon: UserPlus, color: 'blue', path: '/leads' },
    { id: 'accounting', label: 'Accounting', icon: BookOpen, color: 'purple', path: '/accounting' },
    { id: 'profile', label: 'Profile', icon: User, color: 'cyan', path: '/profile' },
];

// Glass Card Component
export const GlassCard = ({ children, className = '' }) => (
    <div
        className={`
      relative overflow-hidden rounded-2xl
      bg-gradient-to-br from-white/[0.08] to-white/[0.02]
      backdrop-blur-xl border border-white/[0.1]
      shadow-[0_8px_32px_rgba(0,0,0,0.4)]
      ${className}
    `}
    >
        {children}
    </div>
);

// Command Center Dashboard
const CommandCenterDashboard = () => {
    const alertLevel = useAlertLevel();
    const bayUtilization = useBayUtilization();
    const missions = useMissions();

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassCard className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-orange-500/20">
                            <Zap className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-orange-400">{bayUtilization}%</p>
                            <p className="text-sm text-gray-400">Bay Utilization</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-blue-500/20">
                            <Wrench className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-blue-400">{missions.length}</p>
                            <p className="text-sm text-gray-400">Active Missions</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-5">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${alertLevel === 'green' ? 'bg-emerald-500/20' :
                            alertLevel === 'yellow' ? 'bg-yellow-500/20' :
                                alertLevel === 'orange' ? 'bg-orange-500/20' : 'bg-red-500/20'
                            }`}>
                            <Shield className={`w-6 h-6 ${alertLevel === 'green' ? 'text-emerald-400' :
                                alertLevel === 'yellow' ? 'text-yellow-400' :
                                    alertLevel === 'orange' ? 'text-orange-400' : 'text-red-400'
                                }`} />
                        </div>
                        <div>
                            <p className={`text-3xl font-bold uppercase ${alertLevel === 'green' ? 'text-emerald-400' :
                                alertLevel === 'yellow' ? 'text-yellow-400' :
                                    alertLevel === 'orange' ? 'text-orange-400' : 'text-red-400'
                                }`}>{alertLevel}</p>
                            <p className="text-sm text-gray-400">Alert Level</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* 3D Scene */}
            <GlassCard className="p-0 h-[350px] md:h-[500px]">
                <CommandCenterScene />
            </GlassCard>

            {/* Mission Queue */}
            <GlassCard className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-orange-400" />
                    Active Missions
                </h2>
                <div className="space-y-3">
                    {missions.map((mission) => (
                        <motion.div
                            key={mission.id}
                            className={`p-4 rounded-xl bg-white/[0.03] border-l-4 ${mission.priority === 'red' ? 'border-l-red-500' :
                                mission.priority === 'orange' ? 'border-l-orange-500' :
                                    mission.priority === 'yellow' ? 'border-l-yellow-500' : 'border-l-gray-500'
                                }`}
                            whileHover={{ scale: 1.01 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-mono font-bold text-orange-400">{mission.missionCode}</span>
                                    <span className={`ml-3 px-2 py-0.5 text-xs rounded-full ${mission.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                        mission.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-emerald-500/20 text-emerald-400'
                                        }`}>{mission.status}</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-white">₹{mission.estimatedCost.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500">Bay {mission.bay}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};

// Jobs Page replaced by RepairOperations


// Main Integrated App
const IntegratedApp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    // Check localStorage for existing auth token on mount
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('auth_token');
    });
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
    const [timeoutSeconds, setTimeoutSeconds] = useState(60);

    // Push Notifications
    const { permission, isSupported, requestPermission, sendTestNotification } = usePushNotifications();

    // Auto-request notification permission when authenticated
    useEffect(() => {
        if (isAuthenticated && isSupported && permission === 'default') {
            // Small delay to not overwhelm user on first load
            const timer = setTimeout(() => {
                requestPermission();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, isSupported, permission, requestPermission]);

    // Proper logout handler - clears all auth data
    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('motofit_user');
        setIsAuthenticated(false);
        setShowTimeoutWarning(false);
        navigate('/');
        logLogout();
    };

    // Session timeout handling
    const handleSessionLogout = () => {
        handleLogout();
    };

    const handleTimeoutWarning = (seconds) => {
        setTimeoutSeconds(seconds);
        setShowTimeoutWarning(true);
    };

    useSessionTimeout(handleSessionLogout, handleTimeoutWarning);

    // Sync active tab with URL
    const activeTab = NAV_ITEMS.find(item => location.pathname === item.path)?.id || 'command';

    // Initialize Offline-First Sync
    useSyncInitialization();

    // Close sidebar on mobile by default
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        };
        handleResize(); // Check on mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Network Status Listeners
    // Network Status Listeners (Now managed by useHybridStore)
    const isOnline = useHybridStore((state) => state.isOnline);
    const setOnlineStatus = useHybridStore((state) => state.setOnlineStatus);

    React.useEffect(() => {
        const handleOnline = () => setOnlineStatus(true);
        const handleOffline = () => setOnlineStatus(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const alertLevel = useAlertLevel();

    if (!isAuthenticated) {
        return (
            <Suspense fallback={<TacticalLoader />}>
                <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
            </Suspense>
        );
    }

    return (
        <div className="min-h-screen bg-[#050A15] text-white flex overflow-x-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {sidebarOpen && window.innerWidth < 768 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`fixed left-0 top-0 h-full z-50 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'}`}
            >
                <div className="h-full flex flex-col bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl border-r border-white/[0.08]">
                    {/* Logo */}
                    <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 p-1 border border-white/10 group-hover:border-orange-500/30 transition-all">
                                <img
                                    src={(() => {
                                        const storedLogo = localStorage.getItem('motofit_org_logo');
                                        return storedLogo || "/motofit-neon-logo.jpg";
                                    })()}
                                    alt="MotoFit 2"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "/motofit-neon-logo.jpg"; }}
                                />
                            </div>
                            {(sidebarOpen || window.innerWidth < 768) && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <h1 className="font-bold text-white tracking-tight">MOTOFIT 2</h1>
                                    <p className="text-[10px] text-orange-500 uppercase font-bold tracking-widest">Tactical Command</p>
                                </motion.div>
                            )}
                        </div>
                        {/* Mobile Close Button */}
                        <button
                            className="md:hidden p-2 text-gray-400 hover:text-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Nav Items */}
                    <nav className="p-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                        {NAV_ITEMS.map((item) => (
                            <motion.button
                                key={item.id}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                    ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/10 text-orange-400 border border-orange-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                onClick={() => {
                                    navigate(item.path);
                                    if (window.innerWidth < 768) setSidebarOpen(false);
                                }}
                                whileHover={{ x: 4 }}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {(sidebarOpen || window.innerWidth < 768) && <span className="font-medium">{item.label}</span>}
                            </motion.button>
                        ))}
                    </nav>

                    {/* Sidebar Toggle (Desktop Only) */}
                    <div className="hidden md:block p-4 border-t border-white/[0.06]">
                        <button
                            className="w-full p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            {sidebarOpen ? <X className="w-5 h-5 mx-auto" /> : <Menu className="w-5 h-5 mx-auto" />}
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 w-full ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                {/* Mobile Header Toggle */}
                <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050A15]/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                            <button
                                className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h2 className="text-lg md:text-xl font-bold text-white truncate">
                                {NAV_ITEMS.find((n) => n.id === activeTab)?.label || 'Dashboard'}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Offline-First Sync Status */}
                            <SyncStatusIndicator />

                            {/* Alert Status */}
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${alertLevel === 'green' ? 'bg-emerald-500/10 border-emerald-500/20' :
                                alertLevel === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/20' :
                                    alertLevel === 'orange' ? 'bg-orange-500/10 border-orange-500/20' :
                                        'bg-red-500/10 border-red-500/20'
                                }`}>
                                <div className={`w-2 h-2 rounded-full animate-pulse ${alertLevel === 'green' ? 'bg-emerald-400' :
                                    alertLevel === 'yellow' ? 'bg-yellow-400' :
                                        alertLevel === 'orange' ? 'bg-orange-400' : 'bg-red-400'
                                    }`} />
                                <span className={`text-sm font-medium uppercase ${alertLevel === 'green' ? 'text-emerald-400' :
                                    alertLevel === 'yellow' ? 'text-yellow-400' :
                                        alertLevel === 'orange' ? 'text-orange-400' : 'text-red-400'
                                    }`}>{alertLevel}</span>
                            </div>

                            {/* Notification Bell */}
                            <NotificationBell
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                unreadCount={0}
                            />

                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors"
                                onClick={() => navigate('/profile')}
                            >
                                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                                    <span className="text-sm font-bold text-orange-400">
                                        {(() => {
                                            const user = JSON.parse(localStorage.getItem('motofit_user') || '{}');
                                            return user.name ? user.name.substring(0, 2).toUpperCase() : (user.username ? user.username.substring(0, 2).toUpperCase() : 'Guest');
                                        })()}
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Notification Center Panel */}
                <NotificationCenter
                    isOpen={notificationsOpen}
                    onClose={() => setNotificationsOpen(false)}
                    pushPermission={permission}
                    pushSupported={isSupported}
                    onRequestPush={requestPermission}
                    onTestPush={sendTestNotification}
                />

                {/* Content */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Suspense fallback={<TacticalLoader />}>
                                <ErrorBoundary>
                                    <Routes>
                                        <Route path="/" element={<Navigate to="/command" replace />} />
                                        <Route path="/command" element={<CommandCenterDashboard />} />
                                        <Route path="/viewer" element={<TacticalVehicleViewer className="h-[500px] md:h-[700px]" showControls />} />
                                        <Route path="/jobs" element={<RepairOperations />} />
                                        <Route path="/inventory" element={<InventoryManager />} />
                                        <Route path="/bikes" element={<BikeDatabase />} />
                                        <Route path="/service-history" element={<ServiceTimeline vehicleId="demo-vehicle" vehicleName="Demo Vehicle" />} />
                                        <Route path="/warranty" element={<WarrantyClaims vehicleId="demo-vehicle" vehicleName="Demo Vehicle" />} />
                                        <Route path="/reports" element={<ReportsAnalytics />} />
                                        <Route path="/invoices" element={<InvoicePDF />} />
                                        <Route path="/job-cards" element={<JobCardPrint />} />
                                        <Route path="/timeclock" element={<TimeClock />} />
                                        <Route path="/profile" element={<UserProfile onLogout={handleLogout} />} />
                                        <Route path="/sync-test" element={<OfflineTestDemo />} />
                                        <Route path="/quotes" element={<QuoteManagement />} />
                                        <Route path="/payments" element={<PaymentManagement />} />
                                        <Route path="/leads" element={<LeadManagement />} />
                                        <Route path="/accounting" element={<AccountingLedger />} />
                                        <Route path="*" element={<Navigate to="/command" replace />} />
                                    </Routes>
                                </ErrorBoundary>
                            </Suspense>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Session Timeout Warning Modal */}
            {showTimeoutWarning && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gradient-to-br from-orange-900/90 to-red-900/90 border border-orange-500/30 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <Clock className="w-8 h-8 text-orange-400 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Session Timeout Warning</h2>
                        <p className="text-gray-300 mb-6">
                            Your session will expire in <span className="text-orange-400 font-bold">{timeoutSeconds} seconds</span> due to inactivity.
                        </p>
                        <p className="text-sm text-gray-400 mb-6">
                            Move your mouse or press any key to stay logged in.
                        </p>
                        <button
                            onClick={() => setShowTimeoutWarning(false)}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all"
                        >
                            Stay Logged In
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default IntegratedApp;
