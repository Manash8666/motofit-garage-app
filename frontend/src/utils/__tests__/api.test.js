import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock axios BEFORE importing the module that uses it
vi.mock('axios', () => {
    const mockAxios = {
        create: vi.fn(() => ({
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            patch: vi.fn(),
            delete: vi.fn(),
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() }
            }
        }))
    };
    return { default: mockAxios };
});

import { jobsApi, customersApi, servicesApi, bikesApi, isOnline, apiRequest } from '../api';

describe('API Utility Functions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('isOnline function', () => {
        it('returns true when navigator is online', () => {
            Object.defineProperty(window.navigator, 'onLine', {
                writable: true,
                value: true
            });

            expect(isOnline()).toBe(true);
        });

        it('returns false when navigator is offline', () => {
            Object.defineProperty(window.navigator, 'onLine', {
                writable: true,
                value: false
            });

            expect(isOnline()).toBe(false);
        });
    });

    describe('apiRequest wrapper', () => {
        it('executes request when online', async () => {
            Object.defineProperty(window.navigator, 'onLine', {
                writable: true,
                value: true
            });

            const mockRequest = vi.fn().mockResolvedValue({ data: 'success' });

            const result = await apiRequest(mockRequest);

            expect(mockRequest).toHaveBeenCalled();
            expect(result).toEqual({ data: 'success' });
        });

        it('uses fallback when offline and fallback provided', async () => {
            Object.defineProperty(window.navigator, 'onLine', {
                writable: true,
                value: false
            });

            const mockRequest = vi.fn();
            const mockFallback = vi.fn().mockReturnValue({ cached: true });

            const result = await apiRequest(mockRequest, mockFallback);

            expect(mockRequest).not.toHaveBeenCalled();
            expect(mockFallback).toHaveBeenCalled();
            expect(result).toEqual({ cached: true });
        });

        it('falls back to cached data when request fails', async () => {
            Object.defineProperty(window.navigator, 'onLine', {
                writable: true,
                value: true
            });

            const mockRequest = vi.fn().mockRejectedValue(new Error('Network error'));
            const mockFallback = vi.fn().mockReturnValue({ cached: true });

            const result = await apiRequest(mockRequest, mockFallback);

            expect(mockRequest).toHaveBeenCalled();
            expect(mockFallback).toHaveBeenCalled();
            expect(result).toEqual({ cached: true });
        });

        it('throws error when request fails and no fallback', async () => {
            const mockRequest = vi.fn().mockRejectedValue(new Error('Network error'));

            await expect(apiRequest(mockRequest)).rejects.toThrow('Network error');
        });
    });

    describe('Jobs API', () => {
        it('has all CRUD methods', () => {
            expect(jobsApi).toHaveProperty('getAll');
            expect(jobsApi).toHaveProperty('getOne');
            expect(jobsApi).toHaveProperty('create');
            expect(jobsApi).toHaveProperty('update');
            expect(jobsApi).toHaveProperty('updateStatus');
            expect(jobsApi).toHaveProperty('delete');
        });
    });

    describe('Customers API', () => {
        it('has all CRUD methods', () => {
            expect(customersApi).toHaveProperty('getAll');
            expect(customersApi).toHaveProperty('getOne');
            expect(customersApi).toHaveProperty('create');
            expect(customersApi).toHaveProperty('update');
            expect(customersApi).toHaveProperty('delete');
        });
    });

    describe('Services API', () => {
        it('has all CRUD methods', () => {
            expect(servicesApi).toHaveProperty('getAll');
            expect(servicesApi).toHaveProperty('getCategories');
            expect(servicesApi).toHaveProperty('getOne');
            expect(servicesApi).toHaveProperty('create');
            expect(servicesApi).toHaveProperty('update');
            expect(servicesApi).toHaveProperty('delete');
        });
    });

    describe('Bikes API', () => {
        it('has all CRUD methods', () => {
            expect(bikesApi).toHaveProperty('getAll');
            expect(bikesApi).toHaveProperty('getOne');
            expect(bikesApi).toHaveProperty('create');
            expect(bikesApi).toHaveProperty('update');
            expect(bikesApi).toHaveProperty('delete');
        });
    });
});
