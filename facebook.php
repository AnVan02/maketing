<?php require "thanh-dieu-huong.php" ?>
<link rel="stylesheet" href="./css/thanh-dieu-huong.css">
<link rel="stylesheet" href="./css/facebook.css">

<title>Quản lý cấu hình - AIS</title>
<div class="app-container">
    <main class="page-body">

        <!-- HEADER -->
        <div class="content-header">
            <div class="header-left-info">
                <h1 class="page-title">Mẫu cấu hình bài Facebook</h1>
            </div>
            <button id="toggleFormBtn" class="btn-add-config">
                <span style="font-size: 20px; line-height: 0;">+</span> Thêm mẫu cấu hình
            </button>
        </div>

        <div id="managerGrid" class="manager-grid">

            <!-- CỘT TRÁI: DANH SÁCH MẪU -->
            <div class="manager-left">
                <div class="card table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="text-align: left; padding-left: 20px;">Tên cấu hình</th>
                                <th>Model</th>
                                <th>Loại bài viết </th>
                                <th>Số bài được tạo</th>
                                <th>Ngày tạo</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody id="configTableBody">
                            <!-- JS Load -->
                        </tbody>
                    </table>
                    <div id="noDataState" style="display: none; padding: 60px 20px; text-align: center; color: #94a3b8;">
                        <img src="./images/icon-ai-bot.png" style="width: 64px; opacity: 0.2; margin-bottom: 20px;">
                        <p style="font-size: 16px;">Bạn chưa có mẫu nào. Hãy bấm "Thêm mẫu cấu hình" để bắt đầu.</p>
                    </div>
                </div>
            </div>

            <!-- CỘT PHẢI: FORM THÊM MỚI (Ẩn mặc định) -->
            <div class="manager-right">
                <div class="form-card bounce-in">
                    <div class="form-header">
                        <h2 class="form-title">Thêm cấu hình</h2>
                        <button id="closeFormBtn" class="btn-close-form">×</button>
                    </div>

                    <div class="tip-box-mini">
                        <span style="font-size: 18px;">💡</span>
                        <p>Mỗi cấu hình sẽ tạo ra phong cách bài viết khác nhau, hãy nghiên cứu và tính chính phúc phù hợp với nhu cầu của bạn </p>
                    </div>

                    <div class="form-body">
                        <div class="form-group">
                            <label>Tên cấu hình</label>
                            <input type="text" id="p_config_name" placeholder="VD: Blog SEO cơ bản" class="premium-input">
                        </div>

                        <div class="form-group">
                            <label>Model</label>
                            <select id="bots" class="premium-select"></select>
                        </div>

                        <div class="form-group">
                            <label>Mức độ sáng tạo</label>
                            <div class="slider-wrapper">
                                <span id="creativity_val" class="slider-value-badge">50%</span>
                                <input type="range" id="p_creativity_level" min="0" max="100" value="50" class="premium-slider">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Loại bài viết</label>
                            <select id="writing_tone" class="premium-select"></select>
                        </div>

                        <div class="form-group">
                            <label>Số bài được tạo</label>
                            <select id="number_of_posts" class="premium-select"></select>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Ngày tạo</label>
                                <select id="date-time" class="premium-select"></select>
                            </div>
                        </div>
                        <button id="p_saveBtn" class="btn-save-full">LƯU CẤU HÌNH</button>
                    </div>
                </div>
            </div>

        </div>
    </main>
</div>

<script src="./js/api-helper.js"></script>
<script src="./js/facebook.js"></script>
<script src="./js/thanh-dieu-huong.js"></script>