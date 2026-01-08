<?php require "thanh-dieu-huong.php" ?>
<link rel="stylesheet" href="./css/thanh-dieu-huong.css">

<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thêm cấu hình - AIS</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="./css/them-cau-hinh.css">
    <style>
        /* Sidebar active state helper */
        .nav-item.active {
            background-color: #EFF6FF !important;
            color: #3B82F6 !important;
        }
        .nav-item.active .icon img {
             filter: brightness(0) saturate(100%) invert(45%) sepia(93%) saturate(1450%) hue-rotate(200deg) brightness(100%) contrast(100%);
        }
    </style>
</head>

<body>

    <div class="app-container">
        <!-- Main Content -->
        <main class="page-body">
            <div class="content-header">
                <h1 class="page-title">Thêm cấu hình</h1>
            </div>

            <div class="alert-info">
                <img src="./images/icon-meo.png" alt="Tip" class="info-icon">
                <p><strong>Mẹo:</strong> Mỗi cấu hình sẽ tạo ra phong cách bài viết khác nhau, hãy nghiên cứu và tinh chỉnh phù hợp với nhu cầu của bạn</p>
            </div>

            <div class="config-form-card">
                <div class="form-section-title">Tên cấu hình</div>

                <form id="configForm">
                    <div class="form-group">
                        <label class="form-label">Tên cấu hình</label>
                        <input type="text" id="configName" class="form-control" placeholder="Nhập tên cấu hình..." required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Độ dài bài viết</label>
                        <select id="articleLength" class="form-control">
                            <option value="Ngắn (800-1200 từ)">Ngắn (800-1200 từ)</option>
                            <option value="Trung bình (1200-2000 từ)">Trung bình (1200-2000 từ)</option>
                            <option value="Dài (2000+ từ)">Dài (2000+ từ)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Mức độ sáng tạo</label>
                        <div class="slider-container">
                            <input type="range" id="creativityLevel" class="slider-input" min="0" max="100" value="90">
                            <span class="slider-value" id="creativityValue">90%</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Loại bài viết</label>
                        <select id="articleType" class="form-control">
                            <option value="Blog SEO cơ bản">Blog SEO cơ bản</option>
                            <option value="Tin tức">Tin tức</option>
                            <option value="Review sản phẩm">Review sản phẩm</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Tone giọng</label>
                        <select id="toneVoice" class="form-control">
                            <option value="Chuyên nghiệp, đáng tin cậy">Chuyên nghiệp, đáng tin cậy</option>
                            <option value="Vui vẻ, hài hước">Vui vẻ, hài hước</option>
                            <option value="Thân thiện, gần gũi">Thân thiện, gần gũi</option>
                        </select>
                    </div>

                    <div class="row">
                        <div class="col form-group">
                            <label class="form-label">Model</label>
                            <select id="aiModel" class="form-control">
                                <option value="Gemini 2.5 Pro">Gemini 2.5 Pro</option>
                                <option value="GPT-4o">GPT-4o</option>
                            </select>
                        </div>
                        <div class="col form-group">
                            <label class="form-label">Ngôn ngữ</label>
                            <select id="language" class="form-control">
                                <option value="Tiếng Việt">Tiếng Việt</option>
                                <option value="English">English</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn-submit">LƯU CẤU HÌNH</button>
                    </div>
                </form>
            </div>
        </main>
    </div>

    <script>
        // Update slider value display
        const rangeInput = document.getElementById('creativityLevel');
        const rangeValue = document.getElementById('creativityValue');
        rangeInput.addEventListener('input', (e) => {
            rangeValue.textContent = e.target.value + '%';
        });

        // Handle Form Submit
        document.getElementById('configForm').addEventListener('submit', (e) => {
            e.preventDefault();

            const newConfig = {
                id: Date.now(),
                name: document.getElementById('configName').value,
                length: document.getElementById('articleLength').value,
                creativity: document.getElementById('creativityLevel').value,
                type: document.getElementById('articleType').value,
                tone: document.getElementById('toneVoice').value,
                model: document.getElementById('aiModel').value,
                language: document.getElementById('language').value,
                created_at: new Date().toLocaleDateString('vi-VN'),
                article_count: 0 // Default
            };

            // Get existing configs
            let configs = JSON.parse(localStorage.getItem('user_configs')) || [];
            configs.push(newConfig);
            
            // Save back to localStorage
            localStorage.setItem('user_configs', JSON.stringify(configs));

            // Redirect to cau-hinh-bai-viet.php as requested
            window.location.href = 'cau-hinh-bai-viet.php';
        });
    </script>
</body>
</html>
