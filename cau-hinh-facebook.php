<?php require "thanh-dieu-huong.php" ?>
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
                <div class="card basic-info-card">
                    <h2 class="card-title">Thông tin cơ bản</h2>
                    <div class="form-group">
                        <label>Yêu cầu đầu vào: <span style="color:red"> *</span></label>
                        <textarea id="input-idea" placeholder="Ý tưởng của bạn là gì?">Tri ân Ngày Nhà giáo Việt Nam</textarea>
                    </div>


                    <div class="form-group">
                        <label for="config_template">Chiến dịch quảng cáo</label>
                        <div class="custom-select-wrapper">
                            <select id="config_template">
                                <option value="tin-tuc-seo">Chiến dịch quảng cáo </option>
                                <option value="bai-chuyen-sau">Bài chuyên sâu</option>
                                <option src="facebook.php" value="add-new">+ Thêm mẫu cấu hình</option>
                            </select>
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
                    </div>

                    <div class="form-group image-toggle-group">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                            <label style="margin-bottom: 0;">Đi kèm hình ảnh:</label>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <a href="#" style="font-size: 15px; color: #3b82f6; text-decoration: none; font-weight: 600;display: flex; align-items: center; gap: 4px;">
                                    <img src="./images/icon-sua-tt.png" alt=""> Tạo ảnh bằng trợ lý AIS
                                </a>
                                <label class="switch">
                                    <input type="checkbox" id="toggle-image-main" checked>
                                    <span class="slider round"></span>
                                </label>

                            </div>
                        </div>

                        <div id="main-upload-trigger" class="file-upload-wrapper-premium">
                            <span class="file-upload-icon"><i class="fas fa-paperclip"></i></span>
                            <span class="file-upload-placeholder" style="margin-right: 8px">Duyệt hình ảnh của bạn tại đây</span>
                        </div>
                        <input type="file" id="main-file-input" hidden accept="image/*" multiple>
                    </div>
                </div>
                <!-- Button Outside Card -->
                <button class="preview-btn-main" id="preview-btn">Xem trước <i class="fas fa-arrow-right"></i></button>
            </div>

            <!-- Cột phải -->
            <div class="column right" id="right-panel">
                <div class="card preview-card" id="facebook-preview" style="height: auto; padding-bottom: 30px;">
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
                                <img src="./images/trang-face.png" alt="Avatar" class="avatar" style="background: #ef4444; padding: 2px;">
                                <div class="user-info">
                                    <div class="user-name">AIS Maketing <i class="fas fa-check-circle" style="color: #1877f2; margin-left: 10px; font-size: 15px;"></i></div>
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

                            <!-- Stats -->
                            <div class="post-stats" style="border-bottom: none; padding-bottom: 5px;">
                                <span style="font-size: 13px;">2 Bình luận. 46 Lượt chia sẻ</span>
                                <span class="likes">
                                    <span id="like-text">361k lượt yêu thích</span>
                                    <img src="./images/icon_like.png" alt="Like">
                                </span>
                            </div>

                            <!-- Actions -->
                            <div class="post-actions-premium">
                                <div class="action-item">
                                    <div class="action-btn-circle active" id="btn-like">
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
            <h1 class="page-title" style="font-size: 24px; font-weight: 600;">Thêm cấu hình bài Facebook</h1>
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
            <div class="form-group">
                <label>Mức độ sáng tạo</label>
                <div class="slider-wrapper">
                    <span id="creativity_val" class="slider-value-badge">50%</span>
                    <input type="range" id="creativity_level" min="0" max="100" value="100" class="premium-slider">
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
                <input type="file" id="modal-file-input" hidden accept="image/*" multiple>
            </div>
        </div>


        <!-- Button -->
        <div style="text-align: center; margin-top: 30px;">
            <button id="save-config-btn" class="save-config-btn">LƯU CẤU HÌNH</button>
        </div>
    </div>
</main>

<!-- Lightbox Modal -->
<div id="lightbox-modal" class="lightbox">
    <span class="close-lightbox">&times;</span>
    <img class="lightbox-content" id="lightbox-img">
    <div id="lightbox-caption"></div>
</div>

<!-- Các script khác -->

<script src="./js/cau-hinh-facebook.js"></script>


<script>
    // Script xử lý chuyển đổi giữa trang chính và trang cấu hình
    (function() {
        const configSelect = document.getElementById('config_template');
        const mainView = document.getElementById('main-view');
        const configSection = document.getElementById('config-section');
        const backListBtn = document.getElementById('back-list-btn');

        if (configSelect) {
            configSelect.addEventListener('change', function() {
                if (this.value === 'add-new') {
                    if (mainView) mainView.style.display = 'none';
                    if (configSection) {
                        configSection.style.display = 'block';
                        const pageBody = document.querySelector('.page-body');
                        if (pageBody) {
                            pageBody.scrollTo({
                                top: 0,
                                behavior: 'smooth'
                            });
                        }
                    }
                    this.value = 'tin-tuc-seo';
                }
            });
        }

        if (backListBtn) {
            backListBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (configSection) configSection.style.display = 'none';
                if (mainView) {
                    mainView.style.display = 'block';
                    const pageBody = document.querySelector('.page-body');
                    if (pageBody) {
                        pageBody.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }
    })();
</script>

</div> <!-- Close app-body -->
</div> <!-- Close app-container -->

</body>

</html>