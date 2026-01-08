<?php require "thanh-dieu-huong.php" ?>

<link rel="stylesheet" href="./css/thanh-dieu-huong.css">
<link rel="stylesheet" href="./css/cau-hinh-facebook.css">

<main class="page-body">
    <div id="main-view">
        <div class="page-header">
            <h1 class="page-title">Viết bài Facebook</h1>
            <div class="step-indicator">Bước 1/3</div>
        </div>

        <div class="tip-box">
            <img src="./images/icon-meo.png" alt="Tip" class="tip-icon">
            <p><strong>Mẹo:</strong> Nội dung càng rõ ràng, bài Facebook càng dễ chạm đúng người bạn muốn!</p>
        </div>

        <div class="gird-layout">
            <!-- Cột trái -->
            <div class="left-column">
                <div class="card">
                    <h2 class="card-title">Thông tin cơ bản</h2>
                    <div class="form-group">
                        <label>Yêu cầu đầu vào<span style="color:red"> *</span></label>
                        <textarea id="input-idea" placeholder="Ý tưởng của bạn là gì?"></textarea>
                    </div>

                    <div class="form-group">
                        <label>Mẫu cấu hình </label>
                        <div class="custom-select-wrapper">
                            <select id="content_lengths"></select>
                        </div>
                    </div>

                    <!-- Button Outside Card -->
                    <button class="preview-btn-main" id="preview-btn">Xem trước <i class="fas fa-arrow-right"></i></button>

                </div>
            </div>

            <!-- Cột phải -->
            <div class="column right" id="right-panel">
                <section class="card right-cpanel-card" id="video-container" style="justify-content: center; align-items: center; text-align: center;">
                    <button class="guide-btn">Hướng dẫn</button>
                    <div id="defaultPreview" class="empty-state-content">
                        <div class="video-placeholder-thumb">
                            <div class="play-button-overlay">
                                <i class="fas fa-play"></i>
                            </div>
                            <img src="./images/banner-face.png" alt="Video Thumbnail" class="video-thumb-img">
                        </div>
                        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 10px;">Bản xem trước sẽ hiển thị tại đây</h3>
                        <p style="font-size: 14px; color: #64748b; max-width: 400px; line-height: 1.6;">Công cụ AI được thiết kế để tạo nhiều dạng nội dung khác nhau với chất lượng ổn định và đáng tin cậy.</p>
                    </div>
                </section>


                <div class="card preview-card" id="facebook-preview" style="display: none; height: auto; padding-bottom: 30px;">
                    <div class="preview-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 class="card-title-manu" style="margin: 0; font-weight: 600; color: #1e40af; border: none;">Xem trước bài viết</h2>
                        <div style="display: flex; gap: 10px;">
                            <button class="preview-btn-small" id="reset-btn" style="color: #64748b; background: white; border: 1px solid #e2e8f0;"><i class="fas fa-undo"></i> Khôi phục</button>
                            <button class="preview-btn-small" id="guide-btn" style="color: #64748b; background: white; border: 1px solid #e2e8f0;"><i class="far fa-file-alt"></i> Hướng dẫn</button>
                        </div>
                    </div>

                    <div class="facebook-post-wrapper">
                        <div class="facebook-post" style="box-shadow: none; border: 1px solid #f0f2f5; max-width: 100%;">
                            <!-- Header -->
                            <div class="post-header">
                                <img src="./images/logo-chat.png" alt="Avatar" class="avatar" style="background: #ef4444; padding: 2px;">
                                <div class="user-info">
                                    <div class="user-name">ROSA AI Computer <i class="fas fa-check-circle" style="color: #1877f2; margin-left: 4px;"></i></div>
                                    <div class="post-time" style="font-size: 12px; color: #65676b;">
                                        <i class="fas fa-globe-americas"></i> Vừa xong
                                    </div>
                                </div>
                                <div class="post-options">
                                    <i class="fas fa-star" style="color: #3b82f6; background: #eeffff; padding: 5px; border-radius: 50%; font-size: 10px;"></i>
                                    <i class="fas fa-ellipsis-h" style="margin-left: 10px;"></i>
                                </div>
                            </div>

                            <!-- Content -->
                            <div class="post-content" id="preview-content" style="padding-top: 0;">
                                ROSA chính thức ra mắt dòng laptop made in Vietnam đầu tiên. Đánh dấu bước đi mới trên hành trình chinh phục công nghệ!
                            </div>

                            <img src="" class="post-image" id="preview-image" alt="Post image" style="display: none; margin-bottom: 10px;">

                            <!-- Stats -->
                            <div class="post-stats" style="border-bottom: none; padding-bottom: 5px;">
                                <span style="font-size: 13px;">1 Bình luận. 46 Lượt chia sẻ</span>
                                <span style="font-size: 13px; margin-left: auto;">361k lượt yêu thích <i class="fas fa-thumbs-up" style="color: white; background: #1877f2; padding: 3px; border-radius: 50%; font-size: 8px;"></i> <i class="fas fa-heart" style="color: white; background: #ef4444; padding: 3px; border-radius: 50%; font-size: 8px;"></i></span>
                            </div>

                            <!-- Actions -->
                            <div class="post-actions" style="border-top: 1px solid #f0f2f5; padding: 10px 0; margin: 0 16px; gap: 15px; justify-content: flex-start;">
                                <div class="action-btn-circle" style="width: 36px; height: 36px; background: #1877f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                                    <i class="fas fa-thumbs-up"></i>
                                </div>
                                <div class="action-btn-circle" style="width: 36px; height: 36px; background: #f0f2f5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #65676b;">
                                    <i class="fas fa-comment-alt"></i>
                                </div>
                                <div class="action-btn-circle" style="width: 36px; height: 36px; background: #f0f2f5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #65676b;">
                                    <i class="fas fa-share"></i>
                                </div>
                            </div>

                            <!-- Comments -->
                            <div class="comment-section" style="padding: 10px 16px; border-top: 1px solid #f0f2f5;">
                                <div class="comment-item" style="display: flex; gap: 10px;">
                                    <img src="./images/icon-people.png" style="width: 32px; height: 32px; border-radius: 50%; filter: grayscale(100%);">
                                    <div class="comment-content">
                                        <div style="background: #f0f2f5; padding: 8px 12px; border-radius: 12px;">
                                            <div style="font-weight: 600; font-size: 13px; color: #050505;">Nguyễn Văn Nam</div>
                                            <div style="font-size: 13px; color: #050505;">Tuyệt vời!</div>
                                        </div>
                                        <div style="display: flex; gap: 10px; font-size: 12px; color: #65676b; margin-top: 4px; margin-left: 4px;">
                                            <span>Thích</span>
                                            <span>Trả lời</span>
                                            <span>2 phút trước</span>
                                        </div>
                                    </div>
                                    <div style="margin-left: auto;">
                                        <i class="fas fa-ellipsis-v" style="color: #65676b; font-size: 12px;"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Configuration Section (Hidden by default) -->
    <div id="config-section" style="display: none; max-width: 800px; margin: 0 auto;">
        <div class="page-header-small" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h1 class="page-title" style="font-size: 24px; font-weight: 600">Thêm cấu hình bài Facebook</h1>
            <a href="#" id="back-list-btn" style="color: #64748b; text-decoration: none; font-size: 14px;">Danh sách cấu hình</a>
        </div>
        <div class="tip-box">
            <img src="./images/icon-meo.png" alt="Tip" class="tip-icon">
            <p><strong>Mẹo:</strong> Mỗi cấu hình sẽ tạo ra phong cách bài viết khác nhau, hãy nghiên cứu và tinh chỉnh phù hợp với nhu cầu của bạn</p>
        </div>

        <!-- Name Input Box -->
        <div class="card" style="margin-bottom: 20px; min-height: auto; padding: 25px 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <div class="form-group" style="margin-bottom: 0;">
                <label style="color: #2563eb; font-weight: 500; font-size: 16px; margin-bottom: 15px; display: block;">Tên cấu hình</label>
                <input type="text" id="config_name_input" placeholder="" class="premium-input" style="width: 100%; border: none; border-bottom: 1px solid #e2e8f0; border-radius: 0; padding: 10px 0; font-size: 15px;">
            </div>
        </div>

        <!-- Main Config Box -->
        <div class="card" style="min-height: auto; padding: 30px;">
            <!-- Lengths -->
            <div class="form-group">
                <label style="font-weight: 500; color: #64748b; font-size: 14px;">Độ dài bài viết</label>
                <div class="custom-select-wrapper">
                    <select id="content_lengths"></select>
                </div>
            </div>

            <!-- Creativeness -->
            <div class="config-row">
                <div class="form-group">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <label for="creativity_level" style="font-weight: 500; color: #64748b; font-size: 14px;">Mức độ sáng tạo</label>
                        <span id="creativity_val" style="background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: 600;">50%</span>
                    </div>
                    <input type="range" id="creativity_level" min="0" max="100" value="50" style="width: 100%; accent-color: #3b82f6;">
                </div>
            </div>

            <!-- Types -->
            <div class="form-group">
                <label for="content_types" style="font-weight: 500; color: #64748b; font-size: 14px;">Loại bài viết</label>
                <div class="custom-select-wrapper">
                    <select id="content_types"></select>
                </div>
            </div>

            <!-- Tones -->
            <div class="config-row">
                <label class="writing-tones" style="font-weight: 500; color: #64748b; font-size: 14px; display: block; margin-bottom: 8px;">Tone giọng</label>
                <div class="custom-select-wrapper">
                    <select id="writing_tones"></select>
                </div>
            </div>

            <!-- 2 Columns: Model & Language -->
            <div class="config-row two-col">
                <div>
                    <label class="bots" style="font-weight: 500; color: #64748b; font-size: 14px; display: block; margin-bottom: 8px;">Model</label>
                    <div class="custom-select-wrapper">
                        <select id="bots"></select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="languages" style="font-weight: 500; color: #64748b; font-size: 14px;">Ngôn ngữ</label>
                    <div class="custom-select-wrapper">
                        <select id="languages"></select>
                    </div>
                </div>
            </div>

            <div style="margin-top: 20px;">
                <!-- Toggles -->
                <div class="toggle-row">
                    <span class="toggle-label" style="color: #64748b;">Đi kèm biểu tượng (emoji):</span>
                    <label class="switch"><input type="checkbox"><span class="slider"></span></label>
                </div>
                <div class="toggle-row">
                    <span class="toggle-label" style="color: #64748b;">Đi kèm thẻ bài viết hashtag:</span>
                    <label class="switch"><input type="checkbox"><span class="slider"></span></label>
                </div>
                <div class="toggle-row">
                    <span class="toggle-label" style="color: #64748b;">Đi kèm hình ảnh:</span>
                    <a style="font-size: 12px; color: #3b82f6; text-decoration: none; margin-left: auto; margin-right: 15px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                        <i class="fas fa-magic"></i> Tao ảnh bằng trợ lý AIS
                    </a>
                    <label class="switch">
                        <input type="checkbox" id="toggle-image" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>

            <!-- Image Upload Group -->
            <div id="modal-image-group" class="image-upload-wrapper" style="margin-top: 10px;">
                <div id="modal-upload-trigger" class="file-upload-wrapper" style="border: 1px solid #e2e8f0; background: white; padding: 12px;">
                    <span class="file-upload-icon"><i class="fas fa-paperclip"></i></span>
                    <span class="file-upload-placeholder" style="margin-left: 10px; font-size:14px; color: #94a3b8;">Duyệt hình ảnh của bạn tại đây</span>
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
</div>

<script src="./js/thanh-dieu-huong.js"></script>
<script src="./js/cau-hinh-facebook.js"></script>