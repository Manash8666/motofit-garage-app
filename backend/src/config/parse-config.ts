import ParseServer from 'parse-server';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Parse Server Configuration
 * This replaces Firebase as our backend service
 */
export const parseConfig = {
    databaseURI: process.env.DATABASE_URI || 'mongodb://localhost:27017/motofit',
    cloud: './src/cloud/main.ts', // Cloud Code functions (optional)
    appId: process.env.PARSE_APP_ID || 'motofit-app',
    masterKey: process.env.PARSE_MASTER_KEY || 'motofit-master-key',
    maintenanceKey: process.env.PARSE_MAINTENANCE_KEY || 'motofit-maintenance-key',
    serverURL: process.env.PARSE_SERVER_URL || 'http://localhost:5000/api/parse',

    // Authentication
    allowClientClassCreation: false, // Disable client-side class creation for security
    enableAnonymousUsers: false,

    // Session configuration
    sessionLength: 31536000, // 1 year in seconds

    // File uploads (if needed later)
    // filesAdapter: ...,

    // Email verification (optional)
    verifyUserEmails: false,
    emailVerifyTokenValidityDuration: 2 * 60 * 60, // 2 hours

    // App name for email templates
    appName: 'MotoFit',

    // Public server URL
    publicServerURL: process.env.PARSE_SERVER_URL || 'http://localhost:5000/api/parse',

    // Logging
    logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'info',

    // Security
    allowHeaders: ['X-Parse-Session-Token', 'Authorization'],
};

export default parseConfig;
