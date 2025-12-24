<?php require "thanh-dieu-huong.php" ?>
<link rel="stylesheet" href="./css/thanh-dieu-huong.css">
<link rel="stylesheet" href="./css/mau-cau-hinh.css">

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
                    <tbody id="configTableBody">
                        <!-- Dữ liệu sẽ được load từ JS -->
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', () => {
             const tableBody = document.getElementById('configTableBody');
             const createBtn = document.querySelector('.btn-primary-text');
             
             // Link to create page
             createBtn.onclick = () => {
                 window.location.href = 'them-cau-hinh.php';
             };

             // Load data
             const configs = JSON.parse(localStorage.getItem('user_configs')) || [];

             // Example data if empty (for demo purpose, matching the screenshot)
             if (configs.length === 0) {
                 const demoConfig = {
                     id: 1,
                     name: 'Tin tức thị trường SEO',
                     model: 'Gemini 2.5 Pro',
                     type: 'Tin tức',
                     article_count: 100,
                     created_at: '20/12/2025'
                 };
                 // Don't auto-save demo to localStorage to keep it clean, just render it
                 renderRow(demoConfig);
             } else {
                 configs.forEach(config => renderRow(config));
             }

             function renderRow(config) {
                 const tr = document.createElement('tr');
                 tr.innerHTML = `
                      <td style="text-align: left; padding-left: 24px;"><strong>${config.name}</strong></td>
                      <td>${config.model}</td>
                      <td>${config.type}</td>
                      <td>${config.article_count || 0}</td>
                      <td>${config.created_at}</td>
                      <td>
                          <div class="table-actions">
                              <button class="btn-icon btn-delete" onclick="deleteConfig(${config.id})"><img src="./images/icon-xoa.png" alt=""> Xóa</button>
                              <button class="btn-icon btn-edit"><img src="./images/icon-sua.png" alt=""> Sửa</button>
                          </div>
                      </td>
                 `;
                 tableBody.appendChild(tr);
             }
             
             // Delete function needs to be global
             window.deleteConfig = function(id) {
                 if(confirm('Bạn có chắc muốn xóa cấu hình này?')) {
                     let currentConfigs = JSON.parse(localStorage.getItem('user_configs')) || [];
                     currentConfigs = currentConfigs.filter(c => c.id !== id);
                     localStorage.setItem('user_configs', JSON.stringify(currentConfigs));
                     location.reload();
                 }
             }
        });
    </script>


</body>

</html>