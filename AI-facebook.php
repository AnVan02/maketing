<?php require "thanh-dieu-huong.php" ?>

<link rel="stylesheet" href="./css/AI-facebook.css">


<title>Quản lý cấu hình - AIS</title>
<div class="card table-container">
    <div style="padding: 20px 20px 10px; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">Kết nối Facebook Page</h2>
        <button class="btn-use-sm" style="background:#1877f2; color:white; border:none; padding: 8px 15px;" onclick="window.location.href='#'">
            <i class="fab fa-facebook" style="margin-right: 5px;"></i> Thêm kết nối
        </button>
    </div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="text-align: left; padding-left: 20px;">Page ID</th>
                <th>Trạng thái</th>
                <th>Ngày kết nối</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody id="connectionTableBody">
            <!-- Dữ liệu kết nối Facebook -->
        </tbody>
    </table>
    <div id="noConnectionState" style="display: none; padding: 60px 20px; text-align: center; color: #94a3b8;">
        <i class="fab fa-facebook" style="font-size: 48px; opacity: 0.2; margin-bottom: 20px;"></i>
        <p style="font-size: 16px;">Bạn chưa có kết nối Facebook nào.</p>
    </div>

</div>
</div>
<script src="./js/api-helper.js"></script>
<script src="./js/AI-facebook.js"></script>