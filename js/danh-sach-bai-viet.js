document.addEventListener('DOMContentLoaded', async () => {

    // --- KHỞI TẠO BIẾN ---
    const tableBody = document.getElementById('postsTableBody');
    const emptyState = document.getElementById('noDataState');
    const loadingState = document.getElementById('loadingState');

    // --- HÀM LOAD BÀI VIẾT ---
    window.refreshPostsTable = async function () {
        if (!tableBody) return;

        // Show loading
        tableBody.innerHTML = '';
        if (loadingState) loadingState.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';

        try {
            // Gọi API lấy danh sách bài viết
            // Endpoint lấy danh sách bài viết SEO
            console.log("Fetching posts from /seo/articles...");
            const response = await apiRequest('/seo/articles');
            console.log("API Response:", response);

            let posts = [];
            if (response && response.articles) posts = response.articles;
            else if (response && response.posts) posts = response.posts;
            else if (Array.isArray(response)) posts = response;
            else if (response.data && Array.isArray(response.data)) posts = response.data;

            if (loadingState) loadingState.style.display = 'none';

            if (!posts || posts.length === 0) {
                if (emptyState) emptyState.style.display = 'block';
                return;
            }

            // Sort newest first
            posts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

            posts.forEach((post, index) => {
                const tr = document.createElement('tr');

                // Parse Data
                const content = post.content || post.message || '(Không có nội dung)';
                const truncatedContent = content.length > 80 ? content.substring(0, 80) + '...' : content;

                const pageName = post.page_name || post.page_id || 'Page Unknown';
                const status = post.published ? 'Đã đăng' : 'Nháp';
                const statusColor = post.published ? 'success' : 'warning'; // green / yellow
                const statusText = post.published ? 'Đã đăng' : 'Đang xử lý';
                const dateStr = post.created_at ? new Date(post.created_at).toLocaleString('vi-VN') : '-';

                // Facebook Link
                let fbLink = '#';
                if (post.facebook_post_id) {
                    // Cấu trúc link thường là: https://facebook.com/{page_id}/posts/{post_id}
                    // Hoặc https://facebook.com/{post_id}
                    const postIdParts = post.facebook_post_id.split('_');
                    // Nếu id dạng pageId_postId
                    if (postIdParts.length === 2) {
                        fbLink = `https://www.facebook.com/${postIdParts[0]}/posts/${postIdParts[1]}`;
                    } else {
                        fbLink = `https://www.facebook.com/${post.facebook_post_id}`;
                    }
                }

                tr.innerHTML = `
                    <td style="text-align: center; color: #64748b;">${index + 1}</td>
                    <td>
                        <div style="font-weight: 500; color: #1e293b; font-size: 14px; max-width: 300px;" title="${content.replace(/"/g, '&quot;')}">
                            ${truncatedContent}
                        </div>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-globe" style="color: #3b82f6; font-size: 16px;"></i>
                            <span style="font-size: 13px; color: #475569;">${post.domain || 'Lưu cục bộ'}</span>
                        </div>
                    </td>
                    <td>
                        <span class="badge-status" style="background: ${post.published ? '#f0fdf4' : '#fefce8'}; color: ${post.published ? '#16a34a' : '#ca8a04'}; border: 1px solid ${post.published ? '#bbf7d0' : '#fef08a'}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                            ${statusText}
                        </span>
                    </td>
                    <td><span style="color:#64748b; font-size:13px;">${dateStr}</span></td>
                    <td>
                        <div style="display: flex; gap: 8px; align-items: center;">
                             ${post.facebook_post_id ?
                        `<a href="${fbLink}" target="_blank" class="btn-use-sm" style="background:#eff6ff; color:#1d4ed8; text-decoration:none;">
                                    <i class="fas fa-external-link-alt"></i> Xem
                                </a>` :
                        `<span style="color:#ccc; font-size: 12px;">Chưa có link</span>`
                    }
                        </div>
                    </td>
                `;
                tableBody.appendChild(tr);

            });

        } catch (error) {
            console.error("Load Posts Error:", error);
            if (loadingState) loadingState.style.display = 'none';
            if (emptyState) {
                emptyState.style.display = 'block';
                emptyState.querySelector('p').textContent = `Lỗi chưa kêt nối dữ liệu: ${error.message}`;
            }
        }
    };

    // hiển thị id facebook 
    async function loadDefaultConnection () {
        try {
            const data = await apiRequest ('/facebook/connections/default');
            if (data && data.page_id) {
                currentDefaultConnection = data;
                if(connectedPage) {
                    connectedPageName.textContent = `sẵn sàng: ${data.page_id}`;
                    connectedPageName.style.color = '#16a34a';

                }
           } else {
                if (connectedPageName) {
                    connectedPageName.textContent = 'Chưa kết nối Facebook';
                    connectedPageName.style.color = '#ef4444';
                }
            }
        } catch (e) {
            console.error("Lỗi loadDefaultConnection:", e);
            if (connectedPageName) connectedPageName.textContent = 'Lỗi kết nối';
        }
    }


    // --- CHẠY LẦN ĐẦU ---
    await window.refreshPostsTable();

});
