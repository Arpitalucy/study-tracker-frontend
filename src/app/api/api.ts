const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('studyTracker_token');

    const headers: any = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Something went wrong' }));
        throw new Error(errorData.detail || 'API request failed');
    }

    return response.json();
}

export const api = {
    signup: (userData: any) => apiRequest('/signup', { method: 'POST', body: JSON.stringify(userData) }),
    login: (credentials: FormData) => {
        // OAuth2PasswordRequestForm expects x-www-form-urlencoded or multipart/form-data
        return fetch(`${BASE_URL}/token`, {
            method: 'POST',
            body: credentials,
        }).then(async r => {
            if (!r.ok) {
                const errorData = await r.json().catch(() => ({ detail: 'Invalid credentials' }));
                throw new Error(errorData.detail || 'Login failed');
            }
            return r.json();
        });
    },

    getGoals: () => apiRequest('/goals'),
    createGoal: (goal: any) => apiRequest('/goals', { method: 'POST', body: JSON.stringify(goal) }),
    deleteGoal: (id: string) => apiRequest(`/goals/${id}`, { method: 'DELETE' }),

    getSubjects: () => apiRequest('/subjects'),
    saveSubject: (subject: any) => apiRequest('/subjects', { method: 'POST', body: JSON.stringify(subject) }),
    deleteSubject: (id: string) => apiRequest(`/subjects/${id}`, { method: 'DELETE' }),

    getNotifications: () => apiRequest('/notifications'),
    syncNotifications: (notifications: any[]) => apiRequest('/notifications/sync', { method: 'POST', body: JSON.stringify(notifications) }),
    saveFCMToken: (token: string) => apiRequest('/users/me/fcm-token', { method: 'PUT', body: JSON.stringify({ token }) }),

    getChapters: (subjectId: string) => apiRequest(`/subjects/${subjectId}/chapters`),
    saveChapter: (chapter: any) => apiRequest('/chapters', { method: 'POST', body: JSON.stringify(chapter) }),
    deleteChapter: (id: string) => apiRequest(`/chapters/${id}`, { method: 'DELETE' }),
    sendTestNotification: () => apiRequest('/notifications/test-fly', { method: 'POST' }),
};
