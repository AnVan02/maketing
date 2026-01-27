document.addEventListener('DOMContentLoaded', async () => {

    // --- KHỞI TẠO BIẾN ---
    const tableBody = document.getElementById('postsTableBody');
    const emptyState = document.getElementById('noDataState');
    const loadingState = document.getElementById('loadingState');
    const tableContainer = document.querySelector('.table-container');

    // Biến phân trang
    let currentPage = 1;
    let totalItems = 0;
    const itemsPerPage = 10;

    /**
     * HÀM TẢI DỮ LIỆU
     */
    window.refreshPostsTable = async function (page = 1) {
        if (!tableBody) return;

        currentPage = page;
        const offset = (currentPage - 1) * itemsPerPage;

        // Hiển thị trạng thái đang tải
        tableBody.style.opacity = '0.3'; // Làm mờ bảng khi đang tải
        if (loadingState) loadingState.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';

        try {
            // Gọi API lấy danh sách bài viết
            const response = await apiRequest(`/seo/articles?limit=${itemsPerPage}&offset=${offset}`);

            let posts = [];
            if (response && response.articles) {
                posts = response.articles;
                // Cập nhật tổng số bài nếu server trả về, nếu không thì tạm lấy số lượng hiện có
                if (response.total) totalItems = response.total;
            } else if (Array.isArray(response)) {
                posts = response;
            }

            if (loadingState) loadingState.style.display = 'none';
            tableBody.style.opacity = '1';

            if (!posts || posts.length === 0) {
                tableBody.innerHTML = '';
                if (emptyState) emptyState.style.display = 'block';
                updatePaginationControls(0);
                return;
            }

            // Nếu không có total từ server, và đây là trang 1, ta tạm tính total dựa trên độ dài
            if (totalItems === 0 && posts.length > 0) {
                // Nếu trang 1 trả về đủ itemsPerPage, có khả năng còn trang sau
                // Chúng ta sẽ cần một bộ đếm total thực tế hơn
                await fetchTotalCount();
            }

            // Render dữ liệu vào bảng
            tableBody.innerHTML = '';
            posts.forEach((post, index) => {
                const tr = document.createElement('tr');

                // Dữ liệu từ API SEO articles
                const title = post.title || '(Không có tiêu đề)';
                const truncatedTitle = title.length > 60 ? title.substring(0, 60) + '...' : title;
                const primaryKeyword = post.primary_keyword || '-';
                const secondaryKeywords = post.secondary_keyword || '-';
                const truncatedSecondary = secondaryKeywords.length > 40 ? secondaryKeywords.substring(0, 40) + '...' : secondaryKeywords;
                const wordCount = post.word_count || 0;
                const metaDesc = post.meta_description || '';
                const truncatedMeta = metaDesc.length > 80 ? metaDesc.substring(0, 80) + '...' : metaDesc;
                const publishedDate = post.published_at ? new Date(post.published_at).toLocaleString('vi-VN') : '-';
                const slug = post.slug || '';

                // STT theo trang
                const stt = (currentPage - 1) * itemsPerPage + index + 1;

                // URL bài viết (nếu có)
                const articleUrl = post.url || '#';
                const hasUrl = post.url && post.url.trim() !== '';

                tr.innerHTML = `
                    <td style="text-align: center; color: #1e293b; font-weight: 500;">${stt}</td>
                    <td>
                        <div style="font-weight: 600; color: #161616; font-size: 15px; max-width: 350px; line-height: 1.4;" title="${title.replace(/"/g, '&quot;')}">
                            ${truncatedTitle}
                        </div>
                        <!--${slug ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">/${slug}</div>` : ''}-->
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 14px; color: #1e293b; font-weight: 500;">${primaryKeyword}</span>
                        </div>
                    </td>
                    <td>
                        <div style="font-size: 14px; color: #1e293b; font-weight: 500;" title="${secondaryKeywords.replace(/"/g, '&quot;')}">
                            ${truncatedSecondary}
                        </div>
                    </td>
                    <td style="text-align: center;">
                        <span style="color: #1e293b; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 500;">
                            ${wordCount.toLocaleString('vi-VN')} từ
                        </span>
                    </td>
                    <td>
                        <div style="font-size: 14px; color: #1e293b; font-weight: 500;"  title="${metaDesc.replace(/"/g, '&quot;')}">
                            ${truncatedMeta || '<span style="color: #cbd5e1;">Chưa có mô tả</span>'}
                        </div>
                    </td>
                    <td><span style="font-size: 14px; color: #1e293b; font-weight: 500;">${publishedDate}</span></td>
                    <td style="text-align: center;">
                        <div style="font-size: 14px; color: #1e293b; font-weight: 500;"">
                            ${hasUrl ?
                        `<a href="${articleUrl}" target="_blank" class="btn-use-sm" style="text-decoration:none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none;">
                                        <i class="fas fa-external-link-alt"></i> Xem
                                    </a>` :
                        `<span style="font-size: 13px; color: #1e293b; font-weight: 500;">Chưa xuất bản</span>`}
                        </div>
                    </td>
                    <td style="text-align: center;">
                        <div style="display: flex; gap: 8px; justify-content: center; font-family: 'Montserrat';">
                            <button class="btn-action-delete" onclick="deleteArticle(${post.id})">
                                <i class="fas fa-trash-alt"></i> Xoá
                            </button>
                            <button class="btn-action-edit" onclick="editArticle(${post.id})">
                                    <i class="fas fa-edit"></i> Sửa
                            </button>
                        </div>
                  </td>
                `;
                
                tableBody.appendChild(tr);
            });

            // Cập nhật bộ điều khiển phân trang
            updatePaginationControls(totalItems);

            // Tự động cuộn lên đầu bảng
            if (tableContainer) {
                tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

        } catch (error) {
            console.error("Lỗi tải bài viết:", error);
            if (loadingState) loadingState.style.display = 'none';
            tableBody.style.opacity = '1';
        }
    };


    /**
     * HÀM ĐẾM TỔNG SỐ BÀI VIẾT (Rất quan trọng để hiện các nút trang)
     */
    async function fetchTotalCount() {
        try {
            // Lấy một danh sách lớn để đếm tổng số bài nếu API không có field total riêng
            const res = await apiRequest('/seo/articles?limit=1000&offset=0');
            if (res && res.articles) {
                totalItems = res.total || res.articles.length;
            } else if (Array.isArray(res)) {
                totalItems = res.length;
            }
        } catch (e) {
            console.warn("Lỗi đếm tổng bài:", e);
        }
    }

    /**
     * CẬP NHẬT GIAO DIỆN PHÂN TRANG
     */
    function updatePaginationControls(total) {
        const fromEl = document.getElementById('showingFrom');
        const toEl = document.getElementById('showingTo');
        const totalEl = document.getElementById('totalArticles');

        if (fromEl && toEl && totalEl) {
            if (total === 0) {
                fromEl.textContent = '0'; toEl.textContent = '0'; totalEl.textContent = '0';
            } else {
                const from = (currentPage - 1) * itemsPerPage + 1;
                const to = Math.min(currentPage * itemsPerPage, total);
                fromEl.textContent = from;
                toEl.textContent = to;
                totalEl.textContent = total;
            }
        }

        const controls = document.getElementById('paginationControls');
        if (!controls) return;
        controls.innerHTML = '';

        const totalPages = Math.ceil(total / itemsPerPage);

        // Nếu chỉ có 1 trang và không có dữ liệu mới thì không hiện nút
        if (totalPages <= 1) return;

        // Nút Trước
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.textContent = 'Trước';
        prevBtn.disabled = (currentPage === 1);
        prevBtn.onclick = () => window.refreshPostsTable(currentPage - 1);
        controls.appendChild(prevBtn);

        // Các nút số trang
        const addPageBtn = (i) => {
            const btn = document.createElement('button');
            btn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.onclick = () => window.refreshPostsTable(i);
            controls.appendChild(btn);
        };

        // Hiển thị tối đa 5 nút số trang xung quanh trang hiện tại
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

        for (let i = startPage; i <= endPage; i++) {
            addPageBtn(i);
        }

        // Nút Sau
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.textContent = 'Sau';
        nextBtn.disabled = (currentPage === totalPages);
        nextBtn.onclick = () => window.refreshPostsTable(currentPage + 1);
        controls.appendChild(nextBtn);
    }

    // --- KHỞI CHẠY ---
    // 1. Lấy tổng số trước để biết có bao nhiêu trang
    await fetchTotalCount();
    // 2. Tải dữ liệu trang đầu tiên
    await window.refreshPostsTable(1);

});

/**
 * HÀM XÓA BÀI VIẾT
 */
window.deleteArticle = async function (articleId) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
        return;
    }

    try {
        const response = await apiRequest(`/seo/articles/${articleId}`, {
            method: 'DELETE'
        });

        if (response && response.success) {
            alert('Xóa bài viết thành công!');
            // Tải lại trang hiện tại
            window.refreshPostsTable(window.currentPage || 1);
        } else {
            alert('Lỗi khi xóa bài viết: ' + (response.message || 'Không xác định'));
        }
    } catch (error) {
        console.error('Lỗi xóa bài viết:', error);
        alert('Có lỗi xảy ra khi xóa bài viết!');
    }
};

/**
 * HÀM SỬA BÀI VIẾT
 */
window.editArticle = function (articleId) {
    // Chuyển hướng đến trang chỉnh sửa (cần tạo trang này)
    window.location.href = `viet-bai-seo.php?id=${articleId}`;
};
