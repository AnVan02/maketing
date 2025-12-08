<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <title>Đang xử lý - AI SEO Tool</title>
    <link rel="stylesheet" href="cau-hinh-bai-viet.css">
    <link rel="stylesheet" href="thinking.css">
</head>

<body>
    <div class="app-container">
        <!-- Top Header (Reused) -->
        <header class="top-header">
            <div class="header-left">
                <button class="menu-toggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <div class="logo">
                     <img src="./assets/image/AIS.png" alt="">
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

            <div class="header-right">
                <a href="#" class="header-action"><span class="icon">📄</span> Chọn từ mẫu</a>
                <a href="#" class="header-action"><span class="icon">💾</span> Lưu nháp</a>
                <div class="user-avatar">
                   <img src="../assets/image/chibi.jpg" alt="Avatar">
                </div>
            </div>
        </header>

        <!-- Body Container -->
        <div class="app-body">
            <!-- Sidebar (Reused) -->
            <aside class="sidebar">
                <nav class="sidebar-nav">
                    <div class="nav-group">
                        <a href="#" class="nav-item active">
                            <span class="icon"></span> AI SEO
                        </a>
                        <a href="#" class="nav-item">
                            <span class="icon">✍️</span> Viết bài SEO
                        </a>
                        <a href="#" class="nav-item">
                            <span class="icon">💠</span> Viết chuỗi bài SEO
                        </a>
                        <a href="#" class="nav-item">
                            <span class="icon">📋</span> Danh sách bài viết
                        </a>
                        <a href="#" class="nav-item">
                            <span class="icon">🔍</span> Phân tích từ khóa
                        </a>
                        <a href="#" class="nav-item">
                            <span class="icon">⚙️</span> Mẫu cấu hình
                        </a>
                    </div>

                    <div class="nav-group">
                        <div class="nav-label">AI Facebook</div>
                        <a href="#" class="nav-item">
                            <span class="icon">📱</span> Viết bài Facebook
                        </a>
                        <a href="#" class="nav-item">
                            <span class="icon">📋</span> Danh sách bài viết
                        </a>
                        <a href="#" class="nav-item">
                            <span class="icon">⚙️</span> Mẫu cấu hình
                        </a>
                    </div>

                    <div class="nav-group mt-auto">
                        <a href="#" class="nav-item"><span class="icon">🧩</span> Tích hợp</a>
                        <a href="#" class="nav-item"><span class="icon">📚</span> Tài liệu</a>
                        <a href="#" class="nav-item"><span class="icon">⚙️</span> Thiết đặt</a>
                    </div>
                </nav>
            </aside>

            <!-- Main Content Area - Thinking Layout -->
            <main class="content-area-thinking">
                <div class="page-header">
                    <h1 class="page-title">Cấu hình bài viết</h1>
                    <div class="step-indicator">Bước 2/3</div>
                </div>

                <div class="notification-bar">
                    <span class="notification-icon">💡</span>
                    <span>Mẹo: Từ khóa chính càng cụ thể, AI sẽ tạo nội dung càng phù hợp với mục tiêu SEO của bạn.</span>
                </div>

                <div class="thinking-container">
                    <h2 class="thinking-title">VUI LÒNG ĐỢI TRONG GIÂY LÁT...</h2>

                    <!-- Spinner -->
                    <div class="spinner-large-container" style="width: 40px; height: 40px;">
                        <svg class="spinner-circle-thinking" width="40" height="40" viewBox="0 0 50 50" style="animation: rotate 2s linear infinite;">
                            <circle cx="25" cy="25" r="20" fill="none" stroke="#E5E7EB" stroke-width="5"></circle>
                            <circle cx="25" cy="25" r="20" fill="none" stroke="#2563EB" stroke-width="5" stroke-dasharray="30 150" stroke-linecap="round"></circle>
                        </svg>
                    </div>

                    <div class="time-estimate" id="countdown-timer">Còn khoảng 2 phút</div>
                    <div class="complexity-level">Độ phức tạp: Trung bình</div>

                    <!-- Stepper -->
                    <div class="stepper-container">
                        <!-- Step 1 -->
                        <div class="step-item active">
                            <div class="step-circle">
                                <svg class="step-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </div>
                            <div class="step-label">Nghiên cứu<br>từ khóa</div>
                        </div>
                        <div class="step-line"></div>

                        <!-- Step 2 -->
                        <div class="step-item">
                            <div class="step-circle">
                                <svg class="step-icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                            <div class="step-label">Tổng hợp<br>thông tin</div>
                        </div>
                        <div class="step-line"></div>

                        <!-- Step 3 -->
                        <div class="step-item">
                            <div class="step-circle">
                                <svg class="step-icon" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </div>
                            <div class="step-label">Phát triển<br>nội dung</div>
                        </div>
                        <div class="step-line"></div>

                        <!-- Step 4 -->
                        <div class="step-item">
                            <div class="step-circle">
                                <svg class="step-icon" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                            </div>
                            <div class="step-label">Kiểm tra<br>sơ bộ</div>
                        </div>
                        <div class="step-line"></div>

                        <!-- Step 5 -->
                        <div class="step-item">
                            <div class="step-circle">
                                <svg class="step-icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <div class="step-label">Hoàn tất</div>
                        </div>
                    </div>

                </div>

                <div class="back-button-container">
                    <a href="cau-hinh-bai-viet.php" class="btn-back">
                        <span>←</span> Quay lại
                    </a>
                </div>
            </main>
        </div>
    </div>

    <!-- Scripts -->
    <script src="thinking.js"></script>
</body>

</html>
