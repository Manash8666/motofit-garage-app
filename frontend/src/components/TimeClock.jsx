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
        <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Cinematic Video Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10 backdrop-blur-[2px]" />
                <img
                    src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop"
                    alt="Motorcycle Mechanic Background"
                    className="w-full h-full object-cover opacity-80"
                />
                {/* Note: In a real production app, use a <video> tag here with a source like:
                    <video autoPlay loop muted className="w-full h-full object-cover">
                        <source src="/mechanic-cinematic.mp4" type="video/mp4" />
                    </video>
                    Using a high-quality Unsplash image as a reliable fallback/placeholder for now.
                */}
            </div>

            <GlassCard className="p-12 relative z-20 max-w-2xl w-full mx-4 border-white/20 shadow-2xl backdrop-blur-md bg-black/40">
                {/* Background Pulse */}
                <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[100px] transition-all duration-1000 ${status === 'clocked-in' ? 'bg-emerald-500/30' :
                        status === 'break' ? 'bg-yellow-500/30' : 'bg-red-500/30'
                    }`} />

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <h1 className="text-5xl font-black text-white tracking-tight mb-2 uppercase drop-shadow-lg">
                            MOTO<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">FIT</span> TIME CLOCK
                        </h1>
                        <p className="text-slate-300 text-lg uppercase tracking-widest font-medium">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>

                    <div className="flex justify-center mb-8">
                        <div className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider border transition-all duration-500 ${status === 'clocked-in' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
                                status === 'break' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.3)]' :
                                    'bg-red-500/20 text-red-300 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                            }`}>
                            Current Status: {status.replace('-', ' ')}
                        </div>
                    </div>

                    {/* Digital Display */}
                    <div className="flex flex-col items-center justify-center py-10 bg-black/40 rounded-3xl border border-white/10 backdrop-blur-sm mb-10 shadow-inner">
                        <div className="text-7xl md:text-8xl font-mono font-bold text-white tracking-wider tabular-nums drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]">
                            {formatTime(time)}
                        </div>
                        {status !== 'clocked-out' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 font-mono text-cyan-400 text-xl font-bold"
                            >
                                Shift Duration: {formatDuration(duration)}
                            </motion.div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-2 gap-6">
                        {status === 'clocked-out' ? (
                            <button
                                onClick={handleClockIn}
                                className="col-span-2 py-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl font-black text-xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_10px_40px_rgba(16,185,129,0.4)] group border border-emerald-400/20"
                            >
                                <LogIn className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                Start Shift
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleBreak}
                                    className={`py-6 rounded-2xl font-bold text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${status === 'break'
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30'
                                        }`}
                                >
                                    {status === 'break' ? <Play className="w-6 h-6" /> : <Coffee className="w-6 h-6" />}
                                    {status === 'break' ? 'Resume' : 'Take Break'}
                                </button>
                                <button
                                    onClick={handleClockOut}
                                    className="py-6 bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 rounded-2xl font-bold text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-red-500/20"
                                >
                                    <LogOut className="w-6 h-6" />
                                    End Shift
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default TimeClock;
