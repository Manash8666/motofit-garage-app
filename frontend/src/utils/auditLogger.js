/**
 * MotoFit 2 - Audit Logger
 * Tracks all CRUD operations for compliance and debugging
 */

const AUDIT_LOG_KEY = 'motofit_audit_log';
const MAX_LOG_ENTRIES = 1000; // Keep last 1000 entries
const LOG_RETENTION_DAYS = 30;

/**
 * @typedef {Object} AuditLogEntry
 * @property {string} id - Unique log ID
 * @property {string} timestamp - ISO timestamp
 * @property {string} action - Action type (CREATE, READ, UPDATE, DELETE)
 * @property {string} entity - Entity type (job, customer, bike, etc.)
 * @property {string} entityId - ID of affected entity
 * @property {string} userId - User who performed action
 * @property {object} [details] - Additional details
 * @property {string} [ipAddress] - Client IP (if available)
 */

/**
 * Generate unique log ID
 * @returns {string}
 */
function generateLogId() {
    return `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current user ID from storage
 * @returns {string}
 */
function getCurrentUserId() {
    try {
        const authData = localStorage.getItem('auth_token');
        if (authData) {
            // Parse JWT to get user ID (simplified)
            const payload = JSON.parse(atob(authData.split('.')[1]));
            return payload.userId || payload.sub || 'unknown';
        }
    } catch (e) {
        // Ignore parsing errors
    }
    return 'anonymous';
}

/**
 * Get all audit logs
 * @returns {AuditLogEntry[]}
 */
export function getAuditLogs() {
    try {
        const logs = localStorage.getItem(AUDIT_LOG_KEY);
        return logs ? JSON.parse(logs) : [];
    } catch (error) {
        console.error('Failed to read audit logs:', error);
        return [];
    }
}

/**
 * Save audit logs
 * @param {AuditLogEntry[]} logs
 */
function saveAuditLogs(logs) {
    try {
        localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
    } catch (error) {
        console.error('Failed to save audit logs:', error);
    }
}

/**
 * Add entry to audit log
 * @param {string} action - CREATE, READ, UPDATE, DELETE
 * @param {string} entity - Entity type
 * @param {string} entityId - Entity ID
 * @param {object} [details] - Additional details
 */
export function logAction(action, entity, entityId, details = null) {
    const entry = {
        id: generateLogId(),
        timestamp: new Date().toISOString(),
        action: action.toUpperCase(),
        entity,
        entityId: String(entityId),
        userId: getCurrentUserId(),
        details: details ? { ...details } : undefined,
    };

    const logs = getAuditLogs();
    logs.push(entry);

    // Trim to max entries
    if (logs.length > MAX_LOG_ENTRIES) {
        logs.splice(0, logs.length - MAX_LOG_ENTRIES);
    }

    saveAuditLogs(logs);

    // Console log for debugging (can be disabled in production)
    console.log(`📝 AUDIT: ${action} ${entity} [${entityId}]`, details || '');

    return entry;
}

/**
 * Log CREATE action
 */
export function logCreate(entity, entityId, details) {
    return logAction('CREATE', entity, entityId, details);
}

/**
 * Log UPDATE action
 */
export function logUpdate(entity, entityId, details) {
    return logAction('UPDATE', entity, entityId, details);
}

/**
 * Log DELETE action
 */
export function logDelete(entity, entityId, details) {
    return logAction('DELETE', entity, entityId, details);
}

/**
 * Log LOGIN action
 */
export function logLogin(userId, success = true) {
    return logAction('LOGIN', 'auth', userId, { success });
}

/**
 * Log LOGOUT action
 */
export function logLogout(userId) {
    return logAction('LOGOUT', 'auth', userId);
}

/**
 * Clean up old logs (older than retention period)
 */
export function rotateAuditLogs() {
    const logs = getAuditLogs();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - LOG_RETENTION_DAYS);

    const filteredLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= cutoffDate;
    });

    if (filteredLogs.length !== logs.length) {
        saveAuditLogs(filteredLogs);
        console.log(`🗑️ Rotated ${logs.length - filteredLogs.length} old audit logs`);
    }

    return filteredLogs.length;
}

/**
 * Export audit logs as JSON
 * @returns {string}
 */
export function exportAuditLogs() {
    const logs = getAuditLogs();
    return JSON.stringify(logs, null, 2);
}

/**
 * Download audit logs as file
 */
export function downloadAuditLogs() {
    const data = exportAuditLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `motofit-audit-log-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Get logs for specific entity
 * @param {string} entity
 * @param {string} [entityId]
 * @returns {AuditLogEntry[]}
 */
export function getLogsForEntity(entity, entityId = null) {
    const logs = getAuditLogs();
    return logs.filter(log => {
        if (entityId) {
            return log.entity === entity && log.entityId === entityId;
        }
        return log.entity === entity;
    });
}

/**
 * Get recent activity summary
 * @param {number} hours - Number of hours to look back
 * @returns {object}
 */
export function getActivitySummary(hours = 24) {
    const logs = getAuditLogs();
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    const recentLogs = logs.filter(log => new Date(log.timestamp) >= cutoffTime);

    const summary = {
        total: recentLogs.length,
        creates: recentLogs.filter(l => l.action === 'CREATE').length,
        updates: recentLogs.filter(l => l.action === 'UPDATE').length,
        deletes: recentLogs.filter(l => l.action === 'DELETE').length,
        logins: recentLogs.filter(l => l.action === 'LOGIN').length,
    };

    return summary;
}

// Run log rotation on module load
rotateAuditLogs();
