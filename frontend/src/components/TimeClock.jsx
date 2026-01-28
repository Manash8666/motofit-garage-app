import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    LogIn,
    LogOut,
    Calendar,
    User,
    ChevronDown,
    Play,
    Pause,
    Coffee,
    Timer,
    CheckCircle,
    XCircle,
    TrendingUp,
    BarChart2,
} from 'lucide-react';

// Sample time entries data
const initialTimeEntries = [
    { id: 1, mechanicId: 1, mechanicName: 'Vikram Singh', date: '2026-01-16', clockIn: '09:00', clockOut: '18:00', breakDuration: 60, status: 'completed' },
    { id: 2, mechanicId: 2, mechanicName: 'Suresh Kumar', date: '2026-01-16', clockIn: '09:30', clockOut: '17:30', breakDuration: 45, status: 'completed' },
    { id: 3, mechanicId: 3, mechanicName: 'Anil Kumar', date: '2026-01-16', clockIn: '10:00', clockOut: null, breakDuration: 30, status: 'working' },
    { id: 4, mechanicId: 4, mechanicName: 'Rajesh Verma', date: '2026-01-16', clockIn: '08:30', clockOut: null, breakDuration: 0, status: 'on-break' },
];

const mechanics = [
    { id: 1, name: 'Vikram Singh', specialty: 'Engine', avatar: 'VS' },
    { id: 2, name: 'Suresh Kumar', specialty: 'Electrical', avatar: 'SK' },
    { id: 3, name: 'Anil Kumar', specialty: 'Brakes', avatar: 'AK' },
    { id: 4, name: 'Rajesh Verma', specialty: 'Suspension', avatar: 'RV' },
];

// Time formatting helpers
const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
};

const calculateWorkHours = (clockIn, clockOut, breakDuration) => {
    if (!clockIn || !clockOut) return 0;
    const [inHr, inMin] = clockIn.split(':').map(Number);
    const [outHr, outMin] = clockOut.split(':').map(Number);
    const totalMinutes = (outHr * 60 + outMin) - (inHr * 60 + inMin) - breakDuration;
    return Math.max(0, totalMinutes);
};

const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

// Status Badge Component
const StatusBadge = ({ status }) => {
    const config = {
        'working': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: Play, label: 'Working' },
        'on-break': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Coffee, label: 'On Break' },
        'completed': { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: CheckCircle, label: 'Completed' },
        'absent': { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle, label: 'Absent' },
    };
    const { bg, text, icon: Icon, label } = config[status] || config.absent;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
};

// Live Clock Component
const LiveClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-4xl font-bold font-mono text-white">
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </div>
    );
};

// Mechanic Time Card
const MechanicTimeCard = ({ mechanic, entry, onClockIn, onClockOut, onStartBreak, onEndBreak }) => {
    const workMinutes = entry ? calculateWorkHours(entry.clockIn, entry.clockOut || getCurrentTime(), entry.breakDuration) : 0;
    const isWorking = entry?.status === 'working';
    const isOnBreak = entry?.status === 'on-break';
    const isClockedIn = entry && !entry.clockOut;

    return (
        <motion.div
            className={`
        bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm
        border rounded-2xl p-5 transition-all
        ${isWorking ? 'border-emerald-500/30' : isOnBreak ? 'border-yellow-500/30' : 'border-white/[0.08]'}
      `}
            whileHover={{ scale: 1.01 }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20 flex items-center justify-center">
                        <span className="font-bold text-orange-400">{mechanic.avatar}</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">{mechanic.name}</h3>
                        <p className="text-sm text-gray-400">{mechanic.specialty} Specialist</p>
                    </div>
                </div>
                {entry && <StatusBadge status={entry.status} />}
            </div>

            {entry && (
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 rounded-xl bg-white/[0.03]">
                    <div>
                        <div className="text-xs text-gray-500">Clock In</div>
                        <div className="text-lg font-medium text-emerald-400">{entry.clockIn}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">Clock Out</div>
                        <div className="text-lg font-medium text-red-400">{entry.clockOut || '--:--'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">Break</div>
                        <div className="text-lg font-medium text-yellow-400">{entry.breakDuration}m</div>
                    </div>
                </div>
            )}

            {isClockedIn && (
                <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/20">
                    <div className="text-xs text-gray-400 mb-1">Work Duration</div>
                    <div className="text-2xl font-bold text-orange-400">{formatTime(workMinutes)}</div>
                </div>
            )}

            <div className="flex gap-2">
                {!isClockedIn ? (
                    <motion.button
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                     bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium
                     shadow-lg shadow-emerald-500/25"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onClockIn(mechanic.id)}
                    >
                        <LogIn className="w-4 h-4" />
                        Clock In
                    </motion.button>
                ) : (
                    <>
                        {isOnBreak ? (
                            <motion.button
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                         bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onEndBreak(entry.id)}
                            >
                                <Play className="w-4 h-4" />
                                End Break
                            </motion.button>
                        ) : (
                            <motion.button
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                         bg-white/5 border border-yellow-500/30 text-yellow-400"
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onStartBreak(entry.id)}
                            >
                                <Coffee className="w-4 h-4" />
                                Break
                            </motion.button>
                        )}
                        <motion.button
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                       bg-gradient-to-r from-red-500 to-red-600 text-white font-medium
                       shadow-lg shadow-red-500/25"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onClockOut(entry.id)}
                        >
                            <LogOut className="w-4 h-4" />
                            Clock Out
                        </motion.button>
                    </>
                )}
            </div>
        </motion.div>
    );
};

const TimeClock = () => {
    const [timeEntries, setTimeEntries] = useState(initialTimeEntries);
    const [selectedDate, setSelectedDate] = useState('2026-01-16');
    const [view, setView] = useState('cards'); // 'cards' or 'table'

    // Get today's entries
    const todayEntries = useMemo(() =>
        timeEntries.filter(e => e.date === selectedDate),
        [timeEntries, selectedDate]);

    const getEntryForMechanic = (mechanicId) =>
        todayEntries.find(e => e.mechanicId === mechanicId);

    // Actions
    const handleClockIn = (mechanicId) => {
        const mechanic = mechanics.find(m => m.id === mechanicId);
        const newEntry = {
            id: Date.now(),
            mechanicId,
            mechanicName: mechanic.name,
            date: selectedDate,
            clockIn: getCurrentTime(),
            clockOut: null,
            breakDuration: 0,
            status: 'working',
        };
        setTimeEntries([...timeEntries, newEntry]);
    };

    const handleClockOut = (entryId) => {
        setTimeEntries(timeEntries.map(e =>
            e.id === entryId
                ? { ...e, clockOut: getCurrentTime(), status: 'completed' }
                : e
        ));
    };

    const handleStartBreak = (entryId) => {
        setTimeEntries(timeEntries.map(e =>
            e.id === entryId
                ? { ...e, status: 'on-break', breakStart: Date.now() }
                : e
        ));
    };

    const handleEndBreak = (entryId) => {
        setTimeEntries(timeEntries.map(e => {
            if (e.id === entryId) {
                const breakMinutes = Math.round((Date.now() - (e.breakStart || Date.now())) / 60000);
                return { ...e, status: 'working', breakDuration: e.breakDuration + breakMinutes };
            }
            return e;
        }));
    };

    // Stats
    const stats = useMemo(() => {
        const working = todayEntries.filter(e => e.status === 'working').length;
        const onBreak = todayEntries.filter(e => e.status === 'on-break').length;
        const completed = todayEntries.filter(e => e.status === 'completed').length;
        const totalHours = todayEntries.reduce((sum, e) => {
            return sum + calculateWorkHours(e.clockIn, e.clockOut || getCurrentTime(), e.breakDuration);
        }, 0);
        return { working, onBreak, completed, totalHours };
    }, [todayEntries]);

    return (
        <div className="p-6">
            {/* Header */}
            <motion.div
                className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20">
                            <Clock className="w-6 h-6 text-orange-400" />
                        </div>
                        Time Clock System
                    </h1>
                    <p className="text-gray-400">Track mechanic attendance and work hours</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Live Clock Display */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08]">
                        <LiveClock />
                        <div className="text-xs text-gray-500 text-center mt-1">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <motion.div
                    className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3">
                        <Play className="w-8 h-8 text-emerald-400" />
                        <div>
                            <div className="text-3xl font-bold text-emerald-400">{stats.working}</div>
                            <div className="text-sm text-gray-400">Working</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-3">
                        <Coffee className="w-8 h-8 text-yellow-400" />
                        <div>
                            <div className="text-3xl font-bold text-yellow-400">{stats.onBreak}</div>
                            <div className="text-sm text-gray-400">On Break</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-blue-400" />
                        <div>
                            <div className="text-3xl font-bold text-blue-400">{stats.completed}</div>
                            <div className="text-sm text-gray-400">Completed</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-2xl p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-3">
                        <Timer className="w-8 h-8 text-orange-400" />
                        <div>
                            <div className="text-3xl font-bold text-orange-400">{formatTime(stats.totalHours)}</div>
                            <div className="text-sm text-gray-400">Total Hours</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Mechanic Cards */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Mechanic Attendance</h2>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white
                   focus:outline-none focus:border-orange-500/50"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mechanics.map((mechanic) => (
                    <MechanicTimeCard
                        key={mechanic.id}
                        mechanic={mechanic}
                        entry={getEntryForMechanic(mechanic.id)}
                        onClockIn={handleClockIn}
                        onClockOut={handleClockOut}
                        onStartBreak={handleStartBreak}
                        onEndBreak={handleEndBreak}
                    />
                ))}
            </div>

            {/* Time Entries Table */}
            <motion.div
                className="mt-8 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm 
                   border border-white/[0.08] rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h3 className="text-lg font-semibold text-white mb-4">Time Log History</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-white/10">
                                <th className="pb-3 text-sm font-medium text-gray-400">Mechanic</th>
                                <th className="pb-3 text-sm font-medium text-gray-400">Date</th>
                                <th className="pb-3 text-sm font-medium text-gray-400">Clock In</th>
                                <th className="pb-3 text-sm font-medium text-gray-400">Clock Out</th>
                                <th className="pb-3 text-sm font-medium text-gray-400">Break</th>
                                <th className="pb-3 text-sm font-medium text-gray-400">Work Hours</th>
                                <th className="pb-3 text-sm font-medium text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timeEntries.map((entry) => (
                                <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 text-white font-medium">{entry.mechanicName}</td>
                                    <td className="py-4 text-gray-400">{entry.date}</td>
                                    <td className="py-4 text-emerald-400">{entry.clockIn}</td>
                                    <td className="py-4 text-red-400">{entry.clockOut || '--:--'}</td>
                                    <td className="py-4 text-yellow-400">{entry.breakDuration}m</td>
                                    <td className="py-4 text-orange-400 font-medium">
                                        {formatTime(calculateWorkHours(entry.clockIn, entry.clockOut || getCurrentTime(), entry.breakDuration))}
                                    </td>
                                    <td className="py-4"><StatusBadge status={entry.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default TimeClock;
