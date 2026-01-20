<!-- Thay thế phần upload hiện tại trong cau-hinh-facebook.php -->

<div class="form-group image-toggle-group">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
        <label style="margin-bottom: 0;">Đi kèm hình ảnh:</label>
        <div style="display: flex; align-items: center; gap: 15px;">
            <a href="#" style="font-size: 15px; color: #3b82f6; text-decoration: none; font-weight: 600;display: flex; align-items: center; gap: 4px;">
                <img src="./images/icon-sua-tt.png" alt=""> Tạo ảnh bằng trợ lý AIS
            </a>
            <label class="switch">
                <input type="checkbox" id="toggle-image-main" checked>
                <span class="slider round"></span>
            </label>
        </div>
    </div>

    <!-- Upload Area với 2 nút: File và Folder -->
    <div id="main-upload-trigger" class="file-upload-wrapper-premium" style="position: relative;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%;">
            <span class="file-upload-icon"><i class="fas fa-paperclip"></i></span>
            <span class="file-upload-placeholder" style="margin-right: 8px; flex: 1;">Duyệt hình ảnh của bạn tại đây</span>

            <!-- Nút Upload Folder -->
            <button type="button" id="folder-upload-btn" style="
                background: #3b82f6;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            " title="Upload toàn bộ thư mục">
                <i class="fas fa-folder-open"></i>
                <span>Thư mục</span>
            </button>
        </div>
    </div>

    <!-- Input cho file đơn lẻ -->
    <input type="file" id="main-file-input" hidden accept="image/*,video/*" multiple>

    <!-- Input cho upload thư mục (webkitdirectory) -->
    <input type="file" id="folder-input" hidden webkitdirectory directory multiple>