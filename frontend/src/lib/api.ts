// API Client Utility
// Centralized API calls with authentication

import { auth } from '@/lib/firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface RequestOptions extends RequestInit {
    requiresAuth?: boolean;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    // Get Firebase ID token for authenticated requests
    private async getAuthToken(): Promise<string | null> {
        if (!auth) return null; // Handle case where auth is null

        const user = auth.currentUser;
        if (user) {
            try {
                return await user.getIdToken();
            } catch (error) {
                console.error('Error getting auth token:', error);
                return null;
            }
        }
        return null;
    }

    // Generic request method
    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const { requiresAuth = true, ...fetchOptions } = options;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Add authorization header if required
        if (requiresAuth) {
            const token = await this.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else if (typeof window !== 'undefined') {
                // If no real token, check for mock email (Development Mode)
                const mockEmail = localStorage.getItem('mockEmail');
                if (mockEmail) {
                    headers['X-Mock-Email'] = mockEmail;
                }
            }
        }

        const url = `${this.baseUrl}${endpoint}`;

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // GET request
    async get<T>(endpoint: string, requiresAuth = true): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'GET',
            requiresAuth,
        });
    }

    // POST request
    async post<T>(endpoint: string, data?: any, requiresAuth = true): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
            requiresAuth,
        });
    }

    // PUT request
    async put<T>(endpoint: string, data?: any, requiresAuth = true): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
            requiresAuth,
        });
    }

    // DELETE request
    async delete<T>(endpoint: string, requiresAuth = true): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
            requiresAuth,
        });
    }
}

// Create singleton instance
const apiClient = new ApiClient(API_URL);

// Export API methods organized by domain
export const api = {
    // Domain endpoints
    domains: {
        getAll: () => apiClient.get('/api/admin/domains'),
        create: (data: { name: string }) => apiClient.post('/api/admin/domains', data),
        delete: (id: string) => apiClient.delete(`/api/admin/domains/${id}`),
    },

    // Batch endpoints
    batches: {
        getAll: (domainId?: string) => {
            const query = domainId ? `?domainId=${domainId}` : '';
            return apiClient.get(`/api/admin/batches${query}`);
        },
        create: (data: { domainId: string; name: string; startDate: string; endDate: string }) =>
            apiClient.post('/api/admin/batches', data),
        delete: (id: string) => apiClient.delete(`/api/admin/batches/${id}`),
    },

    // Tutor endpoints
    tutors: {
        getAll: () => apiClient.get('/api/admin/tutors'),
        create: (data: { name: string; email: string; domainId: string }) =>
            apiClient.post('/api/admin/tutors', data),
        delete: (id: string) => apiClient.delete(`/api/admin/tutors/${id}`),
    },

    // Student endpoints
    students: {
        getAll: (filters?: { domainId?: string; batchId?: string }) => {
            const params = new URLSearchParams();
            if (filters?.domainId) params.append('domainId', filters.domainId);
            if (filters?.batchId) params.append('batchId', filters.batchId);
            const query = params.toString() ? `?${params.toString()}` : '';
            return apiClient.get(`/api/admin/students${query}`);
        },
        create: (data: { name: string; email: string; domainId: string; batchId: string }) =>
            apiClient.post('/api/admin/students', data),
        delete: (id: string) => apiClient.delete(`/api/admin/students/${id}`),
    },

    // Session endpoints
    sessions: {
        getAll: (filters?: { domainId?: string; batchId?: string }) => {
            const params = new URLSearchParams();
            if (filters?.domainId) params.append('domainId', filters.domainId);
            if (filters?.batchId) params.append('batchId', filters.batchId);
            const query = params.toString() ? `?${params.toString()}` : '';
            return apiClient.get(`/api/attendance/sessions${query}`);
        },
        create: (data: {
            domainId: string;
            batchId: string;
            date: string;
            time: string;
            durationMinutes: number;
            meetLink: string;
        }) => apiClient.post('/api/attendance/sessions', data),
        getForStudent: (userId: string) =>
            apiClient.get(`/api/attendance/student/${userId}/sessions`),
    },

    // Attendance endpoints
    attendance: {
        mark: (data: { userId: string; code: string }) =>
            apiClient.post('/api/attendance/mark', data),
        getStats: (userId: string) => apiClient.get(`/api/attendance/stats/${userId}`),
    },

    // Dashboard endpoints
    dashboard: {
        getStats: () => apiClient.get('/api/admin/dashboard/stats'),
    },
};

export default apiClient;
