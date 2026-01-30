import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, LogIn, LogOut, Coffee, Play, Pause } from 'lucide-react';
import { GlassCard } from './IntegratedApp';

const TimeClock = () => {
    const [time, setTime] = useState(new Date());
    const [status, setStatus] = useState('clocked-out'); // clocked-in, clocked-out, break
    const [shiftStart, setShiftStart] = useState(null);
    const [duration, setDuration] = useState(0);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
            if (status === 'clocked-in' && shiftStart) {
                setDuration(Math.floor((new Date() - shiftStart) / 1000));
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [status, shiftStart]);

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

    const handleClockIn = () => {
        setStatus('clocked-in');
        setShiftStart(new Date());
    };

    const handleClockOut = () => {
        setStatus('clocked-out');
        setShiftStart(null);
        setDuration(0);
    };

    const handleBreak = () => {
        setStatus(status === 'break' ? 'clocked-in' : 'break');
    };

    return (
        <GlassCard className="p-6 relative overflow-hidden">
            {/* Background Pulse */}
            <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[50px] transition-all duration-1000 ${status === 'clocked-in' ? 'bg-emerald-500/20' :
                    status === 'break' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                }`} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-cyan-400" />
                            Digital Time Clock
                        </h3>
                        <p className="text-slate-400 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status === 'clocked-in' ? 'bg-emerald-500/20 text-emerald-400' :
                            status === 'break' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                        }`}>
                        {status.replace('-', ' ')}
                    </div>
                </div>

                {/* Digital Display */}
                <div className="flex flex-col items-center justify-center py-6">
                    <div className="text-5xl md:text-6xl font-mono font-bold text-white tracking-wider tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        {formatTime(time)}
                    </div>
                    {status !== 'clocked-out' && (
                        <div className="mt-2 font-mono text-cyan-400">
                            Shift Duration: {formatDuration(duration)}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    {status === 'clocked-out' ? (
                        <button
                            onClick={handleClockIn}
                            className="col-span-2 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 group"
                        >
                            <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Clock In
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleBreak}
                                className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${status === 'break'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20'
                                    }`}
                            >
                                {status === 'break' ? <Play className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
                                {status === 'break' ? 'Resume' : 'Break'}
                            </button>
                            <button
                                onClick={handleClockOut}
                                className="py-3 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                Clock Out
                            </button>
                        </>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};

export default TimeClock;
