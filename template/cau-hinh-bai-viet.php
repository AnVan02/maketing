<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">
    <link href="../assets/css/cau-hinh-bai-viet.css" rel="stylesheet">
    <script href="../assets/js/cau-hinh-bai-viet.js"></script>

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
            <a href="" id="saveDraft">Lưu nháp</a>
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
                Mẹo:Từ khóa chính càng cụ thể, AI sẽ tạo nội dung càng phù hợp với mục tiêu SEO của bạn.
            </span>

        </div>

        <div class="content-wrapper">
            <div class="column left-column">
                
                <section class="card basic-info">
                    <h2 class="card-title">Thông tin cơ bản</h2>
                    
                    <div class="form-group">
                        <label>Từ khóa chính</label>
                        <div class="input-with-icon">
                            <input type="text" id="mainKeyword" placeholder="VD: công nghệ AI 2024, xu hướng thời trang" value="">
                            <span class="info-icon" data-tooltip="Từ khóa chính là từ khóa mục tiêu chính mà bạn muốn tối ưu SEO">?</span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Từ khóa phụ</label>
                        <input type="text" id="secondaryKeyword" placeholder="Nhập từ khóa và nhấn Enter để thêm">
                        <div class="tag-container" id="tagContainer">
                            <span class="tag">AI doanh nghiệp <span class="close-icon" onclick="removeTag(this)">×</span></span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Tiêu đề bài viết</label>
                        <div class="input-with-button">
                            <input type="text" id="articleTitle" placeholder="Nhập tiêu đề hoặc để AI gợi ý">
                            <button class="ai-suggest-btn" id="aiSuggestBtn">
                                <img src="../assets/image/ico.png" alt="">Gợi ý bằng AI</button>
                        </div>
                    </div>
                </section>
                
                <section class="card content-config">
                    <h2 class="card-title">Cấu hình nội dung</h2>
                    
                    <div class="form-group">
                        <label>Độ dài bài viết</label>
                        <select id="articleLength">
                            <option value="short">Ngắn (800-500 từ)</option>
                            <option value="medium">Trung bình (500-800 từ)</option>
                            <option value="long">Chi tiết (800-1200 từ)</option>
                             <option value="long">Chi tiết (1200-2000 từ)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Loại bài viết</label>
                        <select id="articleType">
                            <option>Blog SEO cơ bản</option>
                            <option>Tin tức</option>
                            <option>Đánh giá</option>
                            <option>Hướng dẫn </option>
                            <option>Giới thiệu sản phẩm</option>
                            <option>Landing page </option>
                            <option>Top list/so sánh </option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Tone giọng</label>
                        <select id="tone">
                            <option value="professional">Chuyên nghiệp</option>
                            <option value="friendly">Thân thiện </option>
                            <option value="expert">Sang trọng</option>
                            <option value="casual">Thuyết phục</option>
                        </select>
                    </div>
                    
                    <div class="form-group lang-market-group">
                        <div class="input-half">
                            <label>Ngôn ngữ</label>
                            <select id="language">
                                <option>Tiếng Việt</option>
                                <option>English</option>
                            </select>
                        </div>
                        <div class="input-half">
                            <label>Thị trường</label>
                            <select id="market">
                                <option>Việt Nam</option>
                                <option>Đông Nam Á</option>
                                <option>Toàn cầu</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section class="advanced-options" id="advancedToggle">
                    <h2 class="card-title">Tùy chọn nâng cao</h2>
                    <span class="dropdown-arrow"></span>
                </section>
                <div class="advanced-content" id="advancedContent">
                    <section class="card">
                        <div class="form-group">
                            <label>SEO Meta Description</label>
                            <input type="text" placeholder="Mô tả ngắn cho công cụ tìm kiếm">
                        </div>
                        <div class="form-group">
                            <label>Thêm liên kết nội bộ</label>
                            <input type="text" placeholder="URL các bài viết liên quan">
                        </div>
                    </section>
                </div>
            </div>

            <div class="column right-column">
                <section class="card preview-structure">
                    <h2 class="card-title">Xem trước cấu trúc</h2>
                    
                    <div class="preview-item">
                        <label>Độ dài dự kiến</label>
                        <p class="value" id="previewLength">800-1200 từ</p>
                    </div>
                    
                    <div class="preview-item">
                        <label>Cấu trúc dự kiến</label>
                        <ul class="structure-list" id="previewStructure">
                            <li><span class="bullet"></span> Phần mở đầu (100-150 từ)</li>
                            <li><span class="bullet"></span> 3-4 phần nội dung chính</li>
                            <li><span class="bullet"></span> Kết luận và CTA</li>
                        </ul>
                    </div>
                    
                    <div class="preview-item">
                        <label>Tone giọng mẫu</label>
                        <p class="quote" id="previewTone">"Trong thời đại công nghệ 4.0, việc ứng dụng AI vào doanh nghiệp không chỉ là xu hướng mà đã trở thành yếu tố quyết định."</p>
                    </div>
                    
                    <div class="preview-item">
                        <label>Thời gian dự kiến</label>
                        <p class="value estimated-time" id="previewTime">2-3 phút</p>
                    </div>
                </section>

                <button class="generate-btn" id="generateBtn">
                    <span class="edit-icon"><img src="../assets/image/ico.png" alt=""></span> Generate bài viết
                </button>
                
                <div class="back-link">
                    <a href="#">← Quay lại trang chủ</a>
                </div>
            </div>
        </div>
    </main>

    <div class="tooltip" id="tooltip"></div>
</body