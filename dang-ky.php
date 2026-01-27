<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng ký | AIS AI Marketing</title>
    <!-- Google Fonts: Montserrat -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="./css/dang-ky.css">
</head>

<body>
    <!-- Top Header -->
    <header>
        <div class="header-left">
            <div class="logo">
                <img src="./images/AIS.png" alt="AIS Logo">
            </div>
        </div>

        <div class="header-center">
            <nav class="top-nav">
                <a href="#">AI SEO</a>
                <a href="#">AI Social Media</a>
                <a href="#">Bảng giá</a>
                <a href="#">Hướng dẫn</a>
                <a href="#">Liên hệ</a>
            </nav>
        </div>

        <div class="header-right" style="width: 100px;"></div>
    </header>

    <!-- Main Layout -->
    <main class="layout">
        <!-- Registration Card -->
        <div class="register-container">
            <div id="register-step-1">
                <h2>ĐĂNG KÝ TÀI KHOẢN</h2>
                <form id="form-register">
                    <div class="form-row">
                        <input type="text" name="first_name" placeholder="Họ và tên đệm" required>
                        <input type="text" name="last_name" placeholder="Tên của bạn" required>
                    </div>

                    <div class="form-group">
                        <input type="email" name="email" placeholder="Email" required>
                    </div>

                    <div class="form-group" style="position: relative;">
                        <input type="password" name="password" id="password" placeholder="Mật khẩu (tối thiểu 8 ký tự)" required>
                        <span class="toggle-password" onclick="togglePassword('password')" style="position: absolute; right: 20px; top: 18px; cursor: pointer; opacity: 0.6;">👁️</span>
                    </div>

                    <div class="form-group" style="position: relative;">
                        <input type="password" name="confirm_password" id="confirm_password" placeholder="Nhập lại mật khẩu" required>
                        <span class="toggle-password" onclick="togglePassword('confirm_password')" style="position: absolute; right: 20px; top: 18px; cursor: pointer; opacity: 0.6;">👁️</span>
                    </div>

                    <button type="submit" class="register-btn">ĐĂNG KÝ</button>
                    <p style="text-align: center; margin-top: 20px; font-size: 14px; color: rgba(255,255,255,0.6);">
                        Đã có tài khoản? <a href="dang-nhap.php" style="color: var(--primary-teal); text-decoration: none; font-weight: 600;">Đăng nhập ngay</a>
                    </p>
                </form>
            </div>

            <div id="register-step-2" style="display: none;">
                <h2>XÁC THỰC OTP</h2>
                <p id="otp-message" style="text-align: center; margin-bottom: 25px; font-size: 14px; color: #D1D5DB; line-height: 1.5;">
                    Mã xác thực (OTP) đã được gửi đến email của bạn.<br>Vui lòng nhập mã để hoàn tất đăng ký.
                </p>
                <form id="form-verify-otp">
                    <div class="otp-container">
                        <input type="text" maxlength="1" class="otp-box" required>
                        <input type="text" maxlength="1" class="otp-box" required>
                        <input type="text" maxlength="1" class="otp-box" required>
                        <input type="text" maxlength="1" class="otp-box" required>
                        <input type="text" maxlength="1" class="otp-box" required>
                        <input type="text" maxlength="1" class="otp-box" required>
                        <input type="hidden" name="otp_code">
                    </div>

                    <button type="submit" class="register-btn">XÁC THỰC & KÍCH HOẠT</button>
                    <p style="text-align: center; margin-top: 15px; font-size: 13px; color: rgba(255,255,255,0.5);">
                        Chưa nhận được mã? <a href="javascript:void(0)" id="btn-resend-otp" style="color: var(--primary-teal); text-decoration: none; font-weight: 600;">Gửi lại mã</a>
                    </p>
                    <button type="button" id="btn-back-step-1" style="width: 100%; background: transparent; border: 1px solid rgba(255,255,255,0.3); color: white; padding: 12px; border-radius: 99px; margin-top: 15px; cursor: pointer; font-weight: 600;">QUAY LẠI</button>
                </form>
            </div>
        </div>
    </main>
    <script src="./js/api-helper.js"></script>
    <script src="./js/dang-ky.js"></script>
</body>

</html>