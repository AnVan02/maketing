/**
 * 🔒 Tiện ích bảo mật cho các yêu cầu API (Bản cập nhật Tunneling)
 */

(function () {
    const API_PROXY_URL = 'proxy.php';

    async function getCsrfToken() {
        return window.CSRF_TOKEN || "";
    }

    /**
     * 🛡️ Hàm gọi API chuẩn hóa thông qua Đường hầm (Tunnel)
     */
    async function apiRequest(endpoint, options = {}) {
        const method = options.method || 'GET';
        const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : null;

        const tunnelBody = JSON.stringify({
            endpoint: endpoint.startsWith('/') ? endpoint : `/${endpoint}`,
            method: method,
            data: body
        });

        // Thiết lập header mặc định
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(options.headers || {})
        };

        // Thêm CSRF token cho các request làm thay đổi dữ liệu
        if (["POST", "PUT", "DELETE"].includes(method.toUpperCase())) {
            const csrfToken = await getCsrfToken();
            if (csrfToken) {
                headers["X-CSRF-Token"] = csrfToken;
            }
        }

        try {
            const res = await fetch(API_PROXY_URL, {
                method: 'POST',
                headers: headers,
                body: tunnelBody,
                credentials: 'include'
            });

            if (!res.ok) {
                const errorText = await res.text();
                let errorData = {};
                try { errorData = JSON.parse(errorText); } catch (e) { }
                throw new Error(errorData.message || `Lỗi hệ thống (${res.status})`);
            }

            return await res.json();
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            throw error;
        }
    }

    /**
     * 🛡️ Hàm gọi API dành cho FormData (vẫn đi qua Tunnel)
     */
    async function apiRequestFormData(endpoint, formData, method = "POST") {

        const headers = {
            "X-Tunnel-Endpoint": endpoint.startsWith('/') ? endpoint : `/${endpoint}`,
            "X-Tunnel-Method": method
        };

        if (["POST", "PUT", "DELETE"].includes(method.toUpperCase())) {
            const csrfToken = await getCsrfToken();
            if (csrfToken) {
                headers["X-CSRF-Token"] = csrfToken;
            }
        }

        try {
            const res = await fetch(API_PROXY_URL + "?tunnel=multipart", {
                method: 'POST',
                headers: headers,
                body: formData,
                credentials: 'include'
            });
            return await res.json();
        } catch (error) {
            console.error("Lỗi API FormData:", error);
            throw error;
        }
    }

    // Export ra phạm vi global
    window.apiRequest = apiRequest;
    window.apiRequestFormData = apiRequestFormData;
    window.BACKEND_PROXY = API_PROXY_URL;

    console.log("🔒 Lớp bảo mật (Tunneling) đã được khởi tạo.");
})();
