document.addEventListener('DOMContentLoaded', async () => {
    // --- KHỞI TẠO ---
    console.log("🚀 Script AI-facebook.js is running...");

    // --- HÀM LOAD KẾT NỐI FACEBOOK ---
    window.refreshConnectionsTable = async function () {
        const body = document.getElementById('connectionTableBody');
        const emptyState = document.getElementById('noConnectionState');
        if (!body) return;

        console.log("🔄 Bắt đầu tải danh sách kết nối Facebook...");
        body.innerHTML = '';

        try {
            const response = await apiRequest('/facebook/connections');
            let connections = [];
            if (response && response.connections) connections = response.connections;

            if (!connections || connections.length === 0) {
                if (emptyState) emptyState.style.display = 'block';
                return;
            }

            if (emptyState) emptyState.style.display = 'none';

            window.facebookConnections = connections; // Store globally for editing

            connections.forEach((conn) => {
                const tr = document.createElement('tr');
                const pageId = conn.page_id;
                const isDefault = conn.is_default;
                let dateStr = conn.created_at ? new Date(conn.created_at).toLocaleString('vi-VN') : '-';

                tr.innerHTML = `
                    <td style="padding-left: 20px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="./images/trang-face.png" style="width: 32px; height: 32px; border-radius: 50%; border: 1px solid #e2e8f0;">
                            <div>
                                <strong style="color:#1e293b; font-size:14px; display: block;">${pageId}</strong>
                                <span style="font-size: 11px; color: #94a3b8;">ID: ${conn.id}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="badge-status" style="background: ${isDefault ? '#f0fdf4' : '#f8fafc'}; color: ${isDefault ? '#16a34a' : '#64748b'}; border: 1px solid ${isDefault ? '#bbf7d0' : '#e2e8f0'}; padding: 4px 8px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                            ${isDefault ? 'Mặc định' : 'Liên kết'}
                        </span>
                    </td>
                    <td><span style="color:#94a3b8; font-size:13px;">${dateStr}</span></td>
                    <td>
                        <div style="display: flex; gap: 8px; justify-content: center; align-items:center;">
                            <button class="btn-use-sm" style="color: #3B82F6; background:#f0f2f5"; onclick="editConnection('${conn.id}')">Sửa</button>
                            ${!isDefault ? `<button class="btn-use-sm" style="background:#f0fdf4; color:#16a34a; border-color:#bbf7d0;" onclick="setDefaultConnection('${conn.id}')">Đặt mặc định</button>` : ''}
                            <button class="btn-use-sm"  style="color: #EF4444; background:#f0f2f5"; onclick="deleteConnection('${conn.id}')">Xóa</button>
                        </div>
                    </td>
                    
                `;

                body.appendChild(tr);
            });
        } catch (error) {
            console.error("Refresh Connections Error:", error);
            if (emptyState) emptyState.style.display = 'block';
        }
    };
    // xoá kết nối facebook
    window.deleteConnection = async (id) => {
        if (!confirm("Bạn có chắc chắn muốn xóa kết nối này không?")) return;

        try {
            const response = await apiRequest(`/facebook/connections/${id}`, {
                method: 'DELETE'
            });

            if (response && response.success) {
                alert("Đã xóa kết nối thành công!");
                await window.refreshConnectionsTable();
            } else {
                alert("Lỗi: " + (response.message || "Không thể xóa kết nối"));
            }
        } catch (error) {
            alert("Lỗi khi xóa: " + error.message);
        }
    };
    // kết nối mặc dịnh 
    window.setDefaultConnection = async (id) => {
        try {
            const conn = window.facebookConnections.find(c => c.id == id);
            if (!conn) return;

            await apiRequest(`/facebook/connections/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    page_id: conn.page_id,
                    page_access_token: conn.page_access_token || "",
                    is_default: true
                })
            });

            alert("Đã đặt kết nối mặc định thành công!");
            await window.refreshConnectionsTable();
        } catch (error) {
            alert("Lỗi khi đặt mặc định: " + error.message);
        }
    };



    window.openAddModal = function () {
        // Reset modal for new connection
        document.getElementById('connId').value = '';
        document.getElementById('modalPageId').value = '';
        document.getElementById('modalAccessToken').value = '';
        document.getElementById('modalIsDefault').checked = false;
        document.getElementById('modalTitle').textContent = 'Thêm kết nối mới';

        const saveBtn = document.getElementById('saveConn');
        if (saveBtn) saveBtn.textContent = 'Tạo kết nối';

        const modal = document.getElementById('connectionModal');
        if (modal) modal.style.display = 'flex';
    };

    window.editConnection = function (id) {
        const conn = window.facebookConnections.find(c => c.id == id);
        if (!conn) return;

        // Populate modal for editing
        document.getElementById('connId').value = id;
        document.getElementById('modalPageId').value = conn.page_id;
        document.getElementById('modalAccessToken').value = ''; // Don't show old token for security
        document.getElementById('modalIsDefault').checked = conn.is_default;
        document.getElementById('modalTitle').textContent = 'Cập nhật kết nối';

        const saveBtn = document.getElementById('saveConn');
        if (saveBtn) saveBtn.textContent = 'Lưu thay đổi';

        // Show modal
        const modal = document.getElementById('connectionModal');
        if (modal) modal.style.display = 'flex';
    };

    // --- MODAL HANDLERS ---
    const connectionModal = document.getElementById('connectionModal');
    const closeBtn = document.getElementById('closeConnModal');
    const cancelBtn = document.getElementById('cancelConn');
    const saveBtn = document.getElementById('saveConn');
    const testTokenBtn = document.getElementById('testTokenBtn');

    if (closeBtn) closeBtn.onclick = () => connectionModal.style.display = 'none';
    if (cancelBtn) cancelBtn.onclick = () => connectionModal.style.display = 'none';

    if (testTokenBtn) {
        testTokenBtn.onclick = async () => {
            const pageId = document.getElementById('modalPageId').value.trim();
            const accessToken = document.getElementById('modalAccessToken').value.trim();

            if (!pageId || !accessToken) {
                return alert("Vui lòng nhập cả Page ID và Token để kiểm tra!");
            }

            try {
                testTokenBtn.disabled = true;
                testTokenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang kiểm tra...';

                // Thử gọi trực tiếp tới Graph API của Facebook (Client-side)
                // Nếu bị CORS, lỗi này sẽ được bắt và thông báo cho người dùng
                const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}?access_token=${accessToken}&fields=name,picture`);
                const data = await response.json();

                if (data && data.name) {
                    alert(`✅ Kết nối hợp lệ!\nTrang: ${data.name}`);
                } else {
                    const errorMsg = data.error ? data.error.message : "Token không hợp lệ hoặc không có quyền truy cập trang này.";
                    alert(`❌ Lỗi: ${errorMsg}`);
                }
            } catch (error) {
                alert("⚠️ Không thể kiểm tra tự động (có thể do lỗi CORS). Bạn vẫn có thể thử lưu để hệ thống tự xác thực qua Server.");
            } finally {
                testTokenBtn.disabled = false;
                testTokenBtn.innerHTML = '<i class="fas fa-vial"></i> Kiểm tra Token';
            }
        };
    }

    if (saveBtn) {
        saveBtn.onclick = async () => {
            const id = document.getElementById('connId').value;
            const pageId = document.getElementById('modalPageId').value.trim();
            const accessToken = document.getElementById('modalAccessToken').value.trim();
            const isDefault = document.getElementById('modalIsDefault').checked;

            if (!pageId) return alert("Vui lòng nhập Facebook Page ID!");
            // Nếu thêm mới thì bắt buộc phải có token
            if (!id && !accessToken) return alert("Vui lòng nhập Page Access Token!");

            try {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

                let url = '/facebook/connections';
                let method = 'POST';

                if (id) {
                    url = `/facebook/connections/${id}`;
                    method = 'PUT';
                }

                const currentConn = id ? window.facebookConnections.find(c => c.id == id) : null;

                // Payload chuẩn cho endpoint /facebook/connections
                const payload = {
                    page_id: pageId.match(/^\d+$/) ? String(pageId) : pageId, // Luôn gửi dạng string cho ID lớn
                    page_access_token: accessToken || (currentConn ? currentConn.page_access_token : ""),
                    is_default: isDefault
                };

                const response = await apiRequest(url, {
                    method: method,
                    body: JSON.stringify(payload)
                });

                if (response && (response.success || response.id)) {
                    alert(id ? "✅ Cập nhật kết nối thành công!" : "Đã kết nối Facebook mới thành công!");
                    connectionModal.style.display = 'none';
                    await window.refreshConnectionsTable();
                } else {
                    alert("❌ Lỗi: " + (response.message || "Không thể thực hiện yêu cầu"));
                }
            } catch (error) {
                alert("❌ Lỗi kết nối: " + error.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = id ? 'Lưu thay đổi' : 'Tạo kết nối';
            }
        };
    }

    // --- CHẠY LẦN ĐẦU ---
    await window.refreshConnectionsTable();
});
