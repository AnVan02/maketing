<?php
$hideHeaderActions = true;
require "thanh-dieu-huong.php";
?>
<link rel="stylesheet" href="./css/tong-hop.css">
<link rel="stylesheet" href="./css/thanh-dieu-huong.css">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>



<div class="content-area">
    <!-- Stats Grid -->
    <div class="stats-grid">
        <!-- Card 1: Article SEO -->
        <div class="stats-card" id="card-seo">
            <div class="card-header">
                <span class="card-title">Bài viết SEO</span>
                <span class="card-more">...</span>
            </div>
            <div class="card-body">
                <div class="main-stat">
                    <span class="stat-number"></span>
                    <span class="stat-divider">|</span>
                    <span class="stat-period"></span>
                </div>
                <div class="sub-stat">
                    <!-- dữ liệu tổng xuất bản + nháp  -->
                </div>
            </div>
        </div>

        <!-- Card 2: Article Facebook -->
        <div class="stats-card" id="card-facebook">
            <div class="card-header">
                <span class="card-title">Bài viết Facebook</span>
                <span class="card-more">...</span>
            </div>
            <div class="card-body">
                <div class="main-stat">
                    <span class="stat-number"></span>
                    <span class="stat-divider">|</span>
                    <span class="stat-period"></span>
                </div>
                <div class="sub-stat">
                    <!-- dữ liệu tổng xuất bản + nháp -->
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
                    <span class="stat-number"></span>
                    <span class="stat-divider">|</span>
                    <span class="stat-period"></span>
                </div>
                <a href="#" class="manage-link">Quản lý gói của bạn</a>
            </div>
        </div>
    </div>

    <!-- Recent Activity Section -->

    <div class="activity-header">
        <h3>Hoạt động gần đây</h3>
        <div class="activity-tabs">
            <button class="tab-btn active">Bài viết SEO</button>
            <button class="tab-btn">Bài viết Facebook</button>
            <button id="refreshBtn" class="refresh-btn" onclick="refreshData()" title="Làm mới dữ liệu">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
                Làm mới
            </button>
        </div>
    </div>
    <div class="activity-section">
        <div class="activity-table-container">
            <table class="activity-table">
                <thead>
                    <tr>

                        <th>Tiêu đề bài viết</th>
                        <th>Khoá chính</th>
                        <th>Meta-description</th>
                        <th>Số lượng từ</th>
                        <th>SEO Score</th>
                        <th>Cập nhật lúc</th>
                    </tr>
                </thead>
                <tbody id="configTableBody">
                    <!-- dữ liệu bài viết  -->
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-container">
            <div class="pagination-info">
                Hiển thị <span id="showingFrom">0</span>-<span id="showingTo">0</span> của <span id="totalArticles">0</span> bài viết
            </div>
            <div class="pagination-controls" id="paginationControls">
                <!-- Pagination buttons will be generated here -->
            </div>
        </div>
    </div>

    <!-- Analytics Grid -->
    <div class="analytics-grid">
        <!-- SEO Analytics -->
        <div class="analytics-card" id="analytics-seo">
            <div class="analytics-header">
                <div class="header-info">
                    <h4>SEO – Lượt truy cập gần đây</h4>
                    <span class="header-subtitle">Thống kê 7 ngày qua</span>
                </div>
                <div class="card-actions">
                    <button class="action-btn"><i class="fas fa-ellipsis-h"></i></button>
                </div>
            </div>

            <div class="chart-container">
                <canvas id="seoChart"></canvas>
            </div>


            <div class="analytics-footer">
                <div class="footer-item">
                    <span class="footer-label">Lượt truy cập</span>
                    <span class="footer-value">12,847</span>
                    <span class="footer-trend trend-up">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M1 9L4.5 5.5L7 8L11 4M11 4V7.5M11 4H7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        + 12.5%
                    </span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">Số bài lên top</span>
                    <span class="footer-value">15</span>
                    <span class="footer-trend trend-up">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M1 9L4.5 5.5L7 8L11 4M11 4V7.5M11 4H7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        + 3 bài
                    </span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">CTR trung bình</span>
                    <span class="footer-value">4.2%</span>
                    <span class="footer-trend trend-up">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M1 9L4.5 5.5L7 8L11 4M11 4V7.5M11 4H7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        + 0.8%
                    </span>
                </div>
            </div>
        </div>

        <!-- Facebook Analytics -->
        <div class="analytics-card" id="analytics-facebook" style="display: none;">
            <div class="analytics-header">
                <div class="header-info">
                    <h4>Facebook – Tương tác gần đây</h4>
                    <span class="header-subtitle">Thống kê 7 ngày qua</span>
                </div>
                <div class="card-actions">
                    <button class="action-btn"><i class="fas fa-ellipsis-h"></i></button>
                </div>
            </div>

            <div class="chart-container">
                <canvas id="facebookChart"></canvas>
            </div>


            <div class="analytics-footer">
                <div class="footer-item">
                    <span class="footer-label">Tổng tương tác</span>
                    <span class="footer-value">9,584</span>
                    <span class="footer-trend trend-up">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M1 9L4.5 5.5L7 8L11 4M11 4V7.5M11 4H7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        + 18.2%
                    </span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">Bài nổi bật</span>
                    <span class="footer-value">1,247</span>
                    <span class="footer-trend trend-up">lượt tương tác</span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">Tỉ lệ click</span>
                    <span class="footer-value">3.8%</span>
                    <span class="footer-trend trend-up">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M1 9L4.5 5.5L7 8L11 4M11 4V7.5M11 4H7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        + 0.5%
                    </span>
                </div>
            </div>
        </div>
    </div>
</div>


<script src="./js/api-helper.js"></script>

<script src="./js/tong-hop.js"></script>
<!-- bảo mật -->
<!-- <script src="./js/api-secure.js"></script>
<script src="./js/api-test.js"></script> -->