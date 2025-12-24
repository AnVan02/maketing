<?php $hideHeaderActions = false; ?>
<?php include 'thanh-dieu-huong.php'; ?>

<!-- Content Specific CSS -->
<link rel="stylesheet" href="./css/viet-bai-seo.css">
<link rel="stylesheet" href="./css/thanh-dieu-huong.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<div class="main-content">
    <div class="page-header">
        <div class="header-left">
            <h1 class="page-title">Cấu hình bài viết</h1>
        </div>
        <div class="header-right">
            <span class="step-indicator">Bước 3/3</span>
        </div>
    </div>

    <div class="tip-bar">
        <span class="tip-icon"><img src="./images/icon-meo.png" alt=""></span>
        <span class="tip-text"><b>Mẹo:</b> Từ khóa chính càng cụ thể, AI sẽ tạo nội dung càng phù hợp với mục tiêu SEO của bạn.</span>
    </div>

    <div class="editor-container">
        <!-- Cột trái: Editor -->
        <div class="editor-main">
            <div class="short-description-section">
                <textarea id="articleTitle" class="article-title-input" placeholder="Tiêu đề bài viết..."></textarea>
            </div>

            <!-- Toolbar -->
            <div class="editor-toolbar">
                <div class="toolbar-group">
                    <button class="tool-btn"><i class="fas fa-undo"></i></button>
                    <button class="tool-btn"><i class="fas fa-redo"></i></button>
                    <button class="tool-btn"><i class="fas fa-font"></i></button>
                </div>

                <div class="toolbar-separator"></div>
                <div class="toolbar-group">
                    <button class="tool-btn"><i class="fas fa-bold"></i></button>
                    <button class="tool-btn"><i class="fas fa-italic"></i></button>
                    <button class="tool-btn"><i class="fas fa-link"></i></button>
                    <button class="tool-btn"><i class="far fa-image"></i></button>
                </div>
            </div>

            <!-- Nơi hiển thị nội dung chi tiết -->
            <div id="sectionsContainer" class="sections-container">
                <div style="text-align: center; color: #9CA3AF; padding: 40px;">
                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                    <p style="margin-top: 10px;">Đang phân tích và tải dữ liệu...</p>
                </div>
            </div>

            <!-- FIX 1: Thêm class short-description-section -->
            <div class="short-description-section" style="margin-top: 20px;">
                <label style="font-weight: 600; margin-bottom: 8px; display: block;">Mô tả ngắn:</label>
                <textarea style="width: 100%; border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; font-family: 'Inter'; font-size: 14px; min-height: 80px; resize: none; outline: none;" placeholder="Mô tả ngắn..."></textarea>
            </div>

            <!-- FIX 2: Thêm input ẩn để lưu toàn bộ nội dung HTML -->
            <input type="hidden" id="article-contens">
        </div>

        <!-- Cột phải: Sidebar -->
        <div class="editor-sidebar">
            <div class="sidebar-tabs">
                <button class="tab-btn active" data-tab="media"><img src="./images/icon-media.png" alt="" style="width: 14px; height: 14px;">Media</button>
                <button class="tab-btn" data-tab="smart-edit"><img src="./images/icon-sua-tt.png" alt="" style="width: 14px; height: 14px;"> Smart Edit</button>
            </div>

            <div id="smart-edit-tab" class="tab-content active">
                <div class="ai-chat-area">
                    <div class="ai-message">
                        <div class="ai-avatar"><img src="./images/1.png" alt="AI"></div>
                        <div class="message-bubble">Tôi đã tối ưu nội dung theo chuẩn SEO. Bạn có muốn chỉnh sửa gì không?</div>
                    </div>

                    <div class="chat-input-wrapper">
                        <input type="text" placeholder="Nhập yêu cầu chỉnh sửa...">
                        <button class="send-btn"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>

            <div id="media-tab" class="tab-content">
                <div class="image-search-box" style="margin-bottom: 15px; position: relative;">
                    <input type="text" id="imageSearchInput" placeholder="Tìm hình theo từ khóa" style="width: 89%; padding: 10px 10px 10px 35px; border: 1px solid #E2E8F0; border-radius: 8px; outline: none;">
                    <i class="fas fa-search" style="position: absolute; left: 12px; top: 12px; color: #94A3B8;"></i>
                </div>
                <div class="image-grid" id="imageGrid">
                    <!-- Images will be here -->
                </div>
            </div>

            <div class="sidebar-accordion">
                <div class="accordion-header" onclick="toggleAccordion(this)">
                    <span class="chevron"><img src="./images/icon-nha-xuong.png" alt=""></span>
                    <span class="accordion-title">Nguồn tham khảo</span>
                    <span class="source-count">0 nguồn</span>
                </div>
                <div class="accordion-content"></div>
            </div>

            <div class="sidebar-accordion">
                <div class="accordion-header" onclick="toggleAccordion(this)">
                    <span class="chevron"><img src="./images/icon-nha-xuong.png" alt=""></span>
                    <span class="accordion-title">Đánh giá SEO</span>
                    <span class="seo-score">0 điểm</span>
                </div>
                <div class="accordion-content"></div>
            </div>
        </div>
    </div>
</div>
<script src="./js/viet-bai-seo.js"></script>
</body>

</html>