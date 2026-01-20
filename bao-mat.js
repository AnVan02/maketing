// /**
//  * Tiện ích bảo mật cho các yêu cầu API
//  * Quản lý tập trung URL backend và bảo mật request (CSRF, Proxy, v.v.)
//  */

// (function () {
//     // Cấu hình nội bộ (ẩn)
//     // Hiện tại trỏ tới proxy nội bộ thay vì gọi trực tiếp URL ngrok
//     const API_PROXY_URL = 'api-handler.php?endpoint=';

//     /**
//      * Hàm hỗ trợ lấy CSRF token (dùng fallback nếu không tồn tại)
//      */
//     async function getCsrfToken() {
//         return window.CSRF_TOKEN || "";
//     }

//     /**
//      * Hàm gọi API chuẩn hóa
//      * @param {string} endpoint - Endpoint API (ví dụ: 'ui/configs')
//      * @param {Object} options - Các tuỳ chọn chuẩn của fetch
//      */
//     async function apiRequest(endpoint, options = {}) {
//         // Xây dựng URL đầy đủ thông qua proxy
//         const url = API_PROXY_URL + endpoint;
//         const token = localStorage.getItem('access_token');

//         // Luôn gửi cookie (phục vụ CSRF / session)
//         options.credentials = "include";

//         // Thiết lập header mặc định
//         options.headers = {
//             "Content-Type": "application/json",
//             ...(options.headers || {})
//         };

//         // Tự động thêm Authorization nếu có access token
//         if (token) {
//             options.headers["Authorization"] = `Bearer ${token}`;
//         }

//         // Thêm CSRF token cho các request làm thay đổi dữ liệu
//         if (["POST", "PUT", "DELETE"].includes((options.method || "GET").toUpperCase())) {
//             const csrfToken = await getCsrfToken();
//             if (csrfToken) {
//                 options.headers["X-CSRF-Token"] = csrfToken;
//             }
//         }

//         try {
//             const res = await fetch(url, options);

//             // Nếu response lỗi
//             if (!res.ok) {
//                 console.error(`Lỗi API: ${res.status} ${res.statusText}`);
//                 const errorData = await res.json().catch(() => ({}));
//                 throw new Error(errorData.message || `HTTP ${res.status}`);
//             }

//             // Trả về dữ liệu JSON khi thành công
//             return await res.json();
//         } catch (error) {
//             console.error("Lỗi khi gọi API:", error);
//             throw error;
//         }
//     }

//     /**
//      * Hàm gọi API dành cho FormData (upload file, submit form)
//      */
//     async function apiRequestFormData(endpoint, formData, method = "POST") {
//         const url = API_PROXY_URL + endpoint;

//         const options = {
//             method: method,
//             credentials: "include",
//             headers: {}
//         };

//         // Thêm CSRF token cho các request thay đổi dữ liệu
//         if (["POST", "PUT", "DELETE"].includes(method.toUpperCase())) {
//             const csrfToken = await getCsrfToken();
//             if (csrfToken) {
//                 options.headers["X-CSRF-Token"] = csrfToken;
//             }
//         }

//         options.body = formData;

//         try {
//             const res = await fetch(url, options);
//             return await res.json();
//         } catch (error) {
//             console.error("Lỗi API FormData:", error);
//             throw error;
//         }
//     }
//     // Export ra phạm vi global để sử dụng trong toàn bộ ứng dụng
//     window.apiRequest = apiRequest;
//     window.apiRequestFormData = apiRequestFormData;

//     // Khuyến nghị: sử dụng apiRequest(endpoint) để gọi API
//     window.BACKEND_PROXY = API_PROXY_URL;

//     console.log("🔒 Lớp bảo mật đã được khởi tạo thông qua proxy.");
// })();
