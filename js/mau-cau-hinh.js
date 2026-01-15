document.addEventListener('DOMContentLoaded', async () => {
    const managerGrid = document.getElementById('managerGrid');
    const toggleBtn = document.getElementById('toggleFormBtn');
    const closeBtn = document.getElementById('closeFormBtn');

    // --- XỬ LÝ ẨN/HIỆN FORM ---
    if (closeBtn) {
        closeBtn.onclick = () => {
            if (managerGrid) managerGrid.classList.remove('show-form');
            if (toggleBtn) toggleBtn.style.display = 'flex';
            if (typeof resetForm === 'function') resetForm();
        };
    }

    // --- QUAN TRỌNG: Khởi tạo ---
    console.log("🚀 Script mau-cau-hinh.js is running...");

    // Tải danh sách Options từ API (API 2: GET /api/v1/ui/configs)
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
            console.error("❌ Lỗi loadOptions:", e);
            showNotification("Không thể tải danh sách tùy chọn cấu hình.", "error");
        }
    }

    // Tải danh sách cấu hình người dùng (API 4: GET /api/v1/ui/user/configs)
    async function loadUserConfigs() {
        try {
            const response = await apiRequest('/ui/user/configs');
            // Backend thường trả về { data: [...] } hoặc trực tiếp [...]
            const configs = response.data || response;
            if (Array.isArray(configs)) {
                localStorage.setItem('user_configs_api', JSON.stringify(configs));
                return configs;
            }
            return [];
        } catch (error) {
            console.error('Lỗi khi tải danh sách cấu hình:', error);
            throw error;
        }
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
    async function refreshTable() {
        const body = document.getElementById('configTableBody');
        const emptyState = document.getElementById('noDataState');
        if (!body) {
            console.error("❌ Không tìm thấy element #configTableBody");
            return;
        }


        console.log("🔄 Bắt đầu tải danh sách cấu hình...");

        try {
            // Ưu tiên lấy từ API
            const response = await apiRequest('/ui/user/configs').catch(err => {
                console.error("❌ Lỗi API Request:", err);
                return null;
            });

            console.log("📦 API Response raw:", response);

            // Xử lý các dạng cấu trúc dữ liệu khác nhau từ backend
            let configs = [];
            if (response) {
                if (Array.isArray(response)) {
                    configs = response;
                } else if (response.data && Array.isArray(response.data)) {
                    configs = response.data;
                } else if (response.configs && Array.isArray(response.configs)) {
                    configs = response.configs;
                }
            }

            window.userConfigsData = configs;
            console.log(`📊 Số lượng cấu hình tìm thấy: ${configs.length}`);

            body.innerHTML = '';
            if (!configs || configs.length === 0) {
                if (emptyState) emptyState.style.display = 'block';
                console.log("ℹ️ Hiển thị trạng thái trống (no data)");
            } else {
                if (emptyState) emptyState.style.display = 'none';

                // Sắp xếp mới nhất lên đầu (kiểm tra trường article_count hoặc created_at)
                try {
                    configs.sort((a, b) => {
                        const dateA = new Date(a.created_at || a.updated_at || 0);
                        const dateB = new Date(b.created_at || b.updated_at || 0);
                        return dateB - dateA;
                    });
                } catch (e) {
                    console.warn("⚠️ Không thể sắp xếp dữ liệu:", e);
                }

                configs.forEach((config, index) => {
                    const tr = document.createElement('tr');
                    const name = config.name || config.config_name || "Mẫu không tên";
                    const model = config.bot_id || config.model || config.bot || '-';
                    const type = config.article_type || config.type || '-';
                    const count = config.article_count || 0;

                    let dateStr = '-';
                    if (config.created_at) {
                        try {
                            dateStr = new Date(config.created_at).toLocaleDateString('vi-VN');
                        } catch (e) { dateStr = config.created_at; }
                    }

                    // Đảm bảo lấy đúng ID để Xoá/Sửa (ưu tiên config_id từ API)
                    const id = config.config_id || config.id || config._id || config.configId;

                    if (!id && id !== 0) {
                        console.warn("⚠️ Không tìm thấy ID cho cấu hình:", config);
                    }

                    tr.innerHTML = `
                      <td>
                        <strong style="color:#1e293b; font-size:15px;">${name}</strong>
                        ${config.is_default ? '<span style="margin-left:8px; font-size:10px; background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:4px;">Mặc định</span>' : ''}
                      </td>
                      <td><span class="badge-model">${model}</span></td>
                      <td><span style="color:#64748b;">${type}</span></td>
                      <td><span style="color:#64748b; font-weight:600;">${count}</span></td>
                      <td><span style="color:#94a3b8; font-size:15px;">${dateStr}</span></td>
                      <td>
                        <div style="display: flex; gap: 20px; justify-content: center; align-items:center;">
                            <button class="btn-action-delete" onclick="deleteConfig('${id}')">
                                <i class="fa-regular fa-trash-can"></i> Xoá
                            </button>
                            <button class="btn-action-edit" onclick="editConfig('${id}')">
                                <i class="fa-regular fa-pen-to-square"></i> Sửa
                            </button>
                        </div>
                      </td>
                    `;
                    body.appendChild(tr);
                });
                console.log("✅ Đã render xong bảng dữ liệu");
            }
        } catch (error) {
            console.error("❌ Lỗi nghiêm trọng trong refreshTable:", error);
            if (emptyState) emptyState.style.display = 'block';
        }
    }

    // 4. Lưu cấu hình mới (API 3: POST /api/v1/ui/user/configs)
    const saveBtn = document.getElementById('saveBtn');
    const formTitle = document.querySelector('.form-title');
    const configNameInput = document.getElementById('config_name');
    let editingConfigId = null;

    function resetForm() {
        editingConfigId = null;
        if (configNameInput) configNameInput.value = '';
        if (formTitle) formTitle.innerHTML = 'Tạo cấu hình mới';
        if (saveBtn) saveBtn.textContent = 'LƯU CẤU HÌNH';

        const isDefaultEl = document.getElementById('is_default');
        if (isDefaultEl) isDefaultEl.checked = false;

        // Reset các select
        ['bots', 'content_types', 'content_lengths', 'writing_tones', 'languages'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.selectedIndex = 0;
        });

        // Reset slider
        const slider = document.getElementById('creativity_level');
        const badge = document.getElementById('creativity_val');
        if (slider) slider.value = 50;
        if (badge) badge.textContent = "50%";
    }

    if (toggleBtn) {
        toggleBtn.onclick = () => {
            resetForm();
            if (managerGrid) managerGrid.classList.add('show-form');
            toggleBtn.style.display = 'none';
        };
    }

    if (saveBtn) {
        saveBtn.onclick = async () => {
            const name = configNameInput ? configNameInput.value.trim() : '';
            if (!name) return alert("Vui lòng nhập tên cấu hình!");

            const bot_id = document.getElementById('bots')?.value;
            const article_type = document.getElementById('content_types')?.value;
            const article_length = document.getElementById('content_lengths')?.value;
            const tone = document.getElementById('writing_tones')?.value;
            const language = document.getElementById('languages')?.value;
            const creativity = document.getElementById('creativity_level')?.value || 50;

            const temperature = parseFloat(creativity) / 100;
            const is_default = document.getElementById('is_default')?.checked || false;

            const payload = {
                name: name,
                bot_id: bot_id,
                article_length: article_length,
                tone: tone,
                article_type: article_type,
                language: language,
                temperature: temperature,
                is_default: is_default
            };

            try {
                saveBtn.disabled = true;
                saveBtn.textContent = 'ĐANG XỬ LÝ...';

                if (editingConfigId) {
                    // API 6: Chỉnh sửa cấu hình (PUT)
                    await apiRequest(`/ui/user/configs/${editingConfigId}`, {
                        method: 'PUT',
                        body: JSON.stringify(payload)
                    });
                    alert("Cập nhật cấu hình thành công!");
                } else {
                    // API 3: Tạo cấu hình mới (POST)
                    await apiRequest('/ui/user/configs', {
                        method: 'POST',
                        body: JSON.stringify(payload)
                    });
                    alert("Đã tạo cấu hình mới thành công!");
                }

                if (configNameInput) configNameInput.value = '';
                editingConfigId = null;
                if (formTitle) formTitle.innerHTML = 'Tạo cấu hình mới';

                // Load lại bảng
                await refreshTable();
                resetForm();

                if (managerGrid) managerGrid.classList.remove('show-form');
                if (toggleBtn) toggleBtn.style.display = 'flex';
            } catch (error) {
                alert("Lỗi khi lưu cấu hình: " + error.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = 'LƯU CẤU HÌNH';
            }
        };
    }
    window.useConfig = (id) => {
        const configs = window.userConfigsData || [];
        const found = configs.find(c => c.id == id || c._id == id);

        if (found) {
            sessionStorage.setItem('selected_template', JSON.stringify(found));
            window.location.href = 'cau-hinh-bai-viet.php';
        } else {
            alert("Không tìm thấy thông tin cấu hình này!");
        }
    };

    window.editConfig = (id) => {
        const configs = window.userConfigsData || [];
        const found = configs.find(c => (c.id || c._id || c.config_id) == id);
        if (found) {
            editingConfigId = id;
            if (formTitle) formTitle.innerHTML = '<img src="./images/icon-sua.png" alt="">Sửa cấu hình';
            if (saveBtn) saveBtn.textContent = 'CẬP NHẬT CẤU HÌNH';
            // Điền dữ liệu vào form
            if (configNameInput) configNameInput.value = found.name || found.config_name || '';
            document.getElementById('bots').value = found.bot_id || found.model || '';
            document.getElementById('content_types').value = found.article_type || found.type || '';
            document.getElementById('content_lengths').value = found.article_length || found.length || '';
            document.getElementById('writing_tones').value = found.tone || '';
            document.getElementById('languages').value = found.language || '';

            const isDefaultEl = document.getElementById('is_default');
            if (isDefaultEl) isDefaultEl.checked = found.is_default || false;

            const tempVal = found.temperature !== undefined ? found.temperature : (found.creativity / 100 || 0.5);
            const sliderVal = Math.round(tempVal * 100);

            const slider = document.getElementById('creativity_level');
            const badge = document.getElementById('creativity_val');

            if (slider) slider.value = sliderVal;
            if (badge) badge.textContent = sliderVal + "%";

            if (managerGrid) managerGrid.classList.add('show-form');
            if (toggleBtn) toggleBtn.style.display = 'none';
        }
    };


    window.deleteConfig = async (id) => {
        if (!id) return;
        if (confirm('Bạn có chắc muốn xóa mẫu này?')) {
            try {
                await apiRequest(`/ui/user/configs/${id}`, {
                    method: 'DELETE'
                });
                // Gọi load lại bảng trước khi hiện thông báo để UI cập nhật ngay
                await refreshTable();
                alert("Đã xóa cấu hình thành công!");
            } catch (e) {
                alert("Lỗi khi xóa: " + e.message);
            }
        }
    };
    // Chạy lần đầu
    await loadOptions();
    await refreshTable();
});

