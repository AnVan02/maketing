<?php require "thanh-dieu-huong.php" ?>
<link rel="stylesheet" href="./css/tong-hop.css">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<main class="page-body">
    <div class="page-header">
        <h1 class="page-title">Phân tích hiệu quả</h1>
        <div class="header-actions">
            <select id="analytics-period" class="premium-select">
                <option value="7days">7 ngày qua</option>
                <option value="30days">30 ngày qua</option>
                <option value="90days">90 ngày qua</option>
            </select>
            <button id="sync-metrics-btn" class="btn-primary-ai" style="padding: 8px 16px; font-size: 14px;">
                <i class="fas fa-sync-alt"></i> Đồng bộ dữ liệu
            </button>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stats-card">
            <div class="card-header"><span class="card-title">Tổng tương tác</span></div>
            <div class="card-body">
                <div class="main-stat"><span id="total-engagement" class="stat-number">0</span></div>
                <div class="sub-stat" id="engagement-trend">--</div>
            </div>
        </div>
        <div class="stats-card">
            <div class="card-header"><span class="card-title">Lượt thích</span></div>
            <div class="card-body">
                <div class="main-stat"><span id="total-likes" class="stat-number">0</span></div>
            </div>
        </div>
        <div class="stats-card">
            <div class="card-header"><span class="card-title">Bình luận</span></div>
            <div class="card-body">
                <div class="main-stat"><span id="total-comments" class="stat-number">0</span></div>
            </div>
        </div>
        <div class="stats-card">
            <div class="card-header"><span class="card-title">Chia sẻ</span></div>
            <div class="card-body">
                <div class="main-stat"><span id="total-shares" class="stat-number">0</span></div>
            </div>
        </div>
    </div>

    <div class="grid-layout" style="margin-top: 20px; display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
        <div class="card">
            <h3 class="card-title">Biểu đồ tương tác thời gian thực</h3>
            <div class="chart-container" style="height: 350px;">
                <canvas id="engagementChart"></canvas>
            </div>
        </div>
        <div class="card">
            <h3 class="card-title">Bài viết hiệu quả nhất</h3>
            <div id="top-posts-list" class="top-posts-list">
                <!-- Top posts will be loaded here -->
                <div style="text-align: center; padding: 40px; color: #94a3b8;">
                    <i class="fas fa-spinner fa-spin"></i> Đang tải...
                </div>
            </div>
        </div>
    </div>
</main>

<script src="./js/api-helper.js"></script>
<script src="./js/analytics.js"></script>
