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
                            <button class="btn-use-sm" style="background:#f1f5f9; color:#475569;" onclick="editConnection('${conn.id}')">Sửa</button>
                            ${!isDefault ? `<button class="btn-use-sm" style="background:#f0fdf4; color:#16a34a; border-color:#bbf7d0;" onclick="setDefaultConnection('${conn.id}')">Đặt mặc định</button>` : ''}
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

    window.editConnection = async (id) => {
        const conn = window.facebookConnections.find(c => c.id == id);
        if (!conn) return;

        const pageId = prompt("Nhập Page ID mới:", conn.page_id);
        if (pageId === null) return;

        const accessToken = prompt("Nhập Page Access Token mới (để trống nếu không đổi):");
        if (accessToken === null) return;

        try {
            await apiRequest(`/facebook/connections/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    page_id: pageId,
                    page_access_token: accessToken || conn.page_access_token || "",
                    is_default: conn.is_default
                })
            });
            alert("Đã cập nhật kết nối thành công!");
            await window.refreshConnectionsTable();
        } catch (error) {
            alert("Lỗi khi cập nhật: " + error.message);
        }
    };

    // --- CHẠY LẦN ĐẦU ---
    await window.refreshConnectionsTable();
});
