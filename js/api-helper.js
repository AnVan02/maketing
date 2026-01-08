const API_BASE_URL = 'https://caiman-warm-swan.ngrok-free.app/api/v1';

// Tự động dọn dẹp các dấu vết cũ ngay khi ứng dụng chạy
(function cleanupStorage() {
    localStorage.removeItem('token_type');
    // Dọn dẹp cả bên trong các object lớn
    ['user_info', 'ui_configs'].forEach(key => {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.token_type) {
                    delete parsed.token_type;
                    localStorage.setItem(key, JSON.stringify(parsed));
                }
            }
        } catch (e) { }
    });
})();

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...options.headers
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        let url = endpoint;
        if (!endpoint.startsWith('http')) {
            const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
            const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            url = `${base}${path}`;
        }
        const response = await fetch(url, {
            ...options,
            headers: headers
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Lỗi hệ thống (${response.status})`);

        }
        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}
