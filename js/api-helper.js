const API_BASE_URL = 'https://dvcendpoint.rosachatbot.com/api/v1';
const PROXY_URL = 'proxy.php'; // Sử dụng proxy PHP để tránh lỗi CORS

/**
 * PHẦN 1: HÀM API REQUEST (GỬI QUA PROXY)
 */

async function apiRequest(endpoint, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : null;

    // Chuẩn hóa đường dẫn
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Gửi yêu cầu qua file proxy.php thay vì gọi trực tiếp tới backend
    // Điều này giúp tránh lỗi CORS và bảo mật thông tin API tốt hơn
    const targetUrl = `${PROXY_URL}?endpoint=${encodeURIComponent(cleanEndpoint)}`;

    try {
        const response = await fetch(targetUrl, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: method !== 'GET' ? body : null,
            credentials: 'include' // Quan trọng để gửi HttpOnly Cookies
        });

        const responseText = await response.text();

        if (!response.ok) {
            if (response.status === 401) {
                console.warn('⚠️ Phiên đăng nhập đã hết hạn.');
                if (!window.location.href.includes('dang-nhap.php')) {
                    window.location.href = 'dang-nhap.php';
                }
                throw new Error('Chưa đăng nhập hoặc phiên đã hết hạn');
            }

            let errorData = {};
            try {
                errorData = responseText ? JSON.parse(responseText) : {};
            } catch (e) { }

            throw new Error(errorData.detail || errorData.message || `Lỗi từ Server (${response.status})`);
        }

        try {
            return responseText ? JSON.parse(responseText) : { success: true };
        } catch (e) {
            return { success: true, data: responseText };
        }
    } catch (error) {
        console.error('❌ Lỗi kết nối API:', error.message);
        throw error;
    }
}

/**
 * PHẦN 2: GỬI DỮ LIỆU DẠNG FORM (TẢI ẢNH/FILE)
 */

async function apiRequestFormData(endpoint, formData, method = "POST") {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const targetUrl = `${PROXY_URL}?endpoint=${encodeURIComponent(cleanEndpoint)}`;

    try {
        const response = await fetch(targetUrl, {
            method: method,
            body: formData,
            credentials: 'include'
        });

        const responseText = await response.text();

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'dang-nhap.php';
                throw new Error('Phiên đã hết hạn');
            }
            let errorData = {};
            try { errorData = JSON.parse(responseText); } catch (e) { }
            throw new Error(errorData.detail || errorData.message || `Lỗi gửi file (${response.status})`);
        }

        return responseText ? JSON.parse(responseText) : { success: true };
    } catch (error) {
        console.error('❌ Lỗi gửi File:', error);
        throw error;
    }
}
/**
 * PHẦN 3: TẢI CẤU HÌNH GIAO DIỆN (UI CONFIGS)
 */

async function fetchUIConfigs() {
    try {
        const response = await apiRequest('/ui/configs', { method: 'GET' });

        if (response && (response.success || response.data)) {
            const configData = response.data || response;
            localStorage.setItem('ui_configs', JSON.stringify(configData));
            console.log('✅ Hệ thống: Cấu hình giao diện đã được cập nhật.');
            return configData;
        } else {
            throw new Error(response.message || 'Không thể lấy cấu hình giao diện.');
        }
    } catch (error) {
        console.error('❌ Lỗi tải UI Config:', error);
        throw error;
    }
}

