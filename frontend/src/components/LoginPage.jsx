import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogIn,
    Lock,
    User,
    Eye,
    EyeOff,
    AlertCircle,
    Loader,
    Mail,
    ArrowLeft,
    CheckCircle,
} from 'lucide-react';

// Login Form Component
const LoginForm = ({ onLogin, onForgotPassword, loading, error }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(username, password, rememberMe);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white
                     placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        required
                    />
                </div>
            </div>

            {/* Password Field */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white
                     placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-white/5 text-orange-500 focus:ring-orange-500/20"
                    />
                    <span className="text-sm text-gray-400">Remember me</span>
                </label>
                <button
                    type="button"
                    className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                    onClick={onForgotPassword}
                >
                    Forgot password?
                </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white
                 font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 
                 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
            >
                {loading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <LogIn className="w-5 h-5" />
                        Sign In
                    </>
                )}
            </motion.button>

            {/* Demo Credentials */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs text-gray-500 mb-2">Demo Credentials:</p>
                <div className="space-y-1 text-xs font-mono text-gray-400">
                    <p>Commander: <span className="text-orange-400">commander / admin123</span></p>
                    <p>Manager: <span className="text-orange-400">manager / manager123</span></p>
                    <p>Mechanic: <span className="text-orange-400">mechanic / mech123</span></p>
                </div>
            </div>
        </form>
    );
};

// Forgot Password Form
const ForgotPasswordForm = ({ onSubmit, onBack, loading, success }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(email);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <button
                type="button"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                onClick={onBack}
            >
                <ArrowLeft className="w-4 h-4" />
                Back to login
            </button>

            <div>
                <h3 className="text-xl font-semibold text-white mb-2">Reset Password</h3>
                <p className="text-sm text-gray-400">Enter your email to receive a password reset link.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white
                     placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all"
                        required
                    />
                </div>
            </div>

            {success ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400"
                >
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">Reset link sent! Check your email.</span>
                </motion.div>
            ) : (
                <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white
                   font-semibold rounded-xl shadow-lg shadow-orange-500/25"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                </motion.button>
            )}
        </form>
    );
};

// Main Login Page Component
const LoginPage = ({ onLoginSuccess }) => {
    const [view, setView] = useState('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);

    // Using a simple login handler since we're not wrapping with AuthProvider here
    const handleLogin = async (username, password) => {
        setLoading(true);
        setError('');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const users = {
                commander: { password: 'admin123', name: 'Commander Singh', role: 'commander' },
                manager: { password: 'manager123', name: 'Priya Sharma', role: 'manager' },
                mechanic: { password: 'mech123', name: 'Vikram Singh', role: 'mechanic' },
            };

            if (!users[username] || users[username].password !== password) {
                throw new Error('Invalid username or password');
            }

            const user = { username, ...users[username] };
            localStorage.setItem('motofit_user', JSON.stringify(user));

            if (onLoginSuccess) {
                onLoginSuccess(user);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (email) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            setResetSuccess(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050A15] flex items-center justify-center p-6">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Login Card */}
            <motion.div
                className="relative w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl 
                      border border-white/[0.1] rounded-3xl p-8 shadow-2xl">
                    {/* Logo Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex p-1 rounded-2xl bg-white/5 border border-white/10 mb-4 overflow-hidden">
                            <img
                                src="/motofit-logo.png"
                                alt="MotoFit 2"
                                className="w-20 h-20 object-contain"
                            />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tighter">MOTOFIT 2</h1>
                        <p className="text-orange-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Command Center Access</p>
                    </div>

                    {/* Forms */}
                    <AnimatePresence mode="wait">
                        {view === 'login' ? (
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <LoginForm
                                    onLogin={handleLogin}
                                    onForgotPassword={() => setView('forgot')}
                                    loading={loading}
                                    error={error}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="forgot"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <ForgotPasswordForm
                                    onSubmit={handleForgotPassword}
                                    onBack={() => { setView('login'); setResetSuccess(false); }}
                                    loading={loading}
                                    success={resetSuccess}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-600 mt-6">
                    © 2026 MotoFit Tactical · Premium Edition
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
