// Gửi request tới backend thông qua proxy PHP (proxy.php)
// Tránh lỗi CORS
// Tự động xử lý đăng nhập hết hạn (401)
// Gửi JSON hoặc FormData (upload file)
// Lấy cấu hình giao diện (UI Configs) và lưu vào localStor

// Đảm bảo API_BASE_URL không bị khai báo lại nếu script được tải nhiều lần
if (typeof window.API_BASE_URL === 'undefined') {
    window.API_BASE_URL = 'https://dvcendpoint.rosachatbot.com/api/v1';
}
const API_BASE_URL = window.API_BASE_URL;
const PROXY_URL = 'proxy.php'; // Sử dụng proxy PHP để tránh lỗi CORS

/**
 * PHẦN 1: HÀM API REQUEST (GỬI QUA PROXY)
 */

async function apiRequest(endpoint, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : null;

    // Chuẩn hóa đường dẫn
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Lấy Access Token từ localStorage
    const accessToken = localStorage.getItem('access_token');

    // Gửi yêu cầu qua file proxy.php thay vì gọi trực tiếp tới backend
    const targetUrl = `${PROXY_URL}?endpoint=${encodeURIComponent(cleanEndpoint)}`;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Nếu có Access Token, hãy đính kèm vào header Authorization
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        const response = await fetch(targetUrl, {
            method: method,
            headers: headers,
            body: method !== 'GET' ? body : null,
            credentials: 'include' // Quan trọng để gửi HttpOnly Cookies (nếu backend dùng cookie)
        });

        const responseText = await response.text();

        if (!response.ok) {
            // Tự động Refresh Token nếu là 401 (Unauthorized)
            if (response.status === 401) {
                // Tránh lặp vô hạn (không refresh khi chính API login/refresh/logout bị 401)
                const isAuthPath = cleanEndpoint.includes('/auth/login') ||
                    cleanEndpoint.includes('/auth/refresh') ||
                    cleanEndpoint.includes('/auth/logout');

                if (!isAuthPath) {
                    const refreshToken = localStorage.getItem('refresh_token');
                    if (refreshToken) {
                        try {
                            console.log('🔄 Access Token hết hạn. Đang gọi API Refresh...');
                            // Gọi API Refresh với refresh_token trong body
                            const refreshResponse = await apiRequest('/auth/refresh', {
                                method: 'POST',
                                body: { refresh_token: refreshToken }
                            });

                            // Trích xuất access_token, có thể nằm trong data hoặc trực tiếp
                            const data = refreshResponse.data || refreshResponse;
                            const newAccessToken = data.access_token;
                            const newRefreshToken = data.refresh_token;

                            if (newAccessToken) {
                                console.log('✅ Refresh Token thành công. Đang cập nhật localStorage...');
                                localStorage.setItem('access_token', newAccessToken);
                                if (newRefreshToken) {
                                    localStorage.setItem('refresh_token', newRefreshToken);
                                }

                                // Retry request ban đầu với token mới
                                console.log('🔄 Đang thực hiện lại request ban đầu...');
                                return await apiRequest(endpoint, options);
                            } else {
                                console.error('❌ Refresh response không chứa access_token:', refreshResponse);
                            }
                        } catch (refreshErr) {
                            console.error('❌ Refresh Token thất bại:', refreshErr.message);
                        }
                    }
                }

                // Nếu không thể refresh hoặc refresh thất bại -> Yêu cầu đăng nhập lại
                console.warn('⚠️ Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
                handleAuthFailure();
                throw new Error('Chưa đăng nhập hoặc phiên đã hết hạn');
            }

            let errorData = {};
            try {
                errorData = responseText ? JSON.parse(responseText) : {};
            } catch (e) { }

            let errorMessage = errorData.detail || errorData.message || `Lỗi từ Server (${response.status})`;

            // Nếu errorData.detail là mảng (FastAPI format), hãy trích xuất thông tin
            if (Array.isArray(errorMessage)) {
                errorMessage = errorMessage.map(err => {
                    if (typeof err === 'object' && err.msg) {
                        const loc = (err.loc && Array.isArray(err.loc)) ? `(${err.loc[err.loc.length - 1]}) ` : '';
                        return `${loc}${err.msg}`;
                    }
                    return JSON.stringify(err);
                }).join(', ');
            } else if (typeof errorMessage === 'object') {
                errorMessage = JSON.stringify(errorMessage);
            }

            throw new Error(errorMessage);
        }

        try {
            return responseText ? JSON.parse(responseText) : { success: true };
        } catch (e) {
            return { success: true, data: responseText };
        }
    } catch (error) {
        if (error instanceof TypeError) {
            console.error('❌ Lỗi mạng/Kết nối API:', error.message);
        } else {
            console.warn('⚠️ API Error:', error.message);
        }
        throw error;
    }
}

/**
 * HÀM XỬ LÝ KHI XÁC THỰC THẤT BẠI (401 & REFRESH FAIL)
 */
function handleAuthFailure() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');

    if (!window.location.href.includes('dang-nhap.php')) {
        window.location.href = 'dang-nhap.php';
    }
}

/**
 * PHẦN 2: GỬI DỮ LIỆU DẠNG FORM (TẢI ẢNH/FILE)
 */

async function apiRequestFormData(endpoint, formData, method = "POST") {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const targetUrl = `${PROXY_URL}?endpoint=${encodeURIComponent(cleanEndpoint)}`;

    const accessToken = localStorage.getItem('access_token');
    const headers = {};
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        const response = await fetch(targetUrl, {
            method: method,
            headers: headers,
            body: formData,
            credentials: 'include'
        });

        const responseText = await response.text();

        if (!response.ok) {
            if (response.status === 401) {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    try {
                        console.log('🔄 Token (Upload) hết hạn. Đang Refresh...');
                        const refreshResponse = await apiRequest('/auth/refresh', {
                            method: 'POST',
                            body: { refresh_token: refreshToken }
                        });

                        const data = refreshResponse.data || refreshResponse;
                        const newAccessToken = data.access_token;
                        const newRefreshToken = data.refresh_token;

                        if (newAccessToken) {
                            localStorage.setItem('access_token', newAccessToken);
                            if (newRefreshToken) {
                                localStorage.setItem('refresh_token', newRefreshToken);
                            }
                            console.log('✅ Refresh thành công. Retry Upload...');
                            return await apiRequestFormData(endpoint, formData, method);
                        }
                    } catch (err) {
                        console.warn('⚠️ Refresh Upload thất bại:', err);
                    }
                }

                handleAuthFailure();
                throw new Error('Phiên đã hết hạn');
            }
            let errorData = {};
            try { errorData = JSON.parse(responseText); } catch (e) { }

            let errorMessage = errorData.detail || errorData.message || `Lỗi gửi file (${response.status})`;

            if (Array.isArray(errorMessage)) {
                errorMessage = errorMessage.map(err => {
                    if (typeof err === 'object' && err.msg) {
                        const loc = (err.loc && Array.isArray(err.loc)) ? `(${err.loc[err.loc.length - 1]}) ` : '';
                        return `${loc}${err.msg}`;
                    }
                    return JSON.stringify(err);
                }).join(', ');
            } else if (typeof errorMessage === 'object') {
                errorMessage = JSON.stringify(errorMessage);
            }

            throw new Error(errorMessage);
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

/**
 * PHẦN 4: ĐĂNG XUẤT (LOGOUT)
 */

async function logout() {
    try {
        console.log('⏳ Đang đăng xuất...');
        // Gọi API đăng xuất để server xóa cookies và vô hiệu hóa token
        await apiRequest('/auth/logout', {
            method: 'POST'
        });
    } catch (error) {
        console.warn('⚠️ Lỗi khi đăng xuất từ server:', error.message);
    } finally {
        // Xóa thông tin local bất kể server có lỗi hay không
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        localStorage.removeItem('ui_configs');

        // Chuyển hướng về trang đăng nhập
        window.location.href = 'dang-nhap.php';
    }
}
