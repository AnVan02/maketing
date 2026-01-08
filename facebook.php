<?php require "thanh-dieu-huong.php" ?>
<link rel="stylesheet" href="./css/thanh-dieu-huong.css">
<link rel="stylesheet" href="./css/facebook.css">

<title>Quản lý cấu hình - AIS</title>
    <main class="page-body">

        <!-- HEADER -->
        <div class="content-header">
            <h1 class="page-title">Mẫu cấu hình bài Facebook</h1>
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
                                <th>Mô hình AI</th>
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
                        <h2 class="form-title">Mẫu cấu hình bài Facebook</h2>
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
                            <label>Độ dài bài viết</label>
                            <select id="content_lengths" class="premium-select"></select>
                        </div>

                        <div class="form-group">
                            <label>Mức độ sáng tạo</label>
                            <div class="slider-wrapper">
                                <span id="p_creativity_val" class="slider-value-badge">50%</span>
                                <input type="range" id="p_creativity_level" min="0" max="100" value="50" class="premium-slider">
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

                        <div class="toggle-row">
                            <span class="toggle-label">Đi kèm biểu tượng (emoji)</span>
                            <label class="switch"><input type="checkbox" id="toggle_emoji"><span class="slider"></span></label>
                        </div>
                        <div class="toggle-row">
                            <span class="toggle-label">Đi kèm thẻ bài viết hashtag</span>
                            <label class="switch"><input type="checkbox" id="toggle_hashtag"><span class="slider"></span></label>
                        </div>
                        <div class="toggle-row">
                            <span class="toggle-label">Đi kèm hình ảnh</span>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <a href="#" style="font-size: 13px; color: #3b82f6; text-decoration: none;">+ Tạo câu hình</a>
                                <label class="switch"><input type="checkbox" id="toggle_image" checked><span class="slider"></span></label>
                            </div>
                        </div>

                        <button id="p_saveBtn" class="btn-save-full">LƯU CẤU HÌNH</button>
                    </div>
                </div>
            </div>

        </div>
    </main>
</div>
</div>

<script src="./js/api-helper.js"></script>
<script src="./js/facebook.js"></script>
<script src="./js/thanh-dieu-huong.js"></script>