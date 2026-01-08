document.addEventListener('DOMContentLoaded', async () => {
    const managerGrid = document.getElementById('managerGrid');
    const toggleBtn = document.getElementById('toggleFormBtn');
    const closeBtn = document.getElementById('closeFormBtn');

    // --- XỬ LÝ ẨN/HIỆN FORM ---
    if (toggleBtn) {
        toggleBtn.onclick = () => {
            if (managerGrid) managerGrid.classList.add('show-form');
            toggleBtn.style.display = 'none';
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            if (managerGrid) managerGrid.classList.remove('show-form');
            if (toggleBtn) toggleBtn.style.display = 'flex';
        };
    }

    // --- QUAN TRỌNG: Render bảng ngay lập tức ---
    console.log("🚀 Script mau-cau-hinh.js is running...");
    refreshTable();

    // 1. Tải danh sách Options từ API
    async function loadOptions() {
        const fill = (id, arr, label = "Chọn...") => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = `<option value="">${label}</option>`;
            if (!arr) return;

            if (Array.isArray(arr)) {
                el.innerHTML += arr.map(i => {
                    if (typeof i === 'object') {
                        const val = i.id || i.value || i.code || i.name;
                        const text = i.name || i.label || i.text || val;
                        return `<option value="${val}">${text}</option>`;
                    }
                    return `<option value="${i}">${i}</option>`;
                }).join('');
            } else if (typeof arr === 'object') {
                el.innerHTML += Object.entries(arr).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
            }
        };

        try {
            const data = await apiRequest('/ui/configs');

            localStorage.setItem('ui_configs', JSON.stringify(data));
            const configData = data.data || data;

            if (configData) {
                fill('content_lengths', configData.content_lengths, "Chọn độ dài");
                fill('content_types', configData.content_types, "Chọn loại bài viết");
                fill('writing_tones', configData.writing_tones, "Chọn tone giọng");
                fill('languages', configData.languages, "Chọn ngôn ngữ");
                fill('bots', configData.bots, "Chọn AI Model");
                console.log("✅ Select options updated from API");
            }
        } catch (e) {
            console.warn("⚠️ API Load failed, trying cache...", e);
            const cached = localStorage.getItem('ui_configs');
            if (cached) {
                const data = JSON.parse(cached);
                const configData = data.data || data;
                if (configData) {
                    fill('content_lengths', configData.content_lengths);
                    fill('content_types', configData.content_types);
                    fill('writing_tones', configData.writing_tones);
                    fill('languages', configData.languages);
                    fill('bots', configData.bots);
                }
            }
        }
        // Cập nhật lại bảng sau khi có dữ liệu mới
        refreshTable();
    }

    // 2. Xử lý Slider
    const slider = document.getElementById('creativity_level');
    const badge = document.getElementById('creativity_val');
    if (slider && badge) {
        slider.oninput = function () {
            badge.textContent = this.value + "%";
        };
    }

    // 3. Render danh sách bên trái
    function refreshTable() {
        const body = document.getElementById('configTableBody');
        const emptyState = document.getElementById('noDataState');
        if (!body) return;

        console.log("🔄 Rendering config table...");
        let configs = [];

        const sources = [
            { key: 'user_configs', path: null },
            { key: 'ui_configs', path: 'configs' },
            { key: 'ui_configs', path: 'data.configs' },
            { key: 'ui_configs', path: 'data' }, // Trường hợp data chính là mảng configs
            { key: 'user_info', path: 'configs' },
            { key: 'user_info', path: 'user.configs' },
            { key: 'user_info', path: 'data.configs' }
        ];
        sources.forEach(src => {
            try {
                const stored = localStorage.getItem(src.key);
                if (!stored) return;

                let data = JSON.parse(stored);
                if (src.path) {
                    const parts = src.path.split('.');
                    parts.forEach(p => { if (data) data = data[p]; });
                }

                if (Array.isArray(data)) {
                    data.forEach(item => {
                        if (typeof item !== 'object') return;
                        // Xác định id và name để kiểm tra trùng lặp
                        const itemId = item.id || item._id;
                        const itemName = item.name || item.config_name || item.title;

                        if (!itemId && !itemName) return;

                        const isExist = configs.find(c =>
                            (itemId && (c.id == itemId || c._id == itemId)) ||
                            (itemName && (c.name == itemName || c.config_name == itemName))
                        );
                        if (!isExist) configs.push(item);
                    });
                } else if (data && typeof data === 'object' && src.key === 'user_configs') {
                    if (!configs.find(c => c.id == data.id)) configs.push(data);
                }
            } catch (e) { }
        });

        console.log(`📊 Found ${configs.length} configs`);

        body.innerHTML = '';
        if (configs.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            [...configs].sort((a, b) => (b.id || 0) - (a.id || 0)).forEach(config => {
                const tr = document.createElement('tr');
                const name = config.name || config.config_name || "Mẫu không tên";
                const model = config.model || config.bot || config.bot_id || '-';
                const type = config.type || config.article_type || '-';
                const count = config.article_count || 0;
                const date = config.created_at || '-';
                const id = config.id || btoa(name);

                tr.innerHTML = `
                  <td style="text-align: left; padding-left: 20px;">
                    <strong style="color:#1e293b; font-size:15px;">${name}</strong>
                  </td>
                  <td><span class="badge-model">${model}</span></td>
                  <td><span style="color:#64748b;">${type}</span></td>
                  <td><span style="color:#64748b; font-weight:600;">${count}</span></td>
                  <td><span style="color:#94a3b8; font-size:13px;">${date}</span></td>
                  <td>
                      <div style="display: flex; gap: 12px; justify-content: center; align-items:center;">
                          <button class="btn-use-sm" onclick="useConfig('${id}')">Sử dụng</button>
                          <button class="btn-use-sm" onclick="useConfig('${id}')">Sửa</button>
                          <button onclick="deleteConfig('${id}')" style="border: none; background: none; color: #cbd5e1; cursor: pointer; font-size: 20px; transition:color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#cbd5e1'">&times;</button>
                      </div>
                  </td>
                `;
                body.appendChild(tr);
            });
        }
    }

    // 4. Lưu cấu hình mới
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.onclick = () => {
            const nameEl = document.getElementById('config_name');
            const name = nameEl ? nameEl.value.trim() : '';
            if (!name) return alert("Vui lòng nhập tên cấu hình!");

            const newConfig = {
                id: Date.now(),
                name: name,
                model: document.getElementById('bots')?.value || '',
                type: document.getElementById('content_types')?.value || '',
                length: document.getElementById('content_lengths')?.value || '',
                tone: document.getElementById('writing_tones')?.value || '',
                creativity: document.getElementById('creativity_level')?.value || 50,
                language: document.getElementById('languages')?.value || '',
                article_count: 0,
                created_at: new Date().toLocaleDateString('vi-VN')
            };

            const configs = JSON.parse(localStorage.getItem('user_configs')) || [];
            configs.push(newConfig);
            localStorage.setItem('user_configs', JSON.stringify(configs));

            if (nameEl) nameEl.value = '';
            refreshTable();
            alert("Đã lưu mẫu cấu hình thành công!");
            if (managerGrid) managerGrid.classList.remove('show-form');
            if (toggleBtn) toggleBtn.style.display = 'flex';
        };
    }

    window.useConfig = (id) => {
        let found = null;
        ['user_configs', 'ui_configs', 'user_info'].forEach(key => {
            try {
                const stored = localStorage.getItem(key);
                if (!stored) return;
                const data = JSON.parse(stored);
                const list = Array.isArray(data) ? data : (data.configs || data.data?.configs || (data.user && data.user.configs));
                if (Array.isArray(list)) {
                    const c = list.find(item => item.id == id || (item.name && btoa(item.name) == id));
                    if (c) found = c;
                }
            } catch (e) { }
        });

        if (found) {
            sessionStorage.setItem('selected_template', JSON.stringify(found));
            window.location.href = 'cau-hinh-bai-viet.php';
        } else {
            alert("Không tìm thấy thông tin cấu hình này!");
        }
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
});



