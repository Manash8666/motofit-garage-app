import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useHybridStore } from '../stores/hybridStore';
import { syncManager } from '../utils/syncManager';

export function SyncStatusIndicator() {
    const { isOnline, pendingSync, lastSynced } = useHybridStore();
    const [syncing, setSyncing] = useState(false);

    const handleManualSync = async () => {
        setSyncing(true);
        await syncManager.fullSync();
        useHybridStore.getState().updateSyncStatus();
        setSyncing(false);
    };

    const formatLastSync = (timestamp) => {
        if (!timestamp) return 'Never';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
            {/* Online/Offline Status */}
            <div className="flex items-center gap-2">
                {isOnline ? (
                    <>
                        <Wifi className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-medium text-green-400">Online</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="w-4 h-4 text-orange-400" />
                        <span className="text-xs font-medium text-orange-400">Offline</span>
                    </>
                )}
            </div>

            {/* Separator */}
            <div className="w-px h-4 bg-slate-700" />

            {/* Sync Status */}
            <div className="flex items-center gap-2">
                {isOnline ? (
                    <Cloud className="w-4 h-4 text-blue-400" />
                ) : (
                    <CloudOff className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-xs text-gray-400">
                    {pendingSync > 0 ? (
                        <span className="text-orange-400 font-medium">
                            {pendingSync} pending
                        </span>
                    ) : (
                        'Synced'
                    )}
                </span>
            </div>

            {/* Last Sync Time */}
            <span className="text-xs text-gray-500">
                {formatLastSync(lastSynced)}
            </span>

            {/* Manual Sync Button */}
            {isOnline && (
                <>
                    <div className="w-px h-4 bg-slate-700" />
                    <button
                        onClick={handleManualSync}
                        disabled={syncing}
                        className="p-1 rounded-lg hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                        title="Sync now"
                    >
                        <RefreshCw className={`w-4 h-4 text-gray-400 ${syncing ? 'animate-spin' : ''}`} />
                    </button>
                </>
            )}
        </div>
    );
}

// Compact version for mobile/small spaces
export function CompactSyncStatus() {
    const { isOnline, pendingSync } = useHybridStore();

    return (
        <div className="flex items-center gap-1.5">
            {isOnline ? (
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            ) : (
                <div className="w-2 h-2 rounded-full bg-orange-400" />
            )}
            {pendingSync > 0 && (
                <span className="text-xs font-medium text-orange-400 tabular-nums">
                    {pendingSync}
                </span>
            )}
        </div>
    );
}
