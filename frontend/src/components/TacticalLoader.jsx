import React from 'react';
import { motion } from 'framer-motion';

const TacticalLoader = () => {
    return (
        <div className="flex items-center justify-center h-full w-full min-h-[500px]">
            <div className="relative">
                {/* Rotating Rings */}
                <motion.div
                    className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute inset-0 w-16 h-16 border-4 border-cyan-500/30 border-b-cyan-500 rounded-full scale-75"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                {/* Pulsing Core */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
            </div>
            <span className="ml-4 font-mono text-sm text-gray-400 animate-pulse">
                INITIALIZING SYSTEM...
            </span>
        </div>
    );
};

export default TacticalLoader;
