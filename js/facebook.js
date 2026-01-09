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

    // --- QUAN TRỌNG: Khởi tạo ---
    console.log("🚀 Script mau-cau-hinh.js is running...");

        }
    );

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

            // Nếu API không có dữ liệu, thử lấy từ cache
            if (configs.length === 0) {
                console.log("⚠️ API không có dữ liệu, kiểm tra localStorage...");
                const cached = localStorage.getItem('user_configs_api');
                if (cached) {
                    configs = JSON.parse(cached);
                    console.log("💾 Dữ liệu lấy từ cache:", configs);
                }
            } else {
                localStorage.setItem('user_configs_api', JSON.stringify(configs));
            }

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

                    const id = config.id || config._id || index;

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
                          <div style="display: flex; gap: 12px; justify-content: center; align-items:center;">
                              <button class="btn-use-sm" onclick="useConfig('${id}')">Sử dụng</button>
                              <button class="btn-use-sm" onclick="editConfig('${id}')">Sửa</button>
                              <button onclick="deleteConfig('${id}')" style="border: none; background: none; color: #cbd5e1; cursor: pointer; font-size: 20px; transition:color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#cbd5e1'">&times;</button>
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
    if (saveBtn) {
        saveBtn.onclick = async () => {
            const nameEl = document.getElementById('config_name');
            const name = nameEl ? nameEl.value.trim() : '';
            if (!name) return alert("Vui lòng nhập tên cấu hình!");

            const bot_id = document.getElementById('bots')?.value;
            const article_type = document.getElementById('content_types')?.value;
            const article_length = document.getElementById('content_lengths')?.value;
            const tone = document.getElementById('writing_tones')?.value;
            const language = document.getElementById('languages')?.value;
            const creativity = document.getElementById('creativity_level')?.value || 50;

            const payload = {
                name: name,
                bot_id: bot_id,
                article_length: article_length,
                tone: tone,
                article_type: article_type,
                language: language,
                temperature: parseFloat(creativity) / 100,
                is_default: false
            };

            try {
                saveBtn.disabled = true;
                saveBtn.textContent = 'ĐANG LƯU...';

                await apiRequest('/ui/user/configs', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                if (nameEl) nameEl.value = '';
                alert("Đã tạo cấu hình mới thành công!");

                // Load lại bảng như yêu cầu ở Point 4
                await refreshTable();

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
        const cached = localStorage.getItem('user_configs_api');
        if (!cached) return alert("Không tìm thấy dữ liệu cấu hình!");

        const configs = JSON.parse(cached);
        const found = configs.find(c => c.id == id || c._id == id);

        if (found) {
            sessionStorage.setItem('selected_template', JSON.stringify(found));
            window.location.href = 'cau-hinh-bai-viet.php';
        } else {
            alert("Không tìm thấy thông tin cấu hình này!");
        }
    };

    function resetForm() {
        editingConfigId = null;
        if(configNameInput) configNameInput.value ='';
        if (formTitle) formTitle.innerHTML= 'Tạo cấu hinh mới ';
        if (saveBtn) saveBtn.textContent = 'LƯU CẤU HÌNH';

        const isDefaultEl = documen.getElementById('is_Default');
        if(isDefaultEl) isDefaultEl.checked= false;

        // reset các 
    }

    















    window.editConfig = (id) => {
        const cached = localStorage.getItem('user_configs_api');
        if (!cached) return;
        const configs = JSON.parse(cached);
        const found = configs.find(c => c.id == id || c._id == id);

        if (found) {
            // Điền dữ liệu vào form để sửa
            document.getElementById('config_name').value = found.name || '';
            document.getElementById('bots').value = found.bot_id || found.model || '';
            document.getElementById('content_types').value = found.article_type || found.type || '';
            document.getElementById('content_lengths').value = found.article_length || found.length || '';
            document.getElementById('writing_tones').value = found.tone || '';
            document.getElementById('languages').value = found.language || '';
            const temp = (found.temperature || (found.creativity / 100) || 0.5) * 100;
            document.getElementById('creativity_level').value = temp;
            document.getElementById('creativity_val').textContent = temp + "%";

            if (managerGrid) managerGrid.classList.add('show-form');
            if (toggleBtn) toggleBtn.style.display = 'none';

            // Ở phiên bản này chúng ta chỉ demo điền form, nếu muốn UPDATE thực sự cần API PUT/PATCH
            alert("Đã tải thông tin vào form. Bạn có thể chỉnh sửa và lưu như mới.");
        }
    };

    window.deleteConfig = async (id) => {
        if (confirm('Bạn có chắc muốn xóa mẫu này?')) {
            try {
                // Giả sử có API DELETE /ui/user/configs/{id}
                // Nếu chưa có, tạm thời thông báo
                alert("Tính năng xóa đang được đồng bộ với backend...");
            } catch (e) {
                alert("Lỗi khi xóa: " + e.message);
            }
        }
    };

    // Chạy lần đầu
    await loadOptions();
    await refreshTable();




