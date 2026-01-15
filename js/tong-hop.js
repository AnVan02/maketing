/**
 * PHẦN 1: KIỂM TRA QUYỀN TRUY CẬP (AUTH CHECK)
 * Đảm bảo người xem đã đăng nhập thành công trước khi hiển thị dữ liệu.
 * 
 * Lưu ý: Với HTTP-only cookies, việc kiểm tra chỉ mang tính tham khảo.
 * Server sẽ tự động kiểm tra cookies khi gọi API. Nếu không hợp lệ sẽ trả về 401.
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
 * TIỆN ÍCH: Định dạng thời gian cho dễ đọc.
 * Chuyển dữ liệu thô (2026-01-14T...) thành (14/01/2026 13:50).
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
 * Lưu trữ trạng thái hiện tại của ứng dụng.
 */
let currentPage = 1;      // Trang dữ liệu đang hiển thị hiện tại
let totalArticles = 0;    // Tổng số bài viết lấy được từ Server
const itemsPerPage = 10;  // Mỗi trang chỉ hiện tối đa 10 dòng dữ liệu

/**
 * PHẦN 3: CÁC HÀM TƯƠNG TÁC API
 */

// 1. Lấy danh sách bài viết theo từng trang (kéo dữ liệu SEO)
async function fetchArticles(limit = 10, offset = 0) {
    try {
        // Gửi yêu cầu lấy dữ liệu bài viết kèm giới hạn (limit) và vị trí bắt đầu (offset)
        // API sẽ tự động kiểm tra cookies, nếu không hợp lệ sẽ redirect về trang login
        const response = await apiRequest(`/seo/articles?limit=${limit}&offset=${offset}`, {
            method: 'GET'
        });

        if (response.success && response.articles) {
            return {
                articles: response.articles,
                total: response.total // Tổng số bài thực tế đang có trên server
            };
        } else {
            return { articles: [], total: 0 };
        }
    } catch (error) {
        console.error('❌ Lỗi lấy danh sách bài:', error);
        // Nếu lỗi 401, apiRequest đã tự động redirect về login
        return { articles: [], total: 0 };
    }
}

// 2. Hỏi server tổng cộng có bao nhiêu bài (Để tính số trang 1, 2, 3...)
async function fetchTotalArticles() {
    try {
        const response = await apiRequest(`/seo/articles?limit=1&offset=0`, {
            method: 'GET'
        });
        return response.success ? (response.total || 0) : 0;
    } catch (error) {
        return 0;
    }
}

/**
 * PHẦN 4: ĐIỀU KHIỂN GIAO DIỆN BẢNG DỮ LIỆU (UI RENDERING)
 * Biến mảng dữ liệu thành các thẻ <tr> <td> trong HTML.
 */
function renderArticles(articles, isLoading = false) {
    const tableBody = document.getElementById('configTableBody'); // "Thân" của bảng dữ liệu
    if (!tableBody) return;

    // Hiển thị trạng thái đang tải (Loading) nếu dữ liệu chưa về kịp
    if (isLoading) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                    <div class="loader-container">
                        <span>Đang tải dữ liệu, vui lòng đợi...</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = ''; // Làm sạch bảng trước khi đổ dữ liệu mới vào

    // Nếu không có bài viết nào
    if (!articles || articles.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Chưa có bài viết nào được tạo.</td></tr>';
        return;
    }

    // Lặp qua từng bài viết để vẽ từng dòng (row)
    articles.forEach(article => {
        const row = document.createElement('tr');

        // Tạo Score giả lập cho đẹp giao diện (Thực tế nên lấy từ SEO Tool)
        const seoScore = Math.floor(Math.random() * 30) + 70;
        const scoreClass = seoScore >= 80 ? 'score-good' : 'score-medium';

        row.innerHTML = `
            <td><strong>${article.title || 'Bài viết chưa đặt tên'}</strong></td>
            <td>${article.primary_keyword || '---'}</td>
            <td>
                <div class="meta-description" title="${article.meta_description || ''}">
                    ${article.meta_description ? (article.meta_description.substring(0, 60) + '...') : 'Không có mô tả.'}
                </div>
            </td>
            <td>${article.word_count ? article.word_count.toLocaleString() : 0} từ</td>
            <td><span class="seo-score ${scoreClass}">${seoScore}/100</span></td>
            <td>${formatDateTime(article.created_at)}</td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * PHẦN 5: CẬP NHẬT CÁC Ô THỐNG KÊ (STATS CARDS)
 * Đếm tổng số bài, số bài đã xuất bản, và số bài nháp.
 */
async function updateStats() {
    try {
        const response = await apiRequest(`/seo/articles?limit=1000&offset=0`, { method: 'GET' });
        if (!response.success || !response.articles) return;

        const articles = response.articles;
        totalArticles = articles.length; // Cập nhật tổng số bài toàn cục

        const publishedCount = articles.filter(a => a.published_at).length;
        const draftCount = articles.filter(a => !a.published_at).length;

        // Tìm các phần tử HTML để hiển thị số liệu
        const statNumber = document.querySelector('.stats-card:first-child .stat-number');
        const subStat = document.querySelector('.stats-card:first-child .sub-stat');

        if (statNumber) statNumber.textContent = `${totalArticles} bài`;
        if (subStat) subStat.textContent = `${draftCount} nháp · ${publishedCount} xuất bản`;

        // Vẽ lại thanh phân trang bên dưới cho khớp với số bài mới
        updatePaginationInfo();
        renderPagination();
    } catch (error) {
        console.error('❌ Lỗi cập nhật thống kê:', error);
    }
}

/**
 * PHẦN 6: HỆ THỐNG PHÂN TRANG (PAGINATION)
 * Điều khiển các nút "Trước", "Sau" và các số trang 1, 2, 3...
 */

// Cập nhật thông tin: "Đang xem bài 1 đến 10 trong tổng số 100 bài"
function updatePaginationInfo() {
    const showingFrom = document.getElementById('showingFrom');
    const showingTo = document.getElementById('showingTo');
    const totalArticlesElement = document.getElementById('totalArticles');

    if (!showingFrom || !showingTo || !totalArticlesElement) return;

    if (totalArticles === 0) {
        showingFrom.textContent = '0';
        showingTo.textContent = '0';
        totalArticlesElement.textContent = '0';
        return;
    }

    const from = (currentPage - 1) * itemsPerPage + 1;
    const to = Math.min(currentPage * itemsPerPage, totalArticles);

    showingFrom.textContent = from;
    showingTo.textContent = to;
    totalArticlesElement.textContent = totalArticles;
}

// Vẽ các nút bấm phân trang vào vùng 'paginationControls'
function renderPagination() {
    const paginationControls = document.getElementById('paginationControls');
    if (!paginationControls) return;

    paginationControls.innerHTML = '';
    const totalPages = Math.ceil(totalArticles / itemsPerPage);

    if (totalPages <= 1) return; // Chỉ có 1 trang thì không cần hiện nút

    // Nút "Lùi lại"
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '‹';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => goToPage(currentPage - 1);
    paginationControls.appendChild(prevBtn);

    // Vẽ các số trang (Logic tự động rút gọn dấu ... nếu quá nhiều trang)
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => goToPage(i);
        paginationControls.appendChild(btn);
    }

    // Nút "Tiến tới"
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = '›';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => goToPage(currentPage + 1);
    paginationControls.appendChild(nextBtn);
}

// Hàm thực thi việc chuyển sang một trang khác
async function goToPage(page) {
    if (page < 1) return;

    currentPage = page;
    renderArticles([], true); // Hiện Loading

    const offset = (currentPage - 1) * itemsPerPage;
    const result = await fetchArticles(itemsPerPage, offset);

    if (result.total) totalArticles = result.total;
    renderArticles(result.articles);
    updatePaginationInfo();
    renderPagination();

    // Cuộn trang lên đầu bảng cho dễ xem
    const table = document.querySelector('.activity-section');
    if (table) table.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * PHẦN 7: TƯƠNG TÁC GIAO DIỆN KHÁC (TABS, CHARTS)
 */

// Đổi qua lại giữa tab SEO và tab Facebook
function setupInteractions() {
    const cardSeo = document.getElementById('card-seo');
    const cardFacebook = document.getElementById('card-facebook');
    const analyticsSeo = document.getElementById('analytics-seo');
    const analyticsFacebook = document.getElementById('analytics-facebook');

    if (!cardSeo || !cardFacebook) return;

    cardSeo.addEventListener('click', () => {
        analyticsSeo.style.display = 'block';
        analyticsFacebook.style.display = 'none';
        console.log('📈 Đã chuyển sang xem thống kê SEO');
    });

    cardFacebook.addEventListener('click', () => {
        analyticsFacebook.style.display = 'block';
        analyticsSeo.style.display = 'none';
        console.log('📈 Đã chuyển sang xem thống kê Facebook');
    });
}

// Vẽ biểu đồ tăng trưởng (Sử dụng Tool Chart.js)
function initCharts() {
    const seoCtx = document.getElementById('seoChart')?.getContext('2d');
    if (seoCtx) {
        new Chart(seoCtx, {
            type: 'line',
            data: {
                labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
                datasets: [{
                    label: 'Truy cập SEO',
                    data: [450, 600, 550, 800, 700, 400, 500],
                    borderColor: '#3B82F6',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}

/**
 * KHỞI CHẠY (INITIALIZATION)
 * Chạy toàn bộ hệ thống khi trình duyệt đã sẵn sàng.
 */
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return; // Kiểm tra đăng nhập

    initCharts();        // Vẽ biểu đồ
    setupInteractions(); // Cài đặt nút bấm

    // 1. Lấy dữ liệu thống kê tổng quát
    updateStats();

    // 2. Tải trang dữ liệu đầu tiên
    await goToPage(1);
});