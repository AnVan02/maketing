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
             <div class="tip-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#3B82F6" fill-opacity="0.1"/>
                    <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
             </div>
            <p><strong>Mẹo:</strong> Từ khóa chính càng cụ thể, AI sẽ tạo nội dung càng phù hợp với mục tiêu SEO của bạn.</p>
        </div>

        <div class="grid-layout">
            <!-- Left Column: Form -->
            <div class="column left">
                <section class="card">
                    <h2 class="card-title">Thông tin cơ bản</h2>
                    
                    <!-- Source Tabs -->
                    <div class="source-tabs">
                        <button class="tab active" data-tab="internet">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            Nguồn Internet
                        </button>
                        <button class="tab" data-tab="private">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                            Dữ liệu riêng
                        </button>
                    </div>

                    <!-- Internet Content -->
                    <div id="internet" class="content active">
                        <div class="form-group">
                            <label for="internet_user_query">Từ khóa chính <span class="required">*</span></label>
                            <input type="text" id="internet_user_query" placeholder="Máy tính AI">
                        </div>

                        <div class="form-group">
                            <label for="internet_secondaryKeyword">Từ khóa phụ</label>
                            <input type="text" id="internet_secondaryKeyword" placeholder="Máy tính AI cho doanh nghiệp">
                            <div class="tag-container" id="internet_tagContainer"></div>
                        </div>

                        <div class="form-group">
                            <label for="internet_articleTitle">Tiêu đề bài viết</label>
                            <input type="text" id="internet_articleTitle" placeholder="Xu hướng máy tính AI dành cho doanh n...">
                            <div id="internet_titleSuggestions" class="title-suggestions-container"></div>
                        </div>
                    </div>

                    <!-- Private Content -->
                    <div id="private" class="content">
                        <!-- Hidden fields to keep existing JS happy -->
                        <div class="form-group">
                            <label for="user_query">Từ khóa chính <span class="required">*</span></label>
                            <input type="text" id="user_query" placeholder="Máy tính AI">
                        </div>
                        <div class="form-group">
                            <label for="private_secondaryKeyword">Từ khóa phụ</label>
                            <input type="text" id="private_secondaryKeyword" placeholder="Nhập từ khóa...">
                            <div class="tag-container" id="tagContainer"></div>
                        </div>
                        <div class="form-group">
                            <label for="articleTitle">Tiêu đề bài viết</label>
                            <input type="text" id="articleTitle" placeholder="Nhập tiêu đề...">
                        </div>
                        
                        <!-- Sub-tabs for Private Data (File/Text/Link) - Kept for JS logic -->
                        <div class="private-sub-tabs" style="display: none;">
                            <div class="sub" data-sub="file">File</div>
                            <div class="sub" data-sub="text">Text</div>
                            <div class="sub" data-sub="link">Link</div>
                        </div>
                        <div id="subtab-content-area-hidden" style="display: none;"></div>
                        <div class="uploaded-file-list-outside" style="display: none;"></div>
                        <input type="file" id="file-selector" style="display: none;">
                    </div>

                    <!-- Shared Config Fields -->
                    <div class="form-group">
                        <label for="content_lengths">Độ dài bài viết</label>
                        <select id="content_lengths">
                            <option value="">Chọn độ dài...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="content_types">Loại bài viết</label>
                        <select id="content_types">
                            <option value="">Chọn loại bài viết...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="writing_tones">Tone giọng</label>
                        <select id="writing_tones">
                            <option value="">Chọn tone giọng...</option>
                        </select>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="bots">Model</label>
                            <select id="bots">
                                <option value="">Chọn AI Model...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="languages">Ngôn ngữ</label>
                            <select id="languages">
                                <option value="">Chọn ngôn ngữ...</option>
                            </select>
                        </div>
                    </div>
                </section>

                <div class="bottom-action-bar">
                    <button class="btn-back" onclick="window.history.back()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        Quay lại
                    </button>
                    <button class="btn-generate" id="generateBtn">
                        Tạo dàn ý bài viết 
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                </div>
            </div>

            <!-- Right Column: Preview/Outline -->
            <div class="column right" id="right-panel">
                <section class="card right-panel-card">
                    <button class="guide-btn">Hướng dẫn</button>

                    <div id="defaultPreview" class="center-content">
                        <div class="video-placeholder">
                            <img src="./images/banner-1.png" alt="Guide Banner" class="banner-img">
                            <div class="play-button">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                        </div>

                        <div class="empty-state">
                            <h3>Dàn ý của bạn sẽ hiển thị tại đây</h3>
                            <p>Xem ví dụ bên trên để hiểu cách quy trình hoạt động và tạo ra nội dung hấp dẫn. Tất cả bài viết trên nền tảng đều được tạo từ công cụ này.</p>
                        </div>
                    </div>

                    <!-- Loading State -->
                    <div id="loading" style="display: none;" class="center-content">
                        <div class="loading-container">
                            <div class="spinner-premium">
                                <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" stroke="#E5E7EB" stroke-width="6" fill="none"></circle>
                                    <circle cx="50" cy="50" r="45" stroke="#1D4ED8" stroke-width="6" fill="none" stroke-dasharray="210" stroke-dashoffset="150" stroke-linecap="round">
                                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite" />
                                    </circle>
                                </svg>
                            </div>
                            <h4>Dàn ý đang được khởi tạo...</h4>
                            <p>Hệ thống đang xử lý thông tin và sắp xếp nội dung.<br>Vui lòng chờ trong giây lát.</p>
                        </div>
                    </div>

                    <!-- Outline Result Area -->
                    <div id="outlineResult" style="display: none;">
                        <div id="outlineList"></div>
                        
                        <div class="outline-actions">
                            <button id="btn-back-outline" class="btn-secondary">Quay lại</button>
                            <button id="createArticleBtn" class="btn-primary">Tạo bài viết →</button>
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
