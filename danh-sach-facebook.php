<?php require "thanh-dieu-huong.php" ?>

<link rel="stylesheet" href="./css/facebook.css">
<link rel="stylesheet" href="./css/danh-sach-facebook.css">


<title>Danh sách bài viết Facebook - AIS</title>
<main class=" page-body">

    <!-- HEADER -->
    <div class="content-header">
        <h1 class="page-title">Danh sách bài viết Facebook</h1>
        <div style="display: flex; gap: 10px;">
            <button class="btn-use-sm" style="background:#f1f5f9; color:#475569;" onclick="window.refreshPostsTable()">
                <i class="fas fa-sync-alt"></i> Làm mới
            </button>
            <a href="cau-hinh-facebook.php" class="btn-use-sm" style="background:#2563eb; color:#fff; border-color:#2563eb; text-decoration:none;">
                <i class="fas fa-plus"></i> Viết bài mới
            </a>
        </div>
    </div>
    <div class="tip-box">
        <img src="./images/icon-meo.png" alt="Tip" class="tip-icon">
        <span class="tip-text"><strong>Thông tin:</strong> Bạn có thể lọc bài viết theo trạng thái để dễ dàng quản lý nội dung của mình.</span>
    </div>
    <!-- STATS -->
    <div class="stats-container">
        <div class="stat-card">
            <!-- <div class="stat-icon" style="background: #eff6ff; color: #3b82f6;">
                <i class="fas fa-layer-group"></i>
            </div> -->
            <div class="stat-info">
                <h3>Tổng số</h3>
                <p id="stat-total">0</p>
            </div>
        </div>
        <div class="stat-card">
            <!-- <div class="stat-icon" style="background: #f1f5f9; color: #64748b;">
                <i class="fas fa-edit"></i>
            </div> -->
            <div class="stat-info">
                <h3>Bài nháp</h3>
                <p id="stat-draft">0</p>
            </div>
        </div>
        <div class="stat-card">
            <!-- <div class="stat-icon" style="background: #f0fdf4; color: #16a34a;">
                <i class="fas fa-check-circle"></i>
            </div> -->
            <div class="stat-info">
                <h3>Đã đăng</h3>
                <p id="stat-posted">0</p>
            </div>
        </div>
        <div class="stat-card">
            <!-- <div class="stat-icon" style="background: #fff7ed; color: #ea580c;">
                <i class="fas fa-calendar-alt"></i>
            </div> -->
            <div class="stat-info">
                <h3>Lên lịch</h3>
                <p id="stat-scheduled">0</p>
            </div>
        </div>
    </div>

    <div id="managerGrid" class="manager-grid">
        <div class="manager-left">
            <div class="card table-container">
                <!-- FILTER BAR -->
                <div class="filter-tabs">
                    <span class="filter-tab">Lọc theo trạng thái: </span>
                    <div class="filter-tab active" data-status="">Tất cả bài viết</div>
                    <div class="filter-tab" data-status="posted">Đã đăng</div>
                    <div class="filter-tab" data-status="draft">Bài nháp</div>
                    <div class="filter-tab" data-status="scheduled">Đã lên lịch</div>
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 50px; text-align: center;">#</th>
                            <th style="text-align: left;">Nội dung</th>
                            <th>Fanpage</th>
                            <th>Trạng thái</th>
                            <th>Thời gian</th>
                            <th>Link trang</th>
                            <th>Hạnh động</th>
                        </tr>
                    </thead>
                    <tbody id="postsTableBody">
                        <!-- Data will be loaded via JS -->
                    </tbody>
                </table>

                <div id="loadingState" style="display: none; padding: 40px; text-align: center;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #3b82f6;"></i>
                    <p style="margin-top: 10px; color: #64748b;">Đang tải dữ liệu...</p>
                </div>

                <div id="noDataState" style="display: none; padding: 60px 20px; text-align: center; color: #94a3b8;">
                    <i class="fab fa-facebook-square" style="font-size: 48px; opacity: 0.2; margin-bottom: 20px;"></i>
                    <p style="font-size: 16px;">Không tìm thấy bài viết nào.</p>
                </div>

                <div class="table-footer" style="padding: 15px 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
                    <!-- <div class="pagination-info" style="font-size: 13px; color: #64748b;">
                        Hiển thị từ <span id="showingFrom" style="font-weight: 600; color: #1e293b;">0</span>
                        đến <span id="showingTo" style="font-weight: 600; color: #1e293b;">0</span>
                        trong tổng số <span id="totalArticles" style="font-weight: 600; color: #1e293b;">0</span> bài viết
                    </div> -->
                    <div id="paginationControls" class="pagination-controls" style="display: flex; gap: 5px;">
                        <!-- Buttons will be injected via JS -->
                    </div>
                </div>
            </div>
        </div>

    </div>
</main>
</div>
</div>

<script src="./js/api-helper.js"></script>
<script src="./js/danh-sach-facebook.js"></script>