<?php $hideHeaderActions = false; ?>
<?php include 'thanh-dieu-huong.php'; ?>

<!-- Content Specific CSS -->
<link rel="stylesheet" href="./css/viet-bai-seo.css">
<link rel="stylesheet" href="./css/thanh-dieu-huong.css">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<div class="main-content">
    <div class="page-header">
        <div class="header-left">
            <h1 class="page-title">Cấu hình bài viết</h1>
        </div>
        <div class="header-right">
            <!-- <button onclick="ContentGeneration()" class="btn-primary-ai" style="padding: 10px 20px; background: #4F46E5; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-right: 15px; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-magic"></i>Viết bài AI
            </button> -->
            <span class="step-indicator">Bước 3/3</span>
        </div>
    </div>

    <meta name="description" content="" />
    <div class="tip-bar">
        <span class="tip-icon"><img src="./images/icon-meo.png" alt=""></span>
        <span class="tip-text"><b>Mẹo:</b> Từ khóa chính càng cụ thể, AI sẽ tạo nội dung càng phù hợp với mục tiêu SEO của bạn.</span>
    </div>

    <div class="editor-container">
        <!-- Cột trái: Editor -->
        <div class="editor-main">
            <div class="articleTitle">
                <textarea id="articleTitle" class="article-title-input" placeholder="Tiêu đề bài viết..."></textarea>
            </div>

            <!-- Toolbar -->
            <div class="editor-toolbar">
                <div class="toolbar-group">
                    <button class="tool-btn"><i class="fas fa-undo"></i></button>
                    <button class="tool-btn"><i class="fas fa-redo"></i></button>
                </div>

                <div class="toolbar-separator"></div>

                <div class="toolbar-group">
                    <select class="font-family-select">
                        <option value="Arial">Arial</option>
                        <option value="Inter">Inter</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Montserrat">Montserrat</option>
                    </select>

                    <select class="font-size-select">
                        <option value="1">8</option>
                        <option value="2">10</option>
                        <option value="3">12</option>
                        <option value="4">14</option>
                        <option value="5">18</option>
                        <option value="6">24</option>
                        <option value="7">36</option>
                    </select>
                </div>

                <div class="toolbar-separator"></div>

                <div class="toolbar-group">
                    <button class="tool-btn" data-command="bold" title="In đậm"><i class="fas fa-bold"></i></button>
                    <button class="tool-btn" data-command="italic" title="In nghiêng"><i class="fas fa-italic"></i></button>
                    <button class="tool-btn" data-command="underline" title="Gạch chân"><i class="fas fa-underline"></i></button>
                    <button class="tool-btn" data-command="strikeThrough" title="Gạch ngang"><i class="fas fa-strikethrough"></i></button>
                </div>

                <div class="toolbar-separator"></div>

                <div class="toolbar-group">
                    <button class="tool-btn" data-command="justifyLeft" title="Căn trái"><i class="fas fa-align-left"></i></button>
                    <button class="tool-btn" data-command="justifyCenter" title="Căn giữa"><i class="fas fa-align-center"></i></button>
                    <button class="tool-btn" data-command="justifyRight" title="Căn phải"><i class="fas fa-align-right"></i></button>
                    <button class="tool-btn" data-command="justifyFull" title="Căn đều"><i class="fas fa-align-justify"></i></button>
                </div>

                <div class="toolbar-separator"></div>

                <div class="toolbar-group">

                    <button class="tool-btn" data-command="insertOrderedList" title="Danh sách số"><i class="fas fa-list-ol"></i></button>
                    <button class="tool-btn" data-command="insertUnorderedList" title="Danh sách gạch đầu dòng"><i class="fas fa-list-ul"></i></button>
                    <button class="tool-btn" data-command="indent" title="Thụt lề phải"><i class="fas fa-indent"></i></button>
                    <button class="tool-btn" data-command="outdent" title="Thụt lề trái"><i class="fas fa-outdent"></i></button>
                </div>

                <div class="toolbar-separator"></div>
                <div class="toolbar-group">
                    <button class="tool-btn" data-command="createLink" title="Chèn liên kết"><i class="fas fa-link"></i></button>
                    <button class="tool-btn" id="insertImageBtn" title="Chèn ảnh"><i class="far fa-image"></i></button>
                </div>

                <div class="toolbar-color">
                    <input type="color" id="fontColorPicker" title="Màu chữ">
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
                <textarea style="width: 100%; border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; font-family: 'Montserrat'; font-size: 14px; min-height: 80px; resize: none; outline: none;" placeholder="Mô tả ngắn..."></textarea>
            </div>

            <!-- FIX 2: Thêm input ẩn để lưu toàn bộ nội dung HTML -->
            <input type="hidden" id="article-contens">
        </div>

        <!-- Cột phải: Sidebar -->
        <div class="editor-sidebar">
            <div class="sidebar-tabs">
                <button class="tab-btn active" data-tab="media"><img src="./images/icon-media.png" alt="" style="width: 14px; height: 14px;">Media</button>
                <button class="tab-btn" data-tab="smart-edit"><img src="./images/icon-sua-tt.png" alt="" style="width: 14px; height: 14px;">Sữa thông minh</button>
            </div>
            <div id="smart-edit-tab" class="tab-content active">
                <div class="ai-chat-area">
                    <div class="chat-history" id="chat-history" style="flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 10px;">
                        <div class="ai-message">
                            <div class="ai-avatar"><img src="./images/1.png" alt="AI"></div>
                            <div class="message-bubble">Tôi đã đọc hiểu nội dung bài viết. Bạn cần hỗ trợ gì về nội dung này không?</div>
                        </div>
                    </div>

                    <div class="chat-input-wrapper">
                        <input type="text" id="smart-edit-input" placeholder="Hỏi về bài viết hoặc yêu cầu chỉnh sửa...">
                        <button class="send-btn" id="smart-edit-send-btn"><img src="./images/icon-gui.png" alt=""></button>
                    </div>
                </div>
            </div>

            <div id="media-tab" class="tab-content">
                <div class="image-search-box" style="margin-bottom: 15px; position: relative;">
                    <input type="text" id="imageSearchInput" placeholder="Tìm hình theo từ khóa (vd:máy tính ai)" style="width: 100%; padding: 12px 12px 12px 35px; border: 1px solid #E2E8F0; border-radius: 8px; outline: none; font-size: 14px;">
                    <i class="fas fa-search" style="position: absolute; left: 12px; top: 14px; color: #94A3B8;"></i>
                </div>

                <div id="searchLoading" style="text-align:center; padding:30px; display:none;">
                    <i class="fas fa-spinner fa-spin fa-2x" style="color:#4F46E5;"></i>
                    <p style="margin-top:10px; color:#666;">Đang tìm kiếm ảnh đẹp từ Pexels...</p>
                </div>

                <div class="image-grid" id="imageGrid">
                    <p style="grid-column: 1 / -1; text-align:center; color:#9CA3AF; padding:40px;">
                        Nhập từ khóa và nhấn Enter để tìm hàng triệu ảnh miễn phí chất lượng cao!
                    </p>
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

        <!-- Small Floating Trigger for Selection -->
        <div id="ai-floating-trigger" class="ai-floating-trigger" style="display: none;">
            <src width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                <path d="M12 12L2.7 16.5" />
                <path d="M12 12l8.5 4.5" />
                <path d="M12 12V21" />
            </src>
        </div>

        <!-- Floating AI Chat Popup for Selection -->
        <div id="ai-selection-popup" class="ai-selection-popup" style="display: none;">
            <div class="popup-header">
                <span class="popup-title"><img src="./images/logo_chat.png" alt=""></span>
            </div>

            <div class="popup-body">
                <div id="popup-content-preview" class="popup-content-preview"></div>
                <div class="popup-actions-links">
                    <span class="popup-link" id="popup-copy-btn">Sao chép</span>
                    <span class="popup-link" id="popup-replace-btn">Thay vào bài viết</span>
                </div>
            </div>

            <div class="popup-footer">
                <div class="popup-input-wrapper">
                    <input type="text" id="popup-chat-input" placeholder="Viết lại đoạn này theo phong cách chuyên nghiệp, chuẩn SEO...">
                    <button id="popup-send-btn" class="popup-send-btn"><img src="./images/icon-gui.png" alt=""></button>
                </div>
            </div>
        </div>
    </div>
    <script src="./js/viet-bai-seo.js"></script>
    </body>

    </html>