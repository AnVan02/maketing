<!DOCTYPE html>
<html lang="vi">

<head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">
     <title>Cấu hình bài viết - AI SEO Tool</title>
     <style>
          /* --- THIẾT LẬP MÀU VÀ FONT CƠ BẢN --- */
          :root {
               --bg-dark: #F8FAFC;
               --card-dark: #FFFFFF;
               --text-light: #111827;
               --text-sub: #6B7280;
               --primary-blue: #3A73FF;
               --secondary-blue: #2F5ED6;
               --input-bg: #FFFFFF;
               --border-color: #E5E7EB;
               --tag-bg: #EAF3FF;
               --tag-text: #3A73FF;
               --time-color: #00BFB2;
               --header-bg: #FFFFFF;
               --tip-bg-light: #E8F0FF;
               --tip-text-dark: #3A73FF;
          }

          * {
               box-sizing: border-box;
               margin: 0;
               padding: 0;
               font-family: Montserrat;
          }

          body {
               color: var(--text-light);
               line-height: 1.6;
               font-size: 14px;
          }

          a {
               color: var(--text-sub);
               text-decoration: none;
               transition: color 0.3s;
          }

          a:hover {
               color: var(--primary-blue);
          }

          /* --- HEADER --- */
          .main-header {
               display: flex;
               justify-content: space-between;
               align-items: center;
               padding: 15px 50px;
               background-color: var(--header-bg);
               border-bottom: 1px solid var(--border-color);
               max-width: 1200px;
               margin: 0 auto;
               padding: 30px 20px;
          }

          .logo {
               font-weight: bold;
               font-size: 18px;
               color: var(--text-light);
          }

          .main-nav a {
               margin-right: 20px;
               color: var(--text-sub);
          }

          .user-info {
               display: flex;
               align-items: center;
          }

          .user-info a {
               margin-right: 15px;
          }

          .avatar {
               width: 30px;
               height: 30px;
               border-radius: 50%;
               background: linear-gradient(135deg, #3A73FF 0%, #00BFB2 100%);
               border: 2px solid var(--primary-blue);
               overflow: hidden;
          }

          /* --- LAYOUT CHÍNH --- */
          .container {
               max-width: 1200px;
               margin: 0 auto;
               padding: 30px 20px;
          }

          .page-title {
               font-size: 24px;
               font-weight: 600;
               margin-bottom: 5px;
          }

          .step-indicator {
               color: var(--text-sub);
               font-size: 14px;
               text-align: right;
               margin-top: -30px;
          }

          .tip-box {
               background-color: var(--tip-bg-light);
               color: var(--tip-text-dark);
               padding: 10px 15px;
               border-radius: 6px;
               margin: 20px 0;
               font-size: 14px;
          }

          .tip-icon {
               font-weight: bold;
          }

          .content-wrapper {
               display: flex;
               gap: 30px;
          }

          .left-column {
               flex: 2;
               min-width: 60%;
          }

          .right-column {
               flex: 1;
               min-width: 35%;
          }

          /* --- CARD TỔNG QUÁT --- */
          .card {
               background-color: var(--card-dark);
               padding: 20px;
               border-radius: 8px;
               margin-bottom: 20px;
               box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .card-title {
               font-size: 16px;
               font-weight: 600;
               margin-bottom: 20px;
               color: var(--text-light);
          }

          .advanced-options .card-title {
               margin-bottom: 0;
          }

          /* --- FORM ELEMENTS --- */
          .form-group {
               margin-bottom: 20px;
          }

          .form-group label {
               display: block;
               margin-bottom: 8px;
               color: #111827;
               font-size: 15px;
               margin-top: 15px;
          }

          input[type="text"],
          select,
          textarea,
          .input-with-button input {
               width: 100%;
               padding: 10px 12px;
               background-color: var(--input-bg);
               border: 1px solid var(--border-color);
               border-radius: 4px;
               color: var(--text-light);
               font-size: 15px;
               appearance: none;
               font-weight: bold;
               transition: border-color 0.3s;
          }

          input[type="text"]:focus,
          select:focus,
          textarea:focus {
               outline: none;
               border-color: var(--primary-blue);
          }

          select {
               background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="%23b0b0c0" d="M7 10l5 5 5-5z"/></svg>');
               background-repeat: no-repeat;
               background-position: right 10px center;
               padding-right: 30px;
               cursor: pointer;
          }

          .input-with-icon {
               position: relative;
          }

          .input-with-icon input {
               padding-right: 40px;
          }

          .info-icon {
               position: absolute;
               top: 50%;
               right: 12px;
               transform: translateY(-50%);
               width: 20px;
               height: 20px;
               border: 1px solid var(--text-sub);
               color: var(--text-sub);
               border-radius: 50%;
               text-align: center;
               line-height: 18px;
               font-size: 12px;
               cursor: pointer;
               font-weight: bold;
               transition: all 0.3s;
          }

          .info-icon:hover {
               background-color: var(--primary-blue);
               color: white;
               border-color: var(--primary-blue);
          }

          .tag-container {
               margin-top: 10px;
               display: flex;
               flex-wrap: wrap;
               gap: 8px;
          }

          .tag {
               display: inline-flex;
               align-items: center;
               background-color: var(--tag-bg);
               color: var(--tag-text);
               padding: 5px 10px;
               border-radius: 4px;
               font-size: 13px;
               animation: fadeIn 0.3s;
          }

          @keyframes fadeIn {
               from {
                    opacity: 0;
                    transform: scale(0.8);
               }

               to {
                    opacity: 1;
                    transform: scale(1);
               }
          }

          .close-icon {
               margin-left: 8px;
               font-weight: bold;
               cursor: pointer;
               transition: color 0.3s;
          }

          .close-icon:hover {
               color: #FF4444;
          }

          .input-with-button {
               display: flex;
               gap: 10px;
          }

          .input-with-button input {
               flex-grow: 1;
          }

          .ai-suggest-btn {
               background-color: #2563EB;
               color: white;
               border: none;
               padding: 0 15px;
               border-radius: 4px;
               cursor: pointer;
               font-size: 13px;
               white-space: nowrap;
               line-height: 40px;
               height: 40px;
               transition: background-color 0.3s;
          }

          .ai-suggest-btn:hover {
               background-color: var(--secondary-blue);
          }

          .ai-suggest-btn:disabled {
               opacity: 0.6;
               cursor: not-allowed;
          }

          .lang-market-group {
               display: flex;
               gap: 20px;
          }

          .input-half {
               flex: 1;
          }

          .advanced-options {
               background-color: var(--card-dark);
               padding: 20px;
               border-radius: 8px;
               margin-bottom: 20px;
               display: flex;
               justify-content: space-between;
               align-items: center;
               cursor: pointer;
               border: 1px solid var(--border-color);
               transition: all 0.3s;
          }

          .advanced-options:hover {
               border-color: var(--primary-blue);
          }

          .advanced-options .dropdown-arrow {
               transition: transform 0.3s;
          }

          .advanced-options .dropdown-arrow::after {
               content: '▼';
               font-size: 12px;
               color: var(--text-sub);
               font-weight: bold;
          }

          .advanced-options.open .dropdown-arrow {
               transform: rotate(180deg);
          }

          .advanced-content {
               max-height: 0;
               overflow: hidden;
               transition: max-height 0.3s ease-out;
          }

          .advanced-content.open {
               max-height: 500px;
          }

          /* --- CỘT PHẢI: XEM TRƯỚC CẤU TRÚC --- */
          .preview-structure {
               background: #f5f7fa;
               padding: 20px;
               border-radius: 12px;
          }

          .preview-structure .card-title {
               font-size: 20px;
               font-weight: 600;
               margin-bottom: 20px;
          }

          .preview-item {
               background: #ffffff;
               padding: 18px 20px;
               border-radius: 12px;
               margin-bottom: 16px;
               box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
          }

          .preview-item label {
               font-size: 15px;
               color: #374151;
               display: block;
               margin-bottom: 6px;
          }

          .preview-item .value {
               font-size: 15px;
               font-weight: 600;
               color: #111827;
          }

          .structure-list {
               list-style: none;
               padding-left: 0;
               margin: 0;
          }

          .structure-list .bullet {
               width: 8px;
               height: 8px;
               background: #2563eb;
               border-radius: 50%;
               margin-right: 10px;
          }

          .quote {
               font-size: 15px;
               color: #374151;
               font-style: italic;
          }

          .estimated-time {
               color: #10b981;
               font-weight: 600;
          }

          .preview-item:last-of-type {
               border-bottom: none;
          }

          .preview-item .estimated-time {
               color: #16A34A;
          }

          .structure-list li {
               font-size: 15px;
               margin-bottom: 5px;
               color: #111827;
               display: flex;
               align-items: center;
          }

          .preview-item .quote {
               background-color: var(--bg-dark);
               padding: 10px;
               font-style: 15;
               color: #374151;
               font-size: 15px;
          }

          .generate-btn {
               width: 100%;
               background-color: var(--primary-blue);
               color: white;
               border: none;
               padding: 12px 20px;
               border-radius: 6px;
               cursor: pointer;
               font-size: 17px;
               display: flex;
               align-items: center;
               justify-content: center;
               gap: 10px;
               transition: background-color 0.3s;
          }

          .generate-btn:hover {
               background-color: var(--secondary-blue);
          }

          .generate-btn .edit-icon {
               font-size: 13px;
          }

          .back-link {
               text-align: center;
               margin-top: 20px;
          }

          .back-link a {
               color: var(--primary-blue);
               font-size: 15px;
          }

          .tooltip {
               position: absolute;
               background-color: #333;
               color: white;
               padding: 8px 12px;
               border-radius: 4px;
               font-size: 15px;
               z-index: 1000;
               white-space: nowrap;
               opacity: 0;
               pointer-events: none;
               transition: opacity 0.3s;
          }

          .tooltip.show {
               opacity: 1;
          }

          /* --- PHẦN THÔNG TIN CƠ BẢN --- */
          .content {
               display: none;
          }

          .content.active {
               display: block;
          }

          /* Tab Chính */
          .tabs {
               display: flex;
               background: #337ab7;
               padding: 4px;
               border-radius: 8px;
               margin-bottom: 20px;
          }

          .tab {
               flex: 1;
               padding: 10px;
               border-radius: 6px;
               border: none;
               background: transparent;
               color: white;
               cursor: pointer;
               font-size: 16px;
          }

          .tab.active {
               background: white;
               color: #337ab7;
               font-weight: 600;
          }

          /* Subtabs */
          .subtabs {
               display: flex;
               gap: 20px;
               margin-bottom: 10px;
               border-bottom: 1px solid #dcdcdc;
          }

          .sub {
               background: none;
               border: none;
               padding-bottom: 6px;
               cursor: pointer;
               font-size: 15px;
               position: relative;
          }

          .sub.active {
               border-bottom: 2px solid #4a90e2;
               font-weight: 600;
               color: #4a90e2;
          }

          /* Style cho subtab bị khóa */
          .sub.locked {
               cursor: not-allowed !important;
               opacity: 0.6;
               pointer-events: none;
          }

          .sub.locked.active {
               opacity: 0.8;
          }

          /* Khung Kéo Thả (Upload Box) */
          .upload-box {
               margin-top: 10px;
               padding: 20px;
               min-height: 120px;
               border: 2px dashed #c8c8c8;
               border-radius: 8px;
               text-align: center;
               color: #777;
               display: flex;
               flex-direction: column;
               align-items: center;
               justify-content: center;
               gap: 10px;
               transition: all 0.3s;
          }

          .upload-box.clickable {
               cursor: pointer;
          }

          .upload-box.clickable:hover {
               border-color: #4a90e2;
               background-color: #f8fafd;
          }

          .upload-box .icon {
               font-size: 30px;
               color: #777;
          }

          .upload-box.hover {
               border-color: #4a90e2;
               background-color: #f0f7ff;
          }

          /* Style cho upload-box khi bị khóa */
          .upload-box.locked {
               cursor: not-allowed !important;
               opacity: 0.7;
               background-color: #f9f9f9 !important;
               border-color: #ddd !important;
               color: #999 !important;
          }

          /* Khu vực hiển thị File List (nằm ngoài khung) */
          .uploaded-file-list-outside {
               margin-top: 15px;
               display: none;
               flex-direction: column;
               gap: 10px;
          }

          /* Styling cho File đã Upload */
          .uploaded-file {
               display: flex;
               align-items: center;
               justify-content: space-between;
               padding: 8px 12px;
               border: 1px solid #dcdcdc;
               border-radius: 4px;
               background-color: #f9f9f9;
               animation: fadeInUp 0.3s ease;
          }

          @keyframes fadeInUp {
               from {
                    opacity: 0;
                    transform: translateY(10px);
               }

               to {
                    opacity: 1;
                    transform: translateY(0);
               }
          }

          .file-info {
               display: flex;
               align-items: center;
               gap: 8px;
          }

          .file-icon {
               color: #c71e1e;
               font-size: 24px;
          }

          .file-name {
               font-weight: 600;
               color: #333;
               font-size: 14px;
          }

          .file-size-status {
               font-size: 12px;
               color: #777;
          }

          .remove-file {
               background: none;
               border: none;
               color: #ff0000;
               font-size: 18px;
               cursor: pointer;
               font-weight: 300;
               padding: 0 4px;
               line-height: 1;
          }

          .remove-file:hover {
               color: #cc0000;
          }

          .locked-text {
               color: #777;
               font-size: 12px;
               margin-left: 10px;
               font-style: italic;
          }

          /* Style cho textarea và input khi bị khóa */
          textarea[readonly],
          input[readonly] {
               background-color: #f5f5f5 !important;
               cursor: not-allowed !important;
               opacity: 0.7;
          }

          /* --- THANH CÔNG CỤ NHẬP VĂN BẢN --- */
          .text-editor-container {
               margin-top: 10px;
          }

          .editor-toolbar {
               background: #f8f9fa;
               border: 1px solid #dee2e6;
               border-bottom: none;
               border-radius: 4px 4px 0 0;
               padding: 8px 12px;
               display: flex;
               align-items: center;
               gap: 8px;
               flex-wrap: wrap;
          }

          .font-select {
               border: 1px solid #ced4da;
               border-radius: 3px;
               padding: 4px 8px;
               font-size: 14px;
               background: white;
               width: 120px;
          }

          .toolbar-btn {
               background: none;
               border: 1px solid #ced4da;
               border-radius: 3px;
               padding: 4px 8px;
               font-size: 14px;
               cursor: pointer;
               min-width: 32px;
               text-align: center;
          }

          .toolbar-btn:hover {
               background: #e9ecef;
          }

          .toolbar-btn.active {
               background: #007bff;
               color: white;
               border-color: #007bff;
          }

          .size-input {
               width: 50px;
               border: 1px solid #ced4da;
               border-radius: 3px;
               padding: 4px;
               text-align: center;
               font-size: 14px;
          }

          .color-btn {
               width: 30px;
               height: 30px;
               border: 1px solid #ced4da;
               border-radius: 3px;
               cursor: pointer;
               position: relative;
          }

          .color-btn.red {
               background: #dc3545;
          }

          .color-btn.blue {
               background: #007bff;
          }

          .color-btn.green {
               background: #28a745;
          }

          .color-btn.black {
               background: #212529;
          }

          .editor-textarea {
               width: 100%;
               min-height: 200px;
               padding: 15px;
               border: 1px solid #dee2e6;
               border-top: none;
               border-radius: 0 0 4px 4px;
               font-size: 14px;
               line-height: 1.6;
               resize: vertical;
               font-family: Arial, sans-serif;
          }

          /* --- LINK SẢN PHẨM --- */
          .link-input-container {
               margin-top: 10px;
          }

          .link-input-container input {
               width: 100%;
               padding: 12px;
               border: 1px solid #dee2e6;
               border-radius: 4px;
               font-size: 14px;
               margin-bottom: 15px;
          }

          .product-links-container {
               border: 1px solid #dee2e6;
               border-radius: 4px;
               padding: 15px;
               background: #f8f9fa;
          }

          .product-link-item {
               background: white;
               border: 1px solid #e9ecef;
               border-radius: 4px;
               padding: 12px;
               margin-bottom: 10px;
          }

          .product-link-item:last-child {
               margin-bottom: 0;
          }

          .product-name {
               font-weight: 600;
               color: #212529;
               font-size: 14px;
               margin-bottom: 5px;
          }

          .product-url {
               color: #007bff;
               font-size: 13px;
               word-break: break-all;
          }

          /* --- NÚT TẠO BÀI VIẾT --- */
          /* Loading spinner */
          .spinner {
               border: 4px solid #f3f3f3;
               border-top: 4px solid #4facfe;
               border-radius: 50%;
               width: 40px;
               height: 40px;
               animation: spin 1s linear infinite;
               margin: 0 auto;
          }

          @keyframes spin {
               0% {
                    transform: rotate(0deg);
               }

               100% {
                    transform: rotate(360deg);
               }
          }

          /* Notification */
          .notification {
               position: fixed;
               top: 20px;
               right: 20px;
               padding: 15px 25px;
               border-radius: 5px;
               color: white;
               z-index: 1000;
               box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
               animation: slideIn 0.3s ease;
          }

          .notification.success {
               background: #28a745;
          }

          .notification.error {
               background: #dc3545;
          }

          .notification.info {
               background: #17a2b8;
          }

          .notification.warning {
               background: #ffc107;
               color: #333;
          }

          @keyframes slideIn {
               from {
                    transform: translateX(100%);
                    opacity: 0;
               }

               to {
                    transform: translateX(0);
                    opacity: 1;
               }
          }

          @keyframes slideOut {
               from {
                    transform: translateX(0);
                    opacity: 1;
               }

               to {
                    transform: translateX(100%);
                    opacity: 0;
               }
          }

          /* Responsive */
          @media (max-width: 768px) {
               .content-wrapper {
                    flex-direction: column;
               }

               .left-column,
               .right-column {
                    min-width: 100%;
               }

               .subtabs {
                    overflow-x: auto;
                    white-space: nowrap;
                    padding-bottom: 5px;
               }

               .sub {
                    font-size: 14px;
                    padding: 8px 12px;
               }

               .main-header {
                    flex-direction: column;
                    padding: 15px;
               }

               .main-nav {
                    margin: 10px 0;
               }

               .editor-toolbar {
                    gap: 4px;
                    padding: 6px 8px;
               }

               .font-select {
                    width: 100px;
               }

               .toolbar-btn {
                    min-width: 28px;
                    padding: 3px 6px;
               }
          }
     </style>
</head>

<body>
     <header class="main-header">
          <div class="logo">
               <img src="../assets/image/AIS.png" alt="Logo">
          </div>
          <nav class="main-nav">
               <a href="#">Trang chủ</a>
               <a href="#">Viết bài mới</a>
          </nav>
          <div class="user-info">
               <a href="#" id="saveDraft">Lưu nháp</a>
               <div class="avatar">
                    <img src="../assets/image/chibi.jpg" alt="Avatar">
               </div>
          </div>
     </header>

     <main class="container">
          <h1 class="page-title">Cấu hình bài viết</h1>
          <div class="step-indicator">Bước 1/3</div>

          <div class="tip-box">
               <span class="tip-icon">💡</span>
               Mẹo: Từ khóa chính càng cụ thể, AI sẽ tạo nội dung càng phù hợp với mục tiêu SEO của bạn.
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
                              <div class="content" id="internet">
                                   Nội dung tab Nguồn Internet...
                              </div>

                              <div class="content active" id="private">
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

                                   <div id="subtab-content-area">
                                        <!-- Nội dung sẽ được render động ở đây -->
                                   </div>

                                   <div class="uploaded-file-list-outside"></div>

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
                                                  <span style="margin-right: 5px;">🤖</span>Gợi ý bằng AI
                                             </button>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </section>

                    <section class="card content-config">
                         <h2 class="card-title">Cấu hình nội dung</h2>

                         <div class="form-group">
                              <label>Loại bài viết *</label>
                              <select id="content_type" required>
                                   <option value="">Chọn...</option>
                                   <option value="Blog SEO">Blog SEO</option>
                                   <option value="Tin tức">Tin tức</option>
                                   <option value="Đánh giá">Đánh giá</option>
                                   <option value="Hướng dẫn">Hướng dẫn</option>
                              </select>
                         </div>

                         <div class="form-group">
                              <label>Tone giọng *</label>
                              <select id="writing_tone" required>
                                   <option value="">Chọn...</option>
                                   <option value="Chuyên nghiệp">Chuyên nghiệp</option>
                                   <option value="Thân thiện">Thân thiện</option>
                                   <option value="Trang trọng">Trang trọng</option>
                                   <option value="Sáng tạo">Sáng tạo</option>
                              </select>
                         </div>

                         <div class="form-group">
                              <label>Ngôn ngữ *</label>
                              <select id="language" required>
                                   <option value="">Chọn...</option>
                                   <option value="Tiếng Việt">Tiếng Việt</option>
                                   <option value="English">English</option>
                                   <option value="Tiếng Trung">Tiếng Trung</option>
                              </select>
                         </div>

                         <div class="form-group">
                              <label>AI Model *</label>
                              <select id="bot" required>
                                   <option value="">Chọn...</option>
                                   <option value="GPT-4">GPT-4</option>
                                   <option value="Claude">Claude</option>
                                   <option value="Gemini">Gemini</option>
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
                              <p class="value" id="previewBot">GPT-4</p>
                         </div>
                    </section>

                    <button class="generate-btn" id="generateBtn">
                         <span class="edit-icon">📝</span> Generate bài viết
                    </button>

                    <div class="loading" id="loading" style="display: none; text-align: center; margin: 20px 0;">
                         <div class="spinner"></div>
                         <p>Đang tạo bài viết, vui lòng chờ...</p>
                    </div>

                    <div class="back-link">
                         <a href="#">← Quay lại trang chủ</a>
                    </div>
               </div>
          </div>
     </main>

     <div class="tooltip" id="tooltip"></div>

     <script>
          // ============================================
          // BIẾN TOÀN CỤC VÀ CẤU HÌNH
          // ============================================
          const API_BASE_URL = 'http://localhost:8080/api/v1';

          // Biến cho phần thông tin cơ bản
          const tabs = document.querySelectorAll(".tab");
          const subButtons = document.querySelectorAll("#private .sub");
          const fileSelector = document.getElementById("file-selector");
          const outsideFileListContainer = document.querySelector(".uploaded-file-list-outside");
          const subtabContentArea = document.getElementById("subtab-content-area");
          const STORAGE_KEY = 'uploadedFilesData';
          const MAX_STEP_KEY = 'maxCompletedStep';

          // Khởi tạo trạng thái từ Local Storage
          let maxCompletedStep = parseInt(localStorage.getItem(MAX_STEP_KEY)) || 0;
          let selectedFiles = [];
          let tempTextContent = localStorage.getItem('tempTextContent') || "";
          let tempLinkContent = localStorage.getItem('tempLinkContent') || "";
          let productLinks = JSON.parse(localStorage.getItem('productLinks')) || [{
                    name: "Laptop MacBook Air 13 inch M4 16GB/256GB",
                    url: "https://example.com/macbook-air-m4"
               },
               {
                    name: "Máy in nhiệt HPRT FT800 Wifi",
                    url: "https://example.com/may-in-nhiet-hprt-ft800"
               }
          ];

          // Ánh xạ tên subtab sang chỉ số bước
          const stepMap = {
               'file': 0,
               'text': 1,
               'link': 2
          };

          // ============================================
          // HÀM TIỆN ÍCH CHUNG
          // ============================================
          function formatFileSize(bytes) {
               if (bytes === 0) return '0 Bytes';
               const k = 1024;
               const dm = 2;
               const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
               const i = Math.floor(Math.log(bytes) / Math.log(k));
               return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
          }

          function showNotification(message, type = 'info') {
               const colors = {
                    success: '#28a745',
                    error: '#dc3545',
                    warning: '#ffc107',
                    info: '#17a2b8'
               };

               const notification = document.createElement('div');
               notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: ${colors[type] || colors.info};
                color: white;
                border-radius: 5px;
                z-index: 1000;
                box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                animation: slideIn 0.3s ease;
            `;
               notification.textContent = message;
               document.body.appendChild(notification);

               setTimeout(() => {
                    notification.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => notification.remove(), 300);
               }, 3000);
          }

          function showLoading(show) {
               const loading = document.getElementById('loading');
               const generateBtn = document.getElementById('generateBtn');

               if (show) {
                    loading.style.display = 'block';
                    generateBtn.disabled = true;
                    generateBtn.innerHTML = `<span class="edit-icon">⏳</span> Đang xử lý...`;
               } else {
                    loading.style.display = 'none';
                    generateBtn.disabled = false;
                    generateBtn.innerHTML = `<span class="edit-icon">📝</span> Generate bài viết`;
               }
          }

          function saveState() {
               localStorage.setItem(MAX_STEP_KEY, maxCompletedStep);
               localStorage.setItem('tempTextContent', tempTextContent);
               localStorage.setItem('tempLinkContent', tempLinkContent);
               localStorage.setItem('productLinks', JSON.stringify(productLinks));
               localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedFiles));
          }

          function readFileAsBase64(file) {
               return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
               });
          }

          // ============================================
          // PHẦN XỬ LÝ TAB TUẦN TỰ
          // ============================================

          // Hàm xử lý file sau khi chọn/kéo thả
          async function processFiles(files) {
               if (!files || files.length === 0) return;

               const allowedTypes = [
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
               ];

               const validFiles = Array.from(files).filter(f => allowedTypes.includes(f.type));

               if (validFiles.length === 0) {
                    showNotification("Chỉ chấp nhận file PDF, DOCX hoặc Excel!", "warning");
                    return;
               }

               // Xóa file cũ nếu có (chỉ cho phép 1 file)
               selectedFiles = [];

               for (const file of validFiles) {
                    const base64Content = await readFileAsBase64(file);
                    selectedFiles.push({
                         name: file.name,
                         size: file.size,
                         type: file.type,
                         base64: base64Content
                    });
                    break; // Chỉ lấy 1 file đầu tiên
               }

               renderFiles();
               saveState();

               // Đánh dấu bước 'file' đã hoàn thành
               if (selectedFiles.length > 0 && maxCompletedStep === 0) {
                    maxCompletedStep = 1;
                    saveState();
                    showNotification("✅ Tải file thành công! Bạn có thể chuyển sang bước tiếp theo.", "success");

                    updateSubtabStates();

                    // Nếu đang ở tab file, refresh UI
                    const currentSub = document.querySelector('.sub.active');
                    if (currentSub && currentSub.dataset.sub === 'file') {
                         setupSubtabContent('file');
                    }
               }
          }

          // 1. HÀM RENDER FILE
          function renderFiles() {
               outsideFileListContainer.innerHTML = "";
               const isFileStepCompleted = maxCompletedStep > 0;

               if (selectedFiles.length === 0) {
                    if (maxCompletedStep > 0) {
                         maxCompletedStep = 0;
                         saveState();
                         updateSubtabStates();

                         const currentSub = document.querySelector('.sub.active');
                         if (currentSub && currentSub.dataset.sub === 'file') {
                              setupSubtabContent('file');
                         }
                    }
                    return;
               }

               selectedFiles.forEach((file, index) => {
                    const fileSizeFormatted = formatFileSize(file.size);
                    const fileIcon = file.type.includes("pdf") ? '📄' :
                         file.type.includes("word") ? '📃' :
                         file.type.includes("excel") ? '📊' : '📁';

                    const fileDiv = document.createElement("div");
                    fileDiv.classList.add("uploaded-file");

                    fileDiv.innerHTML = `
                    <div class="file-info">
                        <span class="file-icon">${fileIcon}</span>
                        <div class="file-details">
                            <div class="file-name">${file.name}</div>
                            <div class="file-size-status">${fileSizeFormatted} - Đã tải lên</div>
                        </div>
                    </div>
                    ${isFileStepCompleted ? 
                        `<span class="locked-text">(Đã khóa)</span>` : 
                        `<button class="remove-file" data-index="${index}">×</button>`
                    }
                `;

                    outsideFileListContainer.appendChild(fileDiv);
               });

               // Thêm event listener cho các nút xóa (chỉ khi chưa hoàn thành bước)
               if (!isFileStepCompleted) {
                    document.querySelectorAll(".remove-file").forEach(btn => {
                         btn.addEventListener("click", (e) => {
                              e.stopPropagation();
                              const index = parseInt(e.currentTarget.dataset.index);
                              selectedFiles.splice(index, 1);
                              saveState();
                              renderFiles();
                         });
                    });
               }
          }

          // 2. HÀM SETUP NỘI DUNG SUBTAB (CÓ THANH CÔNG CỤ)
          function setupSubtabContent(sub) {
               subtabContentArea.innerHTML = '';
               const isFileStepCompleted = maxCompletedStep > 0;

               if (sub === 'file') {
                    outsideFileListContainer.style.display = 'flex';
                    renderFiles();
               } else {
                    outsideFileListContainer.style.display = 'none';
               }

               if (sub === "file") {
                    const uploadBoxHTML = `
                    <div class="upload-box" id="actual-upload-box">
                        <div class="icon">☁️</div>
                        <p>Kéo thả File (PDF, Docx, Excel) vào đây</p>
                    </div>
                `;
                    subtabContentArea.innerHTML = uploadBoxHTML;
                    const actualUploadBox = document.getElementById("actual-upload-box");

                    if (isFileStepCompleted) {
                         actualUploadBox.classList.remove('clickable');
                         actualUploadBox.style.pointerEvents = 'none';
                         actualUploadBox.style.opacity = '0.7';
                         actualUploadBox.style.backgroundColor = '#f5f5f5';
                         actualUploadBox.innerHTML = `
                        <div class="icon">✅</div>
                        <p style="color:#28a745;font-weight:600;">File đã được tải lên thành công!</p>
                    `;
                    } else {
                         actualUploadBox.classList.add('clickable');
                         actualUploadBox.style.pointerEvents = 'auto';
                         actualUploadBox.style.opacity = '1';
                         actualUploadBox.style.backgroundColor = 'white';

                         // Thêm event cho kéo thả
                         actualUploadBox.addEventListener("dragover", (e) => {
                              e.preventDefault();
                              actualUploadBox.classList.add("hover");
                         });

                         actualUploadBox.addEventListener("dragleave", () => {
                              actualUploadBox.classList.remove("hover");
                         });

                         actualUploadBox.addEventListener("drop", (e) => {
                              e.preventDefault();
                              actualUploadBox.classList.remove("hover");
                              processFiles(e.dataTransfer.files);
                         });

                         // Thêm event cho click
                         actualUploadBox.addEventListener("click", () => {
                              fileSelector.click();
                         });
                    }
               } else if (sub === "text") {
                    const isReadonly = maxCompletedStep > 1;
                    subtabContentArea.innerHTML = `
                    <div class="text-editor-container">
                        <div class="editor-toolbar">
                            <input type="number" class="size-input" value="5" min="1" max="7" ${isReadonly ? 'readonly' : ''}>
                            <select class="font-select" ${isReadonly ? 'disabled' : ''}>
                                <option value="Arial">Arial</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Courier New">Courier New</option>
                            </select>
                            <button class="toolbar-btn bold-btn" ${isReadonly ? 'disabled' : ''} title="In đậm">B</button>
                            <button class="toolbar-btn italic-btn" ${isReadonly ? 'disabled' : ''} title="In nghiêng">I</button>
                            <button class="toolbar-btn underline-btn" ${isReadonly ? 'disabled' : ''} title="Gạch chân">U</button>
                            <button class="toolbar-btn" ${isReadonly ? 'disabled' : ''} title="Căn trái">◀</button>
                            <button class="toolbar-btn" ${isReadonly ? 'disabled' : ''} title="Căn giữa">▣</button>
                            <button class="toolbar-btn" ${isReadonly ? 'disabled' : ''} title="Căn phải">▶</button>
                            <button class="color-btn red" ${isReadonly ? 'disabled' : ''} title="Màu đỏ"></button>
                            <button class="color-btn blue" ${isReadonly ? 'disabled' : ''} title="Màu xanh dương"></button>
                            <button class="color-btn green" ${isReadonly ? 'disabled' : ''} title="Màu xanh lá"></button>
                            <button class="color-btn black" ${isReadonly ? 'disabled' : ''} title="Màu đen"></button>
                        </div>
                        <textarea class="editor-textarea" id="textarea-text" placeholder="Nhập nội dung tại đây..." 
                                  ${isReadonly ? 'readonly' : ''}>${tempTextContent}</textarea>
                        ${isReadonly ? '<p style="color:#777; font-size:12px; margin-top:5px;">(Đã khóa - bạn đã chuyển sang bước tiếp theo)</p>' : ''}
                    </div>
                `;

                    const textarea = document.getElementById('textarea-text');
                    if (!isReadonly) {
                         textarea.addEventListener('input', (e) => {
                              tempTextContent = e.target.value;
                              saveState();

                              if (tempTextContent.trim() && maxCompletedStep < 2) {
                                   maxCompletedStep = 2;
                                   saveState();
                                   updateSubtabStates();
                              }
                         });

                         // Thêm event cho các nút toolbar
                         const boldBtn = subtabContentArea.querySelector('.bold-btn');
                         const italicBtn = subtabContentArea.querySelector('.italic-btn');
                         const underlineBtn = subtabContentArea.querySelector('.underline-btn');
                         const sizeInput = subtabContentArea.querySelector('.size-input');
                         const fontSelect = subtabContentArea.querySelector('.font-select');
                         const colorButtons = subtabContentArea.querySelectorAll('.color-btn');

                         boldBtn.addEventListener('click', () => {
                              document.execCommand('bold');
                              boldBtn.classList.toggle('active');
                         });

                         italicBtn.addEventListener('click', () => {
                              document.execCommand('italic');
                              italicBtn.classList.toggle('active');
                         });

                         underlineBtn.addEventListener('click', () => {
                              document.execCommand('underline');
                              underlineBtn.classList.toggle('active');
                         });

                         fontSelect.addEventListener('change', (e) => {
                              document.execCommand('fontName', false, e.target.value);
                         });

                         sizeInput.addEventListener('change', (e) => {
                              const size = parseInt(e.target.value);
                              const headingTag = `h${Math.min(6, Math.max(1, 7 - size))}`;
                              document.execCommand('formatBlock', false, headingTag);
                         });

                         colorButtons.forEach(btn => {
                              btn.addEventListener('click', (e) => {
                                   const color = getComputedStyle(e.target).backgroundColor;
                                   document.execCommand('foreColor', false, rgbToHex(color));
                              });
                         });
                    }

               } else if (sub === "link") {
                    const isReadonly = maxCompletedStep > 2;
                    subtabContentArea.innerHTML = `
                    <div class="link-input-container">
                        <input type="url" id="input-link" placeholder="Chèn link sản phẩm tại đây" 
                               value="${tempLinkContent}" 
                               ${isReadonly ? 'readonly' : ''}>
                        ${isReadonly ? '<p style="color:#777; font-size:12px; margin-top:5px;">(Đã khóa)</p>' : ''}
                        <div class="product-links-container">
                            ${productLinks.map((product, index) => `
                                <div class="product-link-item">
                                    <div class="product-name">${product.name}</div>
                                    <div class="product-url">${product.url}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                    const inputLink = document.getElementById('input-link');
                    if (!isReadonly) {
                         inputLink.addEventListener('input', (e) => {
                              tempLinkContent = e.target.value;
                              saveState();
                         });

                         inputLink.addEventListener('keypress', (e) => {
                              if (e.key === 'Enter' && tempLinkContent.trim()) {
                                   const productName = prompt("Nhập tên sản phẩm:", `Sản phẩm ${productLinks.length + 1}`);
                                   if (productName) {
                                        productLinks.push({
                                             name: productName,
                                             url: tempLinkContent
                                        });
                                        saveState();
                                        inputLink.value = '';
                                        tempLinkContent = '';
                                        setupSubtabContent('link');
                                   }
                              }
                         });
                    }
               }
          }

          // Hàm chuyển RGB sang Hex
          function rgbToHex(rgb) {
               const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
               if (!match) return '#000000';

               function hex(x) {
                    return ("0" + parseInt(x).toString(16)).slice(-2);
               }
               return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
          }

          // 3. HÀM CẬP NHẬT TRẠNG THÁI SUBTAB
          function updateSubtabStates() {
               subButtons.forEach(btn => {
                    const sub = btn.dataset.sub;
                    const step = stepMap[sub];

                    if (step < maxCompletedStep) {
                         btn.classList.add('locked');
                         btn.style.opacity = '0.6';
                         btn.title = `Bước "${btn.textContent}" đã hoàn thành và bị khóa`;
                    } else if (step === maxCompletedStep) {
                         btn.classList.remove('locked');
                         btn.style.opacity = '1';
                         btn.title = `Bước hiện tại: ${btn.textContent}`;
                    } else if (step === maxCompletedStep + 1) {
                         btn.classList.remove('locked');
                         btn.style.opacity = '1';
                         btn.title = `Bước tiếp theo: ${btn.textContent}`;
                    } else {
                         btn.classList.remove('locked');
                         btn.style.opacity = '0.4';
                         btn.title = `Chưa đến bước này`;
                    }
               });
          }

          function getStepName(step) {
               const stepNames = {
                    0: 'Tải file',
                    1: 'Nhập văn bản',
                    2: 'Link sản phẩm'
               };
               return stepNames[step] || '';
          }

          // ============================================
          // EVENT LISTENERS CHO TAB TUẦN TỰ
          // ============================================

          // Xử lý SUBBUTTONS
          subButtons.forEach((btn) => {
               btn.addEventListener("click", (e) => {
                    const sub = btn.dataset.sub;
                    const targetStep = stepMap[sub];

                    if (btn.classList.contains('locked')) {
                         e.preventDefault();
                         alert(`❌ Không thể quay lại bước "${btn.textContent}" đã hoàn thành.\n\nHệ thống làm việc theo tuần tự:\n1. Tải file → 2. Nhập văn bản → 3. Link sản phẩm`);
                         return;
                    }

                    if (targetStep > maxCompletedStep + 1) {
                         e.preventDefault();
                         const currentStepName = getStepName(maxCompletedStep);
                         alert(`⏳ Vui lòng hoàn thành bước "${currentStepName}" trước khi chuyển sang bước tiếp theo.`);
                         return;
                    }

                    subButtons.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");

                    setupSubtabContent(sub);
               });
          });

          // Xử lý TAB CHÍNH
          tabs.forEach(tab => {
               tab.addEventListener("click", () => {
                    tabs.forEach(t => t.classList.remove("active"));
                    tab.classList.add("active");

                    const target = tab.dataset.tab;
                    document.querySelectorAll(".content").forEach(c => {
                         c.classList.toggle("active", c.id === target);
                    });

                    if (target === "private") {
                         const activeSub = document.querySelector('.sub.active');
                         if (activeSub) {
                              setupSubtabContent(activeSub.dataset.sub);
                         } else {
                              document.querySelector('.sub[data-sub="file"]').click();
                         }
                    } else {
                         outsideFileListContainer.style.display = 'none';
                    }
               });
          });

          // Xử lý CHỌN FILE TỪ INPUT
          fileSelector.addEventListener("change", (e) => {
               processFiles(e.target.files);
               e.target.value = null;
          });

          // ============================================
          // CÁC CHỨC NĂNG KHÁC
          // ============================================

          // Xử lý thêm tag từ khóa phụ
          const secondaryKeywordInput = document.getElementById('secondaryKeyword');
          const tagContainer = document.getElementById('tagContainer');

          secondaryKeywordInput.addEventListener('keypress', function(e) {
               if (e.key === 'Enter' && this.value.trim() !== '') {
                    e.preventDefault();
                    addTag(this.value.trim());
                    this.value = '';
               }
          });

          function addTag(text) {
               const tag = document.createElement('span');
               tag.className = 'tag';
               tag.innerHTML = `${text} <span class="close-icon" onclick="this.parentElement.remove()">×</span>`;
               tagContainer.appendChild(tag);
          }

          function getSecondaryKeywords() {
               const tags = tagContainer.querySelectorAll('.tag');
               return Array.from(tags).map(tag =>
                    tag.textContent.replace('×', '').trim()
               );
          }

          // Xử lý gợi ý AI
          const aiSuggestBtn = document.getElementById('aiSuggestBtn');
          const articleTitle = document.getElementById('articleTitle');
          const userQuery = document.getElementById('user_query');

          aiSuggestBtn.addEventListener('click', async function() {
               const keyword = userQuery.value.trim();

               if (!keyword) {
                    showNotification('Vui lòng nhập từ khóa chính trước!', 'warning');
                    return;
               }

               showLoading(true);

               try {
                    const titleData = {
                         main_keyword: keyword,
                         language: document.getElementById('language').value || 'Tiếng Việt'
                    };

                    // Mô phỏng API call
                    setTimeout(() => {
                         const mockTitles = [
                              `${keyword} - Hướng dẫn chi tiết từ A đến Z`,
                              `Khám phá ${keyword}: Bí quyết thành công`,
                              `${keyword}: Tất cả những gì bạn cần biết`,
                              `Làm thế nào để tối ưu ${keyword} hiệu quả nhất`,
                              `${keyword}: Xu hướng và ứng dụng thực tế`
                         ];

                         showTitleSuggestions(mockTitles);
                         showLoading(false);
                    }, 1000);

               } catch (error) {
                    console.error('Error generating title suggestion:', error);
                    showNotification('Không thể tạo gợi ý. Vui lòng thử lại!', 'error');
                    showLoading(false);
               }
          });

          function showTitleSuggestions(titles) {
               const modal = document.createElement('div');
               modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            `;

               const modalContent = document.createElement('div');
               modalContent.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 10px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            `;

               modalContent.innerHTML = `
                <h3 style="margin-bottom: 20px; color: #333;">Chọn tiêu đề bạn thích:</h3>
                <div id="titleSuggestions" style="margin-bottom: 20px;">
                    ${titles.map((title, index) => `
                        <div style="padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 5px; cursor: pointer; transition: background 0.3s;"
                             onclick="selectTitle('${title.replace(/'/g, "\\'")}')"
                             onmouseover="this.style.background='#f8f9fa'"
                             onmouseout="this.style.background='white'">
                            ${index + 1}. ${title}
                        </div>
                    `).join('')}
                </div>
                <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" 
                        style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Hủy
                </button>
            `;

               modal.appendChild(modalContent);
               document.body.appendChild(modal);
          }

          window.selectTitle = function(title) {
               articleTitle.value = title;
               document.querySelector('div[style*="position: fixed"]').remove();
               showNotification('Đã chọn tiêu đề thành công!', 'success');
          };

          // Xử lý tùy chọn nâng cao
          const advancedToggle = document.getElementById('advancedToggle');
          const advancedContent = document.getElementById('advancedContent');

          advancedToggle.addEventListener('click', function() {
               this.classList.toggle('open');
               advancedContent.classList.toggle('open');
          });

          // Cập nhật preview khi thay đổi độ dài
          const articleLength = document.getElementById('article_length');
          const previewLength = document.getElementById('previewLength');
          const previewStructure = document.getElementById('previewStructure');

          articleLength.addEventListener('input', function() {
               const length = parseInt(this.value);
               previewLength.textContent = `${length} từ`;

               let structure = [
                    'Phần mở đầu (100-150 từ)',
                    '3-4 phần nội dung chính',
                    'Kết luận và CTA'
               ];

               if (length >= 1200 && length <= 2000) {
                    structure = [
                         'Phần mở đầu (150-200 từ)',
                         '5-6 phần nội dung chính',
                         'Case study & Ví dụ',
                         'Kết luận và CTA'
                    ];
               } else if (length > 2000) {
                    structure = [
                         'Phần mở đầu chi tiết (200-300 từ)',
                         '7-10 phần nội dung sâu',
                         'Case study & Phân tích',
                         'FAQ',
                         'Kết luận và CTA'
                    ];
               }

               previewStructure.innerHTML = structure.map(item =>
                    `<li><span class="bullet"></span> ${item}</li>`
               ).join('');
          });

          // Cập nhật tone giọng preview
          const toneSelect = document.getElementById('writing_tone');
          const previewTone = document.getElementById('previewTone');

          toneSelect.addEventListener('change', function() {
               const toneMap = {
                    'Chuyên nghiệp': '"Trong thời đại công nghệ 4.0, việc ứng dụng AI vào doanh nghiệp không chỉ là xu hướng mà đã trở thành yếu tố quyết định."',
                    'Thân thiện': '"Bạn đã bao giờ tự hỏi làm thế nào AI có thể giúp công việc của bạn dễ dàng hơn? Hãy cùng khám phá nhé!"',
                    'Trang trọng': '"Kiến trúc học sâu và các mô hình transformer đang định hình lại cách chúng ta tiếp cận bài toán tối ưu hóa trong doanh nghiệp."',
                    'Sáng tạo': '"AI không chỉ là công cụ - đó là cánh cửa mở ra thế giới của những khả năng vô tận và đột phá!"'
               };

               previewTone.textContent = toneMap[this.value] || toneMap['Chuyên nghiệp'];
          });

          // Tooltip cho info icon
          const infoIcons = document.querySelectorAll('.info-icon');
          const tooltip = document.getElementById('tooltip');

          infoIcons.forEach(icon => {
               icon.addEventListener('mouseenter', function(e) {
                    const tooltipText = this.getAttribute('data-tooltip');
                    tooltip.textContent = tooltipText;
                    tooltip.classList.add('show');

                    const rect = this.getBoundingClientRect();
                    tooltip.style.left = rect.left + 'px';
                    tooltip.style.top = (rect.bottom + 5) + 'px';
               });

               icon.addEventListener('mouseleave', function() {
                    tooltip.classList.remove('show');
               });
          });

          // Xử lý nút Generate
          const generateBtn = document.getElementById('generateBtn');
          generateBtn.addEventListener('click', async function(e) {
               e.preventDefault();

               const user_query = document.getElementById('user_query').value.trim();
               const title = document.getElementById('articleTitle').value.trim();
               const content_type = document.getElementById('content_type').value;
               const writing_tone = document.getElementById('writing_tone').value;
               const language = document.getElementById('language').value;
               const bot = document.getElementById('bot').value;
               const article_length = document.getElementById('article_length').value;
               const custom_instructions = document.getElementById('custom_instructions').value;
               const metaDescription = document.getElementById('metaDescription').value;
               const internalLinks = document.getElementById('internalLinks').value;

               if (!user_query || !content_type || !writing_tone || !language || !bot) {
                    showNotification('Vui lòng điền đầy đủ các trường bắt buộc!', 'warning');
                    return;
               }

               showLoading(true);

               // Mô phỏng tạo bài viết
               setTimeout(() => {
                    showNotification('Bài viết đã được tạo thành công!', 'success');
                    showLoading(false);

                    // Lưu kết quả giả lập
                    const mockResult = {
                         success: true,
                         article: {
                              title: title || `Bài viết về ${user_query}`,
                              content: `Đây là nội dung bài viết về ${user_query}...`,
                              length: article_length
                         }
                    };

                    sessionStorage.setItem('articleResult', JSON.stringify(mockResult));
                    sessionStorage.setItem('articleTitle', title || mockResult.article.title);
                    sessionStorage.setItem('mainKeyword', user_query);

                    // Có thể chuyển hướng ở đây
                    // window.location.href = 'ket-qua-bai-viet.php';
               }, 2000);
          });

          // Xử lý lưu nháp
          const saveDraftBtn = document.getElementById('saveDraft');
          saveDraftBtn.addEventListener('click', function(e) {
               e.preventDefault();

               const draftData = {
                    user_query: document.getElementById('user_query').value,
                    articleTitle: document.getElementById('articleTitle').value,
                    secondaryKeywords: getSecondaryKeywords(),
                    content_type: document.getElementById('content_type').value,
                    writing_tone: document.getElementById('writing_tone').value,
                    language: document.getElementById('language').value,
                    bot: document.getElementById('bot').value,
                    article_length: document.getElementById('article_length').value,
                    custom_instructions: document.getElementById('custom_instructions').value,
                    metaDescription: document.getElementById('metaDescription').value,
                    internalLinks: document.getElementById('internalLinks').value,
                    timestamp: new Date().toISOString()
               };

               localStorage.setItem('articleDraft', JSON.stringify(draftData));
               showNotification('Nháp đã được lưu thành công!', 'success');
          });

          // Khôi phục nháp nếu có
          function loadDraft() {
               const draft = localStorage.getItem('articleDraft');
               if (draft) {
                    const draftData = JSON.parse(draft);

                    document.getElementById('user_query').value = draftData.user_query || '';
                    document.getElementById('articleTitle').value = draftData.articleTitle || '';

                    if (draftData.secondaryKeywords) {
                         draftData.secondaryKeywords.forEach(keyword => {
                              const tag = document.createElement('span');
                              tag.className = 'tag';
                              tag.innerHTML = `${keyword} <span class="close-icon" onclick="this.parentElement.remove()">×</span>`;
                              tagContainer.appendChild(tag);
                         });
                    }

                    if (draftData.content_type) {
                         document.getElementById('content_type').value = draftData.content_type;
                    }
                    if (draftData.writing_tone) {
                         document.getElementById('writing_tone').value = draftData.writing_tone;
                    }
                    if (draftData.language) {
                         document.getElementById('language').value = draftData.language;
                    }
                    if (draftData.bot) {
                         document.getElementById('bot').value = draftData.bot;
                    }

                    document.getElementById('article_length').value = draftData.article_length || '1200';
                    document.getElementById('custom_instructions').value = draftData.custom_instructions || '';
                    document.getElementById('metaDescription').value = draftData.metaDescription || '';
                    document.getElementById('internalLinks').value = draftData.internalLinks || '';

                    articleLength.dispatchEvent(new Event('input'));
                    if (draftData.writing_tone) {
                         toneSelect.value = draftData.writing_tone;
                         toneSelect.dispatchEvent(new Event('change'));
                    }

                    showNotification('Đã khôi phục nháp thành công!', 'info');
               }
          }

          // Hiển thị thông báo khi thay đổi cấu hình
          const configElements = document.querySelectorAll('select, textarea, input');
          configElements.forEach(element => {
               element.addEventListener('change', function() {
                    this.style.borderColor = '#28a745';
                    setTimeout(() => {
                         this.style.borderColor = '#dee2e6';
                    }, 1000);
               });
          });

          // ============================================
          // KHỞI TẠO TRANG
          // ============================================
          function initializePage() {
               // Tải dữ liệu từ Local Storage
               const savedFiles = localStorage.getItem(STORAGE_KEY);
               if (savedFiles) {
                    try {
                         selectedFiles = JSON.parse(savedFiles);
                    } catch (e) {
                         console.error("Lỗi khi đọc file từ Local Storage:", e);
                         selectedFiles = [];
                    }
               }

               // Cập nhật trạng thái subtab
               updateSubtabStates();

               // Kích hoạt subtab đầu tiên
               const firstSub = document.querySelector('.sub[data-sub="file"]');
               if (firstSub && !firstSub.classList.contains('locked')) {
                    firstSub.click();
               } else {
                    const accessibleSub = document.querySelector('.sub:not(.locked)');
                    if (accessibleSub) {
                         accessibleSub.click();
                    }
               }

               // Load draft nếu có
               loadDraft();

               // Kích hoạt event cho độ dài
               articleLength.dispatchEvent(new Event('input'));

               // Cập nhật preview bot
               const botSelect = document.getElementById('bot');
               const previewBot = document.getElementById('previewBot');
               botSelect.addEventListener('change', function() {
                    previewBot.textContent = this.value;
               });

               showNotification('Trang đã sẵn sàng!', 'info');
          }

          // Chạy khi trang load xong
          document.addEventListener('DOMContentLoaded', initializePage);
     </script>
</body>

</html>