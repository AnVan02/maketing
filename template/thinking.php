<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">
    <title>Hướng dẫn viết blog về Marketing Digital</title>
    <link href="../assets/css/thinking.css" rel="stylesheet">
    <script src="../assets/js/thinking.js"></script>


</head>
<body>
    <!-- HEADER -->
    <div class="header-top">
        <div class="logo_container">
            <img src="../assets/image/AIS.png" alt="Logo">
        </div>
        <div class="header-title">Hướng dẫn viết blog về Marketing Digital</div>

    </div>
    <!-- MAIN CONTAINER -->
    <div class="container">
        <!-- PROGRESS BAR -->
        <div class="progress-bar">
            <div class="progress-line"></div>
            <div class="progress-line-filled"></div>
            
            <div class="step completed">
                <div class="step-circle">✓</div>
                <div class="step-label">Nghiên cứu từ khóa</div>
            </div>
            
            <div class="step completed">
                <div class="step-circle">✓</div>
                <div class="step-label">Tổng hợp thông tin</div>
            </div>
            
            <div class="step active">
                <div class="step-circle">⚙</div>
                <div class="step-label">Phát triển nội dung</div>
            </div>
            
            <div class="step inactive">
                <div class="step-circle">4</div>
                <div class="step-label">Kiểm tra & sửa lỗi</div>
            </div>
            
            <div class="step inactive">
                <div class="step-circle">5</div>
                <div class="step-label">Hoàn tất</div>
            </div>
        </div>
        
        <!-- MAIN TITLE -->
        <h1 class="main-title">ĐANG PHÁT TRIỂN NỘI DUNG</h1>
        
        <!-- TIME INFO -->
        <div class="time-info">
            <div class="spinner"></div>
            Còn khoảng <span class="time-number">2 phút</span>
        </div>
        
        <div class="complexity">Độ phức tạp: Trung bình</div>
        
        <!-- STEPS LIST -->
        <div class="steps-list">
            <div class="step-card completed">
                <div class="step-icon">
                    <img src="../assets/image/tim-kiem.png" alt="">
                </div>
                <div class="step-content">
                    <div class="step-header">
                        <span class="step-number">Bước 1</span>
                        <span class="step-title">Nghiên cứu từ khóa</span>
                    </div>
                    <div class="step-description">
                        Phân tích và tìm kiếm các từ khóa phù hợp cho chủ đề marketing digital để tối ưu SEO
                    </div>
                </div>
                <div class="step-status">✓</div>
            </div>
            
            <div class="step-card completed">
                <div class="step-icon">
                    <img src="../assets/image/tong-hop.png" alt="">
                </div>
                <div class="step-content">
                    <div class="step-header">
                        <span class="step-number">Bước 2</span>
                        <span class="step-title">Tổng hợp thông tin</span>
                    </div>
                    <div class="step-description">
                        Thu thập và tổng hợp các thông tin liên quan đến chủ đề từ nhiều nguồn đáng tin cậy
                    </div>
                </div>
                <div class="step-status">✓</div>
            </div>
            
            <div class="step-card active">
                <div class="step-icon">
                    <img src="../assets/image/phat-trien.png" alt="">
                </div>
                <div class="step-content">
                    <div class="step-header">
                        <span class="step-number">Bước 3</span>
                        <span class="step-title">Phát triển nội dung</span>
                    </div>
                    <div class="step-description">
                        Viết và phát triển nội dung chi tiết với cấu trúc hấp dẫn và dễ đọc cho người dùng
                    </div>
                </div>
                <div class="step-status">⚙</div>
            </div>
            
            <div class="step-card inactive">
                <div class="step-icon">
                    <img src="../assets/image/kiem-tra.png" alt="">
                </div>
                <div class="step-content">
                    <div class="step-header">
                        <span class="step-number">Bước 4</span>
                        <span class="step-title">Kiểm tra & sửa lỗi</span>
                    </div>
                    <div class="step-description">
                        Kiểm tra ngữ pháp, chính tả và tối ưu hóa nội dung để đảm bảo chất lượng cao nhất
                    </div>
                </div>
                <div class="step-status">4</div>
            </div>
            
            <div class="step-card inactive">
                <div class="step-icon">
                    <img src="../assets/image/hoan-tat.png" alt="">
                </div>
                <div class="step-content">
                    <div class="step-header">
                        <span class="step-number">Bước 5</span>
                        <span class="step-title">Hoàn tất</span>
                    </div>
                    <div class="step-description">
                        Hoàn thiện bài viết cuối cùng và chuẩn bị để xuất bản hoặc chỉnh sửa thêm
                    </div>
                </div>
                <div class="step-status">5</div>
            </div>
        </div>
        
        <!-- CONTROL BUTTONS -->
        <div class="settings-btn">
            <h4>🎮 Kiểm tra tiến trình</h4>
            <a href="#" onclick="updateProgress(1, 0); return false;">Bước 1 (0%)</a>
            <a href="#" onclick="updateProgress(2, 25); return false;">Bước 2 (25%)</a>
            <a href="#" onclick="updateProgress(3, 50); return false;">Bước 3 (50%)</a>
            <a href="#" onclick="updateProgress(4, 75); return false;">Bước 4 (75%)</a>
            <a href="#" onclick="updateProgress(5, 100); return false;">Bước 5 (100%)</a>
            <br>
            <a href="#" onclick="autoProgress(); return false;" class="auto-btn">▶️ Chạy tự động</a>
        </div>
    </div>
</body>
</html>