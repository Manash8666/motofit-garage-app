import { query, queryOne } from '../db/tidb';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch'; // Standard available in Node 18+ but using import for clarity if env supports it, or use global fetch

const BRIDGE_KEY = 'motofit_local_bridge_2026';
const API_URL = 'https://motofit2.in/api/leads';
const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface ExternalLead {
    id: number | string;
    name: string;
    phone: string;
    email?: string;
    interest?: string; // vehicle_interest
    message?: string; // notes
    created_at?: string;
}

export const startLeadSync = () => {
    console.log('🔄 Lead Sync Service Started');

    // Initial sync
    syncLeads();

    // Schedule polling
    setInterval(syncLeads, POLLING_INTERVAL);
};

// Export for Cron usage
export const syncLeads = async () => {
    try {
        console.log(`[${new Date().toISOString()}] Pooling for new leads...`);

        // 1. Fetch leads
        const response = await fetch(`${API_URL}?key=${BRIDGE_KEY}`);
        if (!response.ok) {
            console.error(`Sync failed: API returned ${response.status}`);
            return;
        }

        const data = await response.json() as any;
        const leads: ExternalLead[] = data.leads || [];

        if (leads.length === 0) {
            console.log('No new leads found.');
            return;
        }

        console.log(`Found ${leads.length} new leads. Importing...`);
        const syncedIds: (number | string)[] = [];

        for (const lead of leads) {
            // Check for duplicates by phone number to avoid spam/dupes
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            // Simple duplicate check: Phone number exists?
            // Optionally, we could allow duplicates if they are old, but for now prevent exact matches
            const existing = await queryOne(
                'SELECT id FROM leads WHERE phone = ? LIMIT 1',
                [lead.phone]
            );

            if (existing) {
                console.log(`Skipping duplicate lead: ${lead.phone} (${lead.name})`);
                // Even if duplicate, we might want to tell server we saw it so it stops sending?
                // Depending on server logic. Assuming server sends UN-SYNCED leads.
                // If we skip, we should probably still ack it so it doesn't spam us forever.
                syncedIds.push(lead.id);
                continue;
            }

            // Insert into local DB
            const newId = uuidv4();
            await query(
                `INSERT INTO leads (id, name, phone, email, vehicle_interest, source, status, notes, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, 'website', 'new', ?, NOW(), NOW())`,
                [
                    newId,
                    lead.name || 'Unknown',
                    lead.phone,
                    lead.email || null,
                    lead.interest || 'General Inquiry', // mapped from 'interest'
                    lead.message || null  // mapped from 'message'
                ]
            );

            console.log(`Imported lead: ${lead.name}`);
            syncedIds.push(lead.id);
        }

        // 3. Confirm Sync
        if (syncedIds.length > 0) {
            await fetch(`${API_URL}?key=${BRIDGE_KEY}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadIds: syncedIds })
            });
            console.log(`✅ Successfully synced and ack'd ${syncedIds.length} leads.`);
        }

    } catch (error) {
        console.error('❌ Lead sync error:', error);
    }
};
