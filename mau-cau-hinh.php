<?php require "thanh-dieu-huong.php" ?>
<link rel="stylesheet" href="./css/thanh-dieu-huong.css">

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mẫu cấu hình - AIS</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="./css/mau-cau-hinh.css">
    <style>
        /* Sidebar active state */
        .nav-item.active {
            background-color: #EFF6FF;
            color: #3B82F6;
        }
        .nav-item.active .icon img {
            filter: brightness(0) saturate(100%) invert(45%) sepia(93%) saturate(1450%) hue-rotate(200deg) brightness(100%) contrast(100%);
        }
    </style>
</head>
<body>

<div class="app-container">
    <!-- Sidebar -->
        <!-- Page Content -->
        <main class="page-body">
            <div class="content-header">
                <h1 class="page-title">Mẫu cấu hình</h1>
                <button class="btn-primary-text">+ Tạo cấu hình</button>
            </div>

            <div class="alert-info">
                <img src="./images/icon-meo.png" alt="Tip" class="info-icon">
                <p><strong>Mẹo:</strong> Mỗi cấu hình sẽ tạo ra phong cách bài viết khác nhau, hãy nghiên cứu và tinh chỉnh phù hợp với nhu cầu của bạn</p>
            </div>

            <div class="card table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding-left: 24px;">Tên cấu hình</th>
                            <th>Model</th>
                            <th>Loại bài viết</th>
                            <th>Số bài được tạo</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="text-align: left; padding-left: 24px;"><strong>Tin tức thị trường SEO</strong></td>
                            <td>Gemini 2.5 Pro</td>
                            <td>Tin tức</td>
                            <td>100</td>
                            <td>20/12/2025</td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn-icon btn-delete"><img src="./images/icon-xoa.png" alt=""> Xóa</button>
                                    <button class="btn-icon btn-edit"><img src="./images/icon-sua.png" alt=""> Sửa</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
</div>

</body>
</html>