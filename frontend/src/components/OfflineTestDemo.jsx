/**
 * Test Component - Offline-First Demo
 * Use this to test the offline → online sync flow
 */
import React, { useState } from 'react';
import { useHybridStore } from '../stores/hybridStore';
import { SyncStatusIndicator } from '../components/SyncStatusIndicator';

export function OfflineTestDemo() {
    const { activeMissions: jobs, loading, createMission, fetchMissions, isOnline, pendingSync } = useHybridStore();
    const [testJobNo, setTestJobNo] = useState(1);

    const handleCreateTestJob = () => {
        const newJob = {
            jobNo: `TEST-${testJobNo}`,
            date: new Date().toISOString().split('T')[0],
            customer: 'Test Customer',
            phone: '+91-1234567890',
            bikeModel: 'Test Bike',
            mechanic: 'Test Mechanic',
            services: [{ name: 'Test Service', price: 1000 }],
            parts: [],
            estimatedCost: 1000,
            status: 'Pending',
            notes: `Created ${isOnline ? 'ONLINE' : 'OFFLINE'} at ${new Date().toLocaleTimeString()}`,
        };

        createMission(newJob);
        setTestJobNo(prev => prev + 1);
    };

    const simulateOffline = () => {
        // This won't actually disconnect - just for demo
        alert('To test offline mode:\n1. Open DevTools (F12)\n2. Go to Network tab\n3. Select "Offline" from throttling dropdown');
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Offline-First Test</h1>
                <SyncStatusIndicator />
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                <h2 className="font-semibold text-blue-400 mb-2">Test Instructions:</h2>
                <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Create a job while online (should save to TiDB instantly)</li>
                    <li>Go offline (Network tab → Offline in DevTools)</li>
                    <li>Create another job (saves to localStorage, queued for sync)</li>
                    <li>Check "Pending" count in status indicator</li>
                    <li>Go back online → syncs automatically</li>
                    <li>Verify in TiDB Cloud that all jobs are there</li>
                </ol>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    onClick={handleCreateTestJob}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors"
                >
                    Create Test Job ({isOnline ? '🟢' : '📴'})
                </button>

                <button
                    onClick={fetchMissions}
                    disabled={loading.missions}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                    {loading.missions ? 'Loading...' : 'Refresh Jobs'}
                </button>

                <button
                    onClick={simulateOffline}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl font-medium transition-colors border border-slate-600"
                >
                    How to Test Offline
                </button>
            </div>

            {/* Status */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="text-sm text-gray-400 mb-1">Connection</div>
                    <div className={`text-2xl font-bold ${isOnline ? 'text-green-400' : 'text-orange-400'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                    </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="text-sm text-gray-400 mb-1">Pending Sync</div>
                    <div className={`text-2xl font-bold ${pendingSync > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                        {pendingSync}
                    </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="text-sm text-gray-400 mb-1">Total Jobs</div>
                    <div className="text-2xl font-bold text-white">
                        {jobs.length}
                    </div>
                </div>
            </div>

            {/* Jobs List */}
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
                <h3 className="font-semibold text-white mb-3">Recent Jobs</h3>

                {jobs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No jobs yet. Create one to test!</p>
                ) : (
                    <div className="space-y-2">
                        {jobs.slice(-10).reverse().map((job) => (
                            <div
                                key={job.id}
                                className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                            >
                                <div>
                                    <div className="font-medium text-white">{job.jobNo}</div>
                                    <div className="text-sm text-gray-400">{job.customer} - {job.bikeModel}</div>
                                    <div className="text-xs text-gray-500">{job.notes}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-medium ${job.id.startsWith('temp_') ? 'text-orange-400' : 'text-green-400'
                                        }`}>
                                        {job.id.startsWith('temp_') ? '📴 Pending' : '✓ Synced'}
                                    </div>
                                    <div className="text-xs text-gray-500">₹{job.estimatedCost}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
