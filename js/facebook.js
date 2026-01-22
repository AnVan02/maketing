document.addEventListener('DOMContentLoaded', async () => {
    // --- KHỞI TẠO BIẾN UI GLOBAL TRONG SCOPE NÀY ---
    const configFormSection = document.getElementById('configFormSection');
    const toggleBtn = document.getElementById('toggleFormBtn');
    const saveBtn = document.getElementById('saveBtn');

    // Form Inputs
    const configNameInput = document.getElementById('config_name');
    const botSelect = document.getElementById('bots');
    const typeSelect = document.getElementById('content_types');
    const lengthSelect = document.getElementById('content_lengths');
    const toneSelect = document.getElementById('writing_tones');
    const langSelect = document.getElementById('languages');
    const slider = document.getElementById('creativity_level');
    const sliderVal = document.getElementById('creativity_val');
    const toggleEmoji = document.getElementById('toggle_emoji');
    const toggleHashtag = document.getElementById('toggle_hashtag');

    let editingConfigId = null; // Theo dõi đang sửa hay tạo mới

    console.log("🚀 Script facebook.js is running...");

    // --- XỬ LÝ ẨN/HIỆN FORM ---
    if (toggleBtn) {
        toggleBtn.onclick = (e) => {
            e.preventDefault();
            resetForm(); // Reset form khi mở mới
            if (configFormSection) {
                configFormSection.style.display = 'block';
                configFormSection.scrollIntoView({ behavior: 'smooth' });
            }
        };
    }

    // Slider value update
    function updateSliderBadge() {
        if (!slider || !sliderVal) return;
        const val = slider.value;
        sliderVal.textContent = val + '%';

        // Tính toán vị trí % để badge chạy theo
        const percent = (val - slider.min) / (slider.max - slider.min);
        // Điều chỉnh một chút để badge nằm giữa thumb (thumb rộng khoảng 20px)
        sliderVal.style.left = `calc(${percent * 100}%)`;

        // Cập nhật màu thanh kéo (Track color)
        const colorPercent = percent * 100;
        slider.style.background = `linear-gradient(to right, #32A6F9 0%, #32A6F9 ${colorPercent}%, #E2E8F0 ${colorPercent}%, #E2E8F0 100%)`;
    }

    if (slider && sliderVal) {
        slider.oninput = updateSliderBadge;
        // Chạy lần đầu để set vị trí mặc định 50%
        
        updateSliderBadge();
    }

    // --- HÀM LOAD OPTIONS ---
    async function loadOptions() {
        try {
            const data = await apiRequest('/facebook/config');
            const configData = data;

            const fill = (selectEl, arr, label = "Chọn...") => {
                if (!selectEl) return;
                selectEl.innerHTML = `<option value="">${label}</option>`;
                if (!arr) return;


                arr.forEach(i => {
                    const opt = document.createElement('option');
                    if (typeof i === 'object') {
                        opt.value = i.id || i.value || i.code || i.name;
                        opt.textContent = i.name || i.label || i.text || opt.value;
                    } else {
                        opt.value = i;
                        opt.textContent = i;
                    }
                    selectEl.appendChild(opt);
                });
            };

            if (configData) {
                fill(lengthSelect, configData.content_lengths, "Chọn độ dài");
                fill(typeSelect, configData.content_types, "Chọn loại bài viết");
                fill(toneSelect, configData.writing_tones, "Chọn tone giọng");
                fill(langSelect, configData.languages, "Chọn ngôn ngữ");
                fill(botSelect, configData.bots, "Chọn AI Model");
                console.log("Chọn các tùy chọn được cập nhật từ API");
            }
        } catch (e) {
            console.error("❌ Lỗi loadOptions:", e);
            showNotification("Không thể tải danh sách tuỳ chọn cấu hình.", "error");
        }
    }


    // --- HÀM RENDER TABLE ---
    window.refreshTable = async function () {
        const body = document.getElementById('configTableBody');
        const emptyState = document.getElementById('noDataState');
        if (!body) return;

        console.log("🔄 Bắt đầu tải danh sách cấu hình...");
        body.innerHTML = ''; // Clear trước

        try {
            // Lấy từ API
            let configs = [];
            try {
                const response = await apiRequest('/facebook/config/user');
                if (response && response.configs) configs = response.configs;
                else if (response && Array.isArray(response)) configs = response;
                else if (response.data && Array.isArray(response.data)) configs = response.data;
            } catch (err) {
                console.error("API Error:", err);
            }

            window.userConfigsData = configs;

            if (!configs || configs.length === 0) {
                if (emptyState) emptyState.style.display = 'block';
                return;
            }

            if (emptyState) emptyState.style.display = 'none';

            // Sort newest first
            configs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

            configs.forEach((config, index) => {
                const id = config.id || config._id || index;
                const tr = document.createElement('tr');
                tr.setAttribute('id', `row-${id}`); // Để tìm và cập nhật live
                const name = config.name || "Mẫu không tên";
                const model = config.bot_id || config.model || '-';
                const type = config.article_type || '-';
                const count = config.article_count || 0;
                let dateStr = config.created_at ? new Date(config.created_at).toLocaleDateString('vi-VN') : '-';

                tr.innerHTML = `
                  <td>
                    <strong class="col-name" style="color:#1e293b; font-size:15px;">${name}</strong>
                    ${config.is_default ? '<span class="badge-default" style="background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:4px; font-size:10px; margin-left:5px;">Mặc định</span>' : ''}
                  </td>
                  <td><span class="badge-model col-model">${model}</span></td>
                  <td><span class="col-type" style="color:#1e293b;">${type}</span></td>
                  <td><span style="color:#1e293b; font-weight:500;">${count}</span></td>
                  <td><span style="color:#1e293b; font-size:14px;">${dateStr}</span></td>
                  <td>
                        <div style="display: flex; gap: 20px;align-items:center;">
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
        } catch (error) {
            console.error("Refresh Table Error:", error);
            if (emptyState) emptyState.style.display = 'block';
        }
    };

    // --- HÀM LƯU (CREATE / UPDATE) ---

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

            // const payload = {
            //     name: name,
            //     bot_id: botSelect?.value,
            //     article_length: lengthSelect?.value,
            //     article_type: typeSelect?.value,
            //     tone: toneSelect?.value,
            //     language: langSelect?.value,
            //     temperature: parseInt(slider?.value || 50) / 100,
            //     is_default: editingConfigId ? (window.userConfigsData.find(c => (c.id == editingConfigId || c._id == editingConfigId))?.is_default || false) : false
            // };


            try {
                saveBtn.disabled = true;
                saveBtn.textContent = 'ĐANG XỬ..';

                let url = '/facebook/config';
                let method = 'POST';

                if (editingConfigId) {
                    url = `/ facebook / config / user / ${editingConfigId} `;
                    method = 'PUT';
                }

                await apiRequest(url, {
                    method: method,
                    body: JSON.stringify(payload)
                });

                alert("Đã lưu cấu hình thành công!");

                // Refresh list & Reset form
                resetForm();
                await window.refreshTable();

                // Đóng form
                if (configFormSection) configFormSection.style.display = 'none';

            } catch (error) {
                alert("Lỗi: " + error.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = 'LƯU CẤU HÌNH';
            }
        };
    }


    // --- CÁC HÀM GLOBAL (được gọi từ HTML) ---

    window.useConfig = (id) => {
        const configs = window.userConfigsData || [];
        const found = configs.find(c => c.id == id || c._id == id);
        if (found) {
            sessionStorage.setItem('selected_facebook_config', JSON.stringify(found));
            window.location.href = 'cau-hinh-facebook.php';
        }
    };


    window.editConfig = (id) => {
        const configs = window.userConfigsData || [];
        const found = configs.find(c => c.id == id || c._id == id);

        if (found) {
            editingConfigId = id;
            if (configNameInput) configNameInput.value = found.name || '';
            if (botSelect) botSelect.value = found.bot_id || found.model || '';
            if (typeSelect) typeSelect.value = found.article_type || '';
            if (lengthSelect) lengthSelect.value = found.article_length || '';
            if (toneSelect) toneSelect.value = found.tone || '';
            if (langSelect) langSelect.value = found.language || 'vi';

            if (slider) {
                let val = (found.temperature || 0.5) * 100;
                slider.value = val;
                updateSliderBadge(); // Cập nhật vị trí badge khi load dữ liệu sửa
            }

            // Mở form
            if (configFormSection) {
                configFormSection.style.display = 'block';
                configFormSection.scrollIntoView({ behavior: 'smooth' });
            }
            if (saveBtn) saveBtn.textContent = 'LƯU CẤU HÌNH';
        }
    };

    // --- LIVE UPDATE LOGIC ---
    function updateLiveRow() {
        if (!editingConfigId) return;
        const tr = document.getElementById(`row - ${editingConfigId} `);
        if (!tr) return;

        const nameEl = tr.querySelector('.col-name');
        const modelEl = tr.querySelector('.col-model');
        const typeEl = tr.querySelector('.col-type');

        if (nameEl && configNameInput) nameEl.textContent = configNameInput.value || "Mẫu không tên";
        if (modelEl && botSelect) {
            const selectedOption = botSelect.options[botSelect.selectedIndex];
            modelEl.textContent = selectedOption ? selectedOption.text : botSelect.value;
        }
        if (typeEl && typeSelect) {
            const selectedOption = typeSelect.options[typeSelect.selectedIndex];
            typeEl.textContent = selectedOption ? selectedOption.text : typeSelect.value;
        }
    }

    if (configNameInput) configNameInput.oninput = updateLiveRow;
    if (botSelect) botSelect.onchange = updateLiveRow;
    if (typeSelect) typeSelect.onchange = updateLiveRow;

    window.deleteConfig = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa cấu hình này?')) return;
        try {
            await apiRequest(`/ facebook / config / user / ${id} `, { method: 'DELETE' });
            alert("Đã xóa thành công!");
            await window.refreshTable();
        } catch (error) {
            alert("Lỗi khi xóa: " + error.message);
        }
    };

    window.setDefault = async (id) => {
        try {
            await apiRequest(`/ facebook / config / user / ${id}/default`, { method: 'PATCH' });
            await window.refreshTable();
        } catch (error) {
            alert("Lỗi khi đặt mặc định: " + error.message);
        }
    };


    function resetForm() {
        editingConfigId = null;
        if (configNameInput) configNameInput.value = '';
        if (saveBtn) saveBtn.textContent = 'LƯU CẤU HÌNH';
        if (slider) {
            slider.value = 50;
            updateSliderBadge(); // Reset vị trí badge về 50%
        }

        // Reset defaults
        if (botSelect) botSelect.value = '';
        if (langSelect) langSelect.value = 'vi';
        if (typeSelect) typeSelect.value = '';
        if (lengthSelect) lengthSelect.value = '';
        if (toneSelect) toneSelect.value = '';

        if (configFormSection) configFormSection.style.display = 'none';
    }
    // --- CHẠY LẦN ĐẦU ---
    await loadOptions();
    await window.refreshTable();
});

