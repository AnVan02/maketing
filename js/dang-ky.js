/**
 * XỬ LÝ ĐĂNG KÝ TÀI KHOẢN - 2 BƯỚC
 */

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('register-step-1');
    const step2 = document.getElementById('register-step-2');
    const formRegister = document.getElementById('form-register');
    const formVerifyOtp = document.getElementById('form-verify-otp');
    const btnBackStep1 = document.getElementById('btn-back-step-1');
    const btnResendOtp = document.getElementById('btn-resend-otp');
    const otpMessage = document.getElementById('otp-message');

    let userEmail = ''; // Lưu email để hiển thị ở bước 2

    // --- BƯỚC 1: ĐĂNG KÝ ---
    if (formRegister) {
        formRegister.addEventListener('submit', async (e) => {
            e.preventDefault();

            const firstName = formRegister.querySelector('input[name="first_name"]').value.trim();
            const lastName = formRegister.querySelector('input[name="last_name"]').value.trim();
            const email = formRegister.querySelector('input[name="email"]').value.trim();
            const password = formRegister.querySelector('input[name="password"]').value.trim();
            const confirmPassword = formRegister.querySelector('input[name="confirm_password"]').value.trim();
            const submitBtn = formRegister.querySelector('.register-btn');

            // 1. Validate local
            if (!email || !password || !confirmPassword) {
                alert('Vui lòng điền đầy đủ thông tin!');
                return;
            }

            if (password.length < 8) {
                alert('Mật khẩu phải có tối thiểu 8 ký tự!');
                return;
            }

            if (password !== confirmPassword) {
                alert('Mật khẩu xác nhận không khớp!');
                return;
            }

            try {
                // Hiệu ứng loading
                submitBtn.disabled = true;
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'ĐANG XỬ LÝ...';

                // 2. Gọi API đăng ký
                // Theo yêu cầu: /api/v1/auth/register
                const response = await apiRequest('/auth/register', {
                    method: 'POST',
                    body: {
                        first_name: firstName,
                        last_name: lastName,
                        email: email,
                        password: password,
                        confirm_password: confirmPassword
                    }
                });

                // 3. Xử lý kết quả
                // Giả sử API trả về success hoặc thông tin user
                if (response) {
                    userEmail = email;
                    otpMessage.innerHTML = `Mã xác thực (OTP) đã được gửi đến email: <strong>${email}</strong>.<br>Vui lòng kiểm tra hộp thư (cả spam) và nhập mã để hoàn tất.`;

                    // Chuyển sang bước 2
                    step1.style.display = 'none';
                    step2.style.display = 'block';

                    console.log('✅ Bước 1 thành công: Đã gửi OTP.');
                }
            } catch (error) {
                if (error.message.includes('đã được sử dụng')) {
                    const confirmGoToOtp = confirm('Email này đã được đăng ký. Nếu bạn chưa kích hoạt tài khoản, bạn có muốn chuyển sang bước nhập mã OTP ngay không?');
                    if (confirmGoToOtp) {
                        userEmail = email;
                        otpMessage.innerHTML = `Vui lòng nhập mã OTP đã được gửi đến email: <strong>${email}</strong> để kích hoạt tài khoản.`;
                        step1.style.display = 'none';
                        step2.style.display = 'block';
                        return;
                    }
                }
                alert('Lỗi đăng ký: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'ĐĂNG KÝ';
            }
        });
    }

    // --- BƯỚC 2: XÁC THỰC OTP ---
    const otpBoxes = document.querySelectorAll('.otp-box');
    const hiddenOtpInput = document.querySelector('input[name="otp_code"]');

    if (otpBoxes.length > 0) {
        otpBoxes.forEach((box, index) => {
            // Nhập số và nhảy ô tiếp theo
            box.addEventListener('input', (e) => {
                if (e.target.value.length > 1) {
                    e.target.value = e.target.value.slice(0, 1);
                }
                if (e.target.value && index < otpBoxes.length - 1) {
                    otpBoxes[index + 1].focus();
                }
                updateHiddenOtp();
            });

            // Xóa (Backspace) quay lại ô trước
            box.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !box.value && index > 0) {
                    otpBoxes[index - 1].focus();
                }
            });

            // Paste cả mã OTP
            box.addEventListener('paste', (e) => {
                e.preventDefault();
                const pasteData = e.clipboardData.getData('text').slice(0, 6).split('');
                pasteData.forEach((char, i) => {
                    if (otpBoxes[index + i]) {
                        otpBoxes[index + i].value = char;
                    }
                });
                const nextFocus = index + pasteData.length;
                if (otpBoxes[nextFocus]) otpBoxes[nextFocus].focus();
                else otpBoxes[otpBoxes.length - 1].focus();
                updateHiddenOtp();
            });
        });
    }

    function updateHiddenOtp() {
        let code = '';
        otpBoxes.forEach(box => code += box.value);
        if (hiddenOtpInput) hiddenOtpInput.value = code;
    }

    if (formVerifyOtp) {
        formVerifyOtp.addEventListener('submit', async (e) => {
            e.preventDefault();

            updateHiddenOtp(); // Đảm bảo lấy mã mới nhất
            const otpCode = hiddenOtpInput ? hiddenOtpInput.value : '';
            const submitBtn = formVerifyOtp.querySelector('.register-btn');

            if (!otpCode || otpCode.length !== 6) {
                alert('Vui lòng nhập đầy đủ mã OTP gồm 6 chữ số!');
                return;
            }

            try {
                // Hiệu ứng loading
                submitBtn.disabled = true;
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'ĐANG XÁC THỰC...';

                // Gọi API xác thực OTP
                const response = await apiRequest('/auth/verify-otp', {
                    method: 'POST',
                    body: {
                        email: userEmail,
                        otp_code: otpCode
                    }
                });

                if (response) {
                    alert('Chúc mừng! Tài khoản của bạn đã được kích hoạt thành công.');
                    window.location.href = 'dang-nhap.php';
                }
            } catch (error) {
                alert('Lỗi xác thực: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'XÁC THỰC & KÍCH HOẠT';
            }
        });
    }

    // Nút Gửi lại OTP
    if (btnResendOtp) {
        btnResendOtp.addEventListener('click', async () => {
            if (!userEmail) return alert('Không tìm thấy thông tin email!');

            try {
                btnResendOtp.textContent = 'Đang gửi...';
                btnResendOtp.style.pointerEvents = 'none';

                const response = await apiRequest('/auth/resend-otp', {
                    method: 'POST',
                    body: { email: userEmail }
                });

                alert('Mã OTP mới đã được gửi vào email của bạn.');
            } catch (error) {
                alert('Lỗi gửi lại mã: ' + error.message);
            } finally {
                btnResendOtp.textContent = 'Gửi lại mã';
                btnResendOtp.style.pointerEvents = 'auto';
            }
        });
    }

    // Nút quay lại bước 1
    if (btnBackStep1) {
        btnBackStep1.addEventListener('click', () => {
            step2.style.display = 'none';
            step1.style.display = 'block';
        });
    }
});
