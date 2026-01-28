import React, { createContext, useContext, useState, useEffect } from 'react';

// User roles and permissions
export const ROLES = {
    COMMANDER: 'commander',
    MANAGER: 'manager',
    MECHANIC: 'mechanic',
    ANALYST: 'analyst',
    LOGISTICS: 'logistics',
};

export const PERMISSIONS = {
    VIEW_DASHBOARD: 'view_dashboard',
    MANAGE_JOBS: 'manage_jobs',
    MANAGE_INVOICES: 'manage_invoices',
    MANAGE_INVENTORY: 'manage_inventory',
    MANAGE_CUSTOMERS: 'manage_customers',
    MANAGE_USERS: 'manage_users',
    MANAGE_SETTINGS: 'manage_settings',
    VIEW_REPORTS: 'view_reports',
    MANAGE_BIKES: 'manage_bikes',
};

// Role-based permissions mapping
const ROLE_PERMISSIONS = {
    [ROLES.COMMANDER]: Object.values(PERMISSIONS), // All permissions
    [ROLES.MANAGER]: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.MANAGE_JOBS,
        PERMISSIONS.MANAGE_INVOICES,
        PERMISSIONS.MANAGE_CUSTOMERS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.MANAGE_BIKES,
    ],
    [ROLES.MECHANIC]: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.MANAGE_JOBS,
        PERMISSIONS.MANAGE_BIKES,
    ],
    [ROLES.ANALYST]: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.MANAGE_BIKES,
    ],
    [ROLES.LOGISTICS]: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.MANAGE_INVENTORY,
        PERMISSIONS.MANAGE_BIKES,
    ],
};

// Sample users database
const USERS_DB = [
    {
        id: 1,
        username: 'commander',
        password: 'admin123', // In production, would be hashed
        name: 'Commander Singh',
        email: 'commander@motofit.in',
        role: ROLES.COMMANDER,
        avatar: 'CS',
        phone: '9876543210',
        lastLogin: '2026-01-16T09:00:00',
    },
    {
        id: 2,
        username: 'manager',
        password: 'manager123',
        name: 'Priya Sharma',
        email: 'priya@motofit.in',
        role: ROLES.MANAGER,
        avatar: 'PS',
        phone: '9876543211',
        lastLogin: '2026-01-15T18:30:00',
    },
    {
        id: 3,
        username: 'mechanic',
        password: 'mech123',
        name: 'Vikram Singh',
        email: 'vikram@motofit.in',
        role: ROLES.MECHANIC,
        avatar: 'VS',
        phone: '9876543212',
        lastLogin: '2026-01-16T08:00:00',
    },
];

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Generate mock JWT token
const generateToken = (user) => {
    const payload = {
        userId: user.id,
        username: user.username,
        role: user.role,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    // In production, would use actual JWT library
    return btoa(JSON.stringify(payload));
};

// Decode mock JWT token
const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token));
    } catch {
        return null;
    }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState([]);

    // Initialize from localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem('motofit_token');
        const savedUser = localStorage.getItem('motofit_user');

        if (savedToken && savedUser) {
            const decoded = decodeToken(savedToken);
            if (decoded && decoded.exp > Date.now()) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } else {
                // Token expired
                localStorage.removeItem('motofit_token');
                localStorage.removeItem('motofit_user');
            }
        }
        setLoading(false);
    }, []);

    // Login function
    const login = async (username, password) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const foundUser = USERS_DB.find(
            u => u.username === username && u.password === password
        );

        if (!foundUser) {
            throw new Error('Invalid username or password');
        }

        const newToken = generateToken(foundUser);
        const userWithoutPassword = { ...foundUser, password: undefined };

        setToken(newToken);
        setUser(userWithoutPassword);

        localStorage.setItem('motofit_token', newToken);
        localStorage.setItem('motofit_user', JSON.stringify(userWithoutPassword));

        // Track session
        const newSession = {
            id: Date.now(),
            userId: foundUser.id,
            device: navigator.userAgent.slice(0, 50),
            loginTime: new Date().toISOString(),
            ip: '192.168.1.100', // Would be from server
        };
        setSessions(prev => [...prev, newSession]);

        return userWithoutPassword;
    };

    // Logout function
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('motofit_token');
        localStorage.removeItem('motofit_user');
    };

    // Update profile
    const updateProfile = async (updates) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('motofit_user', JSON.stringify(updatedUser));
        return updatedUser;
    };

    // Change password
    const changePassword = async (currentPassword, newPassword) => {
        await new Promise(resolve => setTimeout(resolve, 300));

        const foundUser = USERS_DB.find(u => u.id === user.id);
        if (foundUser.password !== currentPassword) {
            throw new Error('Current password is incorrect');
        }

        // In production, would update the database
        foundUser.password = newPassword;
        return true;
    };

    // Request password reset
    const requestPasswordReset = async (email) => {
        await new Promise(resolve => setTimeout(resolve, 300));

        const foundUser = USERS_DB.find(u => u.email === email);
        if (!foundUser) {
            throw new Error('No account found with this email');
        }

        // In production, would send actual email
        console.log(`Password reset link sent to ${email}`);
        return true;
    };

    // Reset password with token
    const resetPassword = async (resetToken, newPassword) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        // In production, would validate reset token and update password
        return true;
    };

    // Check permission
    const hasPermission = (permission) => {
        if (!user) return false;
        const userPermissions = ROLE_PERMISSIONS[user.role] || [];
        return userPermissions.includes(permission);
    };

    // Check role
    const hasRole = (...roles) => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    // Get active sessions
    const getActiveSessions = () => sessions.filter(s => s.userId === user?.id);

    // Terminate session
    const terminateSession = (sessionId) => {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
        changePassword,
        requestPasswordReset,
        resetPassword,
        hasPermission,
        hasRole,
        getActiveSessions,
        terminateSession,
        ROLES,
        PERMISSIONS,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
