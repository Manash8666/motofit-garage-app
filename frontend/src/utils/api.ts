import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired - redirect to login
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Online/Offline detection
export function isOnline(): boolean {
    return navigator.onLine;
}

// API wrapper with offline fallback
export async function apiRequest<T>(
    request: () => Promise<T>,
    fallback?: () => T
): Promise<T> {
    if (!isOnline() && fallback) {
        console.log('📴 Offline mode - using cached data');
        return fallback();
    }

    try {
        const result = await request();
        return result;
    } catch (error) {
        console.error('API request failed:', error);
        if (fallback) {
            console.log('⚠️ Falling back to cached data');
            return fallback();
        }
        throw error;
    }
}

// Jobs API
export const jobsApi = {
    getAll: async (params?: { status?: string; search?: string }) => {
        const response = await apiClient.get('/jobs', { params });
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await apiClient.get(`/jobs/${id}`);
        return response.data;
    },

    create: async (jobData: any) => {
        const response = await apiClient.post('/jobs', jobData);
        return response.data;
    },

    update: async (id: string, jobData: any) => {
        const response = await apiClient.put(`/jobs/${id}`, jobData);
        return response.data;
    },

    updateStatus: async (id: string, status: string) => {
        const response = await apiClient.patch(`/jobs/${id}/status`, { status });
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/jobs/${id}`);
        return response.data;
    },
};

// Customers API
export const customersApi = {
    getAll: async (params?: { search?: string }) => {
        const response = await apiClient.get('/customers', { params });
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await apiClient.get(`/customers/${id}`);
        return response.data;
    },

    create: async (customerData: any) => {
        const response = await apiClient.post('/customers', customerData);
        return response.data;
    },

    update: async (id: string, customerData: any) => {
        const response = await apiClient.put(`/customers/${id}`, customerData);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/customers/${id}`);
        return response.data;
    },
};

// Services API
export const servicesApi = {
    getAll: async (params?: { category?: string; search?: string; is_active?: boolean }) => {
        const response = await apiClient.get('/services', { params });
        return response.data;
    },

    getCategories: async () => {
        const response = await apiClient.get('/services/categories');
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await apiClient.get(`/services/${id}`);
        return response.data;
    },

    create: async (serviceData: any) => {
        const response = await apiClient.post('/services', serviceData);
        return response.data;
    },

    update: async (id: string, serviceData: any) => {
        const response = await apiClient.put(`/services/${id}`, serviceData);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/services/${id}`);
        return response.data;
    },
};

// Bikes API
export const bikesApi = {
    getAll: async (params?: { search?: string; customer_id?: string }) => {
        const response = await apiClient.get('/bikes', { params });
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await apiClient.get(`/bikes/${id}`);
        return response.data;
    },

    create: async (bikeData: any) => {
        const response = await apiClient.post('/bikes', bikeData);
        return response.data;
    },

    update: async (id: string, bikeData: any) => {
        const response = await apiClient.put(`/bikes/${id}`, bikeData);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/bikes/${id}`);
        return response.data;
    },
};

export default apiClient;
