<?php require "thanh-dieu-huong.php" ?>
<link rel="stylesheet" href="./css/thiet-dat.css">

<main class="page-body">
    <!-- Header -->
    <div class="content-header">
        <h1 class="page-title">Thiết đặt</h1>
        <a href="#" class="add-config-link">+ Tạo cấu hình</a>
    </div>

    <!-- Tip Box -->
    <div class="tip-box">
        <div class="tip-content">
            <i class="fas fa-lightbulb tip-icon"></i>
            <span class="tip-text">
                <strong>Mẹo:</strong> Mỗi cấu hình sẽ tạo ra phong cách bài viết khác nhau, hãy nghiên cứu và tinh chỉnh phù hợp với nhu cầu của bạn
            </span>
        </div>
    </div>

    <div class="settings-container">
        <!-- Thông tin cá nhân -->
        <section class="settings-section">
            <h2 class="section-title">Thông tin cá nhân</h2>
            <div class="profile-grid">
                <div class="profile-upload">
                    <div class="avatar-wrapper">
                        <img src="./images/1.png" alt="Avatar" id="user-avatar-preview">
                    </div>
                    <button class="btn-outline btn-sm">Thay đổi ảnh</button>
                    <input type="file" id="avatar-input" hidden accept="image/*">
                </div>
                <div class="profile-fields">
                    <div class="form-row">
                        <div class="form-group flex-1">
                            <label>Họ và tên</label>
                            <input type="text" id="full-name" placeholder="Văn An" class="form-control">
                        </div>
                        <div class="form-group flex-1">
                            <label>Email</label>
                            <input type="email" id="email" placeholder="tvdell789@gmail.com" class="form-control">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Số điện thoại</label>
                        <input type="text" id="phone-number" placeholder="+84 123 456 789" class="form-control">
                    </div>
                </div>
            </div>
        </section>

        <!-- Thanh toán & Hoá đơn -->
        <section class="settings-section">
            <h2 class="section-title">Thanh toán & Hoá đơn</h2>

            <div class="payment-methods">
                <label class="inner-label">Phương thức thanh toán</label>
                <div class="card-item">
                    <div class="card-info">
                        <i class="fas fa-credit-card card-icon"></i>
                        <div class="card-details">
                            <span class="card-name">Techcombank **** 1234</span>
                            <span class="card-expiry">Hết hạn 12/2027</span>
                        </div>
                    </div>
                    <a href="#" class="edit-link">Chỉnh sửa</a>
                </div>
                <button class="btn-outline-primary btn-add-payment">
                    <i class="fas fa-plus"></i> Thêm phương thức thanh toán
                </button>
            </div>

            <div class="invoice-history">
                <label class="inner-label">Lịch sử hoá đơn</label>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID Hoá đơn</th>
                                <th>Ngày</th>
                                <th>Số tiền</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>#INV-2025-001</td>
                                <td>15/01/2025</td>
                                <td>2,500,000 VND</td>
                                <td><span class="status-badge success">Đã thanh toán</span></td>
                            </tr>
                            <tr>
                                <td>#INV-2025-002</td>
                                <td>10/01/2025</td>
                                <td>5,500,000 VND</td>
                                <td><span class="status-badge success">Đã thanh toán</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- Cài đặt thông báo -->
        <section class="settings-section">
            <h2 class="section-title">Cài đặt thông báo</h2>
            <div class="notification-settings">
                <div class="notification-item">
                    <div class="notification-info">
                        <span class="notification-name">Thông báo khi có đơn hàng mới</span>
                        <span class="notification-desc">Nhận thông báo khi có đơn hàng mới từ khách hàng</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="notification-item">
                    <div class="notification-info">
                        <span class="notification-name">Thông báo khi sản phẩm sắp hết hàng</span>
                        <span class="notification-desc">Cảnh báo khi số lượng tồn kho dưới mức tối thiểu</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="notification-item">
                    <div class="notification-info">
                        <span class="notification-name">Thông báo khi có yêu cầu thương lượng giá</span>
                        <span class="notification-desc">Nhận thông báo khi khách hàng yêu cầu thương lượng giá</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox">
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
        </section>

        <!-- Quản lý thiết bị -->
        <section class="settings-section">
            <div class="section-header-row">
                <h2 class="section-title">Quản lý thiết bị</h2>
                <button class="btn-outline-danger btn-sm">Đăng xuất tất cả thiết bị khác</button>
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Thiết bị</th>
                            <th>Địa chỉ IP</th>
                            <th>Lần đăng nhập gần nhất</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div class="device-info">
                                    <i class="fas fa-laptop device-icon"></i>
                                    <span>Chrome trên Windows</span>
                                </div>
                            </td>
                            <td>192.168.1.100</td>
                            <td>2 phút trước</td>
                            <td><span class="status-badge active">Đang hoạt động</span></td>
                        </tr>
                        <tr>
                            <td>
                                <div class="device-info">
                                    <i class="fas fa-mobile-alt device-icon"></i>
                                    <span>Safari trên iPhone</span>
                                </div>
                            </td>
                            <td>10.0.0.50</td>
                            <td>1 giờ trước</td>
                            <td><span class="status-badge offline">Không hoạt động</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <div class="footer-actions">
            <button class="btn-primary btn-save">Lưu thay đổi</button>
        </div>
    </div>
</main>

<script src="./js/thiet-dat.js"></script>
</body>

</html>