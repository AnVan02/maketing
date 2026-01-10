// Kiểm tra đăng nhập
function checkAuth() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'dang-nhap.php';
        return false;
    }
    return true;
}

// Format ngày giờ
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

// Biến toàn cục cho pagination
let currentPage = 1;
let totalArticles = 0;
const itemsPerPage = 10;

// Lấy danh sách bài viết từ API với pagination
async function fetchArticles(limit = 10, offset = 0) {
    try {
        const response = await apiRequest(`/seo/articles?limit=${limit}&offset=${offset}`, {
            method: 'GET'
        });

        console.log('API Response:', response);

        if (response.success && response.articles) {
            return {
                articles: response.articles,
                // Chỉ trả về total nếu API thực sự có, không fallback về length vì đây là phân trang
                total: response.total
            };
        } else {
            console.warn('Không có dữ liệu bài viết');
            return { articles: [], total: 0 };
        }
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bài viết:', error);
        alert('Lỗi khi tải danh sách bài viết: ' + error.message);
        return { articles: [], total: 0 };
    }
}

// Lấy tổng số bài viết để tính pagination
async function fetchTotalArticles() {
    try {
        const response = await apiRequest(`/seo/articles?limit=1&offset=0`, {
            method: 'GET'
        });

        if (response.success) {
            return response.total || 0;
        }
        return 0;
    } catch (error) {
        console.error('Lỗi khi lấy tổng số bài viết:', error);
        return 0;
    }
}

// Hiển thị danh sách bài viết vào bảng
function renderArticles(articles, isLoading = false) {
    const tableBody = document.getElementById('configTableBody');

    if (!tableBody) {
        console.error('Không tìm thấy element configTableBody');
        return;
    }

    // Hiển thị loading
    if (isLoading) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2">
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                        </svg>
                        <span>Đang tải dữ liệu...</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Xóa dữ liệu cũ
    tableBody.innerHTML = '';

    if (!articles || articles.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #999;">
                    Chưa có bài viết nào
                </td>
            </tr>
        `;
        return;
    }


    // Render từng bài viết
    articles.forEach(article => {
        const row = document.createElement('tr');

        // Tính toán trạng thái (published hoặc draft)
        const status = article.published_at ? 'Đã xuất bản' : 'Nháp';
        const statusClass = article.published_at ? 'status-published' : 'status-draft';

        // Tạo SEO Score giả (vì API không trả về)
        const seoScore = Math.floor(Math.random() * 30) + 70; // Random từ 70-100
        const scoreClass = seoScore >= 80 ? 'score-good' : 'score-medium';

        row.innerHTML = `
            <td>
                <div class="article-title">
                    <a href="article.php?id=${article.id}" style="color: #333; text-decoration: none;">
                        ${article.title || 'Không có tiêu đề'}
                    </a>
                </div>
            </td>
            <td>${article.primary_keyword || 'N/A'}</td>
            <td>
                <div class="meta-description" title="${article.meta_description || ''}">
                    ${article.meta_description ?
                (article.meta_description.length > 80 ?
                    article.meta_description.substring(0, 80) + '...' :
                    article.meta_description)
                : 'N/A'}
                </div>
            </td>
            <td>
                <span class="status-badge ${statusClass}">
                    ${status}
                </span>
            </td>
            <td>
                <span class="seo-score ${scoreClass}">
                    ${seoScore}/100
                </span>
            </td>
            <td>${formatDateTime(article.created_at)}</td>
        `;

        tableBody.appendChild(row);
    });

    console.log(`Đã render ${articles.length} bài viết`);
}

// Cập nhật thống kê
async function updateStats() {
    try {
        console.log('Đang lấy thống kê và tổng số bài viết...');
        // Lấy tất cả bài viết để tính thống kê (giới hạn 1000 để đếm tổng)
        const response = await apiRequest(`/seo/articles?limit=1000&offset=0`, {
            method: 'GET'
        });

        if (!response.success || !response.articles) {
            console.warn('Không lấy được dữ liệu thống kê');
            return;
        }

        const articles = response.articles;

        // QUAN TRỌNG: Cập nhật biến toàn cục totalArticles
        totalArticles = articles.length;
        console.log('Đã cập nhật totalArticles chính xác:', totalArticles);

        // Đếm số bài đã xuất bản và nháp
        const publishedCount = articles.filter(a => a.published_at).length;
        const draftCount = articles.filter(a => !a.published_at).length;

        // Cập nhật card "Bài viết SEO"
        const statNumber = document.querySelector('.stats-card:first-child .stat-number');
        const subStat = document.querySelector('.stats-card:first-child .sub-stat');

        if (statNumber) {
            statNumber.textContent = `${totalArticles} bài`;
        }

        if (subStat) {
            subStat.textContent = `${draftCount} nháp · ${publishedCount} đã xuất bản`;
        }

        // QUAN TRỌNG: Vẽ lại phân trang ngay sau khi có số lượng chính xác
        updatePaginationInfo();
        renderPagination();

    } catch (error) {
        console.error('Lỗi khi cập nhật thống kê:', error);
    }
}

// Cập nhật thông tin pagination
function updatePaginationInfo() {
    const showingFrom = document.getElementById('showingFrom');
    const showingTo = document.getElementById('showingTo');
    const totalArticlesElement = document.getElementById('totalArticles');

    // Nếu không có bài viết nào
    if (totalArticles === 0) {
        showingFrom.textContent = '0';
        showingTo.textContent = '0';
        totalArticlesElement.textContent = '0';
        return;
    }

    const from = (currentPage - 1) * itemsPerPage + 1;
    let to = currentPage * itemsPerPage;

    // Nếu to lớn hơn total, lấy total
    if (to > totalArticles) {
        to = totalArticles;
    }

    showingFrom.textContent = from;
    showingTo.textContent = to;
    totalArticlesElement.textContent = totalArticles;
}

// Tạo các nút pagination
function renderPagination() {
    const paginationControls = document.getElementById('paginationControls');

    if (!paginationControls) {
        console.error('Không tìm thấy element paginationControls');
        return;
    }

    paginationControls.innerHTML = '';

    const totalPages = Math.ceil(totalArticles / itemsPerPage);

    console.log('Rendering Pagination. Total Pages:', totalPages, 'Total Articles:', totalArticles);


    if (totalPages <= 1) {
        return; // Không cần pagination nếu chỉ có 1 trang
    }


    // Nút Previous
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '‹';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => goToPage(currentPage - 1);
    paginationControls.appendChild(prevBtn);

    // Logic hiển thị số trang
    const maxVisiblePages = 7; // Số trang tối đa hiển thị
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisiblePages) {
        const halfVisible = Math.floor(maxVisiblePages / 2);

        if (currentPage <= halfVisible) {
            // Gần đầu
            endPage = maxVisiblePages - 1;
        } else if (currentPage >= totalPages - halfVisible) {
            // Gần cuối
            startPage = totalPages - maxVisiblePages + 2;
        } else {
            // Ở giữa
            startPage = currentPage - halfVisible + 1;
            endPage = currentPage + halfVisible - 1;
        }
    }

    // Trang đầu tiên
    if (startPage > 1) {
        const pageBtn = createPageButton(1);
        paginationControls.appendChild(pageBtn);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationControls.appendChild(ellipsis);
        }
    }

    // Các trang ở giữa
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = createPageButton(i);
        paginationControls.appendChild(pageBtn);
    }

    // Trang cuối cùng
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationControls.appendChild(ellipsis);
        }

        const pageBtn = createPageButton(totalPages);
        paginationControls.appendChild(pageBtn);
    }

    // Nút Next
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = '›';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => goToPage(currentPage + 1);
    paginationControls.appendChild(nextBtn);
}

// Tạo nút trang
function createPageButton(pageNumber) {
    const btn = document.createElement('button');
    btn.className = 'pagination-btn';
    if (pageNumber === currentPage) {
        btn.classList.add('active');
    }
    btn.textContent = pageNumber;
    btn.onclick = () => goToPage(pageNumber);
    return btn;
}

// Chuyển đến trang (gọi API để lấy dữ liệu mới)
async function goToPage(page) {
    // Nếu chưa biết total, tạm thời cho phép chuyển
    const totalPages = totalArticles > 0 ? Math.ceil(totalArticles / itemsPerPage) : 9999;

    if (page < 1 || (totalArticles > 0 && page > totalPages)) {
        return;
    }

    currentPage = page;

    // Hiển thị loading
    renderArticles([], true);

    // Tính offset cho API
    const offset = (currentPage - 1) * itemsPerPage;

    // Gọi API để lấy bài viết cho trang hiện tại
    const result = await fetchArticles(itemsPerPage, offset);

    // QUAN TRỌNG: Cập nhật totalArticles từ kết quả API nếu có
    // Chỉ cập nhật nếu API trả về con số cụ thể
    if (typeof result.total === 'number') {
        totalArticles = result.total;
        console.log('Cập nhật totalArticles:', totalArticles);
    }
    // Nếu không, giữ nguyên totalArticles đã tính từ updateStats()

    // Hiển thị bài viết
    renderArticles(result.articles);

    // Cập nhật thống kê nếu cần (để đảm bảo số draft/published đúng)
    if (totalArticles === 0) {
        updateStats(); // Thử gọi lại updateStats nếu vẫn chưa có total
    }

    // Cập nhật pagination UI
    updatePaginationInfo();
    renderPagination();

    // Scroll lên đầu bảng
    const activitySection = document.querySelector('.activity-section');
    if (activitySection) {
        activitySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Làm mới dữ liệu (không reload trang)
async function refreshData() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.classList.add('loading'); // Thêm hiệu ứng nếu muốn

    console.log('Đang làm mới toàn bộ dữ liệu...');

    try {
        // 1. Cập nhật thống kê và lấy lại tổng số bài viết thực tế
        await updateStats();

        // 2. Quay về trang 1 hoặc giữ trang hiện tại nhưng load lại
        await goToPage(currentPage);

        console.log('Đã làm mới dữ liệu thành công');
    } catch (error) {
        console.error('Lỗi khi làm mới dữ liệu:', error);
    } finally {
        if (refreshBtn) refreshBtn.classList.remove('loading');
    }
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', async function () {
    console.log('=== Khởi tạo trang Tổng hợp ===');

    if (!checkAuth()) return;

    try {
        // 1. Lấy thống kê trước (không bắt buộc phải await xong mới render)
        updateStats();

        // 2. Load trang đầu tiên ngay lập tức
        console.log(`Đang tải trang ${currentPage} (limit=${itemsPerPage})...`);
        const result = await fetchArticles(itemsPerPage, 0);

        // Cập nhật totalArticles từ kết quả API nếu có
        if (result.total && result.total > 0) {
            totalArticles = result.total;
            console.log('Cập nhật totalArticles từ API (init):', totalArticles);
        } else if (result.articles.length > 0) {
            totalArticles = Math.max(totalArticles, result.articles.length);
        }

        // Hiển thị dữ liệu
        renderArticles(result.articles);

        // Cập Nhật Pagination UI
        updatePaginationInfo();
        renderPagination();

        console.log('Khởi tạo hoàn tất');
    } catch (error) {
        console.error('Lỗi khởi tạo:', error);
    }
});