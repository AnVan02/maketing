const API_BASE_URL = 'https://caiman-warm-swan.ngrok-free.app/api/v1';

async function apiRequest(url, options = {}) {
    const token = localStorage.getItem('access_token');

    // Khởi tạo headers nếu chưa có
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
    };

    // Nếu có token, tự động thêm vào Authorization header
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers: headers
        });

        if (response.status === 401) {
            console.warn('Phiên đăng nhập hết hạn hoặc không hợp lệ');
            // Có thể thêm logic chuyển hướng về trang đăng nhập ở đây nếu cần
            // window.location.href = 'dang-nhap.php';
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('configTableBody');
    const noDataState = document.getElementById('noDataState');
    const managerGrid = document.getElementById('managerGrid');
    const toggleBtn = document.getElementById('toggleFormBtn');
    const closeBtn = document.getElementById('closeFormBtn');

    // --- XỬ LÝ ẨN/HIỆN FORM ---
    if (toggleBtn) {
        toggleBtn.onclick = () => {
            managerGrid.classList.add('show-form');
            toggleBtn.style.display = 'none'; // Ẩn nút thêm khi form đang mở
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            managerGrid.classList.remove('show-form');
            toggleBtn.style.display = 'flex'; // Hiện lại nút thêm
        };
    }

    // 1. Tải danh sách Options từ API
    async function loadOptions() {
        try {
            const data = await apiRequest(`${API_BASE_URL}/ui/configs`);
            const fill = (id, arr) => {
                const el = document.getElementById(id);
                if (el && arr) {
                    el.innerHTML = arr.map(i => `<option value="${i}">${i}</option>`).join('');
                }
            };
            fill('content_lengths', data.content_lengths);
            fill('content_types', data.content_types);
            fill('writing_tones', data.writing_tones);
            fill('languages', data.languages);
            fill('bots', data.bots);
        } catch (e) {
            console.error("API Error:", e);
        }
    }

    // 2. Xử lý Slider
    const slider = document.getElementById('p_creativity_level');
    const badge = document.getElementById('p_creativity_val');
    if (slider && badge) {
        slider.oninput = function () {
            badge.textContent = this.value + "%";
        };
    }

    // 3. Render danh sách bên trái
    function refreshTable() {
        let configs = JSON.parse(localStorage.getItem('user_configs')) || [];

        // Add demo data if empty
        if (configs.length === 0) {
            configs = [{
                id: 'demo',
                name: 'Quảng cáo',
                model: 'Gemini 2.5 Pro',
                type: 'Quảng cáo',
                article_count: 100,
                created_at: '20/12/2025'
            }];
        }

        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (configs.length === 0 && !localStorage.getItem('user_configs')) {
            // Logic kept just in case but we force demo data above
            if (noDataState) noDataState.style.display = 'block';
        } else {
            if (noDataState) noDataState.style.display = 'none';
            [...configs].reverse().forEach(config => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                              <td style="text-align: left; padding-left: 30px;">
                                <strong style="color:#1e293b; font-size:14px; font-weight: 500;">${config.name}</strong>
                              </td>
                              <td><span class="badge-model" style="background:none; padding:0; font-weight:400; color:#334155;">${config.model}</span></td>
                              <td><span style="color:#334155;">${config.type}</span></td>
                              <td style="color:#334155; font-weight:400;">${config.article_count || 0}</td>
                              <td style="color:#334155;">${config.created_at}</td>
                              <td>
                                  <div style="display: flex; gap: 15px; justify-content: center; align-items:center;">
                                      <button onclick="deleteConfig('${config.id}')" style="border: none; background: none; color: #ef4444; cursor: pointer; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                                        <i class="far fa-trash-alt"></i> Xoá
                                      </button>
                                      <button class="btn-edit" onclick="useConfig('${config.id}')" style="border: none; background: none; color: #3b82f6; cursor: pointer; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                                        <i class="far fa-edit"></i> Sửa
                                      </button>
                                  </div>
                              </td>
                         `;
                tableBody.appendChild(tr);
            });
        }
    }


    // 4. Lưu cấu hình mới
    const saveBtn = document.getElementById('p_saveBtn');
    if (saveBtn) {
        saveBtn.onclick = () => {
            const nameEl = document.getElementById('p_config_name');
            const name = nameEl ? nameEl.value.trim() : '';

            if (!name) return alert("Vui lòng nhập tên cấu hình!");

            const newConfig = {
                id: Date.now(),
                name: name,
                length: document.getElementById('content_lengths').value,
                creativity: document.getElementById('p_creativity_level').value,
                type: document.getElementById('content_types').value,
                tone: document.getElementById('writing_tones').value,
                model: document.getElementById('bots').value,
                language: document.getElementById('languages').value,
                emoji: document.getElementById('toggle_emoji').checked,
                hashtag: document.getElementById('toggle_hashtag').checked,
                image: document.getElementById('toggle_image').checked,
                article_count: 0,
                created_at: new Date().toLocaleDateString('vi-VN')
            };

            const configs = JSON.parse(localStorage.getItem('user_configs')) || [];
            configs.push(newConfig);
            localStorage.setItem('user_configs', JSON.stringify(configs));

            nameEl.value = '';
            refreshTable();
            alert("Đã lưu mẫu cấu hình thành công!");
            // Tự động đóng form sau khi lưu
            if (managerGrid) managerGrid.classList.remove('show-form');
            if (toggleBtn) toggleBtn.style.display = 'flex';
        };
    }

    window.useConfig = (id) => {
        const configs = JSON.parse(localStorage.getItem('user_configs')) || [];
        const config = configs.find(c => c.id == id);
        sessionStorage.setItem('selected_template', JSON.stringify(config));
        window.location.href = 'facebook.php';
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
