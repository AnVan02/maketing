const API_BASE_URL = 'https://caiman-warm-swan.ngrok-free.app/api/v1';

async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);
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
        const configs = JSON.parse(localStorage.getItem('user_configs')) || [];
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (configs.length === 0) {
            if (noDataState) noDataState.style.display = 'block';
        } else {
            if (noDataState) noDataState.style.display = 'none';
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
    const saveBtn = document.getElementById('p_saveBtn');
    if (saveBtn) {
        saveBtn.onclick = () => {
            const nameEl = document.getElementById('p_config_name');
            const name = nameEl ? nameEl.value.trim() : '';

            if (!name) return alert("Vui lòng nhập tên cấu hình!");

            const newConfig = {
                id: Date.now(),
                name: name,
                model: document.getElementById('bots').value,
                type: document.getElementById('content_types').value,
                length: document.getElementById('content_lengths').value,
                tone: document.getElementById('writing_tones').value,
                creativity: document.getElementById('creativity_level').value,
                language: document.getElementById('languages').value,
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
