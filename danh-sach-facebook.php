<?php require "thanh-dieu-huong.php" ?>

<link rel="stylesheet" href="./css/facebook.css">

<title>Danh sách bài viết Facebook - AIS</title>
<main class="page-body">

    <!-- HEADER -->
    <div class="content-header">
        <h1 class="page-title">Danh sách bài viết Facebook</h1>
        <!-- Optional: Add filters or buttons here if needed -->
    </div>

    <div class="tip-box">
        <i class="fas fa-info-circle tip-icon-bulb"></i>
        <span class="tip-text"><strong>Thông tin:</strong> Danh sách các bài viết đã được tạo và đăng lên Facebook Page của bạn.</span>
    </div>

    <div id="managerGrid" class="manager-grid" style="grid-template-columns: 1fr;"> <!-- Full width -->
        <!-- LIST -->
        <div class="manager-left" style="width: 100%;">
            <div class="card table-container">
                <div style="padding: 20px 20px 10px; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">Bài viết đã đăng</h2>
                    <button class="btn-use-sm" style="background:#f1f5f9; color:#475569;" onclick="window.refreshPostsTable()">
                        <i class="fas fa-sync-alt"></i> Tải lại
                    </button>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 50px; text-align: center;">#</th>
                            <th style="text-align: left;">Nội dung</th>
                            <th>Trang Fanpage</th>
                            <th>Trạng thái</th>
                            <th>Thời gian đăng</th>
                            <th>Hành động</th>
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
                    <p style="font-size: 16px;">Chưa có bài viết nào được ghi nhận.</p>
                </div>
            </div>
        </div>
    </div>
</main>
</div>
</div>

<script src="./js/api-helper.js"></script>
<script src="./js/danh-sach-facebook.js"></script>
