<?php require "thanh-dieu-huong.php" ?>
<link rel="stylesheet" href="./css/thanh-dieu-huong.css">
<link rel="stylesheet" href="./css/mau-cau-hinh.css">


<title>Quản lý cấu hình - AIS</title>
<main class="page-body">

    <!-- HEADER -->
    <div class="content-header">
        <h1 class="page-title">Mẫu cấu hình bài viết seo</h1>
        <a href="#" id="toggleFormBtn" class="add-config-link">+ Tạo cấu hình</a>
    </div>

    <div class="tip-box">
        <i class="fas fa-lightbulb tip-icon-bulb"></i>
        <span class="tip-text"><strong>Mẹo:</strong> Mỗi cấu hình sẽ tạo ra phong cách bài viết khác nhau, hãy nghiên cứu và tinh chỉnh phù hợp với nhu cầu của bạn</span>
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
                            <th>Sô bài dược tạo</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody id="configTableBody">
                        <!-- dữ liệu  -->
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
                    <h2 class="form-title"><img src="./images/icon-sua.png" alt="">Sửa cấu hình </h2>
                    <button id="closeFormBtn" class="btn-close-form"><img src="./images/icon-xoa.png" alt=""></button>

                </div>

                <div class="tip-box-mini">
                    <span style="font-size: 18px;"></span><img src="./images/icon-meo.png" alt="">
                    <p>Mỗi cấu hình sẽ tạo ra phong cách bài viết khác nhau, hãy nghiên cứu và tinh chỉnh phù hợp với nhu cầu của bạn</p>
                </div>

                <div class="form-body">
                    <div class="form-group">
                        <label>Tên cấu hình</label>
                        <input type="text" id="config_name" placeholder="VD: Blog SEO cơ bản" class="premium-input">
                    </div>

                    <div class="form-group">
                        <label>Độ dài bài viết</label>
                        <select id="content_lengths" class="premium-select"></select>
                    </div>

                    <div class="form-group">
                        <label>Mức độ sáng tạo</label>
                        <div class="slider-wrapper">
                            <span id="creativity_val" class="slider-value-badge">50%</span>
                            <input type="range" id="creativity_level" min="0" max="100" value="50" class="premium-slider">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Loại bài viết</label>
                        <select id="content_types" class="premium-select"></select>
                    </div>

                    <div class="form-group">
                        <label>Tone giọng</label>
                        <select id="writing_tones" class="premium-select"></select>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Mô hình AI</label>
                            <select id="bots" class="premium-select"></select>
                        </div>
                        <div class="form-group">
                            <label>Ngôn ngữ</label>
                            <select id="languages" class="premium-select"></select>
                        </div>
                    </div>
                    <button id="saveBtn" class="btn-save-full">LƯU CẤU HÌNH</button>
                </div>
            </div>
        </div>
    </div>
</main>
</div>
</div>

<script src="./js/thanh-dieu-huong"></script>
<script src="./js/api-helper.js"></script>
<script src="./js/mau-cau-hinh.js"></script>