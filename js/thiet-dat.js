document.addEventListener('DOMContentLoaded', function () {
    // UI Elements
    const avatarBtn = document.querySelector('.profile-upload .btn-outline');
    const avatarInput = document.getElementById('avatar-input');
    const avatarPreview = document.getElementById('user-avatar-preview');
    const saveBtn = document.querySelector('.btn-save');

    // Load User Info from localStorage
    function loadUserInfo() {
        const userInfoRaw = localStorage.getItem('user_info');
        if (userInfoRaw) {
            try {
                const userInfo = JSON.parse(userInfoRaw);
                const user = userInfo.user || {};

                // Fill form fields
                const fullNameInput = document.getElementById('full-name');
                const emailInput = document.getElementById('email');
                const phoneInput = document.getElementById('phone-number');

                if (fullNameInput) fullNameInput.value = user.full_name || user.username || '';
                if (emailInput) emailInput.value = user.email || userInfo.email || '';
                // Phone usually isn't in simple auth response, but we'll try
                if (phoneInput && user.phone) phoneInput.value = user.phone;

                // Update avatar if available
                if (avatarPreview && user.avatar_url) {
                    avatarPreview.src = user.avatar_url;
                }

                console.log('✅ Đã tải thông tin người dùng từ localStorage');
            } catch (e) {
                console.error('❌ Lỗi khi phân giải thông tin người dùng:', e);
            }
        }
    }

    loadUserInfo();

    // Handle avatar upload click
    if (avatarBtn && avatarInput) {
        avatarBtn.addEventListener('click', () => {
            avatarInput.click();
        });

        avatarInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    avatarPreview.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle Save Changes
    if (saveBtn) {
        saveBtn.addEventListener('click', function () {
            // In a real app, you'd collect data and call an API
            this.textContent = 'Đang lưu...';
            this.disabled = true;

            setTimeout(() => {
                alert('Đã lưu thay đổi thành công!');
                this.textContent = 'Lưu thay đổi';
                this.disabled = false;
            }, 800);
        });
    }

    // Handle "Tạo cấu hình" button in header
    const addConfigBtn = document.querySelector('.add-config-link');
    if (addConfigBtn) {
        addConfigBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // This could redirect to a configuration page
            window.location.href = 'mau-cau-hinh.php';
        });
    }

    // Handle Edit Payment
    const editPaymentLinks = document.querySelectorAll('.edit-link');
    editPaymentLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Chức năng chỉnh sửa phương thức thanh toán đang được phát triển.');
        });
    });

    // Handle Add Payment
    const addPaymentBtn = document.querySelector('.btn-add-payment');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', () => {
            alert('Chức năng thêm phương thức thanh toán đang được phát triển.');
        });
    }

    // Handle "Logout all other devices"
    const logoutOthersBtn = document.querySelector('.btn-outline-danger');
    if (logoutOthersBtn) {
        logoutOthersBtn.addEventListener('click', () => {
            if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác không?')) {
                alert('Đã đăng xuất khỏi tất cả các thiết bị khác.');
            }
        });
    }
});
