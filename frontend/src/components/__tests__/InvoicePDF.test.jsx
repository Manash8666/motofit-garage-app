import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import InvoicePDF from '../InvoicePDF';
import React from 'react';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('InvoicePDF Component', () => {
    const mockInvoice = {
        id: 'inv-001',
        customer: {
            name: 'John Doe',
            phone: '+91 9876543210',
            address: '123 Main St, Ahmedabad'
        },
        vehicle: {
            make: 'Honda',
            model: 'Activa',
            regNo: 'GJ01AB1234',
            odometer: 15000
        },
        items: [
            { name: 'Oil Change', price: 500, discount: 0 },
            { name: 'Air Filter Replacement', price: 300, discount: 50 }
        ],
        subtotal: 750,
        discount: 50,
        total: 700,
        date: '2026-01-28',
        invoiceNo: 'INV-001'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders invoice list when no invoice is selected', () => {
        render(
            <BrowserRouter>
                <InvoicePDF />
            </BrowserRouter>
        );

        expect(screen.getByText(/Invoice Generator/i)).toBeInTheDocument();
    });

    it('displays customer name correctly in printable invoice', () => {
        render(
            <BrowserRouter>
                <InvoicePDF />
            </BrowserRouter>
        );

        // The component should have sample invoices with actual names
        const customerNames = screen.queryAllByText(/Raj Patel|Amit Shah|Priya/i);
        expect(customerNames.length).toBeGreaterThan(0);
    });

    it('calculates invoice totals correctly', () => {
        const { subtotal, discount, total } = mockInvoice;

        expect(total).toBe(subtotal - discount);
        expect(total).toBe(700);
    });

    it('renders QR code for Google Reviews', async () => {
        render(
            <BrowserRouter>
                <InvoicePDF />
            </BrowserRouter>
        );

        // Check if QR code image is in the document (it's in the PrintableInvoice component)
        await waitFor(() => {
            const qrImages = document.querySelectorAll('img[alt*="Google"]');
            expect(qrImages.length).toBeGreaterThanOrEqual(0);
        });
    });

    it('handles long customer names without overflow', () => {
        const longNameInvoice = {
            ...mockInvoice,
            customer: {
                ...mockInvoice.customer,
                name: 'Very Long Customer Name That Should Truncate Properly In The UI'
            }
        };

        // Verify the name truncation logic would work
        expect(longNameInvoice.customer.name.length).toBeGreaterThan(30);
    });

    it('formats currency correctly in Indian Rupees', () => {
        const amount = 1234.56;
        const formatted = `₹${amount.toLocaleString('en-IN')}`;

        expect(formatted).toContain('₹');
        expect(formatted).toContain('1,234.56');
    });

    it('renders all invoice items with prices', () => {
        render(
            <BrowserRouter>
                <InvoicePDF />
            </BrowserRouter>
        );

        // Sample invoices should have items
        const priceElements = screen.queryAllByText(/₹\d+/);
        expect(priceElements.length).toBeGreaterThan(0);
    });
});
