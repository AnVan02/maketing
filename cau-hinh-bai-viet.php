<?php require "thanh-dieu-huong.php" ?>
<link rel="stylesheet" href="./css/cau-hinh-bai-viet.css">
<link rel="stylesheet" href="./css/thanh-dieu-huong.css">
<link rel="stylesheet" href="./css/dan-y-bai-viet.css">

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

                    <!-- STEP 1: THÔNG TIN CƠ BẢN -->
                    <div id="step-1-content">
                        <h2 class="card-title">Thông tin cơ bản</h2>

                        <div class="form-group">
                            <label for="internet_user_query">Từ khóa chính</label>
                            <input type="text" id="internet_user_query" placeholder="VD: máy tính AI cho doanh nghiệp">
                        </div>

                        <div class="form-group">
                            <label for="internet_secondaryKeyword">Từ khóa phụ</label>
                            <input type="text" id="internet_secondaryKeyword" placeholder="Nhập từ khóa và nhấn Enter để thêm">
                            <div class="tag-container" id="internet_tagContainer"></div>
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
                                    <option src="mau-cau-hinh.php" value="add-new">+ Thêm mẫu cấu hình</option>
                                </select>
                            </div>
                        </div>

                        <div class="bottom-action">
                            <button class="btn-generate" id="btn-continue">
                                Tạo dàn ý bài viết
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- STEP 2: TÊN CẤU HÌNH (CHI TIẾT) -->
                    <div id="step-2-content" style="display: none;">
                        <h2 class="card-title">Thêm cấu hình</h2>

                        <div class="form-group">
                            <label for="content_lengths">Độ dài bài viết</label>
                            <div class="custom-select-wrapper">
                                <select id="content_lengths"></select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="creativity_level">Mức độ sáng tạo: <span id="creativity_val">50%</span></label>
                            <input type="range" id="creativity_level" min="0" max="100" value="50" style="width: 100%;">
                        </div>

                        <div class="form-group">
                            <label for="content_types">Loại bài viết</label>
                            <div class="custom-select-wrapper">
                                <select id="content_types"></select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="writing_tones">Tone giọng</label>
                            <div class="custom-select-wrapper">
                                <select id="writing_tones"></select>
                            </div>
                        </div>

                        <div class="grid-2-cols" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label for="bots">Model</label>
                                <div class="custom-select-wrapper">
                                    <select id="bots"></select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="languages">Ngôn ngữ</label>
                                <div class="custom-select-wrapper">
                                    <select id="languages"></select>
                                </div>
                            </div>
                        </div>

                        <!-- Hidden fields to keep JS compatibility if needed -->
                        <div style="display: none;">
                            <input type="text" id="user_query" value="">
                            <input type="text" id="articleTitle" value="">
                            <div id="tagContainer"></div>
                            <input type="hidden" id="article_length" value="1500">
                        </div>

                        <div class="bottom-action" style="display: flex; gap: 10px;">
                            <button id="btn-back-step1" style="flex: 1; padding: 12px; border: 1px solid #ddd; background: #fff; border-radius: 8px; cursor: pointer; font-weight: 600;">Quay lại</button>
                            <button class="btn-generate" id="generateBtn" style="flex: 2; justify-content: center;">
                                LƯU CẤU HÌNH
                            </button>
                        </div>
                    </div>

                </section>
            </div>

            <script>
                // Slide Logic for Creativity
                const slider = document.getElementById('creativity_level');
                const output = document.getElementById('creativity_val');
                if (slider && output) {
                    slider.oninput = function() {
                        output.innerHTML = this.value + "%";
                    }
                }

                // Internal Step Navigation
                const step1 = document.getElementById('step-1-content');
                const step2 = document.getElementById('step-2-content');
                const btnContinue = document.getElementById('btn-continue');
                const btnBack = document.getElementById('btn-back-step1');
                const tipBoxParams = document.querySelector('.tip-box p');

                // Load existing button logic if any (generateBtn is already handled by khoi-tao-bai-viet.js)

                if (btnContinue) {
                    btnContinue.addEventListener('click', () => {
                        // Simple validation
                        const kw = document.getElementById('internet_user_query').value;
                        if (!kw) {
                            alert("Vui lòng nhập từ khóa chính!");
                            return;
                        }
                        step1.style.display = 'none';
                        step2.style.display = 'block';
                        // Update step indicator
                        document.querySelector('.step-indicator').textContent = 'Bước 2/3';
                        // Update Tip
                        if (tipBoxParams) {
                            tipBoxParams.innerHTML = '<strong>Mẹo:</strong> Mỗi cấu hình sẽ tạo ra phong cách bài viết khác nhau, hãy nghiên cứu và tinh chỉnh phù hợp với nhu cầu của bạn';
                        }
                    });
                }

                if (btnBack) {
                    btnBack.addEventListener('click', () => {
                        step2.style.display = 'none';
                        step1.style.display = 'block';
                        document.querySelector('.step-indicator').textContent = 'Bước 1/3';
                        // Update Tip
                        if (tipBoxParams) {
                            tipBoxParams.innerHTML = '<strong>Mẹo:</strong> Từ khóa chính càng cụ thể, AI sẽ tạo nội dung càng phù hợp với mục tiêu SEO của bạn.';
                        }
                    });
                }
                document.getElementById('config_template').addEventListener('change', function() {
                    if (this.value === 'add-new') {
                        window.location.href = 'mau-cau-hinh.php';
                    }
                });
            </script>

            <!-- Right Column: Preview/Outline -->
            <div class="column right" id="right-panel">
                <section class="card right-panel-card">
                    <button class="guide-btn">Hướng dẫn</button>

                    <div id="defaultPreview">
                        <div class="video-wrapper">
                            <iframe
                                src="https://www.youtube.com/embed/Uzqpwc5hpCE?si=xPtN0u8EW6KOsQ_J"
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerpolicy="strict-origin-when-cross-origin"
                                allowfullscreen>
                            </iframe>
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
                            <button id="createArticleBtn" style="padding: 10px 25px; background: var(--primary-blue); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                                Tạo bài viết <img src="./images/icon-mui-ten.png" alt="">
                            </button>
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
<script src="./js/viet-bai-seo.js"></script>



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