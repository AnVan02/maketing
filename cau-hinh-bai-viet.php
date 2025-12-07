<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <title>Cấu hình bài viết - AI SEO Tool</title>
    <link rel="stylesheet" href="cau-hinh-bai-viet.css">
</head>

<body>
    <div class="app-container">
        <!-- Top Header (Full Width) -->
        <header class="top-header">
            <div class="header-left">
                <button class="menu-toggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <div class="logo">
                    <img src="./assets/image/AIS.png" alt="">
                </div>
            </div>

            <div class="header-center">
                <nav class="top-nav">
                    <a href="#" class="active">AI SEO</a>
                    <a href="#">AI Social Media</a>
                    <a href="#">Bảng giá</a>
                    <a href="#">Hướng dẫn</a>
                    <a href="#">Liên hệ</a>
                </nav>
            </div>

            <div class="header-right">
                <a href="#" class="header-action"><span class="icon">📄</span> Chọn từ mẫu</a>
                <a href="#" class="header-action" id="saveDraft"><span class="icon">�</span> Lưu nháp</a>
                <div class="user-avatar">
                    <img src="../assets/image/chibi.jpg" alt="Avatar">
                </div>
            </div>
        </header>

        <!-- Body Container (Sidebar + Content) -->
        <div class="app-body">
            <!-- Sidebar -->
            <aside class="sidebar">
                <nav class="sidebar-nav">
                    <div class="nav-group">
                        <a href="#" class="nav-item active">
                            <span class="icon"></span> AI SEO
                        </a>
                        <a href="#" class="nav-item">
                            <span class="icon">✍️</span> Viết bài SEO
                        </a>
                        <a href="#" class="nav-item">
                            <span class="icon">�</span> Viết chuỗi bài SEO
                        </a>
                        <a href="#" class="nav-item">
                            <span class="icon">📋</span> Danh sách bài viết
                        </a>
                        <a href="#" class="nav-item">
                            <span class="icon">🔍</span> Phân tích từ khóa
                        </a>
                        <a href="#" class="nav-item">
                            <span class="icon">⚙️</span> Mẫu cấu hình
                        </a>
                    </div>

                    <div class="nav-group">
                        <div class="nav-label">AI Facebook</div>
                        <a href="#" class="nav-item">
                            <span class="icon">📱</span> Viết bài Facebook
                        </a>
                        <a href="#" class="nav-item">
                            <span class="icon">📋</span> Danh sách bài viết
                        </a>
                        <a href="#" class="nav-item">
                            <span class="icon">⚙️</span> Mẫu cấu hình
                        </a>
                    </div>

                    <div class="nav-group mt-auto">
                        <a href="#" class="nav-item"><span class="icon">🧩</span> Tích hợp</a>
                        <a href="#" class="nav-item"><span class="icon">�</span> Tài liệu</a>
                        <a href="#" class="nav-item"><span class="icon">⚙️</span> Thiết đặt</a>
                    </div>
                </nav>
            </aside>

            <!-- Main Content Area -->
            <main class="content-area">
                <div class="page-header">
                    <h1 class="page-title">Cấu hình bài viết</h1>
                    <div class="step-indicator">Bước 1/3</div>
                </div>

                <div class="tip-box">
                    <span class="tip-icon">💡</span>
                    <span class="tip-text">Mẹo: Từ khóa chính càng cụ thể, AI sẽ tạo nội dung càng phù hợp với mục tiêu SEO của bạn.</span>
                </div>

                <div class="grid-layout">
                    <!-- Left Column -->
                    <div class="column left">
                        <section class="card basic-info">
                            <h2 class="card-title">Thông tin cơ bản</h2>
                            <div class="card-header">
                                <div class="tabs">
                                    <button class="tab active" data-tab="internet">🌐 Nguồn Internet</button>
                                    <button class="tab" data-tab="private">📁 Dữ liệu riêng</button>
                                </div>
                            </div>

                            <div class="tab-content-container">
                                <!-- Internet Tab -->
                                <div class="content" id="internet">
                                    <div class="form-group">
                                        <label>Từ khóa chính <span class="required">*</span></label>
                                        <div class="input-wrapper">
                                            <input type="text" id="internet_user_query" placeholder="VD: máy tính AI cho doanh nghiệp...">
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label>Từ khóa phụ</label>
                                        <input type="text" id="internet_secondaryKeyword" placeholder="Nhập từ khóa và nhấn Enter để thêm">
                                        <div class="tag-container" id="internet_tagContainer"></div>
                                    </div>

                                    <div class="form-group">
                                        <label>Tiêu đề bài viết</label>
                                        <input type="text" id="articleTitle_internet" placeholder="Nhập tiêu đề">
                                    </div>
                                </div>

                                <!-- Private Tab -->
                                <div class="content active" id="private">
                                    <div class="form-group">
                                        <label>Từ khóa chính <span class="required">*</span></label>
                                        <div class="input-wrapper">
                                            <input type="text" id="user_query" placeholder="VD: máy tính AI cho doanh nghiệp..." required>
                                        </div>
                                    </div>

                                    <div class="subtabs-wrapper">
                                        <div class="subtabs">
                                            <button class="sub active" data-sub="file">Tải file</button>
                                            <button class="sub" data-sub="text">Nhập văn bản</button>
                                            <button class="sub" data-sub="link">Link sản phẩm</button>
                                        </div>
                                    </div>

                                    <input type="file" id="file-selector" multiple hidden
                                        accept="application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">

                                    <div id="subtab-content-area" class="subtab-content"></div>
                                    <div class="uploaded-file-list-outside"></div>

                                    <div class="form-group">
                                        <label>Từ khóa phụ</label>
                                        <input type="text" id="secondaryKeyword" placeholder="Nhập từ khóa và nhấn Enter để thêm">
                                        <div class="tag-container" id="tagContainer"></div>
                                    </div>

                                    <div class="form-group">
                                        <label>Tiêu đề bài viết</label>
                                        <div class="input-with-button">
                                            <input type="text" id="articleTitle" placeholder="Nhập tiêu đề">
                                            <!-- AI Suggest Button hidden or styled minimally if needed -->
                                            <button type="button" class="ai-suggest-btn" id="aiSuggestBtn" style="display:none;">🤖</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="card content-config">
                            <h2 class="card-title">Cấu hình nội dung</h2>

                            <div class="form-group">
                                <label>Độ dài bài viết</label>
                                <select id="article_length" class="custom-select">
                                    <option value="1200">Ngắn (800-1200 từ)</option>
                                    <option value="2000">Trung bình (1200-2000 từ)</option>
                                    <option value="3000">Dài (2000-3000 từ)</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Loại bài viết</label>
                                <select id="content_types" class="custom-select"></select>
                            </div>

                            <div class="form-group">
                                <label>Tone giọng</label>
                                <select id="writing_tones" class="custom-select"></select>
                            </div>

                            <div class="form-row">
                                <div class="form-group half">
                                    <label>Model</label>
                                    <select id="bots" class="custom-select"></select>
                                </div>
                                <div class="form-group half">
                                    <label>Ngôn ngữ</label>
                                    <select id="languages" class="custom-select"></select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Hướng dẫn đặc biệt</label>
                                <textarea id="custom_instructions" rows="2" placeholder="Nhập các yêu cầu đặc biệt..."></textarea>
                            </div>
                            <button class="generate-btn" id="generateBtn">
                                Tạo dàn ý bài viết <span style="margin-left: 5px;">→</span>
                            </button>

                        </section>
                    </div>

                    <!-- Right Column -->
                    <div class="column right">
                        <div class="video-placeholder">
                            <button class="guide-btn">Hướng dẫn</button>
                            <div class="play-button">▶</div>
                            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Video Thumbnail" class="video-thumb">
                        </div>

                        <div class="preview-text">
                            <h3>Dàn ý của bạn sẽ hiển thị tại đây</h3>
                            <p>Công cụ AI được thiết kế để tạo nhiều dạng nội dung khác nhau với chất lượng ổn định và đáng tin cậy.</p>
                        </div>

                        <!-- Hidden preview structure to keep JS happy if it tries to update it, or we update JS -->
                        <div id="previewLength" style="display:none;"></div>

                        <div class="loading" id="loading" style="display: none; text-align: center; margin: 20px 0;">
                            <div class="spinner"></div>
                            <p>Đang tạo bài viết...</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <div class="tooltip" id="tooltip"></div>
    <script src="khoi-tao-bai-viet.js"></script>
    <script src="cau-hinh-bai-viet.js"></script>
    <script src="nghien-cuu-bai-viet.js"></script>
</body>

</html>