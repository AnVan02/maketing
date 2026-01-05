<?php require "thanh-dieu-huong.php" ?>
<link rel="stylesheet" href="./css/thanh-dieu-huong.css">
<link rel="stylesheet" href="./css/mau-cau-hinh.css">
<title>Quản lý cấu hình - AIS</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">

<style>
    /* === TỐI ƯU MỞ RỘNG TOÀN MÀN HÌNH === */
    .page-body {
        padding: 20px 30px;
        max-width: none;
        margin: 0;
        width: 100%;
        box-sizing: border-box;
        overflow-x: hidden;
        max-width: 1200px;
    }

    .manager-grid {
        display: grid;
        grid-template-columns: 1fr 650px;
        gap: 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        align-items: start;
        width: 100%;
    }

    /* Khi hiển thị Form */
    .manager-grid.show-form {
        grid-template-columns: 1fr 480px;
        gap: 40px;
    }

    /* === ĐIỀU CHỈNH TIÊU ĐỀ === */
    .content-header {
        margin-bottom: 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header-left-info {
        display: flex;
        align-items: baseline;
        gap: 15px;
    }

    .page-title {
        font-size: 28px;
        font-weight: 800;
        color: #1e293b;
        margin: 0;
    }

    .page-subtitle {
        color: #64748b;
        font-size: 14px;
    }

    /* Nút thêm mới */
    .btn-add-config {
        background: #2563eb;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }

    .btn-add-config:hover {
        background: #1d4ed8;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
    }

    /* === BẢNG BÊN TRÁI === */
    .table-container {
        background: white;
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        border: 1px solid #f1f5f9;
        min-height: 400px;
    }

    .data-table {
        width: 100%;
        border-spacing: 0;
    }

    .data-table th {
        text-align: center;
        padding: 15px 10px;
        color: #94a3b8;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 2px solid #f8fafc;
    }

    .data-table td {
        padding: 20px 10px;
        border-bottom: 1px solid #f8fafc;
        text-align: center;
        vertical-align: middle;
    }

    /* === FORM BÊN PHẢI (PREMIUM) === */
    .manager-right {
        opacity: 0;
        transform: translateX(30px);
        pointer-events: none;
        transition: all 0.4s ease;
        width: 480px;
    }

    .show-form .manager-right {
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
    }

    .form-card {
        background: white;
        border-radius: 24px;
        padding: 35px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.04);
        border: 1px solid #f1f5f9;
        position: sticky;
        top: 20px;
    }

    .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
    }

    .form-title {
        font-size: 22px;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
    }

    .btn-close-form {
        background: #f1f5f9;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        color: #64748b;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }

    .btn-close-form:hover {
        background: #e2e8f0;
        color: #ef4444;
    }

    .tip-box-mini {
        background: #f0f7ff;
        padding: 15px 18px;
        border-radius: 16px;
        display: flex;
        gap: 12px;
        margin-bottom: 30px;
        border: 1px solid #e0eeff;
    }

    .tip-box-mini p {
        font-size: 12.5px;
        color: #1e40af;
        line-height: 1.6;
        margin: 0;
    }

    .form-group {
        margin-bottom: 25px;
    }

    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #475569;
        font-size: 13.5px;
    }

    .premium-input {
        width: 100%;
        padding: 15px 18px;
        border-radius: 14px;
        border: 1.5px solid #e2e8f0;
        font-size: 15px;
        color: #1e293b;
        transition: all 0.2s;
        background: #fcfdfe;
        box-sizing: border-box;
    }

    .premium-input:focus {
        border-color: #3b82f6;
        outline: none;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .premium-select {
        width: 100%;
        padding: 14px 18px;
        border-radius: 14px;
        border: 1.5px solid #e2e8f0;
        background: #fff;
        font-size: 14.5px;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 18px center;
        background-size: 18px;
        box-sizing: border-box;
    }

    .btn-save-full {
        width: 100%;
        background: #2563eb;
        color: white;
        border: none;
        padding: 18px;
        border-radius: 16px;
        font-weight: 700;
        font-size: 16px;
        cursor: pointer;
        margin-top: 10px;
        transition: all 0.3s;
        box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.3);
    }

    .btn-save-full:hover {
        background: #1d4ed8;
        transform: translateY(-2px);
        box-shadow: 0 15px 30px -5px rgba(37, 99, 235, 0.4);
    }

    .slider-wrapper {
        position: relative;
        padding-top: 5px;
    }

    .premium-slider {
        width: 100%;
        height: 7px;
        border-radius: 10px;
        background: #e2e8f0;
        outline: none;
        -webkit-appearance: none;
    }

    .premium-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        background: #fff;
        border: 3px solid #3b82f6;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .slider-value-badge {
        background: #3b82f6;
        color: white;
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 800;
        float: right;
        margin-top: -30px;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .badge-model {
        background: #f1f5f9;
        padding: 5px 12px;
        border-radius: 8px;
        font-size: 12px;
        color: #475569;
        font-weight: 600;
    }

    .btn-use-sm {
        padding: 6px 14px;
        border-radius: 8px;
        border: 1.5px solid #dbeafe;
        background: #fff;
        color: #3b82f6;
        cursor: pointer;
        font-weight: 600;
        font-size: 12.5px;
        transition: all 0.2s;
    }

    .btn-use-sm:hover {
        background: #3b82f6;
        color: #fff;
        border-color: #3b82f6;
    }
</style>
</head>

<body>

    <div class="app-container">
        <main class="page-body">

            <!-- HEADER -->
            <div class="content-header">
                <div class="header-left-info">
                    <h1 class="page-title">Mẫu cấu hình</h1>
                    <p class="page-subtitle">Quản lý và sử dụng lại các thiết lập bài viết của bạn.</p>
                </div>
                <button id="toggleFormBtn" class="btn-add-config">
                    <span style="font-size: 20px; line-height: 0;">+</span> Thêm mẫu cấu hình
                </button>
            </div>

            <div id="managerGrid" class="manager-grid">

                <!-- CỘT TRÁI: DANH SÁCH MẪU -->
                <div class="manager-left">
                    <div class="card table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="text-align: left; padding-left: 20px;">Tên cấu hình</th>
                                    <th>Model</th>
                                    <th>Loại bài</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody id="configTableBody">
                                <!-- JS Load -->
                            </tbody>
                        </table>
                        <div id="noDataState" style="display: none; padding: 60px 20px; text-align: center; color: #94a3b8;">
                            <img src="./images/icon-ai-bot.png" style="width: 64px; opacity: 0.2; margin-bottom: 20px;">
                            <p style="font-size: 16px;">Bạn chưa có mẫu nào. Hãy bấm "Thêm mẫu cấu hình" để bắt đầu.</p>
                        </div>
                    </div>
                </div>

                <!-- CỘT PHẢI: FORM THÊM MỚI (Ẩn mặc định) -->
                <div class="manager-right">
                    <div class="form-card bounce-in">
                        <div class="form-header">
                            <h2 class="form-title">Thêm cấu hình</h2>
                            <button id="closeFormBtn" class="btn-close-form">×</button>
                        </div>

                        <div class="tip-box-mini">
                            <span style="font-size: 18px;">💡</span>
                            <p>Mỗi cấu hình sẽ tạo ra phong cách cực chất cho bài viết khác nhau.</p>
                        </div>

                        <div class="form-body">
                            <div class="form-group">
                                <label>Tên cấu hình</label>
                                <input type="text" id="p_config_name" placeholder="VD: Blog SEO cơ bản" class="premium-input">
                            </div>

                            <div class="form-group">
                                <label>Độ dài bài viết</label>
                                <select id="p_content_lengths" class="premium-select"></select>
                            </div>

                            <div class="form-group">
                                <label>Mức độ sáng tạo</label>
                                <div class="slider-wrapper">
                                    <span id="p_creativity_val" class="slider-value-badge">50%</span>
                                    <input type="range" id="p_creativity_level" min="0" max="100" value="50" class="premium-slider">
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Loại bài viết</label>
                                <select id="p_content_types" class="premium-select"></select>
                            </div>

                            <div class="form-group">
                                <label>Tone giọng</label>
                                <select id="p_writing_tones" class="premium-select"></select>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Model</label>
                                    <select id="p_bots" class="premium-select"></select>
                                </div>
                                <div class="form-group">
                                    <label>Ngôn ngữ</label>
                                    <select id="p_languages" class="premium-select"></select>
                                </div>
                            </div>

                            <button id="p_saveBtn" class="btn-save-full">LƯU CẤU HÌNH</button>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    </div>

    <script src="./js/api-helper.js"></script>
    <script>
        const API_BASE_URL = 'https://caiman-warm-swan.ngrok-free.app/api/v1';

        document.addEventListener('DOMContentLoaded', async () => {
            const tableBody = document.getElementById('configTableBody');
            const noDataState = document.getElementById('noDataState');
            const managerGrid = document.getElementById('managerGrid');
            const toggleBtn = document.getElementById('toggleFormBtn');
            const closeBtn = document.getElementById('closeFormBtn');

            // --- XỬ LÝ ẨN/HIỆN FORM ---
            toggleBtn.onclick = () => {
                managerGrid.classList.add('show-form');
                toggleBtn.style.display = 'none'; // Ẩn nút thêm khi form đang mở
            };

            closeBtn.onclick = () => {
                managerGrid.classList.remove('show-form');
                toggleBtn.style.display = 'flex'; // Hiện lại nút thêm
            };

            // 1. Tải danh sách Options từ API
            async function loadOptions() {
                try {
                    const data = await apiRequest(`${API_BASE_URL}/ui/configs`);
                    const fill = (id, arr) => {
                        const el = document.getElementById(id);
                        if (el) el.innerHTML = arr.map(i => `<option value="${i}">${i}</option>`).join('');
                    };
                    fill('p_content_lengths', data.content_lengths);
                    fill('p_content_types', data.content_types);
                    fill('p_writing_tones', data.writing_tones);
                    fill('p_languages', data.languages);
                    fill('p_bots', data.bots);
                } catch (e) {
                    console.error("API Error:", e);
                }
            }

            // 2. Xử lý Slider
            const slider = document.getElementById('p_creativity_level');
            const badge = document.getElementById('p_creativity_val');
            slider.oninput = function() {
                badge.textContent = this.value + "%";
            };

            // 3. Render danh sách bên trái
            function refreshTable() {
                const configs = JSON.parse(localStorage.getItem('user_configs')) || [];
                tableBody.innerHTML = '';

                if (configs.length === 0) {
                    noDataState.style.display = 'block';
                } else {
                    noDataState.style.display = 'none';
                    [...configs].reverse().forEach(config => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                              <td style="text-align: left; padding-left: 20px;">
                                <strong style="color:#1e293b; font-size:15px;">${config.name}</strong>
                              </td>
                              <td><span class="badge-model">${config.model}</span></td>
                              <td><span style="color:#64748b;">${config.type}</span></td>
                              <td>
                                  <div style="display: flex; gap: 12px; justify-content: center; align-items:center;">
                                      <button class="btn-use-sm" onclick="useConfig('${config.id}')">Sử dụng</button>
                                      <button onclick="deleteConfig('${config.id}')" style="border: none; background: none; color: #cbd5e1; cursor: pointer; font-size: 20px; transition:color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#cbd5e1'">&times;</button>
                                  </div>
                              </td>
                         `;
                        tableBody.appendChild(tr);
                    });
                }
            }


            // 4. Lưu cấu hình mới
            document.getElementById('p_saveBtn').onclick = () => {
                const name = document.getElementById('p_config_name').value.trim();
                if (!name) return alert("Vui lòng nhập tên cấu hình!");

                const newConfig = {
                    id: Date.now(),
                    name: name,
                    model: document.getElementById('p_bots').value,
                    type: document.getElementById('p_content_types').value,
                    length: document.getElementById('p_content_lengths').value,
                    tone: document.getElementById('p_writing_tones').value,
                    creativity: document.getElementById('p_creativity_level').value,
                    language: document.getElementById('p_languages').value,
                    created_at: new Date().toLocaleDateString('vi-VN')
                };

                const configs = JSON.parse(localStorage.getItem('user_configs')) || [];
                configs.push(newConfig);
                localStorage.setItem('user_configs', JSON.stringify(configs));

                document.getElementById('p_config_name').value = '';
                refreshTable();
                alert("Đã lưu mẫu cấu hình thành công!");
                // Tự động đóng form sau khi lưu
                managerGrid.classList.remove('show-form');
                toggleBtn.style.display = 'flex';
            };

            window.useConfig = (id) => {
                const configs = JSON.parse(localStorage.getItem('user_configs')) || [];
                const config = configs.find(c => c.id == id);
                sessionStorage.setItem('selected_template', JSON.stringify(config));
                window.location.href = 'cau-hinh-bai-viet.php';
            };

            window.deleteConfig = (id) => {
                if (confirm('Bạn có chắc muốn xóa mẫu này?')) {
                    let configs = JSON.parse(localStorage.getItem('user_configs')) || [];
                    configs = configs.filter(c => c.id != id);
                    localStorage.setItem('user_configs', JSON.stringify(configs));
                    refreshTable();
                }
            };

            await loadOptions();
            refreshTable();
        });
    </script>
</body>

</html>