import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, LogIn, LogOut, Coffee, Play, Pause } from 'lucide-react';
import { GlassCard } from './IntegratedApp';

const TEAM_MEMBERS = [
    { id: 1, name: 'Akshat', role: 'Owner', avatar: 'A', pin: '1234' },
    { id: 2, name: 'Munna', role: 'Sr. Head Mechanic', avatar: 'M', pin: '1234' },
    { id: 3, name: 'Goarav', role: 'Mechanic', avatar: 'G', pin: '1234' },
    { id: 4, name: 'Kunal', role: 'Jr. Mechanic', avatar: 'K', pin: '1234' },
];

const TimeClock = () => {
    const [time, setTime] = useState(new Date());
    const [step, setStep] = useState('select-user'); // select-user, pin-entry, active
    const [selectedUser, setSelectedUser] = useState(null);
    const [enteredPin, setEnteredPin] = useState('');
    const [error, setError] = useState('');

    // Persist status per user
    const [userStatuses, setUserStatuses] = useState(() => {
        const saved = localStorage.getItem('motofit_timeclock_status');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('motofit_timeclock_status', JSON.stringify(userStatuses));
    }, [userStatuses]);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const currentUserStatus = selectedUser ? (userStatuses[selectedUser.id] || { status: 'clocked-out', duration: 0, shiftStart: null }) : null;

    useEffect(() => {
        let interval;
        if (currentUserStatus && currentUserStatus.status === 'clocked-in' && currentUserStatus.shiftStart) {
            interval = setInterval(() => {
                const start = new Date(currentUserStatus.shiftStart);
                const now = new Date();
                const diff = Math.floor((now - start) / 1000);

                setUserStatuses(prev => ({
                    ...prev,
                    [selectedUser.id]: {
                        ...prev[selectedUser.id],
                        duration: diff
                    }
                }));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [selectedUser, currentUserStatus?.status]);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setStep('pin-entry');
        setEnteredPin('');
        setError('');
    };

    const handlePinSubmit = () => {
        if (enteredPin === selectedUser.pin) {
            setStep('active');
        } else {
            setError('Incorrect PIN');
            setEnteredPin('');
        }
    };

    const updateStatus = (newStatus) => {
        const now = new Date();
        const prevStatus = userStatuses[selectedUser.id] || {};

        setUserStatuses(prev => ({
            ...prev,
            [selectedUser.id]: {
                status: newStatus,
                shiftStart: newStatus === 'clocked-in' ? now.toISOString() : (newStatus === 'clocked-out' ? null : prevStatus.shiftStart),
                duration: newStatus === 'clocked-out' ? 0 : prevStatus.duration,
                lastAction: now.toISOString()
            }
        }));
    };

    const handleBack = () => {
        setStep('select-user');
        setSelectedUser(null);
        setEnteredPin('');
    };

    return (
        <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
            {/* Cinematic Video Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10 backdrop-blur-[2px]" />
                <img
                    src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop"
                    alt="Motorcycle Mechanic Background"
                    className="w-full h-full object-cover opacity-60"
                />
            </div>

            <GlassCard className="p-8 relative z-20 max-w-4xl w-full mx-4 border-white/20 shadow-2xl backdrop-blur-md bg-black/40 min-h-[600px] flex flex-col items-center justify-center">
                {/* Header */}
                <div className="text-center mb-10 w-full">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 uppercase drop-shadow-lg">
                        MOTO<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">FIT</span> TIME CLOCK
                    </h1>
                    <p className="text-slate-300 text-xl font-mono">
                        {formatTime(time)}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'select-user' && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full"
                        >
                            <h2 className="text-2xl text-white font-bold text-center mb-8">Select Team Member</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {TEAM_MEMBERS.map((user) => (
                                    <motion.button
                                        key={user.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleUserSelect(user)}
                                        className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/50 transition-all group"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg group-hover:shadow-orange-500/30 transition-all">
                                            {user.avatar}
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-white font-bold text-lg">{user.name}</h3>
                                            <p className="text-gray-400 text-sm">{user.role}</p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 'pin-entry' && (
                        <motion.div
                            key="pin"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center max-w-sm w-full"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-2xl font-bold text-white">
                                    {selectedUser.avatar}
                                </div>
                                <div className="text-left">
                                    <h3 className="text-white font-bold text-xl">Welcome, {selectedUser.name}</h3>
                                    <p className="text-gray-400">Enter your PIN</p>
                                </div>
                            </div>

                            <div className="flex gap-4 mb-8 justify-center">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`w-4 h-4 rounded-full border-2 transition-all ${enteredPin.length > i
                                            ? 'bg-orange-500 border-orange-500'
                                            : 'bg-transparent border-white/30'
                                            }`}
                                    />
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-4 w-full mb-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setEnteredPin(prev => prev.length < 4 ? prev + num : prev)}
                                        className="h-16 rounded-xl bg-white/5 border border-white/10 text-white text-2xl font-bold hover:bg-white/10 active:bg-orange-500/20 transition-all"
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button
                                    onClick={handleBack}
                                    className="h-16 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setEnteredPin(prev => prev.length < 4 ? prev + 0 : prev)}
                                    className="h-16 rounded-xl bg-white/5 border border-white/10 text-white text-2xl font-bold hover:bg-white/10 active:bg-orange-500/20 transition-all"
                                >
                                    0
                                </button>
                                <button
                                    onClick={() => setEnteredPin(prev => prev.slice(0, -1))}
                                    className="h-16 rounded-xl bg-white/5 border border-white/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center"
                                >
                                    <LogOut className="w-6 h-6 rotate-180" />
                                </button>
                            </div>

                            <button
                                onClick={handlePinSubmit}
                                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={enteredPin.length !== 4}
                            >
                                Verify PIN
                            </button>

                            {error && <p className="text-red-500 mt-4 font-bold">{error}</p>}
                        </motion.div>
                    )}

                    {step === 'active' && currentUserStatus && (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full flex flex-col items-center"
                        >
                            <button
                                onClick={handleBack}
                                className="absolute top-8 left-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                            >
                                <LogIn className="w-6 h-6 rotate-180" />
                            </button>

                            <div className="mb-10 text-center">
                                <h2 className="text-3xl text-white font-bold mb-2">{selectedUser.name}</h2>
                                <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${currentUserStatus.status === 'clocked-in' ? 'bg-emerald-500/20 text-emerald-400' :
                                    currentUserStatus.status === 'break' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-gray-500/20 text-gray-400'
                                    }`}>
                                    {currentUserStatus.status.replace('-', ' ')}
                                </div>
                            </div>

                            {/* Digital Display */}
                            <div className="flex flex-col items-center justify-center py-10 px-20 bg-black/40 rounded-3xl border border-white/10 backdrop-blur-sm mb-10 shadow-inner">
                                <div className="text-7xl md:text-8xl font-mono font-bold text-white tracking-wider tabular-nums drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]">
                                    {formatTime(time)}
                                </div>
                                {currentUserStatus.status !== 'clocked-out' && (
                                    <div className="mt-4 font-mono text-cyan-400 text-xl font-bold">
                                        Shift Duration: {formatDuration(currentUserStatus.duration)}
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
                                {currentUserStatus.status === 'clocked-out' ? (
                                    <button
                                        onClick={() => updateStatus('clocked-in')}
                                        className="col-span-2 py-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl font-black text-xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_10px_40px_rgba(16,185,129,0.4)] group border border-emerald-400/20"
                                    >
                                        <LogIn className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                        Start Shift
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => updateStatus(currentUserStatus.status === 'break' ? 'clocked-in' : 'break')}
                                            className={`py-6 rounded-2xl font-bold text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${currentUserStatus.status === 'break'
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30'
                                                }`}
                                        >
                                            {currentUserStatus.status === 'break' ? <Play className="w-6 h-6" /> : <Coffee className="w-6 h-6" />}
                                            {currentUserStatus.status === 'break' ? 'Resume' : 'Take Break'}
                                        </button>
                                        <button
                                            onClick={() => updateStatus('clocked-out')}
                                            className="py-6 bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 rounded-2xl font-bold text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-red-500/20"
                                        >
                                            <LogOut className="w-6 h-6" />
                                            End Shift
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </div>
    );
};

export default TimeClock;
