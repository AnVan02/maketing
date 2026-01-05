<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng nhập | AIS AI Marketing</title>
    <!-- Google Fonts: Montserrat -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="./css/dang-nhap.css">
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

        <div class="header-right" style="width: 100px;">
            <!-- Empty space to balance the header -->
        </div>
    </header>

    <!-- Main Layout -->
    <main class="layout">
        <!-- Left Slogan -->
        <div class="left-content">
            <h1>Định chuẩn mới cho<br>sáng tạo nội dung</h1>
        </div>

        <!-- Right Login Card -->
        <div class="login-container">
            <h2>ĐĂNG NHẬP</h2>

            <form action="tong-hop.php" method="POST">
                <div class="form-group">
                    <input type="text" name="username" placeholder="Tên đăng nhập:" required>
                </div>

                <div class="form-group">
                    <input type="password" name="password" placeholder="Mật khẩu:" required>
                </div>

                <a href="#" class="forgot-password">Quên mật khẩu</a>

                <button type="submit" class="login-btn">ĐĂNG NHẬP</button>
            </form>

            <p class="register-prompt">
                Chưa có tài khoản? <a href="#">Đăng ký ngay</a>
            </p>
        </div>
    </main>

    <!-- Background overlay elements for extra glow if needed -->
    <div class="bg-gradient"></div>

    <script>
        // Simple console log for initialization
        console.log("Login page initialized");
    </script>
</body>

</html>