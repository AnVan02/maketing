<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">
    <link href="./assets/css/cau-hinh-bai-viet.css" rel="stylesheet">
    <title>Cấu hình bài viết - AI SEO Tool</title>
</head>

<body>
    <header class="main-header">
        <div class="logo">
            <img src="../assets/image/AIS.png" alt="">
        </div>
        <nav class="main-nav">
            <a href="#">Trang chủ</a>
            <a href="#">Viết bài mới</a>
        </nav>
        <div class="user-info">
            <a href="#" id="saveDraft">Lưu nháp</a>
            <div class="avatar">
                <img src="../assets/image/chibi.jpg" alt="">
            </div>
        </div>
    </header>

    <main class="container">
        <h1 class="page-title">Cấu hình bài viết</h1>
        <div class="step-indicator">Bước 1/3</div>

        <div class="tip-box">
            <span class="tip-icon">
                <img src="meo.png" alt="Mẹo">
                Mẹo: Từ khóa chính càng cụ thể, AI sẽ tạo nội dung càng phù hợp với mục tiêu SEO của bạn.
            </span>
        </div>

        <div class="content-wrapper">
            <div class="column left-column">

                <section class="card basic-info">
                    <h2 class="card-title">Thông tin cơ bản</h2>

                    <div class="tabs">
                        <button class="tab" data-tab="internet">🌐 Nguồn Internet</button>
                        <button class="tab active" data-tab="private">📁 Dữ liệu riêng</button>
                    </div>
                    <div class="tab-content">
                        <div class="content active" id="private">
                            <!-- THÊM INPUT TỪ KHÓA CHÍNH -->
                            <div class="form-group">
                                <label>Từ khóa chính *</label>
                                <div class="input-with-icon">
                                    <input type="text" id="user_query" placeholder="Nhập từ khóa chính..." required>
                                    <div class="info-icon" data-tooltip="Từ khóa chính cho bài viết">i</div>
                                </div>
                            </div>

                            <div class="subtabs">
                                <button class="sub active" data-sub="file">Tải file</button>
                                <button class="sub" data-sub="text">Nhập văn bản</button>
                                <button class="sub" data-sub="link">Link sản phẩm</button>
                            </div>

                            <input type="file" id="file-selector" multiple hidden
                                accept="application/pdf, 
                                        application/vnd.openxmlformats-officedocument.wordprocessingml.document, 
                                        application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">

                            <!-- VÙNG HIỂN THỊ NỘI DUNG SUBTAB -->
                            <div id="subtab-content-area">
                                <!-- Nội dung sẽ được render động ở đây -->
                            </div>

                            <!-- VÙNG HIỂN THỊ FILE LIST (bên ngoài) -->
                            <div class="uploaded-file-list-outside"></div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Từ khóa phụ</label>
                        <input type="text" id="secondaryKeyword" placeholder="Nhập từ khóa và nhấn Enter để thêm">
                        <div class="tag-container" id="tagContainer">
                            <!-- Tags sẽ được thêm động -->
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Tiêu đề bài viết (tùy chọn)</label>
                        <div class="input-with-button">
                            <input type="text" id="articleTitle" placeholder="Nhập tiêu đề hoặc để AI gợi ý">
                            <button type="button" class="ai-suggest-btn" id="aiSuggestBtn">
                                <img src="../assets/image/ico.png" alt="">Gợi ý bằng AI
                            </button>
                        </div>
                    </div>
                </section>

                <section class="card content-config">
                    <h2 class="card-title">Cấu hình nội dung</h2>

                    <div class="form-group">
                        <label>Loại bài viết *</label>
                        <select id="content_type" required>
                            <option value="">Đang tải cấu hình...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Tone giọng *</label>
                        <select id="writing_tone" required>
                            <option value="">Đang tải cấu hình...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Ngôn ngữ *</label>
                        <select id="language" required>
                            <option value="">Đang tải cấu hình...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>AI Model *</label>
                        <select id="bot" required>
                            <option value="">Đang tải cấu hình...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Độ dài bài viết (số từ)</label>
                        <input type="number" id="article_length" value="1200" min="500" max="5000" step="100">
                    </div>
                </section>

                <section class="advanced-options" id="advancedToggle">
                    <h2 class="card-title">Tùy chọn nâng cao</h2>
                    <span class="dropdown-arrow"></span>
                </section>
                <div class="advanced-content" id="advancedContent">
                    <section class="card">
                        <div class="form-group">
                            <label>Hướng dẫn đặc biệt</label>
                            <textarea id="custom_instructions" rows="3" placeholder="Nhập các yêu cầu đặc biệt cho AI..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>SEO Meta Description</label>
                            <textarea id="metaDescription" rows="2" placeholder="Mô tả ngắn cho công cụ tìm kiếm"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Thêm liên kết nội bộ (mỗi dòng 1 link)</label>
                            <textarea id="internalLinks" rows="2" placeholder="https://example.com/page1&#10;https://example.com/page2"></textarea>
                        </div>
                    </section>
                </div>
            </div>

            <div class="column right-column">
                <section class="card preview-structure">
                    <h2 class="card-title">Xem trước cấu trúc</h2>

                    <div class="preview-item">
                        <label>Độ dài dự kiến</label>
                        <p class="value" id="previewLength">1200 từ</p>
                    </div>

                    <div class="preview-item">
                        <label>Cấu trúc dự kiến</label>
                        <ul class="structure-list" id="previewStructure">
                            <li><span class="bullet"></span> Phần mở đầu (150-200 từ)</li>
                            <li><span class="bullet"></span> 5-6 phần nội dung chính</li>
                            <li><span class="bullet"></span> Case study & Ví dụ</li>
                            <li><span class="bullet"></span> Kết luận và CTA</li>
                        </ul>
                    </div>

                    <div class="preview-item">
                        <label>Tone giọng mẫu</label>
                        <p class="quote" id="previewTone">"Trong thời đại công nghệ 4.0, việc ứng dụng AI vào doanh nghiệp không chỉ là xu hướng mà đã trở thành yếu tố quyết định."</p>
                    </div>

                    <div class="preview-item">
                        <label>AI Model</label>
                        <p class="value" id="previewBot">Đang tải...</p>
                    </div>
                </section>

                <button class="generate-btn" id="generateBtn">
                    <span class="edit-icon"><img src="../assets/image/ico.png" alt=""></span> Generate bài viết
                </button>

                <div class="loading" id="loading" style="display: none; text-align: center; margin: 20px 0;">
                    <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #4facfe; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                    <p>Đang tạo bài viết, vui lòng chờ...</p>
                </div>

                <div class="back-link">
                    <a href="#">← Quay lại trang chủ</a>
                </div>
            </div>
        </div>
    </main>

    <div class="tooltip" id="tooltip"></div>

    <style>
        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }

            100% {
                transform: rotate(360deg);
            }
        }
    </style>

    <script src="./assets/js/cau-hinh-bai-viet.js"></script>
</body>

</html>