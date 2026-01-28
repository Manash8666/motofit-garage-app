import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';

// Mock the PrintableJobCard since it uses `forwardRef` which can be tricky in tests if not exported directly
// But since we can't easily mock inner components without more setup, we'll try to import the default export which is JobCardPrint
// However, JobCardPrint renders PrintableJobCard hidden.
// Let's test by rendering PrintableJobCard directly if we can, or just mock the data structure.

// We need to access the internal component PrintableJobCard. 
// Since it's not exported, we can unfortunately only test the public API or visual output if exported.
// Wait, `JobCardPrint` is the default export. It contains `PrintableJobCard`.
// Let's modify JobCardPrint to export PrintableJobCard (named export) for testing purposes.
// Or just test the logic via `JobCardPrint` but that requires finding the hidden div.

// Better approach: Test the logic by checking if the text appears in the document when we feed it data.
// But JobCardPrint uses internal state `sampleJobCards`.
// We can't inject data easily into JobCardPrint without modifying it to accept props or initial state.

// Let's try to find "WARRANTY: YES" in the rendered output of JobCardPrint.
// sampleJobCards has no warranty field by default, so it should NOT show "WARRANTY".

// To test the logic, we should probably update JobCardPrint to accept props or export the sub-component.
// Let's make PrintableJobCard exported in the file first.

import { PrintableJobCard } from '../JobCardPrint';

describe('PrintableJobCard', () => {
    const mockJobCard = {
        id: 'JC-TEST-UNIQUE',
        date: '2026-01-18',
        time: '10:00 AM',
        priority: 'high',
        customer: { name: 'Test User', phone: '9876543210', email: 'test@test.com' },
        vehicle: { make: 'Test', model: 'Bike', regNo: 'GJ-01-XX-1234', vin: 'VIN123456789', odometer: '100', fuelLevel: '50%' },
        mechanic: 'Mike',
        bay: 1,
        estimatedTime: '1h',
        complaints: [],
        checklist: [],
        services: [],
        notes: '',
    };

    it('does NOT show warranty badge when warranty is undefined', () => {
        render(<PrintableJobCard jobCard={mockJobCard} />);
        expect(screen.queryByText(/WARRANTY:/)).not.toBeInTheDocument();
    });

    it('renders job card with customer details', () => {
        render(<PrintableJobCard jobCard={mockJobCard} copyType="client" />);
        expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('renders job card with vehicle registration', () => {
        render(<PrintableJobCard jobCard={mockJobCard} copyType="motofit" />);
        expect(screen.getByText('GJ-01-XX-1234')).toBeInTheDocument(); // regNo
    });
});
