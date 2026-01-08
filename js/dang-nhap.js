// 1. Bước đăng nhập để lấy Token
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                "email": email,
                "password": password
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản.');
        }

        const data = await response.json();

        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user_info', JSON.stringify(data));

            if (data.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token);
            }
            return data;
        } else {
            throw new Error('Không nhận được access_token từ máy chủ');
        }
    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        throw error;
    }
}

// 2. Bước lấy cấu hình bài viết sử dụng Token
async function getConfigs() {
    return await apiRequest('/ui/configs', {
        method: 'GET'
    });
}

// ==== test ===== 
async function getConfigs() {
    return await apiRequest ('/ui/configs',{
        method: 'GET'
    });
}

// Xử lý sự kiện khi submit form
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = loginForm.querySelector('input[name="email"]');
            const passwordInput = loginForm.querySelector('input[name="password"]');
            const submitBtn = loginForm.querySelector('.login-btn');

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                alert('Vui lòng nhập đầy đủ email và mật khẩu');
                return;
            }

            
            try {
                submitBtn.disabled = true;
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'ĐANG XỬ LÝ...';

                const loginResult = await login(email, password);

                if (loginResult && loginResult.access_token) {
                    // Gọi API lấy cấu hình ngay sau khi đăng nhập thành công
                    try {
                        const configData = await getConfigs();
                        localStorage.setItem('ui_configs', JSON.stringify(configData));
                    } catch (configError) {
                        console.error('Failed to pre-fetch configs:', configError);
                    }

                    // Đăng nhập thành công, chuyển hướng đến trang mẫu cấu hình
                    window.location.href = 'mau-cau-hinh.php';
                }
            } catch (error) {
                alert('Lỗi: ' + error.message);
                console.error('Login failed:', error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'ĐĂNG NHẬP';
            }
        });
    }
});

