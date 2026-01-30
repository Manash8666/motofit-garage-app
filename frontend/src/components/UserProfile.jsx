import React, { useState, useEffect, useMemo } from 'react';
import useCommandCenterStore from '../stores/commandCenterStore';
import { motion } from 'framer-motion';
import {
    User,
    Settings,
    Shield,
    Key,
    Mail,
    Phone,
    Camera,
    Save,
    LogOut,
    Monitor,
    Clock,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    Trash2,
    Building,
    Users,
    Upload,
    Plus,
    X,
    MoreVertical,
    Check,
    Layout,
    Hammer,
    Database
} from 'lucide-react';

// Get logged-in user from localStorage
const getLoggedInUser = () => {
    try {
        const storedUser = localStorage.getItem('motofit_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            return {
                id: user.id || 1,
                name: user.name || user.username || 'User',
                username: user.username || 'user',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || 'Staff',
                avatar: user.avatar || (user.username ? user.username.substring(0, 2).toUpperCase() : 'U'),
                joinDate: user.joinDate || new Date().toISOString().split('T')[0],
                lastLogin: user.lastLogin || new Date().toISOString(),
            };
        }
    } catch (e) {
        console.error('Error reading user from localStorage:', e);
    }
    // Fallback
    return {
        id: 1,
        name: 'User',
        username: 'user',
        email: '',
        phone: '',
        role: 'Staff',
        avatar: 'U',
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString(),
    };
};

// Team data (starts empty - will be populated from API in future)
const initialTeam = [];

const ROLES = ['admin', 'manager', 'mechanic'];

// Organization default data (to be fetched from API in future)
const defaultOrg = {
    name: 'MotoFit Garage',
    address: '',
    phone: '',
    gstin: '',
    website: ''
};

// Organization Tab Component
const OrganizationTab = () => {
    const [orgData, setOrgData] = useState(() => {
        const saved = localStorage.getItem('motofit_org_data');
        return saved ? JSON.parse(saved) : defaultOrg;
    });
    const [logo, setLogo] = useState(() => localStorage.getItem('motofit_org_logo'));

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setLogo(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Logo Section */}
                <div className="w-full md:w-1/3">
                    <h3 className="text-lg font-semibold text-white mb-4">Garage Logo</h3>
                    <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-orange-500/50 transition-colors bg-white/5 relative group">
                        {logo ? (
                            <div className="relative w-full aspect-square flex items-center justify-center">
                                <img src={logo} alt="Garage Logo" className="max-w-full max-h-48 object-contain" />
                                <button
                                    onClick={() => setLogo(null)}
                                    className="absolute top-0 right-0 p-2 bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                                    <Upload className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-white font-medium mb-1">Click to upload logo</p>
                                <p className="text-xs text-gray-500">SVG, PNG, JPG (Max 2MB)</p>
                            </>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} accept="image/*" />
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex-1 space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Business Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Garage Name</label>
                            <input
                                type="text"
                                value={orgData.name}
                                onChange={e => setOrgData({ ...orgData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">GSTIN</label>
                            <input
                                type="text"
                                value={orgData.gstin}
                                onChange={e => setOrgData({ ...orgData, gstin: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-400 mb-2">Address</label>
                            <textarea
                                value={orgData.address}
                                onChange={e => setOrgData({ ...orgData, address: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 min-h-[100px]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Phone</label>
                            <input
                                type="text"
                                value={orgData.phone}
                                onChange={e => setOrgData({ ...orgData, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Website</label>
                            <input
                                type="text"
                                value={orgData.website}
                                onChange={e => setOrgData({ ...orgData, website: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end pt-4">
                            <button
                                onClick={() => {
                                    localStorage.setItem('motofit_org_data', JSON.stringify(orgData));
                                    if (logo) localStorage.setItem('motofit_org_logo', logo);
                                    // Dispatch a custom event so other components can update
                                    window.dispatchEvent(new Event('org-data-updated'));
                                    alert('✅ Organization details saved successfully!');
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-white font-bold hover:from-orange-400 hover:to-red-500 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Team Tab Component
const TeamTab = () => {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'mechanic' });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/users`);
                if (response.ok) {
                    const data = await response.json();
                    const formattedTeam = data.map(u => ({
                        id: u.id,
                        name: u.full_name || u.username,
                        email: u.email,
                        role: u.role,
                        avatar: (u.full_name || u.username).substring(0, 2).toUpperCase(),
                        status: 'active', // Default status
                        joinDate: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                    }));
                    setTeam(formattedTeam);
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleAddUser = () => {
        // Implement API call for adding user if needed, for now just UI update as per previous logic (or better, alert)
        alert('To add a user, please use the Registration API or Admin Console. UI-only add is disabled to prevent sync issues.');
        setIsModalOpen(false);
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
                method: 'DELETE'
            });
            setTeam(team.filter(u => u.id !== id));
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Team Members ({team.length})</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 rounded-xl text-white font-bold hover:bg-orange-500 transition-colors shadow-lg shadow-orange-500/20"
                >
                    <Plus className="w-5 h-5" /> Add Member
                </button>
            </div>

            <div className="space-y-3">
                {team.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.08] transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white border border-white/20">
                                {member.avatar}
                            </div>
                            <div>
                                <h4 className="text-white font-medium">{member.name}</h4>
                                <p className="text-sm text-gray-500">{member.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${member.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                                member.role === 'manager' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                {member.role}
                            </span>

                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-emerald-500' :
                                    member.status === 'away' ? 'bg-yellow-500' :
                                        'bg-gray-500'
                                    }`} />
                                <span className="text-sm text-gray-400 capitalize">{member.status}</span>
                            </div>

                            <button
                                onClick={() => handleDeleteUser(member.id)}
                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Invite Team Member</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                <input className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                                <input className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Role</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {ROLES.map(role => (
                                        <button
                                            key={role}
                                            onClick={() => setNewUser({ ...newUser, role })}
                                            className={`py-2 rounded-lg text-sm font-medium capitalize transition-all ${newUser.role === role ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleAddUser} className="w-full py-3 mt-4 bg-orange-600 rounded-xl text-white font-bold hover:bg-orange-500 transition-colors">
                                Send Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Profile Tab Component
const ProfileTab = ({ user, onSave }) => {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        phone: user.phone,
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 500));
        onSave(formData);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30 flex items-center justify-center">
                        <span className="text-3xl font-bold text-orange-400">{user.avatar}</span>
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-orange-500 rounded-full text-white hover:bg-orange-600 transition-colors">
                        <Camera className="w-4 h-4" />
                    </button>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">{user.name}</h2>
                    <p className="text-sm text-orange-400 capitalize">{user.role}</p>
                    <p className="text-xs text-gray-500 mt-1">Member since {user.joinDate}</p>
                </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                        <input
                            type="text"
                            value={user.username}
                            disabled
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <motion.button
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl shadow-lg shadow-orange-500/25"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
            >
                {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saved ? (
                    <>
                        <CheckCircle className="w-5 h-5" />
                        Saved!
                    </>
                ) : (
                    <>
                        <Save className="w-5 h-5" />
                        Save Changes
                    </>
                )}
            </motion.button>
        </div>
    );
};

// Security Tab Component
const SecurityTab = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Current session info
    const [sessions] = useState([
        { id: 1, device: 'Current Browser', ip: 'Your IP', loginTime: new Date().toLocaleString(), current: true }
    ]);

    const handleChangePassword = async () => {
        setError('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        // Simulate API call
        await new Promise(r => setTimeout(r, 500));
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className="space-y-8">
            {/* Change Password */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Key className="w-5 h-5 text-orange-400" />
                    Change Password
                </h3>
                <div className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                        <div className="relative">
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                onClick={() => setShowPasswords(!showPasswords)}
                            >
                                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">New Password</label>
                        <input
                            type={showPasswords ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                        <input
                            type={showPasswords ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Password changed successfully!
                        </div>
                    )}

                    <motion.button
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleChangePassword}
                    >
                        <Key className="w-4 h-4" />
                        Update Password
                    </motion.button>
                </div>
            </div>

            {/* Active Sessions */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-orange-400" />
                    Active Sessions
                </h3>
                <div className="space-y-3">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className={`flex items-center justify-between p-4 rounded-xl border ${session.current
                                ? 'bg-emerald-500/10 border-emerald-500/20'
                                : 'bg-white/5 border-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <Monitor className={`w-8 h-8 ${session.current ? 'text-emerald-400' : 'text-gray-400'}`} />
                                <div>
                                    <div className="text-white font-medium flex items-center gap-2">
                                        {session.device}
                                        {session.current && (
                                            <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        <span>{session.ip}</span> · <span>{session.loginTime}</span>
                                    </div>
                                </div>
                            </div>
                            {!session.current && (
                                <motion.button
                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </motion.button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Workshop Tab Component
const WorkshopTab = () => {
    const { bays, addBay, deleteBay } = useCommandCenterStore();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-white">Workshop Layout</h3>
                    <p className="text-sm text-gray-400">Configure your service bays</p>
                </div>
                <button
                    onClick={() => addBay()}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 rounded-xl text-white font-bold hover:bg-orange-500 transition-colors shadow-lg shadow-orange-500/20"
                >
                    <Plus className="w-5 h-5" /> Add Bay
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bays.map((bay) => (
                    <div key={bay.id} className="p-4 bg-white/5 border border-white/10 rounded-xl relative group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-slate-800 text-orange-400">
                                    <Hammer className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">Bay 0{bay.id}</h4>
                                    <span className={`text-xs uppercase font-bold ${bay.status === 'occupied' ? 'text-red-400' : 'text-emerald-400'
                                        }`}>{bay.status}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => deleteBay(bay.id)}
                                disabled={bay.status === 'occupied'}
                                className={`p-2 rounded-lg transition-colors ${bay.status === 'occupied'
                                    ? 'text-gray-600 cursor-not-allowed'
                                    : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'
                                    }`}
                                title={bay.status === 'occupied' ? "Cannot delete occupied bay" : "Delete Bay"}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        {bay.status === 'occupied' && (
                            <div className="mt-2 text-sm text-gray-400">
                                <p>Mission: {bay.currentMission}</p>
                                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2">
                                    <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${bay.progress}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Data Management Tab Component
const DataManagementTab = () => {
    const [purging, setPurging] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const handlePurge = async () => {
        setShowConfirm(false);
        setPurging(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/admin/purge`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to purge data');
            }

            const data = await response.json();
            alert(`✅ ${data.message}\nTables cleared: ${data.tables_cleared}`);

            // Refresh the page to clear cached data
            window.location.reload();
        } catch (error) {
            alert(`⚠️ Error: ${error.message}`);
        } finally {
            setPurging(false);
        }
    };

    const handleSeedDemo = async () => {
        setShowConfirm(false);
        setSeeding(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/admin/seed-demo`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to seed demo data');
            }

            const data = await response.json();
            alert(`✅ ${data.message}\nCustomers: ${data.data.customers}, Bikes: ${data.data.bikes}, Services: ${data.data.services}, Jobs: ${data.data.jobs}`);

            // Refresh the page to show new data
            window.location.reload();
        } catch (error) {
            alert(`⚠️ Error: ${error.message}`);
        } finally {
            setSeeding(false);
        }
    };

    const openConfirmDialog = (action) => {
        setConfirmAction(action);
        setShowConfirm(true);
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-yellow-400 font-bold mb-1">⚠️ Danger Zone</h4>
                        <p className="text-sm text-gray-300">
                            These actions will permanently modify or delete all data in your database.
                            Use with extreme caution!
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Purge All Data */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Purge All Data</h3>
                            <p className="text-sm text-gray-400">
                                Permanently delete all customers, jobs, bikes, services, and related data.
                                This action cannot be undone!
                            </p>
                        </div>
                        <button
                            onClick={() => openConfirmDialog('purge')}
                            disabled={purging}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 rounded-xl text-white font-bold 
                                     hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20
                                     disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            <Trash2 className="w-5 h-5" />
                            {purging ? 'Purging...' : 'PURGE ALL'}
                        </button>
                    </div>
                </div>

                {/* Restore Demo Data */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Restore Demo Data</h3>
                            <p className="text-sm text-gray-400">
                                Add sample customers, bikes, services, and jobs for testing and demonstration purposes.
                            </p>
                        </div>
                        <button
                            onClick={() => openConfirmDialog('seed')}
                            disabled={seeding}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 rounded-xl text-white font-bold 
                                     hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20
                                     disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            {seeding ? 'Restoring...' : 'RESTORE DEMO'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <div className={`p-3 rounded-xl ${confirmAction === 'purge' ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                                <AlertCircle className={`w-6 h-6 ${confirmAction === 'purge' ? 'text-red-400' : 'text-emerald-400'}`} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {confirmAction === 'purge' ? 'Confirm Data Purge' : 'Confirm Demo Restore'}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {confirmAction === 'purge'
                                        ? 'Are you absolutely sure? This will permanently delete ALL data from your database. This action CANNOT be undone!'
                                        : 'This will add sample demo data to your database. You can purge it later if needed.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold 
                                         hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction === 'purge' ? handlePurge : handleSeedDemo}
                                className={`flex-1 px-4 py-3 rounded-xl text-white font-bold transition-colors shadow-lg
                                    ${confirmAction === 'purge'
                                        ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20'
                                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'}`}
                            >
                                {confirmAction === 'purge' ? 'YES, PURGE ALL' : 'YES, RESTORE DEMO'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

// Main User Profile Component
const UserProfile = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('motofit_user') || '{}');
        setUser(storedUser);
    }, []);

    const hasFullAccess = useMemo(() => {
        if (!user) return false;
        const privilegedUsernames = ['akshat', 'munna', 'samael'];
        const privilegedRoles = ['Owner', 'Admin', 'Senior Head Mechanic', 'Sr. Head Mechanic'];
        return privilegedUsernames.includes(user.username) || privilegedRoles.includes(user.role);
    }, [user]);

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: User },
        ...(hasFullAccess ? [
            { id: 'organization', label: 'Organization', icon: Building },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'workshop', label: 'Workshop', icon: Layout },
            { id: 'data', label: 'Data Management', icon: Database },
        ] : []),
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div className="p-6">
            {/* Header */}
            <motion.div
                className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20">
                            <Settings className="w-6 h-6 text-orange-400" />
                        </div>
                        Account Settings
                    </h1>
                    <p className="text-gray-400">Manage your profile and security settings</p>
                </div>

                <motion.button
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onLogout}
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </motion.button>
            </motion.div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/10 text-orange-400 border border-orange-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div
                className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm 
                   border border-white/[0.08] rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {activeTab === 'profile' && (
                    <ProfileTab user={getLoggedInUser()} onSave={(data) => console.log('Saved:', data)} />
                )}
                {activeTab === 'organization' && <OrganizationTab />}
                {activeTab === 'team' && <TeamTab />}
                {activeTab === 'workshop' && <WorkshopTab />}
                {activeTab === 'data' && <DataManagementTab />}
                {activeTab === 'security' && <SecurityTab />}
            </motion.div>
        </div>
    );
};

export default UserProfile;
