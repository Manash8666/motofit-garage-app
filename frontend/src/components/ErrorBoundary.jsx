import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Tactical System Error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[500px] w-full flex items-center justify-center p-6 bg-slate-900/50 rounded-3xl border border-red-500/20 backdrop-blur-xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md text-center"
                    >
                        <div className="mb-6 inline-flex p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                            <AlertTriangle className="w-12 h-12 text-red-500" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">Tactical System Failure</h2>
                        <p className="text-slate-400 mb-8 font-mono text-sm uppercase tracking-wider">
                            Critical error detected in mission module
                        </p>

                        <div className="bg-black/40 rounded-xl p-4 mb-8 border border-white/5 text-left">
                            <p className="text-xs font-mono text-red-400 break-all">
                                {this.state.error?.toString() || 'Unknown Runtime Error'}
                            </p>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-white/10"
                            >
                                <RefreshCw className="w-4 h-4" />
                                REBOOT MODULE
                            </button>

                            <button
                                onClick={this.handleReset}
                                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20"
                            >
                                <Home className="w-4 h-4" />
                                COMMAND CENTER
                            </button>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
