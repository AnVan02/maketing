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
            <button class="menu-toggle">
                <img src="./images/menu.png" alt="Menu" style="width: 24px;">
            </button>
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
            <h2>ĐĂNG KÝ TÀI KHOẢN</h2>

            <form action="process-register.php" method="POST">
                <div class="form-row">
                    <input type="text" name="first_name" placeholder="Họ và tên đệm" required>
                    <input type="text" name="last_name" placeholder="Tên của bạn" required>
                </div>

                <div class="form-group">
                    <div class="verify-group">
                        <input type="email" name="email" placeholder="Email" required>
                        <button type="button" class="btn-verify">Xác thực</button>
                    </div>
                </div>

                <div class="form-group">
                    <input type="text" name="verify_code" placeholder="Mã xác thực" required>
                </div>

                <div class="form-group">
                    <input type="password" name="password" placeholder="Mật khẩu" required>
                </div>

                <div class="form-group">
                    <input type="password" name="confirm_password" placeholder="Nhập lại mật khẩu" required>
                </div>

                <button type="submit" class="register-btn">ĐĂNG KÝ</button>
            </form>
        </div>
    </main>
</body>

</html>