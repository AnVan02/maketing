document.addEventListener('DOMContentLoaded', async () => {

    // --- KHỞI TẠO BIẾN ---
    const tableBody = document.getElementById('postsTableBody');
    const emptyState = document.getElementById('noDataState');
    const loadingState = document.getElementById('loadingState');
    const tableContainer = document.querySelector('.table-container');

    // biến phân trang 

    let currentPage = 1;
    let totalItems = 0;
    let itemsPerPage = 10;
    let currentFilterStatus = ''; // Trạng thái lọc hiện tại

    // --- XỬ LÝ SỰ KIỆN CLICK TAB LỌC ---
    const filterTabs = document.querySelectorAll('.filter-tab[data-status]');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 1. Cập nhật UI active
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // 2. Lấy status và reload bảng
            currentFilterStatus = tab.getAttribute('data-status');
            window.refreshPostsTable(1); // Quay về trang 1
            loadStats(); // Cập nhật stats
        });
    });

    // --- HÀM LOAD THỐNG KÊ ---
    async function loadStats() {
        try {
            // Gọi API để lấy tổng số từng loại
            const [allRes, draftRes, postedRes, scheduledRes] = await Promise.all([
                apiRequest('/facebook/publish/posts/drafts'),
                apiRequest('/facebook/publish/posts/drafts?status=draft'),
                apiRequest('/facebook/publish/posts/drafts?status=posted'),
                apiRequest('/facebook/publish/posts/drafts?status=scheduled')
            ]);

            // Cập nhật UI
            const statTotal = document.getElementById('stat-total');
            const statDraft = document.getElementById('stat-draft');
            const statPosted = document.getElementById('stat-posted');
            const statScheduled = document.getElementById('stat-scheduled');

            if (statTotal) statTotal.textContent = allRes?.total || 0;
            if (statDraft) statDraft.textContent = draftRes?.total || 0;
            if (statPosted) statPosted.textContent = postedRes?.total || 0;
            if (statScheduled) statScheduled.textContent = scheduledRes?.total || 0;
        } catch (error) {
            console.error('Lỗi tải thống kê:', error);
        }
    }

    // --- HÀM LOAD BÀI VIẾT ---
    window.refreshPostsTable = async function (page = 1) {
        if (!tableBody) return;
        currentPage = page;

        // Show loading
        tableBody.innerHTML = '';
        if (loadingState) loadingState.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';

        try {
            // Gọi API lấy danh sách bài viết

            let url = '/facebook/publish/posts/drafts';

            // Thêm query parameter status nếu có filter
            if (currentFilterStatus) {
                url += `?status=${currentFilterStatus}`;
            }
            // Nếu không có filter (lấy tất cả), không cần thêm gì

            const response = await apiRequest(url);

            let posts = [];
            if (response && response.posts) posts = response.posts;
            else if (response && response.articles) posts = response.articles;
            else if (response && response.drafts) posts = response.drafts;
            else if (Array.isArray(response)) posts = response;
            else if (response.data && Array.isArray(response.data)) posts = response.data;

            // API đã lọc sẵn theo status parameter, không cần filter client-side nữa

            if (response && typeof response.total !== 'undefined') {
                totalItems = response.total;
            } else if (posts.length > 0) {
                totalItems = posts.length;
            }
            if (loadingState) loadingState.style.display = 'none';
            tableBody.style.opacity = '1'; // 

            if (!posts || posts.length === 0) {
                tableBody.innerHTML = ''; //
                if (emptyState) emptyState.style.display = 'block';
                updatePaginationControls(0);
                return;
            }

            // if (totalItems === 0 && post.length >0){
            //     // 1. Lấy tổng số từ API chính (đã tích hợp trong refreshPostsTable)
            // await fetchTotalCount(); // Removed incorrect call
            // }  


            // Sort newest first
            posts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

            // Rander dữ liệu vào bảng 
            tableBody.innerHTML = ''; //

            // Client-side pagination logic: only show itemsPerPage
            // If server returned ALL, we slice properly:
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const displayedPosts = posts.slice(startIndex, endIndex);

            displayedPosts.forEach((post, index) => {
                const tr = document.createElement('tr')

                // Calculate display index (global numbering)
                const displayIndex = startIndex + index + 1;

                // Parse Data
                const content = post.article_content || post.article_topic || post.content || post.message || '(Không có nội dung)';
                const truncatedContent = content.length > 80 ? content.substring(0, 80) + '...' : content;

                const pageName = post.page_name || post.page_id || 'Page Unknown';
                let statusText = 'Nháp';
                let isPublished = false;

                if (post.status === 'posted' || post.published) {
                    statusText = 'Đã đăng';
                    statusColor = '#16a34a'; // Xanh lá
                    statusBg = '#f0fdf4';
                    statusBorder = '#bbf7d0';
                    isPublished = true;
                } else if (post.status === 'scheduled') {
                    statusText = 'Đã lên lịch';
                    statusColor = '#3b82f6'; // Xanh dương
                    statusBg = '#eff6ff';
                    statusBorder = '#bfdbfe';
                } else {
                    statusText = 'Bài nháp';
                    statusColor = '#64748b'; // Xám
                    statusBg = '#f1f5f9';
                    statusBorder = '#e2e8f0';
                }

                const dateStr = post.created_at ? new Date(post.created_at).toLocaleString('vi-VN') : '-';

                // Facebook Link
                let fbLink = post.facebook_post_url || '#';
                let hasLink = !!post.facebook_post_url;

                if (!hasLink && post.facebook_post_id) {
                    const postIdParts = post.facebook_post_id.split('_');
                    // Nếu id dạng pageId_postId
                    if (postIdParts.length === 2) {
                        fbLink = `https://www.facebook.com/${postIdParts[0]}/posts/${postIdParts[1]}`;
                    } else {
                        fbLink = `https://www.facebook.com/${post.facebook_post_id}`;
                    }
                    hasLink = true;
                }

                tr.innerHTML = `
                    <td style="text-align: center; color: #64748b;">${displayIndex}</td>
                    <td>
                        <div style="font-weight: 500; color: #1e293b; font-size: 14px; max-width: 300px;" title="${content.replace(/"/g, '&quot;')}">
                            ${truncatedContent}
                        </div>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fab fa-facebook-square" style="color: #1877f2; font-size: 16px;"></i>
                            <span style="font-size: 13px; color: #475569;">${pageName}</span>
                        </div>
                    </td>
                    <td>
                        <span class="badge-status" style="background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusBorder}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                            ${statusText}
                        </span>
                    </td>
                    <td><span style="color:#64748b; font-size:13px;">${dateStr}</span></td>
                    <td>
                        <div style="display: flex; gap: 8px; align-items: center;">
                             ${hasLink ?
                        `<a href="${fbLink}" target="_blank" class="btn-use-sm" style="background:#eff6ff; color:#1d4ed8; text-decoration:none;">
                                    <i class="fas fa-external-link-alt"></i> Xem
                                </a>` :
                        `<span style="color:#ccc; font-size: 12px;">Chưa có link</span>`
                    }
                        </div>
                    </td>
                      <td style="text-align: center;">
                        <div style="display: flex; gap: 8px; font-family: 'Montserrat';">
                            <button class="btn-action-delete" onclick="window.deleteArticle(${post.id})">
                                <i class="fas fa-trash-alt"></i> Xoá
                            </button>
                            ${!isPublished ? `
                            <button class="btn-action-schedule" onclick="window.openScheduleModal(${post.id})" style="background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 4px;">
                                <i class="fas fa-clock"></i> Lịch
                            </button>
                            ` : ''}
                            <button class="btn-action-edit" onclick="window.editArticle(${post.id})">
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
        // if (totalPages <= 1) return;

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

    // --- CÁC HÀM HÀNH ĐỘNG ---

    let currentSchedulingId = null;
    const scheduleModal = document.getElementById('scheduleModal');
    const scheduleInput = document.getElementById('scheduleTime');

    window.openScheduleModal = function (id) {
        currentSchedulingId = id;
        if (scheduleModal) {
            scheduleModal.style.display = 'flex';
            // Set default time to 30 mins from now
            const now = new Date();
            now.setMinutes(now.getMinutes() + 30);
            const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            if (scheduleInput) scheduleInput.value = localIso;
        }
    };

    if (scheduleModal) {
        document.getElementById('cancelSchedule').onclick = () => scheduleModal.style.display = 'none';
        document.querySelector('.close-modal').onclick = () => scheduleModal.style.display = 'none';

        document.getElementById('confirmSchedule').onclick = async () => {
            const time = scheduleInput.value;
            if (!time) return alert("Vui lòng chọn thời gian!");

            try {
                const btn = document.getElementById('confirmSchedule');
                btn.disabled = true;
                btn.textContent = 'Đang xử lý...';
                // cập nhập thời gian đăng bài theo lịch trình 
                const response = await apiRequest(`/facebook/publish/posts/scheduled/${currentSchedulingId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        scheduled_publish_time: time
                    })
                });

                if (response && response.success) {
                    alert("Đã cập nhật lịch đăng bài thành công!");
                    scheduleModal.style.display = 'none';
                    window.refreshPostsTable(currentPage);
                    loadStats();
                } else {
                    alert("Lỗi: " + (response.message || "Không thể cập nhật lịch bài đăng"));
                }
            } catch (error) {
                alert("Lỗi kết nối: " + error.message);
            } finally {
                const btn = document.getElementById('confirmSchedule');
                btn.disabled = false;
                btn.textContent = 'Xác nhận';
            }
        };
    }

    window.deleteArticle = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;
        try {
            const res = await apiRequest(`/facebook/publish/posts/drafts/${id}`, { method: 'DELETE' });
            if (res && res.success) {
                alert("Đã xóa thành công!");
                window.refreshPostsTable(currentPage);
                loadStats();
            }
        } catch (error) {
            alert("Lỗi khi xóa: " + error.message);
        }
    };

    window.editArticle = (id) => {
        window.location.href = `cau-hinh-facebook.php?draft_id=${id}`;
    };

    // --- KHỞI CHẠY ---
    await loadStats(); // Load thống kê trước
    await window.refreshPostsTable(1);
});


