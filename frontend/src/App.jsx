import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Target, HardHat, Wrench, Truck, Shield, Clock, User, Zap, Database,
  ChevronDown, ChevronUp, Search, Bell, Settings, Menu, X, BarChart2, TrendingUp,
  CheckCircle, Compass, MessageSquare, DollarSign, MapPin, Battery, Wifi,
  Activity, Thermometer, Sun, Moon, Video, Camera, Package, ArrowRight, Plus,
  Edit2, Trash2, Save, Download, Upload, Filter, ChevronLeft, ChevronRight, Printer,
  Calendar, AlertTriangle, FileText, Bike, Star, TrendingDown, BarChart3,
  LayoutGrid, SquareTerminal, Network, Radar, History, Users, Layers
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  saveToStorage,
  loadFromStorage,
  STORAGE_KEYS,
  exportData,
  importData,
  downloadBackup,
  clearAllStorage,
  getStorageStats
} from './utils/storage';

const DEFAULT_JOBS = [
  { id: 1, no: 'JC-001', date: '2026-01-15', customer: 'Raj Patel', bike: 'Hero Splendor+', status: 'Pending', estimatedCost: 3200, priority: 'yellow', bay: 1 },
  { id: 2, no: 'JC-002', date: '2026-01-15', customer: 'Priya Sharma', bike: 'Honda Activa', status: 'Repairing', estimatedCost: 4500, priority: 'orange', bay: 2 },
  { id: 3, no: 'JC-003', date: '2026-01-14', customer: 'Amit Singh', bike: 'Bajaj Pulsar', status: 'Completed', estimatedCost: 8750, priority: 'green', bay: 3 },
  { id: 4, no: 'JC-004', date: '2026-01-14', customer: 'Suresh Kumar', bike: 'TVS Apache', status: 'Repairing', estimatedCost: 6200, priority: 'red', bay: 4 },
  { id: 5, no: 'JC-005', date: '2026-01-13', customer: 'Deepak Verma', bike: 'Yamaha R15', status: 'Completed', estimatedCost: 12500, priority: 'green', bay: null }
];

const DEFAULT_INVOICES = [
  { id: 1, no: 'INV-2026-001', date: '2026-01-15', customer: 'Raj Patel', amount: 3450, status: 'Paid', bike: 'Hero Splendor+' },
  { id: 2, no: 'INV-2026-002', date: '2026-01-15', customer: 'Amit Singh', amount: 8900, status: 'Paid', bike: 'Bajaj Pulsar' },
  { id: 3, no: 'INV-2026-003', date: '2026-01-14', customer: 'Suresh Kumar', amount: 6350, status: 'Pending', bike: 'TVS Apache' },
  { id: 4, no: 'INV-2026-004', date: '2026-01-13', customer: 'Deepak Verma', amount: 12800, status: 'Paid', bike: 'Yamaha R15' }
];

const DEFAULT_CUSTOMERS = [
  { id: 1, name: 'Raj Patel', phone: '9876543210', email: 'raj.patel@example.com', visits: 5, lastVisit: '2026-01-15', VIP: true, value: 25000 },
  { id: 2, name: 'Priya Sharma', phone: '9876543211', email: 'priya.sharma@example.com', visits: 3, lastVisit: '2026-01-15', VIP: false, value: 12000 },
  { id: 3, name: 'Amit Singh', phone: '9876543212', email: 'amit.singh@example.com', visits: 8, lastVisit: '2026-01-14', VIP: true, value: 67000 },
  { id: 4, name: 'Suresh Kumar', phone: '9876543213', email: 'suresh.kumar@example.com', visits: 2, lastVisit: '2026-01-14', VIP: false, value: 18000 },
  { id: 5, name: 'Deepak Verma', phone: '9876543214', email: 'deepak.verma@example.com', visits: 12, lastVisit: '2026-01-13', VIP: true, value: 95000 }
];

const DEFAULT_INVENTORY = [
  { id: 1, name: 'Engine Oil 10W30', category: 'Fluids', stock: 15, price: 350, minStock: 5, status: 'healthy' },
  { id: 2, name: 'Air Filter', category: 'Filters', stock: 8, price: 220, minStock: 3, status: 'healthy' },
  { id: 3, name: 'Brake Pads', category: 'Brakes', stock: 12, price: 450, minStock: 4, status: 'healthy' },
  { id: 4, name: 'Spark Plug', category: 'Electrical', stock: 3, price: 120, minStock: 10, status: 'critical' },
  { id: 5, name: 'Chain Set', category: 'Drivetrain', stock: 6, price: 850, minStock: 2, status: 'warning' }
];

const DEFAULT_MECHANICS = [
  { id: 1, name: 'Vikram Singh', avatar: 'https://placehold.co/60x60/1a2b4a/ffffff?text=VS', specialty: 'Engine', status: 'active', efficiency: 95 },
  { id: 2, name: 'Rahul Mehta', avatar: 'https://placehold.co/60x60/ff6b35/ffffff?text=RM', specialty: 'Electrical', status: 'busy', efficiency: 88 },
  { id: 3, name: 'Sanjay Patel', avatar: 'https://placehold.co/60x60/e63946/ffffff?text=SP', specialty: 'Suspension', status: 'available', efficiency: 92 },
  { id: 4, name: 'Anil Kumar', avatar: 'https://placehold.co/60x60/2a9d8f/ffffff?text=AK', specialty: 'Transmission', status: 'away', efficiency: 85 }
];

const DEFAULT_BAY_STATUS = [
  { id: 1, status: 'red', vehicle: 'Harley Davidson', mechanic: 'Vikram Singh', eta: '15 min', progress: 75, type: 'motorcycle' },
  { id: 2, status: 'orange', vehicle: 'Yamaha R6', mechanic: 'Rahul Mehta', eta: '45 min', progress: 45, type: 'motorcycle' },
  { id: 3, status: 'yellow', vehicle: 'Ducati Panigale', mechanic: 'Sanjay Patel', eta: '2 hrs', progress: 25, type: 'motorcycle' },
  { id: 4, status: 'green', vehicle: 'BMW S1000RR', mechanic: 'Anil Kumar', eta: 'Completed', progress: 100, type: 'motorcycle' },
];

const DEFAULT_SERVICES = [
  { id: 1, name: 'Basic Service', category: 'Maintenance', price: 800, duration: 60, description: 'Oil change, filter check, basic inspection' },
  { id: 2, name: 'Full Service', category: 'Maintenance', price: 1500, duration: 120, description: 'Complete maintenance package with all fluids' },
  { id: 3, name: 'Brake Service', category: 'Safety', price: 1200, duration: 90, description: 'Brake pads replacement, inspection, adjustment' },
  { id: 4, name: 'Engine Tune-up', category: 'Repair', price: 2500, duration: 180, description: 'Engine diagnostics, tuning, performance check' },
  { id: 5, name: 'Electrical Diagnostics', category: 'Repair', price: 1800, duration: 120, description: 'Wiring inspection, battery check, electronics' },
  { id: 6, name: 'Chain Lubrication', category: 'Maintenance', price: 300, duration: 30, description: 'Chain cleaning and lubrication service' },
  { id: 7, name: 'Tire Replacement', category: 'Safety', price: 2200, duration: 60, description: 'Front or rear tire replacement with balancing' },
  { id: 8, name: 'Suspension Service', category: 'Repair', price: 3500, duration: 240, description: 'Shock absorber work, fork service, alignment' }
];


export default function App() {
  // ===== STATE MANAGEMENT =====
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('command-center');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [alertLevel, setAlertLevel] = useState('operational');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentUserRole, setCurrentUserRole] = useState('commander');

  // Modal states
  const [currentJob, setCurrentJob] = useState(null);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [currentMechanic, setCurrentMechanic] = useState(null);
  const [currentInventory, setCurrentInventory] = useState(null);
  const [currentBike, setCurrentBike] = useState(null);
  const [currentService, setCurrentService] = useState(null);

  // Data states - Load from localStorage or use defaults
  const [jobs, setJobs] = useState(() => loadFromStorage(STORAGE_KEYS.JOBS, DEFAULT_JOBS));

  const [invoices, setInvoices] = useState(() => loadFromStorage(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES));

  const [customers, setCustomers] = useState(() => loadFromStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS));

  const [inventory, setInventory] = useState(() => loadFromStorage(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY));

  const [mechanics, setMechanics] = useState(() => loadFromStorage(STORAGE_KEYS.MECHANICS, DEFAULT_MECHANICS));

  const [bayStatus, setBayStatus] = useState(() => loadFromStorage(STORAGE_KEYS.BAY_STATUS, DEFAULT_BAY_STATUS));

  const [services, setServices] = useState(() => loadFromStorage(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES));

  const controls = useAnimation();

  // ===== EFFECTS =====
  useEffect(() => {
    const lowStockItems = inventory.filter(item => item.stock <= item.minStock).length;
    const criticalJobs = jobs.filter(job => job.priority === 'red').length;

    if (lowStockItems > 2 || criticalJobs > 0) {
      setAlertLevel('critical');
    } else if (lowStockItems > 0) {
      setAlertLevel('caution');
    } else {
      setAlertLevel('operational');
    }

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [inventory, jobs, isDarkMode]);

  // ===== AUTO-SAVE TO LOCALSTORAGE =====
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.JOBS, jobs);
  }, [jobs]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.INVOICES, invoices);
  }, [invoices]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
  }, [customers]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.INVENTORY, inventory);
  }, [inventory]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MECHANICS, mechanics);
  }, [mechanics]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.BAY_STATUS, bayStatus);
  }, [bayStatus]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SERVICES, services);
  }, [services]);

  // ===== UTILITY FUNCTIONS =====
  const getAlertColor = () => {
    switch (alertLevel) {
      case 'critical': return 'bg-red-900/80 border-red-600 text-red-300';
      case 'caution': return 'bg-amber-900/80 border-amber-600 text-amber-300';
      case 'operational': return 'bg-emerald-900/80 border-emerald-600 text-emerald-300';
      default: return 'bg-slate-800 border-slate-600 text-slate-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'black': return 'border-l-4 border-gray-800 bg-gray-900/70';
      case 'red': return 'border-l-4 border-red-500 bg-red-900/30';
      case 'orange': return 'border-l-4 border-orange-500 bg-orange-900/30';
      case 'yellow': return 'border-l-4 border-yellow-500 bg-yellow-900/30';
      case 'green': return 'border-l-4 border-emerald-500 bg-emerald-900/30';
      default: return 'border-l-4 border-gray-500 bg-gray-800/50';
    }
  };

  const getBayStatusColor = (status) => {
    switch (status) {
      case 'red': return 'bg-red-500/20 border-red-500';
      case 'orange': return 'bg-orange-500/20 border-orange-500';
      case 'yellow': return 'bg-yellow-500/20 border-yellow-500';
      case 'green': return 'bg-emerald-500/20 border-emerald-500';
      default: return 'bg-gray-700 border-gray-600';
    }
  };

  const getMechanicStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400';
      case 'busy': return 'bg-red-500/20 text-red-400';
      case 'available': return 'bg-cyan-500/20 text-cyan-400';
      case 'away': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-gray-700/50 text-gray-300';
    }
  };

  const hasPermission = (permission) => {
    const permissions = {
      'commander': ['dashboard', 'repair-ops', 'intel', 'logistics', 'personnel', 'services', 'systems', 'reports'],
      'manager': ['dashboard', 'repair-ops', 'intel', 'personnel', 'services'],
      'mechanic': ['repair-ops', 'personnel'],
      'analyst': ['dashboard', 'intel'],
      'logistics': ['logistics', 'inventory'],
    };

    return permissions[currentUserRole]?.includes(permission) || permissions[currentUserRole]?.includes('all');
  };

  // ===== ANIMATION VARIANTS =====
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05 }
    })
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
  };

  const sideBarVariants = {
    open: { x: 0, transition: { type: "tween", duration: 0.3 } },
    closed: { x: "-100%", transition: { type: "tween", duration: 0.3 } }
  };

  // ===== CORE FUNCTIONS =====
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeModal = () => {
    setCurrentJob(null);
    setCurrentInvoice(null);
    setCurrentCustomer(null);
    setCurrentMechanic(null);
    setCurrentInventory(null);
    setCurrentBike(null);
  };

  const openJobModal = (job = null) => {
    setCurrentJob(job || {
      id: jobs.length + 1,
      no: `JC-${String(jobs.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      priority: 'yellow'
    });
  };

  // ===== FILTERED DATA =====
  const filteredJobs = useMemo(() =>
    jobs.filter(job =>
      job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.bike.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.status.toLowerCase().includes(searchTerm.toLowerCase())
    ), [jobs, searchTerm]);

  const filteredMechanics = useMemo(() =>
    mechanics.filter(mechanic =>
      mechanic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mechanic.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    ), [mechanics, searchTerm]);

  const [serviceCategory, setServiceCategory] = useState('all');

  const filteredServices = useMemo(() =>
    services.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = serviceCategory === 'all' || service.category === serviceCategory;
      return matchesSearch && matchesCategory;
    }), [services, searchTerm, serviceCategory]);

  // ===== SERVICE MODAL HANDLERS =====
  const openServiceModal = (service = null) => {
    if (service) {
      setCurrentService({ ...service });
    } else {
      const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
      setCurrentService({
        id: newId,
        name: '',
        category: 'Maintenance',
        price: 0,
        duration: 60,
        description: ''
      });
    }
  };

  const closeServiceModal = () => setCurrentService(null);

  // ===== DATA MANAGEMENT HANDLERS =====
  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `motofit-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('✅ Data exported successfully!');
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (importData(data)) {
            alert('✅ Data imported successfully! Refreshing page...');
            window.location.reload();
          } else {
            alert('❌ Failed to import data. Please check the file format.');
          }
        } catch (error) {
          alert('❌ Invalid JSON file. Please select a valid MotoFit backup.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearAll = () => {
    if (confirm('⚠️ Are you sure you want to clear ALL data? This action cannot be undone!')) {
      if (confirm('🚨 FINAL WARNING: This will delete all jobs, customers, inventory, and settings. Continue?')) {
        if (clearAllStorage()) {
          alert('✅ All data cleared successfully! Refreshing page...');
          window.location.reload();
        } else {
          alert('❌ Failed to clear data. Please check console for errors.');
        }
      }
    }
  };

  const [storageStats, setStorageStats] = useState(null);

  const refreshStorageStats = () => {
    const stats = getStorageStats();
    setStorageStats(stats);
  };

  // ===== RENDER =====
  return (
    <div className={`min-h-screen bg-[#0a1a3a] text-slate-200 ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Status Banner */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-40 border-b ${getAlertColor()} backdrop-blur-sm`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${alertLevel === 'operational' ? 'bg-emerald-500' :
                  alertLevel === 'caution' ? 'bg-amber-500' : 'bg-red-500'
                  }`}></div>
                <span className="font-mono font-bold text-sm">
                  {alertLevel === 'operational' ? 'OPERATIONAL' :
                    alertLevel === 'caution' ? 'CAUTION' : 'CRITICAL'}
                </span>
              </div>
              <div className="hidden sm:flex items-center text-xs">
                <Activity className="w-4 h-4 mr-1" />
                <span>Bay: {Math.round((bayStatus.filter(b => b.status !== 'green').length / bayStatus.length) * 100)}%</span>
              </div>
              <div className="hidden md:flex items-center text-xs">
                <Thermometer className="w-4 h-4 mr-1" />
                <span>22°C</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1 w-32 md:w-48 bg-slate-800/50 border border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-colors"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-300" /> : <Moon className="w-4 h-4 text-cyan-400" />}
              </button>

              <button className="p-1.5 rounded-full hover:bg-slate-800/50 transition-colors relative">
                <Bell className="w-4 h-4 text-slate-300" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 border-2 border-slate-900"></span>
              </button>

              <div className="hidden md:flex items-center space-x-2 cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-xs">
                  {currentUserRole.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium">{currentUserRole}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex pt-12">
        {/* Sidebar */}
        <motion.aside
          variants={sideBarVariants}
          initial="open"
          animate={isSidebarOpen ? "open" : "closed"}
          className="fixed z-40 w-64 bg-slate-900 border-r border-slate-800 h-screen overflow-y-auto"
        >
          <div className="p-5 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur opacity-75"></div>
                <div className="relative w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                MotoFIT 2
              </span>
            </div>
          </div>

          <nav className="p-4">
            <div className="space-y-1">
              {[
                { id: 'command-center', icon: Target, label: 'Command Center', permission: 'dashboard' },
                { id: 'repair-ops', icon: HardHat, label: 'Repair Ops', permission: 'repair-ops' },
                { id: 'intel', icon: Compass, label: 'Intel Hub', permission: 'intel' },
                { id: 'logistics', icon: Truck, label: 'Logistics', permission: 'logistics' },
                { id: 'personnel', icon: User, label: 'Personnel', permission: 'personnel' },
                { id: 'services', icon: Wrench, label: 'Services', permission: 'services' },
                { id: 'systems', icon: Battery, label: 'Systems', permission: 'systems' },
                { id: 'reports', icon: BarChart2, label: 'Reports', permission: 'reports' }
              ].map((item) => (
                hasPermission(item.permission) && (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeTab === item.id
                      ? 'bg-gradient-to-r from-slate-800 to-cyan-900/30 border-l-4 border-cyan-500 text-white'
                      : 'text-slate-300 hover:bg-slate-800/50'
                      }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                )
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="p-3 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700/50">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                    TAC
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-200 text-sm">Tactical Mode</p>
                    <p className="text-xs text-amber-400">AI Enhanced</p>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                {currentUserRole.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm">{currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)}</p>
                <p className="text-xs text-slate-400">MotoFit 2 HQ</p>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 md:ml-64">
          <motion.header
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                  TACTICAL GARAGE COMMAND CENTER
                </h1>
                <p className="text-slate-400 mt-1 text-sm">
                  Real-time operational intelligence for precision vehicle maintenance
                </p>
              </div>
              {activeTab === 'repair-ops' && (
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openJobModal()}
                  className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium shadow-lg"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  New Mission
                </motion.button>
              )}
            </div>
          </motion.header>



          <main className="p-4 md:p-6 space-y-6">
            {activeTab === 'services' ? (
              /* Services Catalog Tab */
              <div className="space-y-6">
                {/* Services Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-center"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <Wrench className="w-7 h-7 text-cyan-500 mr-3" />
                      Services Catalog
                    </h2>
                    <p className="text-slate-400 mt-1">Manage service pricing and packages</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openServiceModal()}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium shadow-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Service
                  </motion.button>
                </motion.div>

                {/* Category Filter */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <span className="text-slate-400 text-sm">Filter:</span>
                  {['all', 'Maintenance', 'Safety', 'Repair', 'Custom'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setServiceCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${serviceCategory === cat
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </motion.div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/50 transition-all cursor-pointer group"
                      onClick={() => openServiceModal(service)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${service.category === 'Maintenance' ? 'bg-blue-900/50 text-blue-300' :
                          service.category === 'Safety' ? 'bg-amber-900/50 text-amber-300' :
                            service.category === 'Repair' ? 'bg-red-900/50 text-red-300' :
                              'bg-purple-900/50 text-purple-300'
                          }`}>
                          {service.category}
                        </span>
                        <Edit2 className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </div>

                      <h3 className="text-white font-bold text-lg mb-2">{service.name}</h3>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{service.description}</p>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                        <div>
                          <p className="text-2xl font-bold text-cyan-400">₹{service.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Duration</p>
                          <p className="text-sm font-medium text-slate-300">{service.duration} min</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredServices.length === 0 && (
                  <div className="text-center py-12">
                    <Wrench className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">No services found</p>
                    <p className="text-slate-500 text-sm mt-2">Try adjusting your filters or add a new service</p>
                  </div>
                )}
              </div>
            ) : activeTab === 'systems' ? (
              /* Systems/Data Management Tab */
              <div className="space-y-6">
                {/* Data Management Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
                >
                  <div className="flex items-center mb-6">
                    <Database className="w-6 h-6 text-purple-500 mr-3" />
                    <h2 className="text-xl font-bold text-white">Data Management</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Export Data */}
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExportData}
                      className="flex items-center justify-between p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl hover:bg-blue-600/30 transition-colors"
                    >
                      <div className="flex items-center">
                        <Download className="w-5 h-5 text-blue-400 mr-3" />
                        <div className="text-left">
                          <p className="font-medium text-white">Export Data</p>
                          <p className="text-xs text-slate-400">Download JSON backup</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-blue-400" />
                    </motion.button>

                    {/* Import Data */}
                    <motion.label
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-between p-4 bg-emerald-600/20 border border-emerald-500/30 rounded-xl hover:bg-emerald-600/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center">
                        <Upload className="w-5 h-5 text-emerald-400 mr-3" />
                        <div className="text-left">
                          <p className="font-medium text-white">Import Data</p>
                          <p className="text-xs text-slate-400">Restore from backup</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-emerald-400" />
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        className="hidden"
                      />
                    </motion.label>

                    {/* Download Backup */}
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={downloadBackup}
                      className="flex items-center justify-between p-4 bg-cyan-600/20 border border-cyan-500/30 rounded-xl hover:bg-cyan-600/30 transition-colors"
                    >
                      <div className="flex items-center">
                        <Save className="w-5 h-5 text-cyan-400 mr-3" />
                        <div className="text-left">
                          <p className="font-medium text-white">Create Backup</p>
                          <p className="text-xs text-slate-400">Save complete snapshot</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-cyan-400" />
                    </motion.button>

                    {/* Clear All Data */}
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearAll}
                      className="flex items-center justify-between p-4 bg-red-600/20 border border-red-500/30 rounded-xl hover:bg-red-600/30 transition-colors"
                    >
                      <div className="flex items-center">
                        <Trash2 className="w-5 h-5 text-red-400 mr-3" />
                        <div className="text-left">
                          <p className="font-medium text-white">Clear All Data</p>
                          <p className="text-xs text-slate-400">Reset to defaults</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-red-400" />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Storage Statistics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <BarChart3 className="w-6 h-6 text-amber-500 mr-3" />
                      <h2 className="text-xl font-bold text-white">Storage Statistics</h2>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={refreshStorageStats}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                    >
                      Refresh
                    </motion.button>
                  </div>

                  {storageStats ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                          <p className="text-xs text-slate-500 mb-1">Total Used</p>
                          <p className="text-2xl font-bold text-cyan-400">{storageStats.totalKB} KB</p>
                        </div>
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                          <p className="text-xs text-slate-500 mb-1">Available</p>
                          <p className="text-2xl font-bold text-emerald-400">{(storageStats.available || 0).toFixed(0)} KB</p>
                        </div>
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                          <p className="text-xs text-slate-500 mb-1">Usage</p>
                          <p className="text-2xl font-bold text-amber-400">{storageStats.percentUsed}%</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${parseFloat(storageStats.percentUsed) > 80 ? 'bg-red-500' :
                              parseFloat(storageStats.percentUsed) > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            style={{ width: `${Math.min(parseFloat(storageStats.percentUsed), 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {storageStats.individual && (
                        <div className="mt-6 space-y-2">
                          <p className="text-sm font-medium text-slate-400 mb-3">Data Breakdown:</p>
                          {Object.entries(storageStats.individual).map(([key, data]) => (
                            <div key={key} className="flex justify-between items-center p-2 bg-slate-900/30 rounded-lg">
                              <span className="text-sm text-slate-300 capitalize">{key.toLowerCase()}</span>
                              <div className="flex items-center space-x-3">
                                <span className="text-xs text-slate-500">{data.items} items</span>
                                <span className="text-sm font-medium text-cyan-400">{data.sizeKB} KB</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <button
                        onClick={refreshStorageStats}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium shadow-lg"
                      >
                        Load Storage Statistics
                      </button>
                    </div>
                  )}
                </motion.div>

                {/* Info Notice */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-blue-900/20 border border-blue-800 p-4 rounded-xl"
                >
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-400">Data Persistence Active</h3>
                      <p className="text-sm text-slate-300 mt-1">
                        All your data is automatically saved to your browser's localStorage.
                        Export backups regularly to prevent data loss. Data persists across browser sessions.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              /* Default View - Priority Queue and Operators */
              <div className="space-y-6">
                {/* Priority Repair Queue */}
                <motion.div
                  variants={fadeInLeft}
                  initial="hidden"
                  animate="visible"
                  className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                      Priority Repair Queue
                    </h2>
                    <div className="flex space-x-2">
                      <button className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600">
                        <Filter className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openJobModal()}
                        className="p-1.5 rounded-lg bg-amber-600/20 text-amber-400 hover:bg-amber-600/30"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-700 max-h-[600px] overflow-y-auto">
                    {filteredJobs
                      .sort((a, b) => {
                        const priorityOrder = { 'black': 1, 'red': 2, 'orange': 3, 'yellow': 4, 'green': 5 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                      })
                      .map((job, index) => (
                        <motion.div
                          key={job.id}
                          variants={fadeIn}
                          custom={index}
                          initial="hidden"
                          animate="visible"
                          className={`p-4 ${getPriorityColor(job.priority)} hover:bg-opacity-40 transition-all cursor-pointer`}
                          onClick={() => openJobModal(job)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${job.priority === 'black' ? 'bg-gray-800 text-white' :
                                  job.priority === 'red' ? 'bg-red-600 text-white' :
                                    job.priority === 'orange' ? 'bg-orange-600 text-white' :
                                      job.priority === 'yellow' ? 'bg-yellow-600 text-white' :
                                        'bg-emerald-600 text-white'
                                  }`}>
                                  {job.priority.toUpperCase()}
                                </span>
                                <h3 className="font-bold text-white">{job.bike}</h3>
                              </div>
                              <p className="text-slate-300 mt-1 text-sm">Customer: {job.customer}</p>
                              <div className="mt-2 flex items-center space-x-4">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 text-slate-400 mr-1" />
                                  <span className="text-sm text-slate-300">{job.date}</span>
                                </div>
                                <div className="flex items-center">
                                  <Zap className="w-4 h-4 text-slate-400 mr-1" />
                                  <span className="text-sm text-slate-300">Bay {job.bay || 'TBD'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-bold text-cyan-400">₹{job.estimatedCost.toLocaleString('en-IN')}</span>
                              <span className="text-xs text-slate-400 mt-1">{job.status}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>

                {/* Personnel Status */}
                <motion.div
                  variants={fadeInLeft}
                  initial="hidden"
                  animate="visible"
                  className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-700">
                    <h2 className="text-lg font-bold flex items-center">
                      <User className="w-5 h-5 text-blue-400 mr-2" />
                      Precision Operators
                    </h2>
                  </div>

                  <div className="divide-y divide-slate-700">
                    {filteredMechanics.map((mechanic, index) => (
                      <motion.div
                        key={mechanic.id}
                        variants={fadeIn}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        className="p-4 hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="relative">
                            <img
                              src={mechanic.avatar}
                              alt={mechanic.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-slate-900"
                            />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${mechanic.status === 'active' ? 'bg-emerald-500' :
                              mechanic.status === 'busy' ? 'bg-red-500' : 'bg-amber-500'
                              }`}></div>
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium text-white">{mechanic.name}</p>
                                <p className="text-sm text-blue-300">{mechanic.specialty}</p>
                              </div>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getMechanicStatusColor(mechanic.status)}`}>
                                {mechanic.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${mechanic.efficiency > 90 ? 'bg-emerald-500' :
                                  mechanic.efficiency > 80 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${mechanic.efficiency}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{mechanic.efficiency}% Efficiency</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </main>
        </div>
      </div>


      {/* Service Modal */}
      <AnimatePresence>
        {currentService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeServiceModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-600/30 rounded-2xl p-6 max-w-2xl w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Wrench className="w-6 h-6 text-cyan-500 mr-2" />
                  {currentService.name ? 'Edit Service' : 'New Service'}
                </h2>
                <button
                  onClick={closeServiceModal}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Service Name</label>
                  <input
                    type="text"
                    value={currentService.name}
                    onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    placeholder="e.g., Engine Tune-up"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Category</label>
                    <select
                      value={currentService.category}
                      onChange={(e) => setCurrentService({ ...currentService, category: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="Maintenance">Maintenance</option>
                      <option value="Safety">Safety</option>
                      <option value="Repair">Repair</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={currentService.price || ''}
                      onChange={(e) => setCurrentService({ ...currentService, price: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={currentService.duration || ''}
                    onChange={(e) => setCurrentService({ ...currentService, duration: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    placeholder="60"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Description</label>
                  <textarea
                    value={currentService.description}
                    onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white resize-none"
                    rows="3"
                    placeholder="Brief description of the service"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {currentService.name && (
                  <button
                    onClick={() => {
                      setServices(services.filter(s => s.id !== currentService.id));
                      closeServiceModal();
                    }}
                    className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={closeServiceModal}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (services.find(s => s.id === currentService.id)) {
                      setServices(services.map(s => s.id === currentService.id ? currentService : s));
                    } else {
                      setServices([...services, currentService]);
                    }
                    closeServiceModal();
                  }}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                >
                  Save Service
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job Modal */}
      < AnimatePresence >
        {currentJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Mission Details</h2>
                <button onClick={closeModal} className="text-cyan-300 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Mission ID</label>
                    <input
                      type="text"
                      value={currentJob.no}
                      disabled
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={currentJob.date}
                      onChange={(e) => setCurrentJob({ ...currentJob, date: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Customer</label>
                  <input
                    type="text"
                    value={currentJob.customer || ''}
                    onChange={(e) => setCurrentJob({ ...currentJob, customer: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Vehicle</label>
                  <input
                    type="text"
                    value={currentJob.bike || ''}
                    onChange={(e) => setCurrentJob({ ...currentJob, bike: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Priority</label>
                    <select
                      value={currentJob.priority}
                      onChange={(e) => setCurrentJob({ ...currentJob, priority: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                      <option value="orange">Orange</option>
                      <option value="red">Red</option>
                      <option value="black">Black</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Cost (₹)</label>
                    <input
                      type="number"
                      value={currentJob.estimatedCost || 0}
                      onChange={(e) => setCurrentJob({ ...currentJob, estimatedCost: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Service Selection */}
                <div className="pt-2 border-t border-slate-700/50">
                  <label className="block text-sm text-slate-400 mb-2">Services & Packages</label>
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                    {services.map(service => (
                      <button
                        key={service.id}
                        onClick={() => {
                          const isSelected = currentJob.services?.includes(service.id);
                          const newServices = isSelected
                            ? (currentJob.services || []).filter(id => id !== service.id)
                            : [...(currentJob.services || []), service.id];

                          // Auto-calculate cost
                          const newCost = newServices.reduce((total, id) => {
                            const s = services.find(srv => srv.id === id);
                            return total + (s ? s.price : 0);
                          }, 0);

                          setCurrentJob({
                            ...currentJob,
                            services: newServices,
                            estimatedCost: newCost > 0 ? newCost : currentJob.estimatedCost // Only override if services selected
                          });
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${currentJob.services?.includes(service.id)
                            ? 'bg-cyan-900/50 border-cyan-500 text-cyan-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                          }`}
                      >
                        {service.name} (₹{service.price})
                      </button>
                    ))}
                  </div>
                  {(!currentJob.services || currentJob.services.length === 0) && (
                    <p className="text-xs text-slate-500 italic">No services selected. Cost set manually.</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (currentJob.id > jobs.length) {
                      setJobs([...jobs, currentJob]);
                    } else {
                      setJobs(jobs.map(j => j.id === currentJob.id ? currentJob : j));
                    }
                    closeModal();
                  }}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                >
                  Save Mission
                </button>
              </div>
            </motion.div>
          </motion.div>
        )
        }
      </AnimatePresence >
    </div >
  );
}
