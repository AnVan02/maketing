<?php require "thanh-dieu-huong.php" ?>
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
        </div>
    </div>


    <!-- Filter Section with the blue container -->
    <!-- <div class="filter-section-container" id="filter-section" style="display: none;">
        <div class="filter-bar-custom">
            <div class="filter-left">
                <span class="filter-label">Lọc theo trạng thái:</span>
                <div class="status-filters">
                    <button class="status-btn active" data-status="">Tất cả</button>
                    <button class="status-btn" data-status="">Đã đăng</button>
                    <button class="status-btn" data-status="">Đã lên lịch </button>
                    <button class="status-btn" data-status="">Lỗi </button>
                </div>
            </div>
            <div class="filter-right">
                <button class="sync-btn-custom">
                    <i class="fas fa-sync-alt"></i> Đồng bộ lại
                </button>
            </div>
        </div>
    </div> -->

    <!-- Filter Section with the blue container -->
    <div class="filter-section-container" id="filter-section" style="display: none;">
        <div class="filter-bar-custom">
            <div class="filter-left">
                <span class="filter-label">Lọc theo trạng thái:</span>
                <div class="status-filters">
                    <button class="status-btn active" data-status="">Tất cả bài viết</button>
                    <button class="status-btn" data-status="posted">Đã đăng</button>
                    <button class="status-btn" data-status="draft">Bài nháp</button>
                    <button class="status-btn" data-status="scheduled">Đã lên lịch</button>
                </div>
            </div>
            <div class="filter-right">
                <button class="sync-btn-custom">
                    <i class="fas fa-sync-alt"></i> Đồng bộ lại
                </button>
            </div>
        </div>
    </div>

    <div class="activity-section">
        <div class="activity-table-container">
            <table class="activity-table">
                <thead>
                    <tr id="tableHeaderRow">
                        <th>Tiêu đề bài viết</th>
                        <th>Khoá chính</th>
                        <th>Meta-description</th>
                        <th style="text-align: center;">Số lượng từ</th>
                        <th style="text-align: center;">SEO Score</th>
                        <th style="text-align: center;">Ngày đăng</th>
                    </tr>
                </thead>
                <tbody id="configTableBody">
                    <!-- dữ liệu bài viết  -->
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-container">
            <!-- <div class="pagination-info">
                Hiển thị <span id="showingFrom">0</span>-<span id="showingTo">0</span> của <span id="totalArticles">0</span> bài viết
            </div> -->
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
                    <div class="date-selector">
                        <i class="far fa-calendar-alt"></i>
                        <span>Tháng 07/2025 - 12/2025</span>
                    </div>
                    <button class="action-btn"><i class="fas fa-ellipsis-h"></i></button>
                </div>
            </div>

            <div class="chart-container">
                <canvas id="seoChart"></canvas>
            </div>

            <div class="analytics-footer">
                <div class="footer-item">
                    <span class="footer-label">Lượt truy cập</span>
                    <div class="footer-value">
                        12,847
                        <span class="footer-trend trend-up">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M1 9L4.5 5.5L7 8L11 4M11 4V7.5M11 4H7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            + 12.5%
                        </span>
                    </div>
                </div>
                <div class="footer-item">
                    <span class="footer-label">Số bài lên top</span>
                    <div class="footer-value">
                        15
                        <span class="footer-trend trend-up">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M1 9L4.5 5.5L7 8L11 4M11 4V7.5M11 4H7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            + 3 bài
                        </span>
                    </div>
                </div>
                <div class="footer-item">
                    <span class="footer-label">CTR trung bình</span>
                    <div class="footer-value">
                        4.2%
                        <span class="footer-trend trend-up">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M1 9L4.5 5.5L7 8L11 4M11 4V7.5M11 4H7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            + 0.8%
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Facebook Analytics -->
        <div class="analytics-card" id="analytics-facebook" style="display: none;">
            <div class="analytics-header">
                <div class="header-info">
                    <h4>Facebook – Lượt đổ mức độ quan tâm</h4>
                    <span class="header-subtitle">Thống kê 7 ngày qua</span>
                </div>
                <div class="card-actions">
                    <div class="date-selector">
                        <i class="far fa-calendar-alt"></i>
                        <span>12/01/2026 - 18/01/2026</span>
                    </div>
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

    <!-- Metrics Modal -->
    <div id="metricsModal" class="custom-modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalTitle">Chi tiết tương tác bài viết</h3>
                <button class="close-modal" onclick="closeMetricsModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="chart-wrapper" style="height: 300px; width: 100%;">
                    <canvas id="historyChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <style>
        .custom-modal {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }
        .modal-content {
            background: white;
            padding: 24px;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid #f1f5f9;
        }
        .close-modal {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #64748b;
        }
        .close-modal:hover { color: #1e293b; }
    </style>
</div>

<!-- kết nối js -->
<script src="./js/api-helper.js"></script>
<script type="module" src="./js/tong-hop.js"></script>