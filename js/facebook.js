document.addEventListener('DOMContentLoaded', async () => {
    // --- KHỞI TẠO BIẾN UI GLOBAL TRONG SCOPE NÀY ---
    const managerGrid = document.getElementById('managerGrid');
    const toggleBtn = document.getElementById('toggleFormBtn');
    const closeBtn = document.getElementById('closeFormBtn');
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
    const toggleImage = document.getElementById('toggle_image');

    let editingConfigId = null; // Theo dõi đang sửa hay tạo mới

    console.log("🚀 Script facebook.js is running...");

    // --- XỬ LÝ ẨN/HIỆN FORM ---
    if (toggleBtn) {
        toggleBtn.onclick = () => {
            resetForm(); // Reset form khi mở mới
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

    // Slider value update
    if (slider && sliderVal) {
        slider.oninput = () => {
            sliderVal.textContent = slider.value + '%';
        };
    }

    // --- DATA MOCKUP CHO DROPDOWNS ---
    const MOCK_OPTIONS = {
        lengths: [
            { value: 'short', label: 'Ngắn (50-200 từ)' },
           
        ],
        types: [
            { value: 'ads', label: 'Bài quảng cáo' }
        ],
        tones: [
            { value: 'professional', label: 'Chuyên nghiệp, đáng tin cậy' }
        ],
        bots: [
          
            { value: 'gpt-4o', label: 'GPT-4o' },
            { value: 'claude-3-sonnet', label: 'Claude 3.5 Sonnet' }
        ],
        languages: [
            { value: 'vi', label: 'Tiếng Việt' },
           
        ]
    };

    // --- HÀM LOAD OPTIONS ---
    async function loadOptions() {
        console.log("📥 Loading dropdown options...");

        function populate(selectEl, data) {
            if (!selectEl) return;
            selectEl.innerHTML = '';
            data.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.value;
                opt.textContent = item.label;
                selectEl.appendChild(opt);
            });
        }

        populate(lengthSelect, MOCK_OPTIONS.lengths);
        populate(typeSelect, MOCK_OPTIONS.types);
        populate(toneSelect, MOCK_OPTIONS.tones);
        populate(botSelect, MOCK_OPTIONS.bots);
        populate(langSelect, MOCK_OPTIONS.languages);

        // Chọn mặc định
        if (botSelect) botSelect.value = 'gemini-2.5-pro';
        if (langSelect) langSelect.value = 'vi';
        if (lengthSelect) lengthSelect.value = 'short';
        if (typeSelect) typeSelect.value = 'ads';
        if (toneSelect) toneSelect.value = 'professional';
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
                const response = await apiRequest('');
                if (response && Array.isArray(response)) configs = response;
                else if (response.data && Array.isArray(response.data)) configs = response.data;
            } catch (err) {
                console.warn("API Error, checking cache...", err);
            }

            // Fallback cache
            if (configs.length === 0) {
                const cached = localStorage.getItem('');
                if (cached) configs = JSON.parse(cached);
            } else {
                localStorage.setItem('', JSON.stringify(configs));
            }

            if (!configs || configs.length === 0) {
                if (emptyState) emptyState.style.display = 'block';
                return;
            }

            if (emptyState) emptyState.style.display = 'none';

            // Sort newest first
            configs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

            configs.forEach((config, index) => {
                const tr = document.createElement('tr');
                const name = config.name || "Mẫu không tên";
                const model = config.bot_id || config.model || '-';
                const type = config.article_type || '-';
                const count = config.article_count || 0;
                let dateStr = config.created_at ? new Date(config.created_at).toLocaleDateString('vi-VN') : '-';
                const id = config.id || config._id || index;

                tr.innerHTML = `
                  <td style="padding-left: 20px;">
                    <strong style="color:#1e293b; font-size:15px;">${name}</strong>
                    ${config.is_default ? '<span style="background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:4px; font-size:10px; margin-left:5px;">Mặc định</span>' : ''}
                  </td>
                  <td><span class="badge-model">${model}</span></td>
                  <td><span style="color:#64748b;">${type}</span></td>
                  <td><span style="color:#64748b; font-weight:600;">${count}</span></td>
                  <td><span style="color:#94a3b8; font-size:14px;">${dateStr}</span></td>
                  <td>
                      <div style="display: flex; gap: 8px; justify-content: center; align-items:center;">
                          <button class="btn-use-sm" onclick="useConfig('${id}')">Sử dụng</button>
                          <button class="btn-use-sm" onclick="editConfig('${id}')">Sửa</button>
                          <button onclick="deleteConfig('${id}')" style="border:none;background:none;color:#cbd5e1;cursor:pointer;font-size:18px;">&times;</button>
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

            const payload = {
                name: name,
                bot_id: botSelect?.value,
                article_length: lengthSelect?.value,
                article_type: typeSelect?.value,
                tone: toneSelect?.value,
                language: langSelect?.value,
                temperature: parseInt(slider?.value || 50) / 100,
                is_default: false
            };

            // Nếu muốn thêm fields emoji/hashtag/image vào payload, API backend cần hỗ trợ
            // payload.use_emoji = toggleEmoji?.checked;
            // payload.use_hashtag = toggleHashtag?.checked;
            // payload.use_image = toggleImage?.checked;

            try {
                saveBtn.disabled = true;
                saveBtn.textContent = 'ĐANG LƯU...';

                // Nếu đang edit -> PUT (giả sử có API), nếu không -> POST
                // Hiện tại API docs chỉ thấy POST /ui/user/configs

                await apiRequest('', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                alert("Đã lưu cấu hình thành công!");

                // Refresh list & Reset form
                resetForm();
                await window.refreshTable();

                // Đóng form
                if (managerGrid) managerGrid.classList.remove('show-form');
                if (toggleBtn) toggleBtn.style.display = 'flex';

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
        const cached = localStorage.getItem('');
        if (cached) {
            const configs = JSON.parse(cached);
            const found = configs.find(c => c.id == id || c._id == id);
            if (found) {
                sessionStorage.setItem('selected_template', JSON.stringify(found));
                window.location.href = 'cau-hinh-bai-viet.php';
                // Hoặc trang facebook post nếu có
            }
        }
    };

    window.editConfig = (id) => {
        const cached = localStorage.getItem('');
        if (!cached) return;
        const configs = JSON.parse(cached);
        const found = configs.find(c => c.id == id || c._id == id);

        if (found) {
            editingConfigId = id;
            if (configNameInput) configNameInput.value = found.name || '';
            if (botSelect) botSelect.value = found.bot_id || found.model || 'gemini-2.5-pro';
            if (typeSelect) typeSelect.value = found.article_type || 'ads';
            if (lengthSelect) lengthSelect.value = found.article_length || 'short';
            if (toneSelect) toneSelect.value = found.tone || 'professional';
            if (langSelect) langSelect.value = found.language || 'vi';

            if (slider) {
                let val = (found.temperature || 0.5) * 100;
                slider.value = val;
                if (sliderVal) sliderVal.textContent = val + '%';
            }

            // Mở form
            if (managerGrid) managerGrid.classList.add('show-form');
            if (toggleBtn) toggleBtn.style.display = 'none';
            if (saveBtn) saveBtn.textContent = 'CẬP NHẬT CẤU HÌNH';
        }
    };

    window.deleteConfig = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa?')) return;
        // Mock delete
        alert("Đã gửi lệnh xóa (API chưa sẵn sàng)");
    };

    function resetForm() {
        editingConfigId = null;
        if (configNameInput) configNameInput.value = '';
        if (slider) { slider.value = 50; if (sliderVal) sliderVal.textContent = '50%'; }
        if (saveBtn) saveBtn.textContent = 'LƯU CẤU HÌNH';
        // Reset defaults
        if (botSelect) botSelect.value = 'gemini-2.5-pro';
        if (langSelect) langSelect.value = 'vi';
    }

    // --- CHẠY LẦN ĐẦU ---
    await loadOptions();
    await window.refreshTable();
});
