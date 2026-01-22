/**
 * PHẦN 1: KIỂM TRA QUYỀN TRUY CẬP (AUTH CHECK)
 */
function checkAuth() {
    const userInfo = localStorage.getItem('user_info');
    if (!userInfo) {
        console.warn('⚠️ Hệ thống: Không tìm thấy thông tin đăng nhập. Đang chuyển hướng...');
        window.location.href = 'dang-nhap.php';
        return false;
    }
    return true;
}

/**
 * TIỆN ÍCH: Định dạng thời gian
 */
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * PHẦN 2: QUẢN LÝ DỮ LIỆU VÀ PHÂN TRANG (STATE MANAGEMENT)
 */
let currentPage = 1;
let totalArticles = 0; // Luôn giữ tổng số bài để phân trang chính xác
const itemsPerPage = 10;
let currentTab = 'seo';

/**
 * PHẦN 3: CÁC HÀM TƯƠNG TÁC API
 */

async function fetchArticles(limit = 10, offset = 0) {
    try {
        const response = await apiRequest(`/seo/articles?limit=${limit}&offset=${offset}`, { method: 'GET' });
        if (response.success && response.articles) {
            return {
                articles: response.articles,
                total: response.total // Ưu tiên dùng trường total từ Server nếu có
            };
        }
        return { articles: [], total: 0 };
    } catch (error) {
        console.error('❌ Lỗi lấy danh sách bài SEO:', error);
        return { articles: [], total: 0 };
    }
}

let currentFbStatus = ''; // Biến lưu trạng thái lọc Facebook hiện tại

async function fetchFacebookPosts(limit = 10, offset = 0) {
    try {
        let url = '/facebook/publish/posts/drafts';
        if (currentFbStatus) {
            url += `?status=${currentFbStatus}`;
        }

        const response = await apiRequest(url);
        let posts = [];
        if (response && response.posts) posts = response.posts;
        else if (response && response.articles) posts = response.articles;
        else if (response && response.drafts) posts = response.drafts;
        else if (response && response.data) posts = response.data;
        else if (Array.isArray(response)) posts = response;

        // Sort by created_at desc
        posts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

        // Client-side pagination
        const pagedPosts = posts.slice(offset, offset + limit);

        return {
            articles: pagedPosts,
            total: posts.length
        };
    } catch (error) {
        console.error('❌ Lỗi lấy danh sách bài Facebook:', error);
        return { articles: [], total: 0 };
    }
}

/**
 * PHẦN ENGAGEMENT & METRICS (FACEBOOK)
 */

// Thu thập chỉ số cho một bài viết cụ thể
async function collectPostMetrics(draftPostId) {
    try {
        const response = await apiRequest(`/facebook/engagement/posts/${draftPostId}/metrics/collect`, { method: 'POST' });
        return response;
    } catch (error) {
        console.error(`❌ Lỗi thu thập chỉ số cho bài ${draftPostId}:`, error);
        return { success: false, message: error.message };
    }
}

// Thu thập chỉ số cho tất cả bài viết
async function collectAllPostsMetrics() {
    try {
        const response = await apiRequest('/facebook/engagement/posts/metrics/collect-all', { method: 'POST' });
        return response;
    } catch (error) {
        console.error('❌ Lỗi thu thập chỉ số tất cả bài viết:', error);
        return { success: false, message: error.message };
    }
}

// Lấy chỉ số hiện tại của một bài viết
async function getPostMetrics(draftPostId) {
    try {
        const response = await apiRequest(`/facebook/engagement/posts/${draftPostId}/metrics`, { method: 'GET' });
        return response;
    } catch (error) {
        console.error(`❌ Lỗi lấy chỉ số bài ${draftPostId}:`, error);
        return null;
    }
}

// Lấy lịch sử chỉ số của một bài viết
async function getPostMetricsHistory(draftPostId) {
    try {
        const response = await apiRequest(`/facebook/engagement/posts/${draftPostId}/metrics/history`, { method: 'GET' });
        return response;
    } catch (error) {
        console.error(`❌ Lỗi lấy lịch sử chỉ số bài ${draftPostId}:`, error);
        return [];
    }
}

// Lấy danh sách các bài viết hiệu quả nhất
async function getTopPerformingPosts(limit = 5) {
    try {
        const response = await apiRequest(`/facebook/engagement/analytics/top-posts?limit=${limit}`, { method: 'GET' });
        return response;
    } catch (error) {
        console.error('❌ Lỗi lấy danh sách bài viết hiệu quả:', error);
        return [];
    }
}

// Lấy tóm tắt chỉ số tương tác tổng quan
async function getEngagementSummary(period = '7days') {
    try {
        const response = await apiRequest(`/facebook/engagement/analytics/summary?period=${period}`, { method: 'GET' });
        return response;
    } catch (error) {
        console.error('❌ Lỗi lấy tóm tắt tương tác:', error);
        return null;
    }
}

/**
 * PHẦN 4: ĐIỀU KHIỂN GIAO DIỆN BẢNG DỮ LIỆU (UI RENDERING)
 */
function renderArticles(articles, isLoading = false) {
    const tableBody = document.getElementById('configTableBody');
    const tableHeader = document.getElementById('tableHeaderRow');
    if (!tableBody || !tableHeader) return;

    if (currentTab === 'seo') {
        tableHeader.innerHTML = `
            <th>Tiêu đề bài viết</th>
            <th>Khoá chính</th>
            <th>Meta-description</th>
            <th style="text-align: center;">Số lượng từ</th>
            <th style="text-align: center;">SEO Score</th>
            <th style="text-align: center;">Ngày đăng</th>
            <th style="text-align: center;">Hành động</th>
        `;
    } else {
        tableHeader.innerHTML = `
            <th>Nội dung bài viết</th>
            <th>Trang Fanpage</th>
            <th>Trạng thái</th>
            <th style="text-align: center;">Tương tác</th>
            <th style="text-align: center;">Thời gian</th>
            <th style="text-align: center;">Hành động</th>
        `;
    }

    if (isLoading) {
        const colSpan = currentTab === 'seo' ? 7 : 5;
        tableBody.innerHTML = `
            <tr>
                <td colspan="${colSpan}" style="text-align: center; padding: 40px; color: #999;">
                    <div class="loader-container"><i class="fas fa-spinner fa-spin"></i> <span>Đang tải dữ liệu, vui lòng đợi...</span></div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = '';

    if (!articles || articles.length === 0) {
        const colSpan = currentTab === 'seo' ? 7 : 5;
        tableBody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center; padding:20px;">Dữ liệu ở trang này trống hoặc chưa được bài viết nào.</td></tr>`;
        return;
    }

    articles.forEach(item => {
        const row = document.createElement('tr');
        if (currentTab === 'seo') {
            const seoScore = Math.floor(Math.random() * 30) + 70;
            const scoreClass = seoScore >= 80 ? 'score-good' : 'score-medium';
            row.innerHTML = `
                <td><strong>${item.title || 'Bài viết chưa đặt tên'}</strong></td>
                <td>${item.primary_keyword || '---'}</td>
                <td>
                    <div class="meta-description" title="${item.meta_description || ''}">
                        ${item.meta_description ? (item.meta_description.substring(0, 60) + '...') : 'Không có mô tả.'}
                    </div>
                </td>
                <td style="text-align: center;">${item.word_count ? item.word_count.toLocaleString() : 0} từ</td>
                <td style="text-align: center;"><span class="seo-score ${scoreClass}">${seoScore}/100</span></td>
                <td style="text-align: center;">${formatDateTime(item.created_at).split(' ')[0]}</td>
                <td style="text-align: center;">
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button class="action-btn-mini" style="color: #EF4444;" onclick="window.deleteArticle('${item.id}')" title="Xoá bài viết">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        <button class="action-btn-mini" style="color: #3B82F6;" onclick="window.editArticle('${item.id}')" title="Sửa bài viết">
                            <i class="fas fa-edit"></i>
                        </button>
                       
                    </div>
                </td>
            `;
        } else {
            const content = item.article_content || item.article_topic || item.content || item.message || '(Không có nội dung)';
            const truncatedContent = content.length > 60 ? content.substring(0, 60) + '...' : content;

            // Xử lý hiển thị trạng thái chi tiết hơn
            let statusText = 'Đang xử lý';
            let statusColor = '#ca8a04'; // Mặc định: Vàng
            let statusBg = '#fefce8';

            if (item.status === 'posted' || item.published === true || item.published === 1 || item.published === '1') {
                statusText = 'Đã đăng';
                statusColor = '#16a34a'; // Xanh lá
                statusBg = '#f0fdf4';
            } else if (item.status === 'scheduled') {
                statusText = 'Đã lên lịch';
                statusColor = '#3b82f6'; // Xanh dương
                statusBg = '#eff6ff';
            } else if (item.status === 'draft' || !item.published) {
                statusText = 'Bài nháp';
                statusColor = '#6b7280'; // Xám
                statusBg = '#f3f4f6';
            }

            // Xử lý tên Fanpage
            const pageName = item.page_name || item.page_id || '---';

            // Link xem bài viết trên Facebook
            let viewLink = '';
            let fbLink = item.facebook_post_url || '';

            if (!fbLink && item.facebook_post_id) {
                const parts = item.facebook_post_id.split('_');
                if (parts.length === 2) {
                    fbLink = `https://www.facebook.com/${parts[0]}/posts/${parts[1]}`;
                } else {
                    fbLink = `https://www.facebook.com/${item.facebook_post_id}`;
                }
            }

            if (fbLink) {
                viewLink = `<a href="${fbLink}" target="_blank" class="action-btn-mini" style="color: #3B82F6;" title="Xem trên Facebook"><i class="fas fa-external-link-alt"></i></a>`;
            }

            // Tổng chỉ số tương tác (nếu có)
            const likes = item.likes || 0;
            const comments = item.comments || 0;
            const shares = item.shares || 0;
            const totalEngage = likes + comments + shares;

            row.innerHTML = `
                <td><div style="font-weight: 500; color: #1e293b; font-size: 14px;">${truncatedContent}</div></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fab fa-facebook-square" style="color: #1877f2; font-size: 16px;"></i>
                        <span style="font-size: 14px; color: #475569;">${pageName}</span>
                    </div>
                </td>
                <td>
                    <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                        ${statusText}
                    </span>
                </td>
                <td style="text-align: center;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                        <span style="font-weight: 600; color: #1e293b;">${totalEngage.toLocaleString()}</span>
                        <div style="display: flex; gap: 6px; font-size: 10px; color: #64748b;">
                            <span title="Lượt thích"><i class="far fa-thumbs-up"></i> ${likes}</span>
                            <span title="Bình luận"><i class="far fa-comment"></i> ${comments}</span>
                        </div>
                    </div>
                </td>
                <td style="text-align: center; font-size: 14px; color: #475569;">${formatDateTime(item.created_at)}</td>

                <td style="text-align: center;">
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        ${viewLink}
                        <button class="action-btn-mini" style="color: #10b981;" onclick="window.viewMetrics('${item.id}')" title="Xem chỉ số chi tiết">
                            <i class="fas fa-chart-line"></i>
                        </button>
                        <button class="action-btn-mini" style="color: #ef4444;" onclick="window.deleteArticle('${item.id}')" title="Xoá bài viết">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        <button class="action-btn-mini" style="color: #3b82f6;" onclick="window.editArticle('${item.id}')" title="Sửa bài viết">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
        }
        tableBody.appendChild(row);
    });
}

/**
 * HÀNH ĐỘNG
 */
window.editArticle = (id) => {
    if (currentTab === 'seo') {
        window.location.href = `viet - bai - seo.php ? id = ${id} `;
    } else {
        // Chuyển hướng sang trang cấu hình facebook với id bài viết nháp
        window.location.href = `cau - hinh - facebook.php ? draft_id = ${id} `;
    }
};

window.deleteArticle = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xoá bài viết này không?')) return;

    try {
        let url = '';
        if (currentTab === 'seo') {
            url = `/ seo / articles / ${id} `;
        } else {
            // API xoá bài nháp facebook
            url = `/ facebook / publish / posts / drafts / ${id} `;
        }

        const res = await apiRequest(url, { method: 'DELETE' });

        if (res && res.success) {
            alert('Đã xoá thành công!');
            // Refresh lại bảng hiện tại
            const offset = (currentPage - 1) * itemsPerPage;
            let result;
            if (currentTab === 'seo') {
                result = await fetchArticles(itemsPerPage, offset);
            } else {
                result = await fetchFacebookPosts(itemsPerPage, offset);
            }
            // Cập nhật lại số liệu thống kê
            if (result.total) totalArticles = result.total;
            renderArticles(result.articles);
            updateStats();
        } else {
            alert('Xoá thất bại: ' + (res.message || 'Lỗi không xác định'));
        }
    } catch (e) {
        console.error('Lỗi khi xoá:', e);
        alert('Có lỗi xảy ra khi xoá bài viết.');
    }
};

/**
 * PHẦN 5: CẬP NHẬT THỐNG KÊ (Stats Cards)
 */
async function updateStats() {
    try {
        // 1. Tính tổng SEO
        const seoRes = await apiRequest(`/seo/articles?limit=1000&offset=0`, { method: 'GET' });
        if (seoRes.success && seoRes.articles) {
            const articles = seoRes.articles;
            const draftCount = articles.filter(a => !a.published_at).length;
            const publishedCount = articles.filter(a => a.published_at).length;

            const seoCardNum = document.querySelector('#card-seo .stat-number');
            const seoCardSub = document.querySelector('#card-seo .sub-stat');

            if (seoCardNum) seoCardNum.textContent = `${articles.length} bài`;
            if (seoCardSub) seoCardSub.textContent = `${draftCount} nháp · ${publishedCount} xuất bản`;

            if (currentTab === 'seo') totalArticles = seoRes.total || articles.length;
        }

        // 2. Tính tổng Facebook
        const fbRes = await apiRequest(`/facebook/publish/posts/drafts?limit=1000&offset=0`, { method: 'GET' });
        if (fbRes) {
            let posts = [];
            if (fbRes.posts) posts = fbRes.posts;
            else if (fbRes.articles) posts = fbRes.articles;
            else if (fbRes.drafts) posts = fbRes.drafts;
            else if (fbRes.data) posts = fbRes.data;
            else if (Array.isArray(fbRes)) posts = fbRes;

            const fbCardNum = document.querySelector('#card-facebook .stat-number');
            const fbCardSub = document.querySelector('#card-facebook .sub-stat');

            const publishedCount = posts.filter(p => p.status === 'posted' || p.published === true || p.published === 1 || p.published === '1').length;
            const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
            const draftCount = posts.length - publishedCount - scheduledCount;

            if (fbCardNum) fbCardNum.textContent = `${posts.length} bài`;
            if (fbCardSub) {
                let subText = `${draftCount} nháp · ${publishedCount} đã đăng`;
                if (scheduledCount > 0) subText += ` · ${scheduledCount} chờ đăng`;
                fbCardSub.textContent = subText;
            }

            if (currentTab === 'facebook') totalArticles = fbRes.total || posts.length;
        }

        // 3. Cập nhật Analytics Facebook nếu đang ở tab Facebook
        if (currentTab === 'facebook') {
            updateFacebookAnalytics();
        }

        updatePaginationInfo();
        renderPagination();
    } catch (error) {
        console.error('❌ Lỗi thống kê:', error);
    }
}

async function updateFacebookAnalytics() {
    try {
        const summary = await getEngagementSummary();
        const topPosts = await getTopPerformingPosts(1);

        if (summary) {
            const totalEngagementEl = document.querySelector('#analytics-facebook .footer-item:nth-child(1) .footer-value');
            const ctrEl = document.querySelector('#analytics-facebook .footer-item:nth-child(3) .footer-value');

            if (totalEngagementEl) {
                const total = (summary.total_likes || 0) + (summary.total_comments || 0) + (summary.total_shares || 0);
                totalEngagementEl.textContent = total.toLocaleString();
            }
            if (ctrEl && summary.avg_ctr) {
                ctrEl.textContent = `${summary.avg_ctr}% `;
            }
        }

        if (topPosts && topPosts.length > 0) {
            const bestPostEl = document.querySelector('#analytics-facebook .footer-item:nth-child(2) .footer-value');
            if (bestPostEl) {
                const bestPost = topPosts[0];
                const bestEngagement = (bestPost.likes || 0) + (bestPost.comments || 0) + (bestPost.shares || 0);
                bestPostEl.textContent = bestEngagement.toLocaleString();
            }
        }
    } catch (error) {
        console.warn('⚠️ Không thể cập nhật dữ liệu phân tích Facebook:', error);
    }
}

/**
 * PHẦN 6: PHÂN TRANG (PAGINATION)
 */
function updatePaginationInfo() {
    const fromEl = document.getElementById('showingFrom');
    const toEl = document.getElementById('showingTo');
    const totalEl = document.getElementById('totalArticles');
    if (!fromEl || !toEl || !totalEl) return;

    if (totalArticles === 0) {
        fromEl.textContent = '0'; toEl.textContent = '0'; totalEl.textContent = '0';
        return;
    }
    const from = (currentPage - 1) * itemsPerPage + 1;
    const to = Math.min(currentPage * itemsPerPage, totalArticles);
    fromEl.textContent = from; toEl.textContent = to; totalEl.textContent = totalArticles;
}
// phần vùng từng trang

function renderPagination() {
    const controls = document.getElementById('paginationControls');
    if (!controls) return;
    controls.innerHTML = '';
    const totalPages = Math.ceil(totalArticles / itemsPerPage);
    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn'; prevBtn.textContent = 'Trước';
    prevBtn.disabled = (currentPage === 1);
    prevBtn.onclick = () => goToPage(currentPage - 1);
    controls.appendChild(prevBtn);

    const addPageBtn = (i) => {
        const btn = document.createElement('button');
        btn.className = `pagination - btn ${i === currentPage ? 'active' : ''} `;
        btn.textContent = i;
        btn.onclick = () => goToPage(i);
        controls.appendChild(btn);
    };

    const addEllipsis = () => {
        const span = document.createElement('span');
        span.className = 'pagination-ellipsis';
        span.textContent = '...';
        controls.appendChild(span);
    };

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) addPageBtn(i);
    } else {
        addPageBtn(1);
        if (currentPage > 3) addEllipsis();
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) addPageBtn(i);
        if (currentPage < totalPages - 2) addEllipsis();
        addPageBtn(totalPages);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn'; nextBtn.textContent = 'Sau';
    nextBtn.disabled = (currentPage === totalPages);
    nextBtn.onclick = () => goToPage(currentPage + 1);
    controls.appendChild(nextBtn);
}

async function goToPage(page) {
    if (page < 1) return;
    currentPage = page;
    renderArticles([], true);

    const offset = (currentPage - 1) * itemsPerPage;
    const result = (currentTab === 'seo')
        ? await fetchArticles(itemsPerPage, offset)
        : await fetchFacebookPosts(itemsPerPage, offset);

    // Nếu API có trả về total mới nhất, cập nhật. Nếu không, giữ nguyên total đã đếm từ updateStats.
    if (result.total) totalArticles = result.total;

    renderArticles(result.articles);
    updatePaginationInfo();
    renderPagination();

    const tableHeader = document.querySelector('.activity-header');
    if (tableHeader) tableHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * CHARTS - GIỮ NGUYÊN
 */
function initCharts() {
    const seoCtx = document.getElementById('seoChart')?.getContext('2d');
    if (seoCtx) {
        new Chart(seoCtx, {
            type: 'bar',
            data: {
                labels: ['T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                datasets: [{
                    label: 'Lượt truy cập',
                    data: [5231, 2241, 8921, 12213, 10145, 8597, 12847],
                    backgroundColor: '#3B82F6', borderRadius: 4, barThickness: 20
                }]
            },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, border: { display: false } },
                    y: { grid: { display: false }, border: { display: false } }
                }
            }
        });
    }

    const fbCtx = document.getElementById('facebookChart')?.getContext('2d');
    if (fbCtx) {
        const hours = Array.from({ length: 24 }, (_, i) => i.toString());
        const genData = (base) => hours.map(h => {
            const hr = parseInt(h);
            let val = base + Math.random() * 20;
            if (hr >= 10 && hr <= 15) val *= 3;
            else if (hr >= 16 && hr <= 20) val *= 2;
            else if (hr >= 6 && hr <= 9) val *= 1.5;
            else val *= 0.5;
            return Math.floor(val);
        });

        new Chart(fbCtx, {
            type: 'bar',
            data: {
                labels: hours,
                datasets: [
                    { label: 'Thứ Hai', data: genData(30), backgroundColor: '#60A5FA' },
                    { label: 'Thứ Ba', data: genData(25), backgroundColor: '#D97706' },
                    { label: 'Thứ Tư', data: genData(35), backgroundColor: '#22D3EE' },
                    { label: 'Thứ Năm', data: genData(20), backgroundColor: '#FBBF24' },
                    { label: 'Thứ Sáu', data: genData(40), backgroundColor: '#3B82F6' },
                    { label: 'Thứ Bảy', data: genData(45), backgroundColor: '#34D399' },
                    { label: 'Chủ Nhật', data: genData(50), backgroundColor: '#1D4ED8' }
                ]
            },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20, font: { size: 11 } } } },
                scales: {
                    x: { stacked: true, grid: { color: '#f1f5f9' }, border: { display: false }, max: 600 },
                    y: { stacked: true, grid: { display: false }, border: { display: false } }
                }
            }
        });
    }
}

function setupInteractions() {
    const cardSeo = document.getElementById('card-seo');
    const cardFacebook = document.getElementById('card-facebook');
    const analyticsSeo = document.getElementById('analytics-seo');
    const analyticsFacebook = document.getElementById('analytics-facebook');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const filterSection = document.getElementById('filter-section');
    const filterBtns = document.querySelectorAll('.status-btn');

    if (!cardSeo || !cardFacebook) return;

    // Xử lý chuyển tab
    const switchTab = async (tab) => {
        if (currentTab === tab) return;
        currentTab = tab;
        currentPage = 1; // Reset về trang 1 khi đổi tab

        tabBtns.forEach(btn => {
            const isTarget = (tab === 'seo' && btn.textContent.includes('SEO')) || (tab === 'facebook' && btn.textContent.includes('Facebook'));
            btn.classList.toggle('active', isTarget);
        });

        if (tab === 'seo') {
            analyticsSeo.style.display = 'block';
            analyticsFacebook.style.display = 'none';
            if (filterSection) filterSection.style.display = 'none'; // Ẩn filter khi ở tab SEO
        } else {
            analyticsFacebook.style.display = 'block';
            analyticsSeo.style.display = 'none';
            if (filterSection) filterSection.style.display = 'block'; // Hiện filter khi ở tab Facebook
        }

        await updateStats(); // Cập nhật lại tổng số bài trước
        await goToPage(1);   // Sau đó tải dữ liệu trang 1
    };

    // Xử lý click filter button
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                // Remove active class from all
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active to clicked
                btn.classList.add('active');

                // Set status
                currentFbStatus = btn.getAttribute('data-status') || '';

                // Reload data
                currentPage = 1;
                await goToPage(1);
            });
        });
    }

    cardSeo.addEventListener('click', () => switchTab('seo'));
    cardFacebook.addEventListener('click', () => switchTab('facebook'));
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.textContent.includes('SEO') ? 'seo' : 'facebook';
            switchTab(tab);
        });
    });

    // Xử lý nút Đồng bộ lại
    const syncBtn = document.querySelector('.sync-btn-custom');
    if (syncBtn) {
        syncBtn.addEventListener('click', async () => {
            const icon = syncBtn.querySelector('i');
            if (icon) icon.classList.add('fa-spin');
            syncBtn.disabled = true;

            try {
                const res = await collectAllPostsMetrics();
                if (res && res.success) {
                    alert('Đồng bộ dữ liệu thành công!');
                    await updateStats();
                    await goToPage(1);
                } else {
                    alert('Đồng bộ thất bại: ' + (res?.message || 'Lỗi không xác định'));
                }
            } catch (error) {
                alert('Có lỗi xảy ra khi đồng bộ dữ liệu.');
            } finally {
                if (icon) icon.classList.remove('fa-spin');
                syncBtn.disabled = false;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    initCharts();
    setupInteractions();
    await updateStats();
    await goToPage(1);
});

let metricsChart = null;

window.viewMetrics = async (draftId) => {
    const modal = document.getElementById('metricsModal');
    if (!modal) return;

    modal.style.display = 'flex';
    const chartCtx = document.getElementById('historyChart').getContext('2d');

    // Loading state
    document.getElementById('modalTitle').textContent = 'Đang tải chỉ số...';

    try {
        const history = await getPostMetricsHistory(draftId);

        document.getElementById('modalTitle').textContent = 'Chi tiết tương tác bài viết';

        if (!history || history.length === 0) {
            alert('Chưa có dữ liệu lịch sử cho bài viết này.');
            modal.style.display = 'none';
            return;
        }

        const labels = history.map(h => formatDateTime(h.collected_at).split(' ')[0]);
        const likesData = history.map(h => h.likes || 0);
        const commentsData = history.map(h => h.comments || 0);
        const sharesData = history.map(h => h.shares || 0);

        if (metricsChart) metricsChart.destroy();

        metricsChart = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Lượt thích',
                        data: likesData,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Bình luận',
                        data: commentsData,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Chia sẻ',
                        data: sharesData,
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });

    } catch (error) {
        console.error('Lỗi khi tải modal chỉ số:', error);
        alert('Không thể tải dữ liệu chỉ số.');
        modal.style.display = 'none';
    }
};

window.closeMetricsModal = () => {
    const modal = document.getElementById('metricsModal');
    if (modal) modal.style.display = 'none';
};

