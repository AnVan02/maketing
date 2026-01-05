<?php require "thanh-dieu-huong.php" ?>

<link rel="stylesheet" href="./css/thanh-dieu-huong.css">
<link rel="stylesheet" href="./css/cau-hinh-facebook.css">

<div class="app-body">
    <main class="content-area">
        <div class="page-header">
            <h1 class="page-title">Cấu hình bài Facebook</h1>
            <div class="step-indicator">Bước 1/3</div>
        </div>

        <div class="tip-box">
            <img src="./images/icon-meo.png" alt="Tip" class="tip-icon">
            <p><strong>Mẹo:</strong> Nội dung càng rõ ràng, bài Facebook càng dễ chạm đúng người bạn muốn!</p>
        </div>

        <div class="gird-layout">
            <!-- Cột trái -->
            <div class="card">
                <h2 class="card-title">Thông tin cơ bản</h2>
                <div class="form-group">
                    <label>Yêu cầu đầu vào<span style="color:red">*</span></label>
                    <textarea id="input-idea" placeholder="Ý tưởng của bạn là gì"></textarea>
                </div>

                <div class="form-group">
                    <label>Mẫu cấu hình </label>
                    <div class="custom-select-wrapper">
                        <select id="content_lengths"></select>
                    </div>
                </div>

                <button class="preview-btn" id="preview-btn">Xem trước →</button>
            </div>

            <!-- Cột phải -->
            <div class="column right" id="right-panel">
                <section class="card right-cpanel-card" id="video-container">
                    <button class="guide-btn">Hướng dẫn</button>
                    <div id="defaultPreview">
                        <div class="video-wrapper">
                            <iframe
                                src="https://www.youtube.com/embed/Uzqpwc5hpCE?si=xPtN0u8EW6KOsQ_J"
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerpolicy="strict-origin-when-cross-origin"
                                allowfullscreen>
                            </iframe>
                        </div>
                    </div>
                </section>


                <div class="card preview-card" id="facebook-preview" style="display: none;">
                    <div class="preview-header">
                        <h2 class="card-title-manu">Xem trước bài viết</h2>
                        <div>
                            <button class="preview-btn-small" id="reset-btn"><img src="./images/icon-khoi-phuc.png" alt="">Khôi phục</button>
                            <button class="preview-btn-small" style="margin-left:8px;" id="guide-btn"><img src="./images/icon-huong-dan.png" alt="">Hướng dẫn</button>
                        </div>
                    </div>

                    <div class="facebook-post-wrapper">
                        <div class="facebook-post">

                            <div class="post-content" id="preview-content">
                                Chào mọi người! Hôm nay là một ngày thật tuyệt vời. Tôi vừa hoàn thành một dự án thú vị về mô phỏng giao diện Facebook. Các bạn thấy sao?
                            </div>

                            <img src="" class="post-image" id="preview-image" alt="Post image" style="display: none;">
                            <div class="post-stats">
                                <span>10 Bình luận . 2 Lượt chia sẻ</span>
                                <span>100 lượt thích </span>
                            </div>

                            <div class="post-actions">
                                <div class="action-btn like-btn">
                                    <image src="./images/icon-like.png" alt="Like icon" class="like-icon">
                                </div>
                                <div class="action-btn comment-btn">
                                    <image src="./images/icon-comment.png" alt="Comment icon" class="comment-icon">
                                </div>
                                <div class="action-btn share-btn">
                                    <image src="./images/icon-share.png" alt="Share icon" class="share-icon">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Configuration Section (Hidden by default) -->
        <div id="config-section" class="config-section" style="display: none; max-width: 1000px; margin: 0 auto;">
            <div class="page-header-small">
                <h1 class="page-title">Thêm cấu hình bài Facebook</h1>
            </div>
            <div class="tip-box">
                <img src="./images/icon-meo.png" alt="Tip" class="tip-icon">
                <p><strong>Mẹo:</strong>Mỗi cấu hình sẽ tạo ra phong cách bài viết khác nhau, hãy nghiên cứu và tinh chỉnh phù hợp với nhu cầu của bạn</p>
            </div>

            <!-- Name Input Box -->
            <div class="card" style="margin-bottom: 20px; min-height: auto; padding: 15px 20px; display: flex; flex-direction: column; justify-content: center;">
                <label style="color: #1037B8; font-weight: 500; font-size: 16px; margin-bottom: 0;">Tên cấu hình</label>
            </div>

            <!-- Main Config Box -->
            <div class="card" style="min-height: auto;">
                <!-- Lengths -->
                <div class="form-group">
                    <label>Mẫu cấu hình </label>
                    <div class="custom-select-wrapper">
                        <select id="content_lengths"></select>
                    </div>
                </div>

                <!-- Creativeness -->
                <div class="config-row">
                    <div class="form-group">
                        <label for="creativity_level">Mức độ sáng tạo: <span id="creativity_val">50%</span></label>
                        <input type="range" id="creativity_level" min="0" max="100" value="50" style="width: 100%;">
                    </div>
                </div>
                <!-- Types -->
                <div class="form-group">
                    <label for="content_types">Loại bài viết</label>
                    <div class="custom-select-wrapper">
                        <select id="content_types"></select>
                    </div>
                </div>

                <!-- Tones -->
                <div class="config-row">
                    <label class="writing-tones">Tone giọng</label>
                    <div class="custom-select-wrapper">
                        <select id="writing_tones"></select>
                    </div>
                </div>
                <!-- 2 Columns: Model & Language -->
                <div class="config-row two-col">
                    <div>
                        <label class="bots">Model</label>
                        <div class="custom-select-wrapper">
                            <select id="bots"></select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="languages">Ngôn ngữ</label>
                        <div class="custom-select-wrapper">
                            <select id="languages"></select>
                        </div>
                    </div>
                </div>

                <!-- Toggles -->
                <div class="toggle-row">
                    <span class="toggle-label">Đi kèm biểu tượng (emoji):</span>
                    <label class="switch"><input type="checkbox"><span class="slider"></span></label>
                </div>
                <div class="toggle-row">
                    <span class="toggle-label">Đi kèm thẻ bài viết hashtag:</span>
                    <label class="switch"><input type="checkbox"><span class="slider"></span></label>
                </div>
                <div class="toggle-row">
                    <span class="toggle-label">Đi kèm hình ảnh:</span>
                    <a style="font-size: 15px; color: #1877f2; text-decoration: none; margin-left: auto; margin-right: 10px; cursor: pointer;">✦ Tạo ảnh bằng trợ lý AIS</a>
                    <label class="switch">
                        <input type="checkbox" id="toggle-image" checked>
                        <span class="slider"></span>
                    </label>
                </div>
                <!-- Image Upload Group -->
                <div id="modal-image-group" class="image-upload-wrapper">
                    <div id="modal-upload-trigger" class="file-upload-wrapper">
                        <span class="file-upload-icon"><i class="fas fa-paperclip"></i></span>
                        <span class="file-upload-placeholder" style="margin-left: 10px; font-size:15px;">Duyệt hình ảnh của bạn tại đây</span>
                    </div>
                    <input type="file" id="modal-file-input" hidden accept="image/*">
                </div>
            </div>
            <!-- Button -->
            <div style="text-align: center; margin-top: 30px;">
                <button id="save-config-btn" class="save-config-btn">LƯU CẤU HÌNH</button>
            </div>
        </div>


    </main>
</div>

<script src="./js/thanh-dieu-huong.js"></script>
<script src="./js/cau-hinh-facebook.js"></script>