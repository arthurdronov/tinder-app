import { isLoggedIn } from './auth.js'

export async function apiFetch(url, options = {}) {
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (options.body instanceof FormData) {
        delete defaultHeaders['Content-Type'];
    }

    const defaultOptions = {
        credentials: 'include',
        headers: defaultHeaders,
        ...options,
    };

    const response = await fetch(url, defaultOptions);
    
    if (response.status === 401) {
        isLoggedIn.value = false 
        throw new Error('Sessão expirada ou não autorizada');
    }

    return response;
}