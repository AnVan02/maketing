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
    <?php require "header.php"; ?>
    <!-- Main Layout -->
    <main class="layout">
        <!-- Left Slogan -->
        <div class="left-content">
            <h1>Định chuẩn mới cho<br>sáng tạo nội dung</h1>
        </div>

        <!--Trang đăng nhập bên phải -->
        <div class="login-container">
            <h2>ĐĂNG NHẬP</h2>

            <form id="loginForm" action="javascript:void(0);" method="POST">
                <div class="form-group">
                    <input type="email" name="email" placeholder="Tên đăng nhập:" value="" required>
                </div>

                <div class="form-group">
                    <input type="password" name="password" placeholder="Mật khẩu:" value="" required>
                </div>

                <a href="#" class="forgot-password">Quên mật khẩu</a>

                <button type="submit" class="login-btn">ĐĂNG NHẬP</button>
            </form>

            <p class="register-prompt">
                Chưa có tài khoản? <a href="dang-ky.php">Đăng ký ngay</a>
            </p>
        </div>
    </main>

    <!-- Background overlay elements for extra glow if needed -->
    <div class="bg-gradient"></div>

    <script src="./js/api-helper.js"></script>
    <script src="./js/dang-nhap.js"></script>
    <!-- bảo mật -->
    <script>
        // Simple console log for initialization
        console.log("Login page initialized");
    </script>

</body>

</html>