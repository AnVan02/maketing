/**
 * PHẦN 1: HÀM ĐĂNG NHẬP (LOGIN)
 * Thực hiện gửi thông tin tài khoản lên Server để xác thực.
 * Server sẽ trả về HTTP-only cookies thay vì access_token
 * 
 * @param {string} email - Địa chỉ email người dùng nhập
 * @param {string} password - Mật khẩu người dùng nhập
 */
async function login(email, password) {
    try {
        // Gọi hàm apiRequest để gửi yêu cầu POST đến /auth/login
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: {
                "email": email,
                "password": password
            }
        });
        // Kiểm tra đăng nhập thành công
        if (response.login_success || response.success) {
            // Lưu Access Token và Refresh Token vào localStorage (JS sử dụng để đính kèm Header Authorization)
            if (response.access_token) localStorage.setItem('access_token', response.access_token);
            if (response.refresh_token) localStorage.setItem('refresh_token', response.refresh_token);

            // Lưu thông tin người dùng (Tên, Email...) vào localStorage
            const userInfo = {
                user: response.user,
                login_success: true,
                email: email,
                last_login: new Date().toISOString()
            };
            localStorage.setItem('user_info', JSON.stringify(userInfo));

            console.log('✅ Đăng nhập thành công. Cookies đã được lưu tự động.');
            return response;
        } else {
            throw new Error('Máy chủ phản hồi không xác định. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('❌ Lỗi đăng nhập:', error);
        throw error; // Ném lỗi ra ngoài để UI hiển thị thông báo Alert
    }
}

/**
 * PHẦN 1.1: KIỂM TRA PHIÊN ĐĂNG NHẬP CŨ (AUTO REFRESH)
 * Nếu người dùng quay lại trang đăng nhập nhưng vẫn còn refresh_token,
 * chúng ta sẽ thử lấy access_token mới để họ không phải nhập lại mật khẩu.
 */
async function checkExistingSession() {
    const refreshToken = localStorage.getItem('refresh_token');
    const userInfo = localStorage.getItem('user_info');
    const loader = document.getElementById('auth-loader');

    // Nếu không có token hoặc vừa bấm Đăng xuất (có tham số ?logout=true) thì bỏ qua
    if (!refreshToken || window.location.search.includes('logout=true')) {
        return;
    }

    try {
        if (loader) loader.style.display = 'flex';
        console.log('🔄 Đang kiểm tra phiên làm việc cũ...');

        // Gọi API refresh
        const response = await apiRequest('/auth/refresh', {
            method: 'POST',
            body: { refresh_token: refreshToken }
        });

        // Trích xuất dữ liệu (hỗ trợ cả format lồng trong .data hoặc trực tiếp)
        const data = response.data || response;

        if (data && data.access_token) {
            console.log('✅ Khôi phục phiên làm việc thành công.');

            // Cập nhật token mới vào localStorage
            localStorage.setItem('access_token', data.access_token);
            if (data.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token);
            }

            // Chuyển hướng ngay lập tức sang Dashboard
            window.location.href = 'tong-hop.php';
            return; // Quan trọng: Dừng luồng xử lý để không ẩn loader
        }
    } catch (error) {
        console.warn('⚠️ Phiên làm việc cũ đã hết hạn thực sự:', error.message);
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

/**
 * PHẦN 2: LẤY CẤU HÌNH HỆ THỐNG
 * Sau khi đăng nhập xong, chúng ta cần biết giao diện sẽ hiển thị như thế nào.
 */

// Gọi hệ thông api /ui/configs
async function getConfigs() {
    return await apiRequest('/ui/configs', {
        method: 'GET'
    });
}

/**
 * PHẦN 3: HÀM ĐĂNG XUẤT (LOGOUT)
 * Xóa cookies phía server và xóa thông tin local
 */
async function logout() {
    try {
        // Gọi API đăng xuất để server xóa cookies
        await apiRequest('/auth/logout', {
            method: 'POST'
        });
    } catch (error) {
        console.warn('⚠️ Lỗi khi đăng xuất từ server:', error);
    } finally {
        // Xóa thông tin local
        localStorage.removeItem('user_info');
        localStorage.removeItem('ui_configs');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        // Chuyển về trang đăng nhập với flag logout để tránh auto-login
        window.location.href = 'dang-nhap.php?logout=true';
    }
}

/**
 * PHẦN 4: ĐIỀU KHIỂN GIAO DIỆN (DOM INTERACTION)
 * Đoạn mã này quản lý sự kiện nhấn nút và nhập liệu trên trang.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Kiểm tra session cũ ngay khi load trang
    checkExistingSession();

    const loginForm = document.querySelector('#loginForm'); // Tìm form đăng nhập trong HTML

    // Tự động điền dữ liệu mẫu (Sử dụng trong giai đoạn phát triển/demo)
    if (loginForm) {
        const emailInput = loginForm.querySelector('input[name="email"]');
        const passwordInput = loginForm.querySelector('input[name="password"]');

        if (emailInput && !emailInput.value) emailInput.value = "";
        if (passwordInput && !passwordInput.value) passwordInput.value = "";

        // Lắng nghe sự kiện khi người dùng nhấn "Enter" hoặc bấm nút "Đăng nhập"
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Chặn hành động tải lại trang mặc định của Form

            const submitBtn = loginForm.querySelector('.login-btn');
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            // Kiểm tra dữ liệu đầu vào cơ bản
            if (!email || !password) {
                alert('Vui lòng nhập đầy đủ email và mật khẩu!');
                return;
            }
            
            try {
                // Hiệu ứng Loading: Khóa nút bấm và đổi chữ
                submitBtn.disabled = true;
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'ĐANG XỬ LÝ...';

                // Thực hiện gọi hàm login() đã viết ở PHẦN 1
                const loginResult = await login(email, password);

                if (loginResult) {
                    // Nếu đăng nhập thành công -> Tiến hành tải cấu hình giao diện
                    try {
                        const configData = await getConfigs();
                        console.log(configData);
                        if (configData && configData.success) {
                            localStorage.setItem('ui_configs', JSON.stringify(configData.data));
                        }
                    } catch (configError) {
                        console.warn('⚠️ Không thể cập nhật cấu hình mới:', configError);
                    }

                    // Cuối cùng: Chuyển hướng sang trang quản lý chính
                    window.location.href = 'tong-hop.php';
                }
            } catch (error) {
                // Hiển thị lỗi ra màn hình cho người dùng thấy
                alert('Đăng nhập thất bại: ' + error.message);
            } finally {
                // Hoàn tất: Mở khóa nút bấm trở lại trạng thái ban đầu
                submitBtn.disabled = false;
                submitBtn.textContent = 'ĐĂNG NHẬP';
            }
        });
    }
});

