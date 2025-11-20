<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">
    <title>Cấu hình bài viết - AI SEO Tool</title>
    <style>
        /* Giữ nguyên toàn bộ CSS như trong code gốc */
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
            --success-color: #10B981;
            --error-color: #EF4444;
            --warning-color: #F59E0B;
        }

        /* ... (giữ nguyên toàn bộ CSS như code gốc) ... */


        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: Montserrat;
        }

        body {
            background-color: var(--bg-dark);
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
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
        }

        input[type="text"], select, .input-with-button input {
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

        input[type="text"]:focus, select:focus {
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
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
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
            background-color:#2563EB;
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
            box-shadow: 0 2px 6px rgba(0,0,0,0.06);
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
            color:#16A34A;
        }

        .structure-list {
            list-style: none;
            padding-left: 0;
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

        /* Thêm style cho kết quả bài viết */
        .generated-article {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border: 1px solid #e9ecef;
        }

        .article-preview {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .error-message {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #f5c6cb;
        }

        .success-message {
            background: #d1ecf1;
            color: #0c5460;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #bee5eb;
        }

        /* ===== THINKING PAGE STYLES ===== */
        .thinking-container {
            display: none;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px;
        }

        .header-top {
            max-width: 1200px;
            margin: 0 auto 20px;
            padding: 15px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            height: 60px;
        }

        .header-title {
            font-size: 18px;
            font-weight: 600;
            color: #000;
            flex: 1;
            text-align: center;
            letter-spacing: 0.2px;
        }

        .logo_container img {
            max-width: 120px;
            height: auto;
        }

        .progress-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 50px;
            position: relative;
        }

        .progress-line {
            position: absolute;
            top: -28px;
            left: 0;
            right: 0;
            height: 10px;
            background: #e0e0e0;
            z-index: 0;
            border-radius: 32px;
        }

        .progress-line-filled {
            position: absolute;
            top: -28px;
            left: 0;
            width: 0%;
            height: 10px;
            background: linear-gradient(to right, #14a33fff ,  #1565C0);
            z-index: 1;
            transition: width 0.5s ease;
            border-radius: 32px;
        }

        .step {
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 2;
            padding: 0 10px;
        }

        .step-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            font-weight: bold;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .step.completed .step-circle {
            background: #4CAF50;
            color: white;
        }

        .step.active .step-circle {
            background: #2196F3;
            color: white;
        }

        .step.inactive .step-circle {
            background: #e0e0e0;
            color: #999;
        }

        .step-label {
            font-size: 13px;
            color: #666;
            text-align: center;
            white-space: nowrap;
        }

        .main-title {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            color: #000;
            margin-bottom: 20px;
        }

        .time-info {
            text-align: center;
            color: #666;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .time-number {
            color: #2196F3;
            font-weight: bold;
        }

        .complexity {
            text-align: center;
            color: #999;
            font-size: 14px;
            margin-bottom: 40px;
        }

        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid #e0e0e0;
            border-top: 2px solid #2196F3;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .steps-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-bottom: 30px;
        }

        .step-card {
            border-radius: 12px;
            padding: 24px;
            display: flex;
            gap: 20px;
            align-items: flex-start;
            transition: all 0.3s ease;
        }

        .step-card.completed {
            background: #E8F5E9;
            box-shadow: 0 6px 18px rgba(81, 160, 98, 0.35);
        }

        .step-card.active {
            background: #E3F2FD;
            box-shadow: 0 6px 18px rgba(60, 167, 255, 0.35);
        }

        .step-card.inactive {
            background: #FAFAFA;
        }

        .step-icon {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 24px;
        }

        .step-card.completed .step-icon {
            background: #4CAF50;
            color: white;
        }

        .step-card.active .step-icon {
            background: #2196F3;
            color: white;
        }

        .step-card.inactive .step-icon {
            background: #BDBDBD;
            color: white;
        }

        .step-content {
            flex: 1;
        }

        .step-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
        }

        .step-number {
            font-size: 12px;
            font-weight: bold;
        }

        .step-card.completed .step-number {
            color: #4CAF50;
        }

        .step-card.active .step-number {
            color: #2196F3;
        }

        .step-card.inactive .step-number {
            color: #999;
        }

        .step-title {
            font-size: 18px;
            font-weight: bold;
            color: #000;
        }

        .step-description {
            color: #666;
            font-size: 14px;
            line-height: 1.6;
        }

        .step-status {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 16px;
        }

        .step-card.completed .step-status {
            background: #4CAF50;
            color: white;
        }

        .step-card.active .step-status {
            background: #2196F3;
            color: white;
        }

        .step-card.inactive .step-status {
            background: #E0E0E0;
            color: #999;
        }

        .settings-btn {
            text-align: center;
            padding: 20px;
            border-radius: 12px;
        }

        .settings-btn h4 {
            margin-bottom: 15px;
            color: #333;
        }

        .settings-btn a {
            color: #2196F3;
            text-decoration: none;
            font-size: 14px;
            padding: 8px 12px;
            margin: 5px;
            display: inline-block;
            border-radius: 6px;
            transition: all 0.3s ease;
        }

        .settings-btn a:hover {
            background: #e3f2fd;
        }

        .auto-btn {
            display: inline-block;
            background: #2196F3;
            color: white !important;
            padding: 12px 24px !important;
            border-radius: 8px;
            font-weight: bold;
            margin-top: 10px;
        }

        .auto-btn:hover {
            background: #1976D2;
        }

        /* Thêm style cho loading */
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            flex-direction: column;
        }

        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #2196F3;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }

        .loading-text {
            font-size: 18px;
            color: #2196F3;
            font-weight: bold;
        }

        /* Style cho real-time updates */
        .real-time-update {
            background: #e3f2fd;
            padding: 10px;
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid #2196F3;
        }

        .update-time {
            font-size: 12px;
            color: #666;
            float: right;
        }

        .server-status {
            background: #fff3cd;
            padding: 10px;
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid #ffc107;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
            .thinking-container {
                padding: 20px;
            }
            
            .header-top {
                padding: 15px 20px;
            }
            
            .main-title {
                font-size: 22px;
            }
            
            .step-label {
                font-size: 11px;
            }
            
            .step-circle {
                width: 35px;
                height: 35px;
                font-size: 12px;
            }
            
            .step-card {
                padding: 16px;
            }
        }
        /* Thêm styles mới */
        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }

        .status-online {
            background: #D1FAE5;
            color: #065F46;
        }

        .status-offline {
            background: #FEE2E2;
            color: #991B1B;
        }

        .status-checking {
            background: #FEF3C7;
            color: #92400E;
        }

        .processing-details {
            background: #F8FAFC;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid var(--primary-blue);
        }

        .detail-item {
            display: flex;
            justify-content: between;
            margin-bottom: 5px;
        }

        .detail-label {
            font-weight: 500;
            color: var(--text-sub);
            min-width: 120px;
        }

        .detail-value {
            color: var(--text-light);
            font-weight: 500;
        }

        .retry-btn {
            background: var(--warning-color);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-left: 10px;
        }

        .retry-btn:hover {
            background: #D97706;
        }
    </style>
</head>
<body>
    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loadingOverlay">
        <div class="loading-spinner"></div>
        <div class="loading-text">Đang tạo bài viết...</div>
    </div>

    <!-- Config Page -->
    <div id="configPage">
        <header class="main-header">
            <div class="logo">
                <img src="AIS.png" alt="AI SEO Tool">
            </div>
            <nav class="main-nav">
                <a href="#">Trang chủ</a>
                <a href="#">Viết bài mới</a>
            </nav>
            <div class="user-info">
                <a href="#" id="saveDraft">Lưu nháp</a>
                <div class="status-indicator" id="serverStatusIndicator">
                    <div class="spinner" style="width: 12px; height: 12px;"></div>
                    <span>Đang kiểm tra server...</span>
                </div>
                <div class="avatar">
                    <img src="chibi.jpg" alt="Avatar">
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

            <form method="POST" id="articleConfigForm">
                <div class="content-wrapper">
                    <div class="column left-column">
                        <section class="card basic-info">
                            <h2 class="card-title">Thông tin cơ bản</h2>
                            
                            <div class="form-group">
                                <label>Từ khóa chính <span class="required">*</span></label>
                                <div class="input-with-icon">
                                    <input type="text" id="mainKeyword" name="query" placeholder="VD: công nghệ AI 2024, xu hướng thời trang" value="<?php echo htmlspecialchars($_POST['query'] ?? ''); ?>" required>
                                    <span class="info-icon" data-tooltip="Từ khóa chính là từ khóa mục tiêu chính mà bạn muốn tối ưu SEO">?</span>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Từ khóa phụ</label>
                                <input type="text" id="secondaryKeyword" name="secondary_keywords" placeholder="Nhập từ khóa và nhấn Enter để thêm">
                                <div class="tag-container" id="tagContainer">
                                    <!-- Tags sẽ được thêm bằng JavaScript -->
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Tiêu đề bài viết</label>
                                <div class="input-with-button">
                                    <input type="text" id="articleTitle" name="article_title" placeholder="Nhập tiêu đề hoặc để AI gợi ý" value="<?php echo htmlspecialchars($_POST['article_title'] ?? ''); ?>">
                                    <button type="button" class="ai-suggest-btn" id="aiSuggestBtn">
                                        <img src="ico.png" alt="AI"> Gợi ý bằng AI
                                    </button>
                                </div>
                            </div>
                        </section>
                        
                        <section class="card content-config">
                            <h2 class="card-title">Cấu hình nội dung</h2>
                            
                            <div class="form-group">
                                <label>Độ dài bài viết</label>
                                <select id="articleLength" name="article_length">
                                    <option value="300-500" <?php echo ($_POST['article_length'] ?? '800-1200') === '300-500' ? 'selected' : ''; ?>>Ngắn (300-500 từ)</option>
                                    <option value="500-800" <?php echo ($_POST['article_length'] ?? '800-1200') === '500-800' ? 'selected' : ''; ?>>Trung bình (500-800 từ)</option>
                                    <option value="800-1200" <?php echo ($_POST['article_length'] ?? '800-1200') === '800-1200' ? 'selected' : ''; ?>>Chi tiết (800-1200 từ)</option>
                                    <option value="1200-2000" <?php echo ($_POST['article_length'] ?? '800-1200') === '1200-2000' ? 'selected' : ''; ?>>Rất chi tiết (1200-2000 từ)</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Loại bài viết</label>
                                <select id="articleType" name="article_type">
                                    <option value="blog" <?php echo ($_POST['article_type'] ?? 'blog') === 'blog' ? 'selected' : ''; ?>>Blog SEO cơ bản</option>
                                    <option value="news" <?php echo ($_POST['article_type'] ?? 'blog') === 'news' ? 'selected' : ''; ?>>Tin tức</option>
                                    <option value="review" <?php echo ($_POST['article_type'] ?? 'blog') === 'review' ? 'selected' : ''; ?>>Đánh giá</option>
                                    <option value="guide" <?php echo ($_POST['article_type'] ?? 'blog') === 'guide' ? 'selected' : ''; ?>>Hướng dẫn</option>
                                    <option value="product" <?php echo ($_POST['article_type'] ?? 'blog') === 'product' ? 'selected' : ''; ?>>Giới thiệu sản phẩm</option>
                                    <option value="landing" <?php echo ($_POST['article_type'] ?? 'blog') === 'landing' ? 'selected' : ''; ?>>Landing page</option>
                                    <option value="toplist" <?php echo ($_POST['article_type'] ?? 'blog') === 'toplist' ? 'selected' : ''; ?>>Top list/so sánh</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Tone giọng</label>
                                <select id="tone" name="tone">
                                    <option value="chuyên nghiệp" <?php echo ($_POST['tone'] ?? 'chuyên nghiệp') === 'chuyên nghiệp' ? 'selected' : ''; ?>>Chuyên nghiệp</option>
                                    <option value="thân thiện" <?php echo ($_POST['tone'] ?? 'chuyên nghiệp') === 'thân thiện' ? 'selected' : ''; ?>>Thân thiện</option>
                                    <option value="trang trọng" <?php echo ($_POST['tone'] ?? 'chuyên nghiệp') === 'trang trọng' ? 'selected' : ''; ?>>Sang trọng</option>
                                    <option value="thuyết phục" <?php echo ($_POST['tone'] ?? 'chuyên nghiệp') === 'thuyết phục' ? 'selected' : ''; ?>>Thuyết phục</option>
                                </select>
                            </div>
                            
                            <div class="form-group lang-market-group">
                                <div class="input-half">
                                    <label>Ngôn ngữ</label>
                                    <select id="language" name="language">
                                        <option value="vi" <?php echo ($_POST['language'] ?? 'vi') === 'vi' ? 'selected' : ''; ?>>Tiếng Việt</option>
                                        <option value="en" <?php echo ($_POST['language'] ?? 'vi') === 'en' ? 'selected' : ''; ?>>English</option>
                                    </select>
                                </div>
                                <div class="input-half">
                                    <label>Thị trường</label>
                                    <select id="market" name="market">
                                        <option value="Việt Nam" <?php echo ($_POST['market'] ?? 'Việt Nam') === 'Việt Nam' ? 'selected' : ''; ?>>Việt Nam</option>
                                        <option value="Đông Nam Á" <?php echo ($_POST['market'] ?? 'Việt Nam') === 'Đông Nam Á' ? 'selected' : ''; ?>>Đông Nam Á</option>
                                        <option value="Toàn cầu" <?php echo ($_POST['market'] ?? 'Việt Nam') === 'Toàn cầu' ? 'selected' : ''; ?>>Toàn cầu</option>
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
                                    <input type="text" name="meta_description" placeholder="Mô tả ngắn cho công cụ tìm kiếm" value="<?php echo htmlspecialchars($_POST['meta_description'] ?? ''); ?>">
                                </div>
                                <div class="form-group">
                                    <label>Hướng dẫn tùy chỉnh</label>
                                    <textarea name="custom_instructions" placeholder="Ví dụ: Tập trung vào lợi ích cho người dùng, sử dụng ví dụ thực tế, tránh thuật ngữ kỹ thuật..." rows="3"><?php echo htmlspecialchars($_POST['custom_instructions'] ?? ''); ?></textarea>
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

                            <div class="preview-item">
                                <label>Trạng thái server</label>
                                <div id="serverPreviewStatus">
                                    <div class="status-indicator status-checking">
                                        <div class="spinner" style="width: 12px; height: 12px;"></div>
                                        <span>Đang kiểm tra...</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <button type="button" class="generate-btn" id="generateBtn" onclick="validateAndGenerate()">
                            <span class="edit-icon"><img src="ico.png" alt="Generate"></span> Generate bài viết
                        </button>
                        
                        <div class="back-link">
                            <a href="#" onclick="showConfigPage(); return false;">← Quay lại trang chủ</a>
                        </div>
                    </div>
                </div>
            </form>

            <div id="articleResult">
                <?php
                // session_start();
                if (isset($_SESSION['generated_article'])) {
                    echo $_SESSION['generated_article'];
                    unset($_SESSION['generated_article']);
                }
                ?>
            </div>
        </main>
    </div>

    <!-- Thinking Page -->
    <div id="thinkingPage" class="thinking-container" style="display: none;">
        <!-- Giữ nguyên phần thinking page như code gốc -->
        <div class="header-top">
            <div class="logo_container">
                <img src="AIS.png" alt="Logo">
            </div>
            <div class="header-title" id="thinkingTitle">Đang tạo bài viết...</div>
        </div>
        
        <div class="progress-bar">
            <div class="progress-line"></div>
            <div class="progress-line-filled" id="realProgressBar" style="width: 0%"></div>
            
            <div class="step inactive" id="step1">
                <div class="step-circle">1</div>
                <div class="step-label">Khởi tạo</div>
            </div>
            
            <div class="step inactive" id="step2">
                <div class="step-circle">2</div>
                <div class="step-label">Tìm kiếm</div>
            </div>
            
            <div class="step inactive" id="step3">
                <div class="step-circle">3</div>
                <div class="step-label">Phân tích</div>
            </div>
            
            <div class="step inactive" id="step4">
                <div class="step-circle">4</div>
                <div class="step-label">Tạo bài</div>
            </div>
            
            <div class="step inactive" id="step5">
                <div class="step-circle">5</div>
                <div class="step-label">Hoàn tất</div>
            </div>
        </div>
        
        <h1 class="main-title" id="currentStepTitle">ĐANG KHỞI TẠO HỆ THỐNG</h1>
        
        <div class="time-info">
            <div class="spinner"></div>
            <span id="timeEstimate">Đang kết nối đến server...</span>
        </div>
        
        <div class="complexity" id="complexityInfo">Trạng thái: Đang chuẩn bị</div>

        <!-- Processing Details -->
        <div class="processing-details" id="processingDetails">
            <div class="detail-item">
                <span class="detail-label">Từ khóa chính:</span>
                <span class="detail-value" id="detailKeyword">-</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Loại bài viết:</span>
                <span class="detail-value" id="detailType">-</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Độ dài:</span>
                <span class="detail-value" id="detailLength">-</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Tone giọng:</span>
                <span class="detail-value" id="detailTone">-</span>
            </div>
        </div>

        <div class="server-status" id="serverStatus">
            <strong>🖥️ Trạng thái server:</strong> 
            <span id="serverStatusText">Đang kiểm tra kết nối...</span>
        </div>

        <div id="realTimeUpdates" style="margin-bottom: 20px;">
            <div class="real-time-update">
                <strong>🚀 Bắt đầu quá trình tạo bài viết...</strong>
                <span class="update-time" id="lastUpdateTime"><?php echo date('H:i:s'); ?></span>
            </div>
        </div>
        
        <div class="steps-list">
            <!-- Giữ nguyên các step cards như code gốc -->
            <div class="step-card inactive" id="card1">
                <div class="step-icon">🔧</div>
                <div class="step-content">
                    <div class="step-header">
                        <span class="step-number">Bước 1</span>
                        <span class="step-title">Khởi tạo hệ thống</span>
                    </div>
                    <div class="step-description">
                        <span id="step1Desc">Đang kết nối đến AI Server và chuẩn bị môi trường xử lý...</span>
                        <div id="step1Detail" style="margin-top: 8px; font-size: 13px; color: #888;"></div>
                    </div>
                </div>
                <div class="step-status">1</div>
            </div>
            
            <!-- Các step card khác giữ nguyên -->
            <div class="step-card inactive" id="card2">
                <div class="step-icon">🔍</div>
                <div class="step-content">
                    <div class="step-header">
                        <span class="step-number">Bước 2</span>
                        <span class="step-title">Tìm kiếm & Thu thập</span>
                    </div>
                    <div class="step-description">
                        <span id="step2Desc">Đang tìm kiếm thông tin từ các nguồn đáng tin cậy...</span>
                        <div id="step2Detail" style="margin-top: 8px; font-size: 13px; color: #888;"></div>
                    </div>
                </div>
                <div class="step-status">2</div>
            </div>
            
            <div class="step-card inactive" id="card3">
                <div class="step-icon">📊</div>
                <div class="step-content">
                    <div class="step-header">
                        <span class="step-number">Bước 3</span>
                        <span class="step-title">Phân tích & Xử lý</span>
                    </div>
                    <div class="step-description">
                        <span id="step3Desc">AI đang phân tích dữ liệu và xác định cấu trúc bài viết...</span>
                        <div id="step3Detail" style="margin-top: 8px; font-size: 13px; color: #888;"></div>
                    </div>
                </div>
                <div class="step-status">3</div>
            </div>
            
            <div class="step-card inactive" id="card4">
                <div class="step-icon">✍️</div>
                <div class="step-content">
                    <div class="step-header">
                        <span class="step-number">Bước 4</span>
                        <span class="step-title">Tạo & Tối ưu</span>
                    </div>
                    <div class="step-description">
                        <span id="step4Desc">Đang tạo nội dung và tối ưu hóa cho SEO...</span>
                        <div id="step4Detail" style="margin-top: 8px; font-size: 13px; color: #888;"></div>
                    </div>
                </div>
                <div class="step-status">4</div>
            </div>
            
            <div class="step-card inactive" id="card5">
                <div class="step-icon">✅</div>
                <div class="step-content">
                    <div class="step-header">
                        <span class="step-number">Bước 5</span>
                        <span class="step-title">Hoàn tất</span>
                    </div>
                    <div class="step-description">
                        <span id="step5Desc">Kiểm tra cuối cùng và chuẩn bị hiển thị kết quả...</span>
                        <div id="step5Detail" style="margin-top: 8px; font-size: 13px; color: #888;"></div>
                    </div>
                </div>
                <div class="step-status">5</div>
            </div>
        </div>
        
        <div class="settings-btn">
            <h4>🎮 Điều khiển hệ thống</h4>
            <div id="progressStatus" style="margin-bottom: 15px;">
                <strong>Tiến trình thực tế:</strong> 
                <span id="currentStatus">Đang khởi động...</span>
            </div>
            <a href="#" onclick="checkServerStatus(); return false;" class="auto-btn">🔄 Kiểm tra server</a>
            <a href="#" onclick="startRealProcessing(); return false;" class="auto-btn">▶️ Bắt đầu xử lý</a>
            <br><br>
            <a href="#" onclick="showConfigPage(); return false;" class="auto-btn" style="background: #6c757d;">↩️ Dừng và quay lại</a>
        </div>
    </div>

    <div class="tooltip" id="tooltip"></div>

    <script>
        // ===== BIẾN TOÀN CỤC =====
        let processingInterval;
        let currentProcessingStep = 0;
        let articleGenerationId = null;
        let isServerOnline = false;

        // ===== KHỞI TẠO =====
        document.addEventListener('DOMContentLoaded', function() {
            // Kiểm tra server status khi trang load
            checkServerStatusOnLoad();
            
            // Khởi tạo các event listeners
            initializeEventListeners();
            
            // Cập nhật preview dựa trên giá trị hiện tại
            updatePreviews();
        });

        function initializeEventListeners() {
            // Xử lý thêm tag từ khóa phụ
            const secondaryKeywordInput = document.getElementById('secondaryKeyword');
            secondaryKeywordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && this.value.trim() !== '') {
                    e.preventDefault();
                    addTag(this.value.trim());
                    this.value = '';
                }
            });

            // Xử lý gợi ý AI
            const aiSuggestBtn = document.getElementById('aiSuggestBtn');
            aiSuggestBtn.addEventListener('click', generateAISuggestion);

            // Xử lý tùy chọn nâng cao
            const advancedToggle = document.getElementById('advancedToggle');
            advancedToggle.addEventListener('click', function() {
                this.classList.toggle('open');
                document.getElementById('advancedContent').classList.toggle('open');
            });

            // Cập nhật preview khi thay đổi
            document.getElementById('articleLength').addEventListener('change', updatePreviews);
            document.getElementById('tone').addEventListener('change', updatePreviews);
            
            // Xử lý lưu nháp
            document.getElementById('saveDraft').addEventListener('click', saveDraft);
        }

        function updatePreviews() {
            const articleLength = document.getElementById('articleLength');
            const previewLength = document.getElementById('previewLength');
            const previewTime = document.getElementById('previewTime');
            const previewStructure = document.getElementById('previewStructure');
            const toneSelect = document.getElementById('tone');
            const previewTone = document.getElementById('previewTone');

            // Cập nhật độ dài
            const lengthMap = {
                '300-500': { text: '300-500 từ', time: '1-2 phút', structure: ['Phần mở đầu (50-100 từ)', '2-3 phần nội dung chính', 'Kết luận ngắn'] },
                '500-800': { text: '500-800 từ', time: '2-3 phút', structure: ['Phần mở đầu (80-120 từ)', '3-4 phần nội dung chính', 'Kết luận và CTA'] },
                '800-1200': { text: '800-1200 từ', time: '3-4 phút', structure: ['Phần mở đầu (100-150 từ)', '4-5 phần nội dung chính', 'Case study', 'Kết luận và CTA'] },
                '1200-2000': { text: '1200-2000 từ', time: '5-7 phút', structure: ['Phần mở đầu chi tiết (150-200 từ)', '6-8 phần nội dung sâu', 'Case study & Phân tích', 'FAQ', 'Kết luận và CTA'] }
            };
            
            const selected = lengthMap[articleLength.value];
            if (selected) {
                previewLength.textContent = selected.text;
                previewTime.textContent = selected.time;
                previewStructure.innerHTML = selected.structure.map(item => 
                    `<li><span class="bullet"></span> ${item}</li>`
                ).join('');
            };
        

            // Cập nhật tone giọng
            const toneMap = {
                'chuyên nghiệp': '"Trong thời đại công nghệ 4.0, việc ứng dụng AI vào doanh nghiệp không chỉ là xu hướng mà đã trở thành yếu tố quyết định."',
                'thân thiện': '"Bạn đã bao giờ tự hỏi làm thế nào AI có thể giúp công việc của bạn dễ dàng hơn? Hãy cùng khám phá nhé!"',
                'trang trọng': '"Kiến trúc học sâu và các mô hình transformer đang định hình lại cách chúng ta tiếp cận bài toán tối ưu hóa trong doanh nghiệp."',
                'thuyết phục': '"AI ngày nay không còn xa lạ nữa! Bắt đầu với những công cụ đơn giản, bạn sẽ thấy sự khác biệt ngay!"'
            };
            
            previewTone.textContent = toneMap[toneSelect.value] || toneMap['chuyên nghiệp'];
        }

        // ===== QUẢN LÝ TAGS =====
        function addTag(text) {
            const tagContainer = document.getElementById('tagContainer');
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerHTML = `${text} <span class="close-icon" onclick="removeTag(this)">×</span>`;
            tagContainer.appendChild(tag);
        }

        function removeTag(element) {
            element.parentElement.remove();
        }

        // ===== GỢI Ý AI =====
        function generateAISuggestion() {
            const aiSuggestBtn = document.getElementById('aiSuggestBtn');
            const articleTitle = document.getElementById('articleTitle');
            const mainKeyword = document.getElementById('mainKeyword');

            aiSuggestBtn.disabled = true;
            aiSuggestBtn.innerHTML = '<img src="ico.png" alt="AI"> Đang tạo...';
            
            setTimeout(() => {
                const keyword = mainKeyword.value || 'công nghệ AI';
                const suggestions = [
                    `Top 10 ${keyword} tốt nhất năm 2024`,
                    `Hướng dẫn chi tiết về ${keyword} cho người mới`,
                    `${keyword}: Những điều bạn cần biết`,
                    `Cách tối ưu hiệu quả với ${keyword}`
                ];
                
                articleTitle.value = suggestions[Math.floor(Math.random() * suggestions.length)];
                aiSuggestBtn.disabled = false;
                aiSuggestBtn.innerHTML = '<img src="ico.png" alt="AI"> Gợi ý bằng AI';
            }, 1500);
        }

        // ===== KIỂM TRA SERVER =====
        function checkServerStatusOnLoad() {
            updateServerStatus('checking', 'Đang kiểm tra server...');
            
            // Kiểm tra server status
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'check_server=1'
            })
            .then(response => response.text())
            .then(data => {
                if (data.includes('success') || data.includes('Kết nối thành công')) {
                    updateServerStatus('online', 'Server hoạt động tốt');
                    isServerOnline = true;
                } else {
                    updateServerStatus('offline', 'Không thể kết nối server');
                    isServerOnline = false;
                }
            })
            .catch(error => {
                console.error('Lỗi kiểm tra server:', error);
                updateServerStatus('offline', 'Lỗi kết nối đến server');
                isServerOnline = false;
            });
        }

        function updateServerStatus(status, message) {
            const indicator = document.getElementById('serverStatusIndicator');
            const previewStatus = document.getElementById('serverPreviewStatus');
            
            const statusMap = {
                'checking': { class: 'status-checking', text: message },
                'online': { class: 'status-online', text: '✅ ' + message },
                'offline': { class: 'status-offline', text: '❌ ' + message }
            };
            
            const statusInfo = statusMap[status];
            
            indicator.className = `status-indicator ${statusInfo.class}`;
            indicator.innerHTML = status === 'checking' 
                ? `<div class="spinner" style="width: 12px; height: 12px;"></div> <span>${statusInfo.text}</span>`
                : `<span>${statusInfo.text}</span>`;
                
            previewStatus.innerHTML = indicator.innerHTML;
        }

        // ===== VALIDATION & GENERATION =====
        function validateAndGenerate() {
            const mainKeyword = document.getElementById('mainKeyword').value.trim();
            
            if (!mainKeyword) {
                alert('Vui lòng nhập từ khóa chính!');
                document.getElementById('mainKeyword').focus();
                return;
            }
            
            if (!isServerOnline) {
                const shouldContinue = confirm('Server hiện không khả dụng. Bạn có muốn thử tiếp không?');
                if (!shouldContinue) {
                    return;
                }
            }
            
            showThinkingPage();
        }

        // ===== PAGE NAVIGATION =====
        function showThinkingPage() {
            const keyword = document.getElementById('mainKeyword').value;
            const title = document.getElementById('articleTitle').value;
            const articleType = document.getElementById('articleType').value;
            const articleLength = document.getElementById('articleLength').value;
            const tone = document.getElementById('tone').value;
            
            // Cập nhật thông tin cho trang thinking
            document.getElementById('thinkingTitle').textContent = title || 'Đang tạo bài viết: ' + keyword;
            document.getElementById('detailKeyword').textContent = keyword;
            document.getElementById('detailType').textContent = document.getElementById('articleType').options[document.getElementById('articleType').selectedIndex].text;
            document.getElementById('detailLength').textContent = document.getElementById('articleLength').options[document.getElementById('articleLength').selectedIndex].text;
            document.getElementById('detailTone').textContent = tone;
            
            document.getElementById('configPage').style.display = 'none';
            document.getElementById('thinkingPage').style.display = 'block';
            
            // Reset progress về ban đầu
            resetProgress();
            
            // Tự động kiểm tra server status và bắt đầu xử lý
            setTimeout(() => {
                checkServerStatus();
                setTimeout(startRealProcessing, 1000);
            }, 500);
        }

        function showConfigPage() {
            if (processingInterval) {
                clearInterval(processingInterval);
            }
            
            document.getElementById('thinkingPage').style.display = 'none';
            document.getElementById('configPage').style.display = 'block';
        }

        // ===== PROGRESS MANAGEMENT =====
        function resetProgress() {
            currentProcessingStep = 0;
            document.getElementById('realProgressBar').style.width = '0%';
            
            for (let i = 1; i <= 5; i++) {
                updateStepStatus(i, 'inactive');
            }
            
            document.getElementById('currentStepTitle').textContent = 'ĐANG KHỞI TẠO HỆ THỐNG';
            document.getElementById('timeEstimate').innerHTML = '<div class="spinner"></div> Đang kết nối đến server...';
            document.getElementById('complexityInfo').textContent = 'Trạng thái: Đang chuẩn bị';
            document.getElementById('currentStatus').textContent = 'Đang khởi động...';
            
            document.getElementById('realTimeUpdates').innerHTML = `
                <div class="real-time-update">
                    <strong>🚀 Bắt đầu quá trình tạo bài viết...</strong>
                    <span class="update-time">${new Date().toLocaleTimeString()}</span>
                </div>
            `;
        }

        function updateStepStatus(stepNumber, status) {
            const step = document.getElementById(`step${stepNumber}`);
            const card = document.getElementById(`card${stepNumber}`);
            const circle = step.querySelector('.step-circle');
            const statusIcon = card.querySelector('.step-status');
            
            step.classList.remove('completed', 'active', 'inactive');
            card.classList.remove('completed', 'active', 'inactive');
            
            step.classList.add(status);
            card.classList.add(status);
            
            if (status === 'completed') {
                circle.innerHTML = '✓';
                statusIcon.innerHTML = '✓';
            } else if (status === 'active') {
                circle.innerHTML = '⚙';
                statusIcon.innerHTML = '⚙';
            } else {
                circle.innerHTML = stepNumber;
                statusIcon.innerHTML = stepNumber;
            }
        }

        function updateProgressBar(percentage) {
            document.getElementById('realProgressBar').style.width = percentage + '%';
        }

        function addRealTimeUpdate(message) {
            const updatesContainer = document.getElementById('realTimeUpdates');
            const updateElement = document.createElement('div');
            updateElement.className = 'real-time-update';
            updateElement.innerHTML = `
                <strong>${message}</strong>
                <span class="update-time">${new Date().toLocaleTimeString()}</span>
            `;
            updatesContainer.appendChild(updateElement);
            updatesContainer.scrollTop = updatesContainer.scrollHeight;
        }

        // ===== SERVER COMMUNICATION =====
        function checkServerStatus() {
            document.getElementById('serverStatusText').textContent = 'Đang kiểm tra...';
            document.getElementById('serverStatus').style.background = '#fff3cd';
            document.getElementById('serverStatus').style.borderLeftColor = '#ffc107';
            
            setTimeout(() => {
                if (isServerOnline) {
                    document.getElementById('serverStatusText').innerHTML = '✅ <strong>Kết nối thành công!</strong> Server sẵn sàng';
                    document.getElementById('serverStatus').style.background = '#d4edda';
                    document.getElementById('serverStatus').style.borderLeftColor = '#28a745';
                    addRealTimeUpdate('✅ Kết nối server thành công! Hệ thống sẵn sàng xử lý');
                } else {
                    document.getElementById('serverStatusText').innerHTML = '❌ <strong>Không thể kết nối!</strong> Vui lòng thử lại';
                    document.getElementById('serverStatus').style.background = '#f8d7da';
                    document.getElementById('serverStatus').style.borderLeftColor = '#dc3545';
                    addRealTimeUpdate('❌ Không thể kết nối đến server AI');
                }
            }, 2000);
        }

        function startRealProcessing() {
            document.getElementById('loadingOverlay').style.display = 'flex';
            
            const formData = new FormData(document.getElementById('articleConfigForm'));
            
            fetch('', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(html => {
                document.getElementById('loadingOverlay').style.display = 'none';
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const resultElement = tempDiv.querySelector('.generated-article') || tempDiv.querySelector('.error-message');
                
                if (resultElement) {
                    simulateRealProcessing(resultElement.outerHTML);
                } else {
                    throw new Error('Không nhận được kết quả từ server');
                }
            })
            .catch(error => {
                document.getElementById('loadingOverlay').style.display = 'none';
                addRealTimeUpdate('❌ Lỗi: ' + error.message);
                document.getElementById('currentStatus').textContent = 'Lỗi: ' + error.message;
            });
        }

        function simulateRealProcessing(finalHtml) {
            articleGenerationId = 'article_' + Date.now();
            addRealTimeUpdate('🚀 Bắt đầu xử lý bài viết với ID: ' + articleGenerationId);
            
            let step = 1;
            let percentage = 0;
            
            processingInterval = setInterval(() => {
                percentage += 20;
                step = Math.min(step + 1, 5);
                
                updateProgressBar(percentage);
                updateStepStatus(step, 'active');
                
                const messages = [
                    '🔧 Đang khởi tạo AI models và thiết lập môi trường...',
                    '🔍 Đang tìm kiếm và thu thập dữ liệu từ các nguồn...',
                    '📊 AI đang phân tích và xử lý thông tin...',
                    '✍️ Đang tạo nội dung bài viết theo cấu trúc...',
                    '✅ Đang hoàn thiện và tối ưu bài viết...'
                ];
                
                const titles = [
                    'ĐANG KHỞI TẠO HỆ THỐNG',
                    'ĐANG TÌM KIẾM DỮ LIỆU',
                    'ĐANG PHÂN TÍCH NỘI DUNG',
                    'ĐANG TẠO BÀI VIẾT',
                    'ĐANG HOÀN TẤT'
                ];
                
                if (step <= 5) {
                    document.getElementById('currentStepTitle').textContent = titles[step - 1];
                    addRealTimeUpdate(messages[step - 1]);
                    document.getElementById('currentStatus').textContent = messages[step - 1];
                }
                
                if (percentage >= 100) {
                    clearInterval(processingInterval);
                    handleCompletion(finalHtml);
                }
            }, 2000);
        }

        function handleCompletion(resultHtml) {
            for (let i = 1; i <= 5; i++) {
                updateStepStatus(i, 'completed');
            }
            
            updateProgressBar(100);
            document.getElementById('currentStepTitle').textContent = 'HOÀN TẤT';
            document.getElementById('timeEstimate').innerHTML = '✅ <strong>Đã hoàn thành!</strong>';
            document.getElementById('currentStatus').textContent = 'Bài viết đã sẵn sàng';
            
            addRealTimeUpdate('🎉 Quá trình tạo bài viết đã hoàn thành!');
            
            setTimeout(() => {
                document.getElementById('articleResult').innerHTML = resultHtml;
                showConfigPage();
                
                document.getElementById('articleResult').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 2000);
        }

        // ===== UTILITY FUNCTIONS =====
        function saveDraft(e) {
            e.preventDefault();
            const draftData = {
                mainKeyword: document.getElementById('mainKeyword').value,
                title: document.getElementById('articleTitle').value,
                length: document.getElementById('articleLength').value,
                tone: document.getElementById('tone').value
            };
            
            localStorage.setItem('articleDraft', JSON.stringify(draftData));
            alert('Nháp đã được lưu thành công!');
        }

        function loadDraft() {
            const draft = localStorage.getItem('articleDraft');
            if (draft) {
                const draftData = JSON.parse(draft);
                document.getElementById('mainKeyword').value = draftData.mainKeyword || '';
                document.getElementById('articleTitle').value = draftData.title || '';
                document.getElementById('articleLength').value = draftData.length || '800-1200';
                document.getElementById('tone').value = draftData.tone || 'chuyên nghiệp';
                updatePreviews();
            }
        }

        // Tooltip functionality
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

        // Load draft when page loads
        window.addEventListener('load', loadDraft);
    </script>

    <?php
    // ==================== BACKEND PHP ====================
    
    class NewsAggregatorClient {
        private $base_url;
        private $api_base;
        
        public function __construct($base_url = "https://caiman-warm-swan.ngrok-free.app") {
            $this->base_url = rtrim($base_url, '/');
            $this->api_base = $this->base_url . "/api/v1";
        }
        
        private function makeRequest($endpoint, $payload) {
            $url = $this->api_base . $endpoint;
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Accept: application/json'
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 60);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);
            
            if ($http_code !== 200) {
                throw new Exception("HTTP Error: " . $http_code . " - " . $error);
            }
            
            $result = json_decode($response, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("JSON decode error: " . json_last_error_msg());
            }
            
            return $result;
        }
        
        public function runFullPipeline($query, $max_search_results = 5, $top_k_news = 3, $content_config = []) {
            $payload = [
                "query" => $query,
                "max_search_results" => $max_search_results,
                "top_k_news" => $top_k_news,
                "target_language" => "vi"
            ];
            
            if (!empty($content_config)) {
                $payload["content_config"] = $content_config;
            }
            
            return $this->makeRequest("/pipeline", $payload);
        }
        
        public function checkServerStatus() {
            try {
                $test_payload = ["query" => "test"];
                $result = $this->makeRequest("/pipeline", $test_payload);
                return ["success" => true, "message" => "Server hoạt động bình thường"];
            } catch (Exception $e) {
                return ["success" => false, "message" => "Lỗi kết nối: " . $e->getMessage()];
            }
        }
    }

    class SEOArticleToHTML {
        public function convertToHtml($article_data) {
            $title = htmlspecialchars($article_data['title'] ?? 'Bài viết SEO');
            $content = $article_data['content'] ?? '';
            $keywords = $article_data['keywords'] ?? [];
            $references = $article_data['references'] ?? [];
            
            $html = '
            <div class="generated-article">
                <div class="success-message">
                    <strong>✅ Bài viết đã được tạo thành công!</strong>
                    <p>Bài viết đã được tạo dựa trên từ khóa và cấu hình của bạn.</p>
                </div>
                <div class="article-preview">
                    <h2>' . $title . '</h2>
                    <div class="content">' . nl2br(htmlspecialchars($content)) . '</div>';
            
            if (!empty($keywords)) {
                $html .= '<div class="keywords">
                            <strong>📌 Từ khóa:</strong> ' . implode(', ', array_map('htmlspecialchars', $keywords)) . '
                        </div>';
            }
            
            if (!empty($references)) {
                $html .= '<div class="references">
                            <strong>📚 Tham khảo:</strong>
                            <ul>';
                
                foreach ($references as $ref) {
                    $html .= '<li><a href="' . htmlspecialchars($ref['url'] ?? '#') . '" target="_blank">' . htmlspecialchars($ref['title'] ?? 'Nguồn tham khảo') . '</a></li>';
                }
                
                $html .= '</ul>
                        </div>';
            }
            
            $html .= '</div>
            </div>';
            
            return $html;
        }
    }

    // Bắt đầu session
    session_start();

    // Xử lý kiểm tra server status
    if (isset($_POST['check_server'])) {
        try {
            $client = new NewsAggregatorClient();
            $status = $client->checkServerStatus();
            echo $status['success'] ? 'success' : 'error: ' . $status['message'];
            exit;
        } catch (Exception $e) {
            echo 'error: ' . $e->getMessage();
            exit;
        }
    }

    // Xử lý form khi submit
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['query'])) {
        $query = $_POST['query'] ?? '';
        $article_length = $_POST['article_length'] ?? '800-1200';
        $tone = $_POST['tone'] ?? 'chuyên nghiệp';
        $article_type = $_POST['article_type'] ?? 'blog';
        $language = $_POST['language'] ?? 'vi';
        $custom_instructions = $_POST['custom_instructions'] ?? '';
        
        if (!empty($query)) {
            try {
                $client = new NewsAggregatorClient("https://caiman-warm-swan.ngrok-free.app");
                
                $content_config = [
                    "article_length" => $article_length,
                    "tone" => $tone,
                    "article_type" => $article_type,
                    "language" => $language
                ];
                
                if (!empty($custom_instructions)) {
                    $content_config["custom_instructions"] = $custom_instructions;
                }
                
                $pipeline_results = $client->runFullPipeline($query, 5, 3, $content_config);
                
                if ($pipeline_results['success'] && $pipeline_results['generated_content']['success']) {
                    $article = $pipeline_results['generated_content']['article'];
                    
                    $converter = new SEOArticleToHTML();
                    $result_html = $converter->convertToHtml($article);
                    
                    // Lưu kết quả vào session
                    $_SESSION['generated_article'] = $result_html;
                    
                    // Redirect để tránh resubmit form
                    header('Location: ' . $_SERVER['PHP_SELF']);
                    exit;
                } else {
                    $error_msg = $pipeline_results['error'] ?? 'Không thể tạo bài viết';
                    $_SESSION['generated_article'] = '<div class="error-message">❌ Lỗi: ' . $error_msg . '</div>';
                    header('Location: ' . $_SERVER['PHP_SELF']);
                    exit;
                }
                
            } catch (Exception $e) {
                $_SESSION['generated_article'] = '<div class="error-message">❌ Lỗi: ' . htmlspecialchars($e->getMessage()) . '</div>';
                header('Location: ' . $_SERVER['PHP_SELF']);
                exit;
            }
        } else {
            $_SESSION['generated_article'] = '<div class="error-message">❌ Vui lòng nhập từ khóa chính để tạo bài viết.</div>';
            header('Location: ' . $_SERVER['PHP_SELF']);
            exit;
        }
    }
    ?>
</body>
</html>