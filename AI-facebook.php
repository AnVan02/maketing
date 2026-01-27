<?php require "thanh-dieu-huong.php" ?>

<link rel="stylesheet" href="./css/AI-facebook.css">


<title>Quản lý cấu hình - AIS</title>
<div class="card table-container">

    <div style="padding: 20px 20px 10px; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">Kết nối Facebook Page</h2>

        <button class="btn-use-sm" style="background:#1877f2; color:white; border:none; padding: 8px 15px;" onclick="openAddModal()">
            <i class="fab fa-facebook" style="margin-right: 5px;"></i> Thêm kết nối
        </button>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="text-align: left; padding-left: 20px;">Page ID</th>
                <th>Trạng thái</th>
                <th>Ngày kết nối</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody id="connectionTableBody">
            <!-- Dữ liệu kết nối Facebook -->
        </tbody>
    </table>
    <div id="noConnectionState" style="display: none; padding: 60px 20px; text-align: center; color: #94a3b8;">
        <i class="fab fa-facebook" style="font-size: 48px; opacity: 0.2; margin-bottom: 20px;"></i>
        <p style="font-size: 16px;">Bạn chưa có kết nối Facebook nào.</p>
    </div>

</div>
</div>

<!-- Modal Sửa/Thêm Kết Nối -->
<div id="connectionModal" class="modal-premium" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); align-items: center; justify-content: center;">
    <div class="modal-content" style="background: white; padding: 0; border-radius: 16px; width: 500px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; border: 1px solid #e2e8f0;">
        <!-- Header Modal -->
        <div style="background: #f8fafc; padding: 20px 25px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="background: #1877f2; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white;">
                    <i class="fab fa-facebook-f"></i>
                </div>
                <h3 id="modalTitle" style="margin: 0; color: #1e293b; font-size: 18px; font-weight: 600;">Cập nhật kết nối</h3>
            </div>
            <span class="close-modal" id="closeConnModal" style="cursor: pointer; font-size: 24px; color: #94a3b8; transition: color 0.2s;">&times;</span>
        </div>

        <div style="padding: 25px;">
            <input type="hidden" id="connId">

            <div class="form-group" style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #334155;">Facebook Page ID</label>
                <div style="position: relative;">
                    <input type="text" id="modalPageId" placeholder="VD: 1029384756" style="width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; transition: border-color 0.2s; background: #fcfcfc;">
                    <i class="fas fa-fingerprint" style="position: absolute; right: 15px; top: 14px; color: #cbd5e1;"></i>
                </div>
                <p style="font-size: 12px; color: #64748b; margin-top: 6px;">Tìm thấy trong mục <strong>Giới thiệu</strong> trên Fanpage của bạn.</p>
            </div>

            <div class="form-group" style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <label style="font-size: 14px; font-weight: 600; color: #334155;">Page Access Token</label>
                    <button id="testTokenBtn" style="background: none; border: none; color: #1877f2; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; display: flex; align-items: center; gap: 4px;">
                        <i class="fas fa-vial"></i> Kiểm tra Token
                    </button>
                </div>
                <textarea id="modalAccessToken" style="width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; height: 120px; resize: none; background: #fcfcfc;" placeholder="Dán mã Page Access Token vào đây..."></textarea>
                <p style="font-size: 11px; color: #64748b; margin-top: 6px;">* Token cần có quyền <code style="background: #f1f5f9; padding: 2px 4px; border-radius: 4px;">pages_manage_posts</code> và <code style="background: #f1f5f9; padding: 2px 4px; border-radius: 4px;">pages_read_engagement</code>.</p>
            </div>

            <div class="form-group" style="margin-bottom: 25px;">
                <label class="premium-checkbox-container" style="display: flex; align-items: center; gap: 10px; cursor: pointer; border: 1px solid #f1f5f9; padding: 12px; border-radius: 10px; transition: background 0.2s;">
                    <input type="checkbox" id="modalIsDefault" style="width: 18px; height: 18px; border-radius: 4px; cursor: pointer; accent-color: #1877f2;">
                    <div>
                        <span style="font-size: 14px; font-weight: 500; color: #334155; display: block;">Đặt làm kết nối mặc định</span>
                        <span style="font-size: 12px; color: #64748b;">Hệ thống sẽ ưu tiên dùng trang này để đăng bài.</span>
                    </div>
                </label>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end; padding-top: 10px;">
                <button id="cancelConn" style="padding: 10px 24px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; color: #475569; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">Hủy</button>
                <button id="saveConn" style="padding: 10px 24px; border-radius: 10px; border: none; background: #1877f2; color: white; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(24, 119, 242, 0.2);">Lưu thay đổi</button>
            </div>
        </div>
    </div>
</div>

<!-- kết nối js  -->
<script src="./js/api-helper.js"></script>
<script src="./js/AI-facebook.js"></script>