<?php require "thanh-dieu-huong.php" ?>
<link rel="stylesheet" href="./css/cau-hinh-bai-viet.css">
<link rel="stylesheet" href="./css/thanh-dieu-huong.css">

<!-- Using Montserrat from thanh-dieu-huong if available, or already in CSS -->

<div class="app-body">
    <!-- Sidebar is included in thanh-dieu-huong.php -->

    <main class="content-area">
        <div class="page-header">
            <h1 class="page-title">Cấu hình bài viết</h1>
            <div class="step-indicator">Bước 1/3</div>
        </div>

        <div class="tip-box">
            <img src="./images/icon-meo.png" alt="Tip" class="tip-icon">
            <p><strong>Mẹo:</strong> Từ khóa chính càng cụ thể, AI sẽ tạo nội dung càng phù hợp với mục tiêu SEO của bạn.</p>
        </div>

        <div class="grid-layout">
            <!-- Left Column: Form -->
            <div class="column left">
                <section class="card">
                    <h2 class="card-title">Thông tin cơ bản</h2>
                    
                    <div class="form-group">
                        <label for="internet_user_query">Từ khóa chính</label>
                        <input type="text" id="internet_user_query" placeholder="VD: máy tính AI cho doanh nghiệp">
                    </div>

                    <div class="form-group">
                        <label for="internet_secondaryKeyword">Từ khóa phụ</label>
                        <input type="text" id="internet_secondaryKeyword" placeholder="Nhập từ khóa và nhấn Enter để thêm">
                        <div class="tag-container" id="internet_tagContainer">
                            <!-- Tags added dynamically: <span class="tag">AI doanh nghiệp <span class="close-icon">×</span></span> -->
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="internet_articleTitle">Tiêu đề bài viết</label>
                        <input type="text" id="internet_articleTitle" placeholder="Nhập tiêu đề">
                        <a href="#" class="suggest-link" id="aiSuggestTitleBtn">Gợi ý tiêu đề</a>
                        <div id="internet_titleSuggestions" class="title-suggestions-container"></div>
                    </div>

                    <div class="form-group">
                        <label for="config_template">Mẫu cấu hình</label>
                        <div class="custom-select-wrapper">
                            <select id="config_template">
                                <option value="tin-tuc-seo">Tin tức SEO</option>
                                <option value="bai-chuyen-sau">Bài chuyên sâu</option>
                                <option value="add-new">+ Thêm mẫu cấu hình</option>
                            </select>
                        </div>
                    </div>

                    <!-- Hidden config fields to keep JS working -->
                    <div style="display: none;">
                        <input type="text" id="user_query">
                        <input type="text" id="articleTitle">
                        <div id="tagContainer"></div>
                        
                        <select id="content_lengths"></select>
                        <select id="content_types"></select>
                        <select id="writing_tones"></select>
                        <select id="bots"></select>
                        <select id="languages"></select>
                        <input type="hidden" id="article_length" value="1500">
                    </div>
                </section>

                <div class="bottom-action">
                    <button class="btn-generate" id="generateBtn">
                        Tạo dàn ý bài viết 
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Right Column: Preview/Outline -->
            <div class="column right" id="right-panel">
                <section class="card right-panel-card">
                    <button class="guide-btn">Hướng dẫn</button>

                    <div id="defaultPreview">
                        <div class="video-container">
                            <!-- Assuming the image stats-img-1 or similar as placeholder -->
                            <img src="./images/banner-1.png" alt="Guide Video">
                            <div class="play-icon"></div>
                        </div>

                        <div class="placeholder-content">
                            <h3>Dàn ý của bạn sẽ hiển thị tại đây</h3>
                            <p>Xem ví dụ bên trên để hiểu cách quy trình hoạt động và tạo ra nội dung hấp dẫn. Tất cả bài viết trên nền tảng đều được tạo từ công cụ này.</p>
                        </div>
                    </div>

                    <!-- Loading State -->
                    <div id="loading" style="display: none; text-align: center; margin-top: 50px;">
                        <div class="loading-state-container">
                             <div class="spinner-large-container" style="margin-bottom: 20px;">
                                  <svg class="spinner-circle" viewBox="0 0 100 100" style="width: 60px; height: 60px;">
                                       <circle class="spinner-track" cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" stroke-width="8"></circle>
                                       <circle class="path" cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" stroke-width="8" stroke-dasharray="150, 200"></circle>
                                  </svg>
                             </div>
                             <h4 style="font-size: 18px; margin-bottom: 10px;">Dàn ý đang được khởi tạo...</h4>
                             <p style="color: #6B7280;">Hệ thống đang xử lý thông tin và sắp xếp nội dung. <br>Vui lòng chờ trong giây lát.</p>
                        </div>
                    </div>

                    <!-- Outline Result Area -->
                    <div id="outlineResult" style="display: none;">
                        <div id="outlineList"></div>
                        
                        <!-- Actions after outline generation -->
                        <div style="margin-top: 30px; display: flex; justify-content: flex-end; gap: 15px;">
                            <button id="btn-back" style="padding: 10px 20px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer;">Quay lại</button>
                            <button id="createArticleBtn" style="padding: 10px 25px; background: var(--primary-blue); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Tạo bài viết →</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </main>
</div>

<script src="./js/cau-hinh-bai-viet.js"></script>
<script src="./js/khoi-tao-bai-viet.js"></script>
<script src="./js/dan-y-bai-viet.js"></script>

<style>
/* Spinner Animation */
.path {
  animation: dash 1.5s ease-in-out infinite;
  stroke-linecap: round;
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>

<script>
    // Highlight active sidebar item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.innerText.includes('Viết bài SEO')) {
            item.classList.add('active');
        }
    });
</script>

    </div> <!-- Close app-body -->
</div> <!-- Close app-container -->

</body>
</html>
