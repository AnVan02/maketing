<?php require "thanh-dieu-huong.php" ?>

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
        <!-- DANH SÁCH MẪU VÀ KẾT NỐI -->
        <div class="manager-content">
            <!-- Section 1: Cấu hình bài viết -->
            <div class="card table-container">
                <div style="padding: 20px 20px 10px; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">Mẫu cấu hình bài viết</h2>
                </div>
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
                        <!-- dữ liệu  -->
                    </tbody>
                </table>
                <div id="noDataState" style="display: none; padding: 60px 20px; text-align: center; color: #94a3b8;">
                    <img src="./images/icon-ai-bot.png" style="width: 64px; opacity: 0.2; margin-bottom: 20px;">
                    <p style="font-size: 16px;">Bạn chưa có mẫu nào. Hãy bấm "Thêm mẫu cấu hình" để bắt đầu.</p>
                </div>

                <!-- FORM CHỈNH SỬA / THÊM MỚI (Nằm trong card table-container để cùng 1 khối) -->
                <div id="configFormSection" class="config-form-section" style="display: none;">
                    <div class="form-body-custom">
                        <div class="form-group">
                            <label>Tên cấu hình <span style="color: red;">*</span></label>
                            <input type="text" id="config_name" class="premium-input" placeholder="Nhập tên cấu hình...">
                        </div>

                        <div class="form-group">
                            <label>Độ dài bài viết <span style="color: red;">*</span></label>
                            <select id="content_lengths" class="premium-select"></select>
                        </div>

                        <div class="form-group">
                            <label>Mức độ sáng tạo:</label>
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
                                <label>Model</label>
                                <select id="bots" class="premium-select"></select>
                            </div>
                            <div class="form-group">
                                <label>Ngôn ngữ</label>
                                <select id="languages" class="premium-select"></select>
                            </div>
                        </div>

                        <div class="toggles-grid" style="display: none;"> <!-- Ẩn các toggle này nếu không có trong screenshot nhưng giữ code để handle API -->
                            <div class="toggale-row">
                                <span class="toggle-label">Đi kèm biểu tượng (emoji)</span>
                                <label class="switch"><input type="checkbox" id="toggle_emoji"><span class="slider"></span></label>
                            </div>

                            <div class="toggle-row">
                                <span class="toggle-label">Đi kèm thẻ bài viết hashtag</span>
                                <label class="switch"><input type="checkbox" id="toggle_hashtag"><span class="slider"></span></label>
                            </div>
                        </div>

                        <div class="form-group is-default-row">
                            <label class="switch">
                                <input type="checkbox" id="is_default">
                                <span class="slider"></span>
                            </label>
                            <span class="toggle-label">Đặt làm cấu hình mặc định</span>
                        </div>

                        <button id="saveBtn" class="btn-save-full">LƯU CẤU HÌNH</button>
                    </div>
                </div>
            </div>

        </div>
    </div>

</main>
</div>
</div>


<script src="./js/api-helper.js"></script>
<script src="./js/facebook.js"></script>