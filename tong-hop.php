<?php
$hideHeaderActions = true;
require "thanh-dieu-huong.php";
?>
<link rel="stylesheet" href="./css/tong-hop.css">
<link rel="stylesheet" href="./css/thanh-dieu-huong.css">

<div class="content-area">
    <!-- Stats Grid -->
    <div class="stats-grid">
        <!-- Card 1: Article SEO -->
        <div class="stats-card">
            <div class="card-header">
                <span class="card-title">Bài viết SEO</span>
                <span class="card-more">...</span>
            </div>
            <div class="card-body">
                <div class="main-stat">
                    <span class="stat-number">52 bài</span>
                    <span class="stat-divider">|</span>
                    <span class="stat-period">30 ngày</span>
                </div>
                <div class="sub-stat">
                    12 nháp · 52 đã xuất bản
                </div>
            </div>
        </div>

        <!-- Card 2: Article Facebook -->
        <div class="stats-card">
            <div class="card-header">
                <span class="card-title">Bài viết Facebook</span>
                <span class="card-more">...</span>
            </div>
            <div class="card-body">
                <div class="main-stat">
                    <span class="stat-number">36 bài</span>
                    <span class="stat-divider">|</span>
                    <span class="stat-period">30 ngày</span>
                </div>
                <div class="sub-stat">
                    2 nháp · 36 đã xuất bản
                </div>
            </div>
        </div>

        <!-- Card 3: Service Package -->
        <div class="stats-card">
            <div class="card-header">
                <span class="card-title">Gói dịch vụ</span>
                <span class="card-more">...</span>
            </div>
            <div class="card-body">
                <div class="main-stat">
                    <span class="stat-number">Basic</span>
                    <span class="stat-divider">|</span>
                    <span class="stat-period">còn lại 212 ngày</span>
                </div>
                <a href="#" class="manage-link">Quản lý gói của bạn</a>
            </div>
        </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="activity-section">
        <div class="activity-header">
            <h3>Hoạt động gần đây</h3>
            <div class="activity-tabs">
                <button class="tab-btn active">Bài viết SEO</button>
                <button class="tab-btn">Bài viết Facebook</button>
            </div>
        </div>
        <div class="activity-table-container">
            <table class="activity-table">
                <thead>
                    <tr>
                        <th>Tiêu đề bài viết</th>
                        <th>Trạng thái</th>
                        <th>SEO Score</th>
                        <th>Cập nhật lúc</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>10 Cách tối ưu SEO cho website năm 2025</td>
                        <td><span class="status-badge status-published">Đã xuất bản</span></td>
                        <td class="score-cell score-high">92/100</td>
                        <td>2 giờ trước</td>
                    </tr>
                    <tr>
                        <td>Hướng dẫn viết content marketing hiệu quả</td>
                        <td><span class="status-badge status-draft">Nháp</span></td>
                        <td class="score-cell">—</td>
                        <td>5 giờ trước</td>
                    </tr>
                    <tr>
                        <td>Phân tích từ khóa cho ngành thương mại điện tử</td>
                        <td><span class="status-badge status-published">Đã xuất bản</span></td>
                        <td class="score-cell score-high">85/100</td>
                        <td>1 ngày trước</td>
                    </tr>
                    <tr>
                        <td>Chiến lược link building 2025</td>
                        <td><span class="status-badge status-published">Đã xuất bản</span></td>
                        <td class="score-cell score-medium">78/100</td>
                        <td>2 ngày trước</td>
                    </tr>
                    <tr>
                        <td>Technical SEO: Tối ưu tốc độ trang web</td>
                        <td><span class="status-badge status-draft">Nháp</span></td>
                        <td class="score-cell">—</td>
                        <td>3 ngày trước</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Analytics Grid -->
    <div class="analytics-grid">
        <!-- SEO Analytics -->
        <div class="analytics-card">
            <div class="analytics-header">
                <h4>SEO – Lượt truy cập gần đây</h4>
                <span class="card-more">...</span>
            </div>
            <div class="chart-placeholder">
                <img src="./images/tong-hop.png" alt="Chart" style="width: 50px; opacity: 0.3;">
                <span>Biểu đồ lượt truy cập theo thời gian</span>
            </div>
            <div class="analytics-footer">
                <div class="footer-item">
                    <span class="footer-label">Lượt truy cập</span>
                    <span class="footer-value">12,847</span>
                    <span class="footer-trend trend-up">+ 12.5%</span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">Số bài lên top</span>
                    <span class="footer-value">15</span>
                    <span class="footer-trend trend-up">+ 3 bài</span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">CTR trung bình</span>
                    <span class="footer-value">4.2%</span>
                    <span class="footer-trend trend-up">+ 0.8%</span>
                </div>
            </div>
        </div>

        <!-- Facebook Analytics -->
        <div class="analytics-card">
            <div class="analytics-header">
                <h4>Facebook – Tương tác gần đây</h4>
                <span class="card-more">...</span>
            </div>
            <div class="chart-placeholder">
                <img src="./images/tong-hop.png" alt="Chart" style="width: 50px; opacity: 0.3;">
                <span>Biểu đồ tương tác theo bài viết</span>
            </div>
            <div class="analytics-footer">
                <div class="footer-item">
                    <span class="footer-label">Tổng tương tác</span>
                    <span class="footer-value">9,584</span>
                    <span class="footer-trend trend-up">+ 18.2%</span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">Bài nổi bật</span>
                    <span class="footer-value">1,247</span>
                    <span class="footer-trend trend-up">lượt tương tác</span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">Tỉ lệ click</span>
                    <span class="footer-value">3.8%</span>
                    <span class="footer-trend trend-up">+ 0.5%</span>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Highlight "AI SEO" in sidebar
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.textContent.trim().includes('AI SEO')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    });
</script>

<script src="./js/thanh-dieu-huong.js"></script>