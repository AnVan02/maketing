<?php require "thanh-dieu-huong.php" ?>
<link rel="stylesheet" href="./css/cau-hinh-facebook.css">


<main class="page-body">
    <div id="main-view">
        <div class="page-header">
            <h1 class="page-title">Viết bài Facebook</h1>
            <div class="step-indicator">Bước 1/3</div>
        </div>

        <div class="tip-box" style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center;">
                <img src="./images/icon-meo.png" alt="Tip" class="tip-icon">
                <p><strong>Mẹo: </strong> Nội dung càng rõ ràng, bài Facebook càng dễ chạm đúng người bạn muốn!</p>
            </div>
            <div id="facebook-connection-status" style="font-size: 13px; color: #64748b; background: #f1f5f9; padding: 5px 12px; border-radius: 20px; display: flex; align-items: center; gap: 8px;">
                <i class="fab fa-facebook" style="color: #1877f2;"></i>
                <span id="connected-page-name">Đang kiểm tra kết nối...</span>
            </div>
        </div>

        <div class="grid-layout">
            <!-- Cột trái -->
            <div class="left-column">
                <div class="card basic-info-card">
                    <h2 class="card-title">Thông tin cơ bản</h2>
                    <div class="form-group">
                        <label>Yêu cầu đầu vào: <span style="color:red"> *</span></label>
                        <textarea id="input-idea" placeholder="Ý tưởng của bạn là gì?"></textarea>
                    </div>


                    <div class="form-group">
                        <label for="config_template">Chiến dịch quảng cáo</label>
                        <div class="custom-select-wrapper">
                            <select id="config_template">
                                <option value="">-- Chọn chiến dịch --</option>
                                <option src="facebook.php" value="add-new">+ Thêm mẫu cấu hình</option>
                            </select>
                        </div>
                    </div>

                    <!-- Hẹn giờ bài đăng  -->
                    <div class="toggle-row">
                        <button class="btn-action-schedule" style="background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 4px;">
                            <i class="fas fa-clock"></i> Hẹn giờ bài đăng
                        </button>
                        <div id="scheduleModal" class="custom-modal" style="display: none;">
                            <div class="modal-content" style="width: 400px;">
                                <div class="modal-header">
                                    <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">Hẹn giờ đăng bài</h3>
                                    <button class="close-modal" id="closeScheduleModal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <div class="form-group" style="margin-bottom: 20px;">
                                        <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #475569;">Chọn thời gian đăng:</label>
                                        <input type="datetime-local" id="scheduleTime" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;">
                                        <p style="margin-top: 8px; font-size: 12px; color: #64748b;">Thời gian phải cách ít nhất 15 phút so với hiện tại.</p>
                                    </div>
                                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                                        <button id="cancelSchedule" style="padding: 8px 16px; border-radius: 6px; border: 1px solid #e2e8f0; background: #f8fafc; cursor: pointer; font-size: 14px;">Hủy</button>
                                        <button id="confirmSchedule" style="padding: 8px 16px; border-radius: 6px; border: none; background: #2563eb; color: white; cursor: pointer; font-size: 14px;">Xác nhận</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <!-- Toggles -->
                        <div class="toggle-row">
                            <span class="toggle-label" style="color: #374151;">Đi kèm biểu tượng (emoji):</span>
                            <label class="switch"><input type="checkbox"><span class="slider"></span></label>
                        </div>
                        <div class="toggle-row">
                            <span class="toggle-label" style="color: #374151;">Đi kèm thẻ bài viết hashtag:</span>
                            <label class="switch"><input type="checkbox"><span class="slider"></span></label>
                        </div>
                    </div>

                    <div class="form-group image-toggle-group">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                            <label id="label-image-toggle" class="toggle-label-text" style="margin-bottom: 0;">Đi kèm hình ảnh:</label>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <a href="#" id="ais-assistant-toggle" class="ais-toggle-link" style="font-size: 13px; text-decoration: none; font-weight:500;display: flex; align-items: center; gap: 4px;">
                                    <img src="./images/icon-sua-tt.png" alt=""> Tạo ảnh bằng trợ lý AIS
                                </a>
                                <label class="switch">
                                    <input type="checkbox" id="toggle-image-main" checked>
                                    <span class="slider round"></span>
                                </label>
                            </div>
                        </div>

                        <!-- Image Upload Group -->
                        <div id="main-upload-trigger" class="file-upload-wrapper-premium">
                            <div class="upload-content-wrapper">
                                <div class="upload-icon-box">
                                    <img src="./images/icon-uphinh.png" alt="Upload">
                                </div>
                                <div class="upload-text-box">
                                    <span class="file-upload-placeholder">Kéo thả hoặc <strong>Duyệt hình ảnh</strong></span>
                                    <span class="upload-sub-text">Hỗ trợ JPG, PNG, MP4. Tối đa 100MB</span>
                                </div>
                                <div id="folder-upload-btn" class="folder-btn" title="Tải lên cả thư mục">
                                    <i class="fas fa-folder-plus"></i> Thư mục
                                </div>
                            </div>
                        </div>
                        <input type="file" id="main-file-input" hidden accept="image/*,video/*" multiple>
                        <input type="file" id="folder-input" hidden webkitdirectory directory multiple>

                        <!-- Thêm hàng nhập link ảnh -->
                        <div class="url-upload-row">
                            <input type="text" id="image-url-input" placeholder="Dán link ảnh hoặc video tại đây...">
                            <button type="button" id="add-url-btn">Thêm</button>
                        </div>
                    </div>
                </div>


                <!-- Button Outside Card -->
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="preview-btn-main" id="generate-ai-btn" style="flex: 1; background: #1e40af;">
                        <img src="./images/icon-mui-ten.png" alt=""> Xem trước
                    </button>
                    <button class="preview-btn-main" id="publish-btn" style="flex: 1; background: #1e40af;">
                        <i class="fas fa-paper-plane"></i> Đăng bài
                    </button>
                </div>
            </div>

            <!-- Cột phải -->
            <div class="column right" id="right-panel">
                <div class="card preview-card" id="facebook-preview" style="height: auto; padding-bottom: 135px;">
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
                                <img id="preview-user-avatar" src="./images/trang-face.png" alt="Avatar" class="avatar" style="background: #ef4444; padding: 2px;">
                                <div class="user-info">
                                    <div class="user-name" id="preview-user-name">AIS Maketing <i class="fas fa-check-circle" style="color: #1877f2; margin-left: 10px; font-size: 15px;"></i></div>
                                    <div class="post-time" style="font-size: 14px; color: #65676b;">
                                        <i class="fas fa-globe-americas"></i> Vừa xong
                                    </div>
                                </div>
                                <div class="post-options">
                                    <i class="fas fa-star" style="color: #3b82f6; background: #eeffff; padding: 5px; border-radius: 50%; font-size: 15px;"></i>
                                    <i class="fas fa-ellipsis-h" style="margin-left: 10px;"></i>
                                </div>
                            </div>

                            <!-- Content -->
                            <div class="post-content" id="preview-content" style="padding-top: 0;">
                                Ý tưởng của bạn là gì ?
                            </div>

                            <!-- Image Grid Layer -->
                            <div id="image-grid-container" class="facebook-image-grid" style="display: none;"></div>
                            <img src="" class="post-image" id="preview-image" alt="Post image" style="display: none; margin-bottom: 10px;">

                            <!-- Combined Interaction Row (Buttons Left, Stats Right) -->
                            <div class="post-interaction-row">
                                <!-- Action Buttons on the Left -->
                                <div class="post-actions-premium">
                                    <div class="action-item">
                                        <div class="action-btn-circle" id="btn-like">
                                            <img src="./images/icon-like.png" alt="Like">
                                        </div>
                                    </div>
                                    <div class="action-item">
                                        <div class="action-btn-circle" id="btn-comment">
                                            <img src="./images/icon-binh-luan.png" alt="Comment">
                                        </div>
                                    </div>
                                    <div class="action-item">
                                        <div class="action-btn-circle" id="btn-share">
                                            <img src="./images/icon-share.png" alt="Share">
                                        </div>
                                    </div>
                                </div>

                                <!-- Stats text on the Right -->
                                <div style="display: flex; align-items: center; gap: 10px; margin-left: auto; font-size: 13px; color: #65676b;">
                                    <span id="like-count-text" style="font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
                                        <img src="./images/icon_like.png" alt="like" style="width:50px; height:25px;">
                                        361k lượt yêu thích
                                    </span>
                                    <span>•</span>
                                    <span id="comment-share-stats">2 Bình luận • 46 Lượt chia sẻ</span>
                                </div>
                            </div>

                            <!-- Comments -->
                            <div class="comment-section-premium">
                                <div class="comment-item">
                                    <img src="./images/1.png" class="comment-avatar">
                                    <div class="comment-body">
                                        <div class="comment-bubble">
                                            <div class="comment-user"> ROSA AI COMPUTER <i class="fas fa-check-circle" style="color: #1877f2; margin-left: 4px;"></i></div>
                                            <div class="comment-text">Tuyệt vời!</div>
                                        </div>
                                        <div class="comment-actions">
                                            <span>Thích</span>
                                            <span>Trả lời</span>
                                            <span>2 phút trước</span>
                                        </div>
                                    </div>
                                    <div class="comment-more">
                                        <i class="fas fa-ellipsis-h"></i>
                                    </div>
                                </div>

                                <div class="comment-item">
                                    <img src="./images/icon-people.png" class="comment-avatar">
                                    <div class="comment-body">
                                        <div class="comment-bubble">
                                            <div class="comment-user">Tui khoong cos teen</div>
                                            <div class="comment-text">Tuyệt vời quá!</div>
                                        </div>
                                        <div class="comment-actions">
                                            <span>Thích</span>
                                            <span>Trả lời</span>
                                            <span>2 phút trước</span>
                                        </div>
                                    </div>
                                    <div class="comment-more">
                                        <i class="fas fa-ellipsis-h"></i>
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
                <input id="config_name_input" class="premium-input" placeholder="VD: Blog SEO cơ bản" style="width: 100%; border: none; border-bottom: 1px solid #e2e8f0; border-radius: 0; padding: 10px 0; font-size: 15px;">
            </div>
        </div>

        <!-- Main Config Box -->
        <div class="card" style="min-height: auto; padding: 30px;">
            <div class="form-group">
                <label>Độ dài bài viết</label>
                <div class="custom-select-wrapper">
                    <select id="content_lengths"></select>
                </div>
            </div>

            <!-- Creativeness -->
            <div class="form-group">
                <label>Mức độ sáng tạo</label>
                <div class="slider-wrapper">
                    <input type="range" id="creativity_level" min="0" max="100" class="premium-slider">
                </div>
            </div>

            <!-- Types -->
            <div class="form-group">
                <label>Loại bài viết</label>
                <div class="custom-select-wrapper">
                    <select id="content_types"></select>
                </div>
            </div>


            <!-- Tones -->
            <div class="config-row">
                <label>Tone giọng</label>
                <div class="custom-select-wrapper">
                    <select id="writing_tones"></select>
                </div>
            </div>

            <!-- 2 Columns: Model & Language -->
            <div class="config-row two-col">
                <div>
                    <label>Model</label>
                    <div class="custom-select-wrapper">
                        <select id="bots"></select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Ngôn ngữ</label>
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
                    <span class="toggle-label" style="color: #64748b;">Upload hình ảnh:</span>
                    <a id="ais-assistant-toggle-modal" style="font-size: 12px; color: #3b82f6; text-decoration: none; margin-left: auto; margin-right: 15px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                        <i class="fas fa-magic"></i> Tao ảnh bằng trợ lý AIS
                    </a>
                    <label class="switch">
                        <input type="checkbox" id="toggle-image" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
                <!-- Thêm Toggle đặt làm mặc định -->
                <div class="toggle-row">
                    <span class="toggle-label" style="color: #64748b;">Đặt làm cấu hình mặc định:</span>
                    <label class="switch">
                        <input type="checkbox" id="is_default">
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
        </div>

        <div class="form-group image-toggle-group">
            <!-- Image Upload Group -->
            <!-- <div id="modal-upload-trigger" class="file-upload-wrapper-premium">
                <span class="file-upload-icon"><i class="fas fa-photo-video"></i></span>
                <span class="file-upload-placeholder">Duyệt hình ảnh của bạn tại đây</span>
            </div>
            <input type="file" id="modal-file-input" hidden accept="image/*,video/*" multiple> -->

            <div style="text-align: center; margin-top: 30px;">
                <button id="save-config-btn" class="save-config-btn">LƯU CẤU HÌNH</button>
            </div>
        </div>
    </div>
    </div>
</main>


<!-- AI Image Generation Modal -->
<div id="aiImageModal" class="modal-premium" style="display: none; position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); align-items: center; justify-content: center;">
    <div class="modal-content" style="background: white; padding: 30px; border-radius: 12px; width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Trợ lý AIS Tạo Ảnh</h2>
            <span id="closeAiImageModal" style="cursor: pointer; font-size: 24px; color: #94a3b8;">&times;</span>
        </div>
        <div class="form-group" style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Mô tả hình ảnh bạn muốn:</label>
            <textarea id="aiImagePrompt" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; height: 100px; resize: none;" placeholder="VD: Một cô gái đang sử dụng máy tính AI trong văn phòng hiện đại, phong cách ảnh thực tế..."></textarea>
        </div>
        <div id="aiImageResult" style="margin-bottom: 20px; display: none; text-align: center;">
            <div id="generatedImagesList" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;"></div>
            <p style="font-size: 12px; color: #64748b; margin-top: 10px;">Click vào ảnh để chọn</p>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="generateAiImageBtn" class="btn-primary-ai" style="padding: 10px 20px;">
                <i class="fas fa-magic"></i> Bắt đầu tạo
            </button>
        </div>
    </div>
</div>

<!-- Lightbox Modal -->
<div id="lightbox-modal" class="lightbox">
    <span class="close-lightbox">&times;</span>
    <img class="lightbox-content" id="lightbox-img">
    <div id="lightbox-caption"></div>
</div>

<!-- Các script khác -->
<script src="./js/api-helper.js"></script>
<script src="./js/cau-hinh-facebook.js"></script>
<script src="./js/tong-hop.js"></script>

</div>
</div>

</body>

</html>