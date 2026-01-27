<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="./css/thanh-dieu-huong.css">
    <link rel="stylesheet" href="./css/header.css">
    <script src="./js/auth-check.js"></script>
    <script src="./js/api-helper.js"></script>
    <script src="./bao-mat.js"></script>
</head>

<?php
$current_page = basename($_SERVER['PHP_SELF']);
function isActive($page, $current_page)
{
    return ($page === $current_page) ? 'active' : '';
}
?>

<body>
    <div class="app-container">
        <!-- Top Header (Reused) -->
        <header class="top-header">
            <div class="header-left">
                <button class="menu-toggle">
                    <img src="./images/menu.png" alt="">
                </button>
                <div class="logo">
                    <img src="./images/AIS.png" alt="">
                </div>
            </div>

            <div class="header-center">
                <nav class="top-nav">
                    <a href="#" class="active">AI SEO</a>
                    <a href="#">AI Social Media</a>
                    <a href="#">Bảng giá</a>
                    <a href="#">Hướng dẫn</a>
                    <a href="#">Liên hệ</a>
                </nav>
            </div>
            <!-- <div class="header-right">
                <a href="#" class="header-action"><span class="icon"><img src="./images/icon-tu-mau.png" alt=""></span> Chọn từ mẫu</a>
                <a href="#" class="header-action"><span class="icon"><img src="./images/icon-luu-nhap.png" alt=""></span> Lưu nháp</a>
                <div class="user-avatar">
                    <img src="./images/icon-people.png" alt="Avatar">
                </div>
            </div> -->
            <div class="header-right">
                <?php if (empty($hideHeaderActions)) { ?>
                    <a href="#" class="header-action">
                        <span class="icon"><img src="./images/icon-tu-mau.png" alt=""></span>
                        Chọn từ mẫu
                    </a>
                    <a href="#" class="header-action">
                        <span class="icon"><img src="./images/icon-luu-nhap.png" alt=""></span>
                        Lưu nháp
                    </a>
                <?php } ?>

                <div class="user-avatar">
                    <img src="./images/icon-people.png" alt="Avatar">
                </div>
            </div>
        </header>


        <!-- Body Container -->
        <div class="app-body">
            <!-- Sidebar (Reused) -->
            <aside class="sidebar">
                <nav class="sidebar-nav">
                    <div class="nav-group">
                        <a href="tong-hop.php" class="nav-item <?php echo isActive('tong-hop.php', $current_page); ?>">
                            <span class="icon">
                                <img src="./images/icon-google.png" alt="">
                            </span> AI SEO
                        </a>

                        <a href="cau-hinh-bai-viet.php" class="nav-item <?php echo isActive('cau-hinh-bai-viet.php', $current_page); ?>">
                            <span class="icon">
                                <img src="./images/icon-viet-seo.png" alt="">
                            </span> Viết bài SEO
                        </a>

                        <a href="danh-sach-bai-viet.php" class="nav-item <?php echo isActive('danh-sach-bai-viet.php', $current_page); ?>">
                            <span class="icon">
                                <img src="./images/icon-danh-sach.png" alt="">
                            </span> Danh sách bài viết
                        </a>

                        <a href="#" class="nav-item">
                            <span class="icon">
                                <img src="./images/icon-search.png" alt="">
                            </span> Phân tích từ khóa
                        </a>

                        <a href="mau-cau-hinh.php" class="nav-item <?php echo isActive('mau-cau-hinh.php', $current_page); ?>">
                            <span class="icon">
                                <img src="./images/icon-mau-cau-hinh.png" alt="">
                            </span> Mẫu cấu hình
                        </a>
                    </div>

                    <div class="nav-group">
                        <a href="AI-facebook.php" class="nav-item <?php echo isActive('AI-facebook.php', $current_page); ?>">
                            <span class="icon">
                                <img src="./images/icon-face.png" alt="">
                            </span> AI Facebook
                        </a>

                        <a href="cau-hinh-facebook.php" class="nav-item <?php echo isActive('cau-hinh-facebook.php', $current_page); ?>">
                            <span class="icon">
                                <img src="./images/icon-sua.png" alt="">
                            </span> Viết bài Facebook
                        </a>

                        <a href="danh-sach-facebook.php" class="nav-item <?php echo isActive('danh-sach-facebook.php', $current_page); ?>">
                            <span class="icon">
                                <img src="./images/icon-danh-sach.png" alt="">
                            </span>
                            Danh sách bài viết
                        </a>

                        <a href="facebook.php" class="nav-item <?php echo isActive('facebook.php', $current_page); ?>">
                            <span class="icon">
                                <img src="./images/icon-mau-cau-hinh.png" alt="">
                            </span> Mẫu cấu hình
                        </a>
                    </div>

                    <div class="nav-group mt-auto">
                        <a href="tich-hop.php" class="nav-item <?php echo isActive('tich-hop.php', $current_page); ?>">
                            <span class="icon">
                                <img src="./images/icon-tich-hop.png" alt="">
                            </span> Tich hợp
                        </a>

                        <a href="#" class="nav-item"><span class="icon">
                                <img src="./images/icon-tai-lieu.png" alt="">
                            </span> Tài liệu
                        </a>

                        <a href="thiet-dat.php" class="nav-item"><span class="icon">
                                <img src="./images/icon-cai-dat.png" alt="">
                            </span> Thiết đặt
                        </a>

                        <a href="#" class="nav-item" onclick="logout(); return false;">
                            <span class="icon">
                                <i class="fa-solid fa-right-from-bracket"></i>
                            </span> Đăng xuất
                        </a>

                    </div>
                </nav>
            </aside>
            <div class="sidebar-overlay"></div>
            <script src="./js/thanh-dieu-huong.js"></script>